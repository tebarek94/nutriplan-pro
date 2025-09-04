import { Request, Response, NextFunction } from 'express';
import { asyncHandler } from '../../middleware/errorHandler';
import pool from '../../config/database';

export const suggestionController = {
  /**
   * Get all suggestions (Admin)
   */
  getAllSuggestions: asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { page = 1, limit = 10, search, suggestion_type, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereConditions = [];
    let queryParams = [];

    if (search) {
      whereConditions.push('(s.title LIKE ? OR s.description LIKE ? OR s.content LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (suggestion_type) {
      whereConditions.push('s.suggestion_type = ?');
      queryParams.push(suggestion_type);
    }

    if (status) {
      whereConditions.push('s.status = ?');
      queryParams.push(status);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM suggestions s
      ${whereClause}
    `;
    const [countResult] = await pool.execute(countQuery, queryParams);
    const total = (countResult as any)[0].total;

    // Get suggestions with user info
    const query = `
      SELECT 
        s.*,
        u.first_name,
        u.last_name,
        u.email,
        COALESCE(COUNT(usi.id), 0) as interaction_count,
        COALESCE(SUM(CASE WHEN usi.interaction_type = 'upvote' THEN 1 ELSE 0 END), 0) as upvotes,
        COALESCE(SUM(CASE WHEN usi.interaction_type = 'downvote' THEN 1 ELSE 0 END), 0) as downvotes
      FROM suggestions s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN user_suggestion_interactions usi ON s.id = usi.suggestion_id
      ${whereClause}
      GROUP BY s.id
      ORDER BY s.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [suggestions] = await pool.execute(query, [...queryParams, Number(limit), offset]);

    const totalPages = Math.ceil(total / Number(limit));

    res.status(200).json({
      success: true,
      data: suggestions,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  }),

  /**
   * Get approved suggestions for users
   */
  getApprovedSuggestions: asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Get total count of approved suggestions
    const [countResult] = await pool.execute(
      'SELECT COUNT(*) as total FROM suggestions WHERE status IN ("approved", "implemented")',
      []
    );
    const total = (countResult as any)[0].total;

    // Get approved suggestions with user info
    const query = `
      SELECT 
        s.*,
        u.first_name,
        u.last_name,
        u.email,
        COALESCE(COUNT(usi.id), 0) as interaction_count,
        COALESCE(SUM(CASE WHEN usi.interaction_type = 'upvote' THEN 1 ELSE 0 END), 0) as upvotes,
        COALESCE(SUM(CASE WHEN usi.interaction_type = 'downvote' THEN 1 ELSE 0 END), 0) as downvotes
      FROM suggestions s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN user_suggestion_interactions usi ON s.id = usi.suggestion_id
      WHERE s.status IN ("approved", "implemented")
      GROUP BY s.id
      ORDER BY s.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [suggestions] = await pool.execute(query, [Number(limit), offset]);

    res.status(200).json({
      success: true,
      data: suggestions,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  }),

  /**
   * Get suggestion by ID
   */
  getSuggestionById: asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    const query = `
      SELECT 
        s.*,
        u.first_name,
        u.last_name,
        u.email,
        COALESCE(COUNT(usi.id), 0) as interaction_count,
        COALESCE(SUM(CASE WHEN usi.interaction_type = 'upvote' THEN 1 ELSE 0 END), 0) as upvotes,
        COALESCE(SUM(CASE WHEN usi.interaction_type = 'downvote' THEN 1 ELSE 0 END), 0) as downvotes
      FROM suggestions s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN user_suggestion_interactions usi ON s.id = usi.suggestion_id
      WHERE s.id = ?
      GROUP BY s.id
    `;

    const [suggestions] = await pool.execute(query, [id]);

    if ((suggestions as any[]).length === 0) {
      res.status(404).json({
        success: false,
        message: 'Suggestion not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: (suggestions as any[])[0]
    });
  }),

  /**
   * Create suggestion
   */
  createSuggestion: asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { suggestion_type, title, description, content } = req.body;
    const userId = (req as any).user.userId;

    const query = `
      INSERT INTO suggestions (user_id, suggestion_type, title, description, content, status)
      VALUES (?, ?, ?, ?, ?, 'pending')
    `;

    const [result] = await pool.execute(query, [userId, suggestion_type, title, description, content]);

    res.status(201).json({
      success: true,
      message: 'Suggestion created successfully',
      data: {
        id: (result as any).insertId,
        user_id: userId,
        suggestion_type,
        title,
        description,
        content,
        status: 'pending'
      }
    });
  }),

  /**
   * Update suggestion status (Admin)
   */
  updateSuggestionStatus: asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { status, admin_response } = req.body;

    const query = `
      UPDATE suggestions 
      SET status = ?, admin_response = ?, updated_at = NOW()
      WHERE id = ?
    `;

    const [result] = await pool.execute(query, [status, admin_response || null, id]);

    if ((result as any).affectedRows === 0) {
      res.status(404).json({
        success: false,
        message: 'Suggestion not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Suggestion status updated successfully'
    });
  }),

  /**
   * Delete suggestion
   */
  deleteSuggestion: asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    // First delete related interactions
    await pool.execute('DELETE FROM user_suggestion_interactions WHERE suggestion_id = ?', [id]);

    // Then delete the suggestion
    const [result] = await pool.execute('DELETE FROM suggestions WHERE id = ?', [id]);

    if ((result as any).affectedRows === 0) {
      res.status(404).json({
        success: false,
        message: 'Suggestion not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Suggestion deleted successfully'
    });
  }),

  /**
   * Get user suggestions
   */
  getUserSuggestions: asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = (req as any).user.userId;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereConditions = ['s.user_id = ?'];
    let queryParams = [userId];

    if (status) {
      whereConditions.push('s.status = ?');
      queryParams.push(status);
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM suggestions s
      ${whereClause}
    `;
    const [countResult] = await pool.execute(countQuery, queryParams);
    const total = (countResult as any)[0].total;

    // Get suggestions
    const query = `
      SELECT 
        s.*,
        COALESCE(COUNT(usi.id), 0) as interaction_count,
        COALESCE(SUM(CASE WHEN usi.interaction_type = 'upvote' THEN 1 ELSE 0 END), 0) as upvotes,
        COALESCE(SUM(CASE WHEN usi.interaction_type = 'downvote' THEN 1 ELSE 0 END), 0) as downvotes
      FROM suggestions s
      LEFT JOIN user_suggestion_interactions usi ON s.id = usi.suggestion_id
      ${whereClause}
      GROUP BY s.id
      ORDER BY s.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const [suggestions] = await pool.execute(query, [...queryParams, Number(limit), offset]);

    const totalPages = Math.ceil(total / Number(limit));

    res.status(200).json({
      success: true,
      data: suggestions,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  }),

  /**
   * Interact with suggestion (upvote/downvote)
   */
  interactWithSuggestion: asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { interaction_type } = req.body;
    const userId = (req as any).user.userId;

    // Check if interaction already exists
    const [existingInteraction] = await pool.execute(
      'SELECT * FROM user_suggestion_interactions WHERE user_id = ? AND suggestion_id = ?',
      [userId, id]
    );

    if ((existingInteraction as any[]).length > 0) {
      // Update existing interaction
      await pool.execute(
        'UPDATE user_suggestion_interactions SET interaction_type = ?, updated_at = NOW() WHERE user_id = ? AND suggestion_id = ?',
        [interaction_type, userId, id]
      );
    } else {
      // Create new interaction
      await pool.execute(
        'INSERT INTO user_suggestion_interactions (user_id, suggestion_id, interaction_type) VALUES (?, ?, ?)',
        [userId, id, interaction_type]
      );
    }

    res.status(200).json({
      success: true,
      message: 'Interaction updated successfully'
    });
  }),

  /**
   * Get suggestion analytics
   */
  getSuggestionAnalytics: asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Get total suggestions by status
    const statusQuery = `
      SELECT 
        status,
        COUNT(*) as count
      FROM suggestions
      GROUP BY status
    `;
    const [statusStats] = await pool.execute(statusQuery);

    // Get suggestions by type
    const typeQuery = `
      SELECT 
        suggestion_type,
        COUNT(*) as count
      FROM suggestions
      GROUP BY suggestion_type
    `;
    const [typeStats] = await pool.execute(typeQuery);

    // Get recent suggestions
    const recentQuery = `
      SELECT 
        s.*,
        u.first_name,
        u.last_name
      FROM suggestions s
      LEFT JOIN users u ON s.user_id = u.id
      ORDER BY s.created_at DESC
      LIMIT 5
    `;
    const [recentSuggestions] = await pool.execute(recentQuery);

    // Get top suggestions by interactions
    const topQuery = `
      SELECT 
        s.*,
        u.first_name,
        u.last_name,
        COALESCE(COUNT(usi.id), 0) as interaction_count,
        COALESCE(SUM(CASE WHEN usi.interaction_type = 'upvote' THEN 1 ELSE 0 END), 0) as upvotes,
        COALESCE(SUM(CASE WHEN usi.interaction_type = 'downvote' THEN 1 ELSE 0 END), 0) as downvotes
      FROM suggestions s
      LEFT JOIN users u ON s.user_id = u.id
      LEFT JOIN user_suggestion_interactions usi ON s.id = usi.suggestion_id
      GROUP BY s.id
      ORDER BY interaction_count DESC, upvotes DESC
      LIMIT 5
    `;
    const [topSuggestions] = await pool.execute(topQuery);

    res.status(200).json({
      success: true,
      data: {
        statusStats,
        typeStats,
        recentSuggestions,
        topSuggestions
      }
    });
  })
};
