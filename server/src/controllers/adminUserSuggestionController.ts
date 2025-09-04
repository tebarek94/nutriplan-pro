import { Request, Response, NextFunction } from 'express';
import { RowDataPacket } from 'mysql2';
import pool from '../config/database';
import { OperationalError, asyncHandler } from '../middleware/errorHandler';

class AdminUserSuggestionController {
  /**
   * Get all users with their profile information for admin suggestions
   */
  getUsersForSuggestions = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { page = 1, limit = 20, search, has_profile } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = 'WHERE u.role = "user"';
    let params: any[] = [];

    if (search) {
      whereClause += ' AND (u.email LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (has_profile === 'true') {
      whereClause += ' AND up.id IS NOT NULL';
    } else if (has_profile === 'false') {
      whereClause += ' AND up.id IS NULL';
    }

    // Get total count
    const [countResult] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total 
       FROM users u 
       LEFT JOIN user_profiles up ON u.id = up.user_id 
       ${whereClause}`,
      params
    );

    const total = countResult[0].total;

    // Get users with profile information
    const [users] = await pool.execute<RowDataPacket[]>(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.is_active, u.created_at,
              up.age, up.gender, up.weight, up.height, up.activity_level, 
              up.fitness_goal, up.dietary_preferences, up.allergies, up.medical_conditions,
              (SELECT COUNT(*) FROM admin_user_suggestions aus WHERE aus.user_id = u.id) as suggestion_count,
              (SELECT COUNT(*) FROM weekly_meal_suggestions wms WHERE wms.user_id = u.id) as weekly_suggestion_count
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       ${whereClause}
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    const usersWithParsedData = users.map(user => ({
      ...user,
      dietary_preferences: user.dietary_preferences ? JSON.parse(user.dietary_preferences) : [],
      allergies: user.allergies ? JSON.parse(user.allergies) : [],
      created_at: new Date(user.created_at),
      has_profile: !!user.age
    }));

    res.json({
      success: true,
      data: usersWithParsedData,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  });

  /**
   * Send meal suggestion to specific user
   */
  sendMealSuggestionToUser = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { user_id, meal_suggestion_id, message, admin_notes } = req.body;
    const createdBy = req.user!.userId;

    // Check if user exists
    const [users] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE id = ? AND role = "user"',
      [user_id]
    );

    if (users.length === 0) {
      throw new OperationalError('User not found', 404);
    }

    // Check if meal suggestion exists
    const [suggestions] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM meal_suggestions WHERE id = ? AND is_active = TRUE',
      [meal_suggestion_id]
    );

    if (suggestions.length === 0) {
      throw new OperationalError('Meal suggestion not found', 404);
    }

    // Create user suggestion
    const [result] = await pool.execute(
      `INSERT INTO admin_user_suggestions (
        user_id, suggestion_type, meal_suggestion_id, message, admin_notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, 'meal', meal_suggestion_id, message || null, admin_notes || null, createdBy]
    );

    const suggestionId = (result as any).insertId;

    // Get created suggestion with details
    const [userSuggestions] = await pool.execute<RowDataPacket[]>(
      `SELECT aus.*, ms.title, ms.description, ms.meal_type, ms.image_url,
              u.first_name, u.last_name, u.email
       FROM admin_user_suggestions aus
       LEFT JOIN meal_suggestions ms ON aus.meal_suggestion_id = ms.id
       LEFT JOIN users u ON aus.user_id = u.id
       WHERE aus.id = ?`,
      [suggestionId]
    );

    const userSuggestion = userSuggestions[0];

    res.status(201).json({
      success: true,
      message: 'Meal suggestion sent to user successfully',
      data: {
        ...userSuggestion,
        created_at: new Date(userSuggestion.created_at),
        updated_at: new Date(userSuggestion.updated_at)
      }
    });
  });

  /**
   * Send recipe suggestion to specific user
   */
  sendRecipeSuggestionToUser = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { user_id, recipe_suggestion_id, message, admin_notes } = req.body;
    const createdBy = req.user!.userId;

    // Check if user exists
    const [users] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE id = ? AND role = "user"',
      [user_id]
    );

    if (users.length === 0) {
      throw new OperationalError('User not found', 404);
    }

    // Check if recipe suggestion exists
    const [suggestions] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM recipe_suggestions WHERE id = ? AND is_active = TRUE',
      [recipe_suggestion_id]
    );

    if (suggestions.length === 0) {
      throw new OperationalError('Recipe suggestion not found', 404);
    }

    // Create user suggestion
    const [result] = await pool.execute(
      `INSERT INTO admin_user_suggestions (
        user_id, suggestion_type, recipe_suggestion_id, message, admin_notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [user_id, 'recipe', recipe_suggestion_id, message || null, admin_notes || null, createdBy]
    );

    const suggestionId = (result as any).insertId;

    // Get created suggestion with details
    const [userSuggestions] = await pool.execute<RowDataPacket[]>(
      `SELECT aus.*, rs.title, rs.description, rs.difficulty, rs.image_url,
              u.first_name, u.last_name, u.email
       FROM admin_user_suggestions aus
       LEFT JOIN recipe_suggestions rs ON aus.recipe_suggestion_id = rs.id
       LEFT JOIN users u ON aus.user_id = u.id
       WHERE aus.id = ?`,
      [suggestionId]
    );

    const userSuggestion = userSuggestions[0];

    res.status(201).json({
      success: true,
      message: 'Recipe suggestion sent to user successfully',
      data: {
        ...userSuggestion,
        created_at: new Date(userSuggestion.created_at),
        updated_at: new Date(userSuggestion.updated_at)
      }
    });
  });

  /**
   * Create and send weekly meal suggestion to user
   */
  sendWeeklyMealSuggestion = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {
      user_id,
      week_start_date,
      week_end_date,
      title,
      description,
      total_calories,
      total_protein,
      total_carbs,
      total_fat,
      message,
      admin_notes,
      meals
    } = req.body;

    const createdBy = req.user!.userId;

    // Check if user exists
    const [users] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE id = ? AND role = "user"',
      [user_id]
    );

    if (users.length === 0) {
      throw new OperationalError('User not found', 404);
    }

    // Check if there's already a weekly suggestion for this user and week
    const [existingSuggestions] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM weekly_meal_suggestions WHERE user_id = ? AND week_start_date = ?',
      [user_id, week_start_date]
    );

    if (existingSuggestions.length > 0) {
      throw new OperationalError('Weekly meal suggestion already exists for this user and week', 409);
    }

    // Create weekly meal suggestion
    const [result] = await pool.execute(
      `INSERT INTO weekly_meal_suggestions (
        user_id, week_start_date, week_end_date, title, description,
        total_calories, total_protein, total_carbs, total_fat,
        message, admin_notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user_id, week_start_date, week_end_date, title, description,
        total_calories || null, total_protein || null, total_carbs || null, total_fat || null,
        message || null, admin_notes || null, createdBy
      ]
    );

    const weeklySuggestionId = (result as any).insertId;

    // Add meal items
    if (meals && Array.isArray(meals)) {
      for (const meal of meals) {
        await pool.execute(
          `INSERT INTO weekly_meal_suggestion_items (
            weekly_meal_suggestion_id, meal_suggestion_id, recipe_suggestion_id,
            meal_type, day_of_week, custom_meal_name, custom_ingredients,
            custom_nutrition, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            weeklySuggestionId,
            meal.meal_suggestion_id || null,
            meal.recipe_suggestion_id || null,
            meal.meal_type,
            meal.day_of_week,
            meal.custom_meal_name || null,
            meal.custom_ingredients ? JSON.stringify(meal.custom_ingredients) : null,
            meal.custom_nutrition ? JSON.stringify(meal.custom_nutrition) : null,
            meal.notes || null
          ]
        );
      }
    }

    // Get created weekly suggestion with details
    const [weeklySuggestions] = await pool.execute<RowDataPacket[]>(
      `SELECT wms.*, u.first_name, u.last_name, u.email
       FROM weekly_meal_suggestions wms
       LEFT JOIN users u ON wms.user_id = u.id
       WHERE wms.id = ?`,
      [weeklySuggestionId]
    );

    const weeklySuggestion = weeklySuggestions[0];

    res.status(201).json({
      success: true,
      message: 'Weekly meal suggestion sent to user successfully',
      data: {
        ...weeklySuggestion,
        created_at: new Date(weeklySuggestion.created_at),
        updated_at: new Date(weeklySuggestion.updated_at)
      }
    });
  });

  /**
   * Get all user suggestions sent by admin
   */
  getUserSuggestions = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { page = 1, limit = 20, user_id, suggestion_type, is_read, is_accepted } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (user_id) {
      whereClause += ' AND aus.user_id = ?';
      params.push(user_id);
    }

    if (suggestion_type) {
      whereClause += ' AND aus.suggestion_type = ?';
      params.push(suggestion_type);
    }

    if (is_read !== undefined) {
      whereClause += ' AND aus.is_read = ?';
      params.push(is_read === 'true');
    }

    if (is_accepted !== undefined) {
      whereClause += ' AND aus.is_accepted = ?';
      params.push(is_accepted === 'true');
    }

    // Get total count
    const [countResult] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM admin_user_suggestions aus ${whereClause}`,
      params
    );

    const total = countResult[0].total;

    // Get user suggestions
    const [suggestions] = await pool.execute<RowDataPacket[]>(
      `SELECT aus.*, 
              u.first_name, u.last_name, u.email,
              ms.title as meal_title, ms.meal_type, ms.image_url as meal_image,
              rs.title as recipe_title, rs.difficulty, rs.image_url as recipe_image,
              admin.first_name as admin_name
       FROM admin_user_suggestions aus
       LEFT JOIN users u ON aus.user_id = u.id
       LEFT JOIN meal_suggestions ms ON aus.meal_suggestion_id = ms.id
       LEFT JOIN recipe_suggestions rs ON aus.recipe_suggestion_id = rs.id
       LEFT JOIN users admin ON aus.created_by = admin.id
       ${whereClause}
       ORDER BY aus.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    res.json({
      success: true,
      data: suggestions.map(suggestion => ({
        ...suggestion,
        created_at: new Date(suggestion.created_at),
        updated_at: new Date(suggestion.updated_at)
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  });

  /**
   * Get all weekly meal suggestions sent by admin
   */
  getWeeklyMealSuggestions = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { page = 1, limit = 20, user_id, is_read, is_accepted } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (user_id) {
      whereClause += ' AND wms.user_id = ?';
      params.push(user_id);
    }

    if (is_read !== undefined) {
      whereClause += ' AND wms.is_read = ?';
      params.push(is_read === 'true');
    }

    if (is_accepted !== undefined) {
      whereClause += ' AND wms.is_accepted = ?';
      params.push(is_accepted === 'true');
    }

    // Get total count
    const [countResult] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM weekly_meal_suggestions wms ${whereClause}`,
      params
    );

    const total = countResult[0].total;

    // Get weekly meal suggestions
    const [suggestions] = await pool.execute<RowDataPacket[]>(
      `SELECT wms.*, 
              u.first_name, u.last_name, u.email,
              admin.first_name as admin_name,
              (SELECT COUNT(*) FROM weekly_meal_suggestion_items wmsi WHERE wmsi.weekly_meal_suggestion_id = wms.id) as meal_count
       FROM weekly_meal_suggestions wms
       LEFT JOIN users u ON wms.user_id = u.id
       LEFT JOIN users admin ON wms.created_by = admin.id
       ${whereClause}
       ORDER BY wms.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    res.json({
      success: true,
      data: suggestions.map(suggestion => ({
        ...suggestion,
        created_at: new Date(suggestion.created_at),
        updated_at: new Date(suggestion.updated_at)
      })),
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  });

  /**
   * Get weekly meal suggestion details with items
   */
  getWeeklyMealSuggestionDetails = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    // Get weekly suggestion
    const [suggestions] = await pool.execute<RowDataPacket[]>(
      `SELECT wms.*, 
              u.first_name, u.last_name, u.email,
              admin.first_name as admin_name
       FROM weekly_meal_suggestions wms
       LEFT JOIN users u ON wms.user_id = u.id
       LEFT JOIN users admin ON wms.created_by = admin.id
       WHERE wms.id = ?`,
      [id]
    );

    if (suggestions.length === 0) {
      throw new OperationalError('Weekly meal suggestion not found', 404);
    }

    const weeklySuggestion = suggestions[0];

    // Get meal items
    const [items] = await pool.execute<RowDataPacket[]>(
      `SELECT wmsi.*, 
              ms.title as meal_title, ms.description as meal_description, ms.image_url as meal_image,
              rs.title as recipe_title, rs.description as recipe_description, rs.image_url as recipe_image
       FROM weekly_meal_suggestion_items wmsi
       LEFT JOIN meal_suggestions ms ON wmsi.meal_suggestion_id = ms.id
       LEFT JOIN recipe_suggestions rs ON wmsi.recipe_suggestion_id = rs.id
       WHERE wmsi.weekly_meal_suggestion_id = ?
       ORDER BY FIELD(wmsi.day_of_week, 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'),
                FIELD(wmsi.meal_type, 'breakfast', 'lunch', 'dinner', 'snack')`,
      [id]
    );

    const itemsWithParsedData = items.map(item => ({
      ...item,
      custom_ingredients: item.custom_ingredients ? JSON.parse(item.custom_ingredients) : null,
      custom_nutrition: item.custom_nutrition ? JSON.parse(item.custom_nutrition) : null,
      created_at: new Date(item.created_at)
    }));

    res.json({
      success: true,
      data: {
        ...weeklySuggestion,
        created_at: new Date(weeklySuggestion.created_at),
        updated_at: new Date(weeklySuggestion.updated_at),
        items: itemsWithParsedData
      }
    });
  });

  /**
   * Update user suggestion status (read/accepted)
   */
  updateUserSuggestionStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { is_read, is_accepted } = req.body;

    // Check if suggestion exists
    const [suggestions] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM admin_user_suggestions WHERE id = ?',
      [id]
    );

    if (suggestions.length === 0) {
      throw new OperationalError('User suggestion not found', 404);
    }

    // Update status
    const updateFields = [];
    const updateValues = [];

    if (is_read !== undefined) {
      updateFields.push('is_read = ?');
      updateValues.push(is_read);
    }

    if (is_accepted !== undefined) {
      updateFields.push('is_accepted = ?');
      updateValues.push(is_accepted);
    }

    if (updateFields.length > 0) {
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(id);

      await pool.execute(
        `UPDATE admin_user_suggestions SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
    }

    res.json({
      success: true,
      message: 'User suggestion status updated successfully'
    });
  });

  /**
   * Update weekly meal suggestion status (read/accepted)
   */
  updateWeeklyMealSuggestionStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { is_read, is_accepted } = req.body;

    // Check if suggestion exists
    const [suggestions] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM weekly_meal_suggestions WHERE id = ?',
      [id]
    );

    if (suggestions.length === 0) {
      throw new OperationalError('Weekly meal suggestion not found', 404);
    }

    // Update status
    const updateFields = [];
    const updateValues = [];

    if (is_read !== undefined) {
      updateFields.push('is_read = ?');
      updateValues.push(is_read);
    }

    if (is_accepted !== undefined) {
      updateFields.push('is_accepted = ?');
      updateValues.push(is_accepted);
    }

    if (updateFields.length > 0) {
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(id);

      await pool.execute(
        `UPDATE weekly_meal_suggestions SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
    }

    res.json({
      success: true,
      message: 'Weekly meal suggestion status updated successfully'
    });
  });

  /**
   * Get suggestion analytics for admin
   */
  getSuggestionAnalytics = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Get user suggestion stats
    const [userSuggestionStats] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_read = 1 THEN 1 ELSE 0 END) as read_count,
        SUM(CASE WHEN is_accepted = 1 THEN 1 ELSE 0 END) as accepted_count,
        SUM(CASE WHEN suggestion_type = 'meal' THEN 1 ELSE 0 END) as meal_suggestions,
        SUM(CASE WHEN suggestion_type = 'recipe' THEN 1 ELSE 0 END) as recipe_suggestions
       FROM admin_user_suggestions`
    );

    // Get weekly meal suggestion stats
    const [weeklySuggestionStats] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_read = 1 THEN 1 ELSE 0 END) as read_count,
        SUM(CASE WHEN is_accepted = 1 THEN 1 ELSE 0 END) as accepted_count
       FROM weekly_meal_suggestions`
    );

    // Get top users receiving suggestions
    const [topUsers] = await pool.execute<RowDataPacket[]>(
      `SELECT u.first_name, u.last_name, u.email,
              COUNT(aus.id) as suggestion_count,
              SUM(CASE WHEN aus.is_accepted = 1 THEN 1 ELSE 0 END) as accepted_count
       FROM users u
       LEFT JOIN admin_user_suggestions aus ON u.id = aus.user_id
       WHERE u.role = 'user'
       GROUP BY u.id
       ORDER BY suggestion_count DESC
       LIMIT 10`
    );

    // Get recent suggestions
    const [recentSuggestions] = await pool.execute<RowDataPacket[]>(
      `SELECT aus.*, u.first_name, u.last_name, u.email
       FROM admin_user_suggestions aus
       LEFT JOIN users u ON aus.user_id = u.id
       ORDER BY aus.created_at DESC
       LIMIT 5`
    );

    res.json({
      success: true,
      data: {
        user_suggestions: userSuggestionStats[0],
        weekly_suggestions: weeklySuggestionStats[0],
        top_users: topUsers,
        recent_suggestions: recentSuggestions.map(suggestion => ({
          ...suggestion,
          created_at: new Date(suggestion.created_at),
          updated_at: new Date(suggestion.updated_at)
        }))
      }
    });
  });
}

export default new AdminUserSuggestionController();
