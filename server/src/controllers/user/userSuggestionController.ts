import { Request, Response, NextFunction } from 'express';
import { RowDataPacket } from 'mysql2';
import pool from '../../config/database';
import { OperationalError, asyncHandler } from '../../middleware/errorHandler';

class UserSuggestionController {
  /**
   * Get admin suggestions for the current user
   */
  getAdminSuggestions = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { page = 1, limit = 10, suggestion_type, is_read, is_accepted } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const userId = req.user!.userId;

    let whereClause = 'WHERE aus.user_id = ?';
    const params: any[] = [userId];

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
              ms.title as meal_title, ms.description as meal_description, ms.meal_type, 
              ms.image_url as meal_image, ms.calories_per_serving, ms.protein_per_serving,
              ms.carbs_per_serving, ms.fat_per_serving, ms.ingredients as meal_ingredients,
              ms.instructions as meal_instructions, ms.tips as meal_tips,
              rs.title as recipe_title, rs.description as recipe_description, rs.difficulty,
              rs.image_url as recipe_image, rs.calories_per_serving as recipe_calories,
              rs.protein_per_serving as recipe_protein, rs.carbs_per_serving as recipe_carbs,
              rs.fat_per_serving as recipe_fat, rs.ingredients as recipe_ingredients,
              rs.instructions as recipe_instructions, rs.tips as recipe_tips,
              admin.first_name as admin_name, admin.last_name as admin_last_name
       FROM admin_user_suggestions aus
       LEFT JOIN meal_suggestions ms ON aus.meal_suggestion_id = ms.id
       LEFT JOIN recipe_suggestions rs ON aus.recipe_suggestion_id = rs.id
       LEFT JOIN users admin ON aus.created_by = admin.id
       ${whereClause}
       ORDER BY aus.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    const suggestionsWithParsedData = suggestions.map(suggestion => ({
      ...suggestion,
      meal_ingredients: suggestion.meal_ingredients ? JSON.parse(suggestion.meal_ingredients) : [],
      recipe_ingredients: suggestion.recipe_ingredients ? JSON.parse(suggestion.recipe_ingredients) : [],
      created_at: new Date(suggestion.created_at),
      updated_at: new Date(suggestion.updated_at)
    }));

    res.json({
      success: true,
      data: suggestionsWithParsedData,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  });

  /**
   * Get weekly meal suggestions for the current user
   */
  getWeeklyMealSuggestions = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { page = 1, limit = 10, is_read, is_accepted } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    const userId = req.user!.userId;

    let whereClause = 'WHERE wms.user_id = ?';
    const params: any[] = [userId];

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
              admin.first_name as admin_name, admin.last_name as admin_last_name,
              (SELECT COUNT(*) FROM weekly_meal_suggestion_items wmsi WHERE wmsi.weekly_meal_suggestion_id = wms.id) as meal_count
       FROM weekly_meal_suggestions wms
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
    const userId = req.user!.userId;

    // Get weekly suggestion
    const [suggestions] = await pool.execute<RowDataPacket[]>(
      `SELECT wms.*, 
              admin.first_name as admin_name, admin.last_name as admin_last_name
       FROM weekly_meal_suggestions wms
       LEFT JOIN users admin ON wms.created_by = admin.id
       WHERE wms.id = ? AND wms.user_id = ?`,
      [id, userId]
    );

    if (suggestions.length === 0) {
      throw new OperationalError('Weekly meal suggestion not found', 404);
    }

    const weeklySuggestion = suggestions[0];

    // Mark as read
    await pool.execute(
      'UPDATE weekly_meal_suggestions SET is_read = TRUE WHERE id = ?',
      [id]
    );

    // Get meal items
    const [items] = await pool.execute<RowDataPacket[]>(
      `SELECT wmsi.*, 
              ms.title as meal_title, ms.description as meal_description, ms.meal_type,
              ms.image_url as meal_image, ms.calories_per_serving, ms.protein_per_serving,
              ms.carbs_per_serving, ms.fat_per_serving, ms.ingredients as meal_ingredients,
              ms.instructions as meal_instructions, ms.tips as meal_tips,
              rs.title as recipe_title, rs.description as recipe_description, rs.difficulty,
              rs.image_url as recipe_image, rs.calories_per_serving as recipe_calories,
              rs.protein_per_serving as recipe_protein, rs.carbs_per_serving as recipe_carbs,
              rs.fat_per_serving as recipe_fat, rs.ingredients as recipe_ingredients,
              rs.instructions as recipe_instructions, rs.tips as recipe_tips
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
      meal_ingredients: item.meal_ingredients ? JSON.parse(item.meal_ingredients) : [],
      recipe_ingredients: item.recipe_ingredients ? JSON.parse(item.recipe_ingredients) : [],
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
   * Mark admin suggestion as read
   */
  markSuggestionAsRead = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Check if suggestion exists and belongs to user
    const [suggestions] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM admin_user_suggestions WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (suggestions.length === 0) {
      throw new OperationalError('Suggestion not found', 404);
    }

    // Mark as read
    await pool.execute(
      'UPDATE admin_user_suggestions SET is_read = TRUE WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Suggestion marked as read'
    });
  });

  /**
   * Accept or reject admin suggestion
   */
  respondToSuggestion = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { is_accepted } = req.body;
    const userId = req.user!.userId;

    // Check if suggestion exists and belongs to user
    const [suggestions] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM admin_user_suggestions WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (suggestions.length === 0) {
      throw new OperationalError('Suggestion not found', 404);
    }

    // Update acceptance status
    await pool.execute(
      'UPDATE admin_user_suggestions SET is_accepted = ?, is_read = TRUE WHERE id = ?',
      [is_accepted, id]
    );

    res.json({
      success: true,
      message: `Suggestion ${is_accepted ? 'accepted' : 'rejected'} successfully`
    });
  });

  /**
   * Mark weekly meal suggestion as read
   */
  markWeeklySuggestionAsRead = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Check if suggestion exists and belongs to user
    const [suggestions] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM weekly_meal_suggestions WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (suggestions.length === 0) {
      throw new OperationalError('Weekly meal suggestion not found', 404);
    }

    // Mark as read
    await pool.execute(
      'UPDATE weekly_meal_suggestions SET is_read = TRUE WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Weekly meal suggestion marked as read'
    });
  });

  /**
   * Accept or reject weekly meal suggestion
   */
  respondToWeeklySuggestion = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { is_accepted } = req.body;
    const userId = req.user!.userId;

    // Check if suggestion exists and belongs to user
    const [suggestions] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM weekly_meal_suggestions WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (suggestions.length === 0) {
      throw new OperationalError('Weekly meal suggestion not found', 404);
    }

    // Update acceptance status
    await pool.execute(
      'UPDATE weekly_meal_suggestions SET is_accepted = ?, is_read = TRUE WHERE id = ?',
      [is_accepted, id]
    );

    res.json({
      success: true,
      message: `Weekly meal suggestion ${is_accepted ? 'accepted' : 'rejected'} successfully`
    });
  });

  /**
   * Get suggestion statistics for user
   */
  getSuggestionStats = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user!.userId;

    // Get admin suggestion stats
    const [adminSuggestionStats] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_read = 1 THEN 1 ELSE 0 END) as read_count,
        SUM(CASE WHEN is_accepted = 1 THEN 1 ELSE 0 END) as accepted_count,
        SUM(CASE WHEN suggestion_type = 'meal' THEN 1 ELSE 0 END) as meal_suggestions,
        SUM(CASE WHEN suggestion_type = 'recipe' THEN 1 ELSE 0 END) as recipe_suggestions
       FROM admin_user_suggestions
       WHERE user_id = ?`,
      [userId]
    );

    // Get weekly meal suggestion stats
    const [weeklySuggestionStats] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_read = 1 THEN 1 ELSE 0 END) as read_count,
        SUM(CASE WHEN is_accepted = 1 THEN 1 ELSE 0 END) as accepted_count
       FROM weekly_meal_suggestions
       WHERE user_id = ?`,
      [userId]
    );

    // Get recent suggestions
    const [recentSuggestions] = await pool.execute<RowDataPacket[]>(
      `SELECT aus.*, 
              ms.title as meal_title, rs.title as recipe_title,
              admin.first_name as admin_name
       FROM admin_user_suggestions aus
       LEFT JOIN meal_suggestions ms ON aus.meal_suggestion_id = ms.id
       LEFT JOIN recipe_suggestions rs ON aus.recipe_suggestion_id = rs.id
       LEFT JOIN users admin ON aus.created_by = admin.id
       WHERE aus.user_id = ?
       ORDER BY aus.created_at DESC
       LIMIT 5`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        admin_suggestions: adminSuggestionStats[0],
        weekly_suggestions: weeklySuggestionStats[0],
        recent_suggestions: recentSuggestions.map(suggestion => ({
          ...suggestion,
          created_at: new Date(suggestion.created_at),
          updated_at: new Date(suggestion.updated_at)
        }))
      }
    });
  });

  /**
   * Convert weekly meal suggestion to actual meal plan
   */
  convertWeeklySuggestionToMealPlan = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Get weekly suggestion
    const [suggestions] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM weekly_meal_suggestions WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (suggestions.length === 0) {
      throw new OperationalError('Weekly meal suggestion not found', 404);
    }

    const weeklySuggestion = suggestions[0];

    // Check if user already has a meal plan for this week
    const [existingMealPlans] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM meal_plans WHERE user_id = ? AND start_date = ?',
      [userId, weeklySuggestion.week_start_date]
    );

    if (existingMealPlans.length > 0) {
      throw new OperationalError('Meal plan already exists for this week', 409);
    }

    // Create meal plan
    const [mealPlanResult] = await pool.execute(
      `INSERT INTO meal_plans (
        user_id, name, description, start_date, end_date,
        total_calories, total_protein, total_carbs, total_fat
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        weeklySuggestion.title,
        weeklySuggestion.description,
        weeklySuggestion.week_start_date,
        weeklySuggestion.week_end_date,
        weeklySuggestion.total_calories,
        weeklySuggestion.total_protein,
        weeklySuggestion.total_carbs,
        weeklySuggestion.total_fat
      ]
    );

    const mealPlanId = (mealPlanResult as any).insertId;

    // Get meal items and convert to meal plan items
    const [items] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM weekly_meal_suggestion_items WHERE weekly_meal_suggestion_id = ?',
      [id]
    );

    for (const item of items) {
      await pool.execute(
        `INSERT INTO meal_plan_items (
          meal_plan_id, recipe_id, meal_type, day_of_week,
          custom_meal_name, custom_ingredients, custom_nutrition, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          mealPlanId,
          item.recipe_suggestion_id, // Note: This would need to be converted to actual recipe_id
          item.meal_type,
          item.day_of_week,
          item.custom_meal_name,
          item.custom_ingredients,
          item.custom_nutrition,
          item.notes
        ]
      );
    }

    // Mark weekly suggestion as accepted
    await pool.execute(
      'UPDATE weekly_meal_suggestions SET is_accepted = TRUE, is_read = TRUE WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Weekly meal suggestion converted to meal plan successfully',
      data: { meal_plan_id: mealPlanId }
    });
  });
}

export default new UserSuggestionController();
