import { Request, Response, NextFunction } from 'express';
import { RowDataPacket } from 'mysql2';
import pool from '../config/database';
import { OperationalError, asyncHandler } from '../middleware/errorHandler';

class AdminSuggestionController {
  /**
   * Create meal suggestion (admin only)
   */
  createMealSuggestion = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {
      title,
      description,
      meal_type,
      cuisine_type,
      dietary_tags,
      difficulty,
      prep_time,
      cook_time,
      calories_per_serving,
      protein_per_serving,
      carbs_per_serving,
      fat_per_serving,
      fiber_per_serving,
      sugar_per_serving,
      sodium_per_serving,
      image_url,
      ingredients,
      instructions,
      tips
    } = req.body;

    const createdBy = req.user!.userId;

    const [result] = await pool.execute(
      `INSERT INTO meal_suggestions (
        title, description, meal_type, cuisine_type, dietary_tags, difficulty,
        prep_time, cook_time, calories_per_serving, protein_per_serving,
        carbs_per_serving, fat_per_serving, fiber_per_serving, sugar_per_serving,
        sodium_per_serving, image_url, ingredients, instructions, tips, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, description, meal_type, cuisine_type, JSON.stringify(dietary_tags || []), difficulty,
        prep_time, cook_time, calories_per_serving, protein_per_serving,
        carbs_per_serving, fat_per_serving, fiber_per_serving, sugar_per_serving,
        sodium_per_serving, image_url, JSON.stringify(ingredients || []), instructions, tips, createdBy
      ]
    );

    const suggestionId = (result as any).insertId;

    // Get created suggestion
    const [suggestions] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM meal_suggestions WHERE id = ?',
      [suggestionId]
    );

    const suggestion = suggestions[0];

    res.status(201).json({
      success: true,
      message: 'Meal suggestion created successfully',
      data: {
        ...suggestion,
        dietary_tags: JSON.parse(suggestion.dietary_tags),
        ingredients: JSON.parse(suggestion.ingredients),
        created_at: new Date(suggestion.created_at),
        updated_at: new Date(suggestion.updated_at)
      }
    });
  });

  /**
   * Create recipe suggestion (admin only)
   */
  createRecipeSuggestion = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {
      title,
      description,
      instructions,
      prep_time,
      cook_time,
      servings,
      difficulty,
      cuisine_type,
      dietary_tags,
      image_url,
      video_url,
      calories_per_serving,
      protein_per_serving,
      carbs_per_serving,
      fat_per_serving,
      fiber_per_serving,
      sugar_per_serving,
      sodium_per_serving,
      ingredients,
      tips,
      nutrition_notes
    } = req.body;

    const createdBy = req.user!.userId;

    const [result] = await pool.execute(
      `INSERT INTO recipe_suggestions (
        title, description, instructions, prep_time, cook_time, servings, difficulty,
        cuisine_type, dietary_tags, image_url, video_url, calories_per_serving,
        protein_per_serving, carbs_per_serving, fat_per_serving, fiber_per_serving,
        sugar_per_serving, sodium_per_serving, ingredients, tips, nutrition_notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title, description, instructions, prep_time, cook_time, servings, difficulty,
        cuisine_type, JSON.stringify(dietary_tags || []), image_url, video_url, calories_per_serving,
        protein_per_serving, carbs_per_serving, fat_per_serving, fiber_per_serving,
        sugar_per_serving, sodium_per_serving, JSON.stringify(ingredients || []), tips, nutrition_notes, createdBy
      ]
    );

    const suggestionId = (result as any).insertId;

    // Get created suggestion
    const [suggestions] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM recipe_suggestions WHERE id = ?',
      [suggestionId]
    );

    const suggestion = suggestions[0];

    res.status(201).json({
      success: true,
      message: 'Recipe suggestion created successfully',
      data: {
        ...suggestion,
        dietary_tags: JSON.parse(suggestion.dietary_tags),
        ingredients: JSON.parse(suggestion.ingredients),
        created_at: new Date(suggestion.created_at),
        updated_at: new Date(suggestion.updated_at)
      }
    });
  });

  /**
   * Get all meal suggestions (admin view)
   */
  getAllMealSuggestions = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { page = 1, limit = 10, meal_type, difficulty, is_active, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Build WHERE clause
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (meal_type) {
      whereClause += ' AND ms.meal_type = ?';
      params.push(meal_type);
    }

    if (difficulty) {
      whereClause += ' AND ms.difficulty = ?';
      params.push(difficulty);
    }

    if (is_active !== undefined) {
      whereClause += ' AND ms.is_active = ?';
      params.push(is_active === 'true');
    }

    if (search) {
      whereClause += ' AND (ms.title LIKE ? OR ms.description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Get total count
    const [countResult] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM meal_suggestions ms ${whereClause}`,
      params
    );

    const total = countResult[0].total;

    // Get meal suggestions
    const [suggestions] = await pool.execute<RowDataPacket[]>(
      `SELECT ms.*, u.first_name as creator_name
       FROM meal_suggestions ms
       LEFT JOIN users u ON ms.created_by = u.id
       ${whereClause}
       ORDER BY ms.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    // Parse JSON fields
    const suggestionsWithParsedData = suggestions.map(suggestion => ({
      ...suggestion,
      dietary_tags: suggestion.dietary_tags ? JSON.parse(suggestion.dietary_tags) : [],
      ingredients: suggestion.ingredients ? JSON.parse(suggestion.ingredients) : [],
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
   * Get all recipe suggestions (admin view)
   */
  getAllRecipeSuggestions = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { page = 1, limit = 10, difficulty, is_active, is_featured, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Build WHERE clause
    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    if (difficulty) {
      whereClause += ' AND rs.difficulty = ?';
      params.push(difficulty);
    }

    if (is_active !== undefined) {
      whereClause += ' AND rs.is_active = ?';
      params.push(is_active === 'true');
    }

    if (is_featured !== undefined) {
      whereClause += ' AND rs.is_featured = ?';
      params.push(is_featured === 'true');
    }

    if (search) {
      whereClause += ' AND (rs.title LIKE ? OR rs.description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Get total count
    const [countResult] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM recipe_suggestions rs ${whereClause}`,
      params
    );

    const total = countResult[0].total;

    // Get recipe suggestions
    const [suggestions] = await pool.execute<RowDataPacket[]>(
      `SELECT rs.*, u.first_name as creator_name
       FROM recipe_suggestions rs
       LEFT JOIN users u ON rs.created_by = u.id
       ${whereClause}
       ORDER BY rs.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    // Parse JSON fields
    const suggestionsWithParsedData = suggestions.map(suggestion => ({
      ...suggestion,
      dietary_tags: suggestion.dietary_tags ? JSON.parse(suggestion.dietary_tags) : [],
      ingredients: suggestion.ingredients ? JSON.parse(suggestion.ingredients) : [],
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
   * Update meal suggestion (admin only)
   */
  updateMealSuggestion = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.created_by;
    delete updateData.created_at;
    delete updateData.updated_at;

    // Handle JSON fields
    if (updateData.dietary_tags) {
      updateData.dietary_tags = JSON.stringify(updateData.dietary_tags);
    }
    if (updateData.ingredients) {
      updateData.ingredients = JSON.stringify(updateData.ingredients);
    }

    // Build UPDATE query
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);

    await pool.execute(
      `UPDATE meal_suggestions SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, id]
    );

    // Get updated suggestion
    const [suggestions] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM meal_suggestions WHERE id = ?',
      [id]
    );

    if (suggestions.length === 0) {
      throw new OperationalError('Meal suggestion not found', 404);
    }

    const suggestion = suggestions[0];

    res.json({
      success: true,
      message: 'Meal suggestion updated successfully',
      data: {
        ...suggestion,
        dietary_tags: JSON.parse(suggestion.dietary_tags),
        ingredients: JSON.parse(suggestion.ingredients),
        created_at: new Date(suggestion.created_at),
        updated_at: new Date(suggestion.updated_at)
      }
    });
  });

  /**
   * Update recipe suggestion (admin only)
   */
  updateRecipeSuggestion = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.created_by;
    delete updateData.created_at;
    delete updateData.updated_at;

    // Handle JSON fields
    if (updateData.dietary_tags) {
      updateData.dietary_tags = JSON.stringify(updateData.dietary_tags);
    }
    if (updateData.ingredients) {
      updateData.ingredients = JSON.stringify(updateData.ingredients);
    }

    // Build UPDATE query
    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);

    await pool.execute(
      `UPDATE recipe_suggestions SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, id]
    );

    // Get updated suggestion
    const [suggestions] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM recipe_suggestions WHERE id = ?',
      [id]
    );

    if (suggestions.length === 0) {
      throw new OperationalError('Recipe suggestion not found', 404);
    }

    const suggestion = suggestions[0];

    res.json({
      success: true,
      message: 'Recipe suggestion updated successfully',
      data: {
        ...suggestion,
        dietary_tags: JSON.parse(suggestion.dietary_tags),
        ingredients: JSON.parse(suggestion.ingredients),
        created_at: new Date(suggestion.created_at),
        updated_at: new Date(suggestion.updated_at)
      }
    });
  });

  /**
   * Delete meal suggestion (admin only)
   */
  deleteMealSuggestion = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    // Check if suggestion exists
    const [suggestions] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM meal_suggestions WHERE id = ?',
      [id]
    );

    if (suggestions.length === 0) {
      throw new OperationalError('Meal suggestion not found', 404);
    }

    // Delete suggestion (cascade will handle related interactions)
    await pool.execute('DELETE FROM meal_suggestions WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Meal suggestion deleted successfully'
    });
  });

  /**
   * Delete recipe suggestion (admin only)
   */
  deleteRecipeSuggestion = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    // Check if suggestion exists
    const [suggestions] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM recipe_suggestions WHERE id = ?',
      [id]
    );

    if (suggestions.length === 0) {
      throw new OperationalError('Recipe suggestion not found', 404);
    }

    // Delete suggestion (cascade will handle related interactions)
    await pool.execute('DELETE FROM recipe_suggestions WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Recipe suggestion deleted successfully'
    });
  });

  /**
   * Toggle meal suggestion status (active/inactive)
   */
  toggleMealSuggestionStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    await pool.execute(
      'UPDATE meal_suggestions SET is_active = NOT is_active WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Meal suggestion status toggled successfully'
    });
  });

  /**
   * Toggle recipe suggestion status (active/inactive)
   */
  toggleRecipeSuggestionStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    await pool.execute(
      'UPDATE recipe_suggestions SET is_active = NOT is_active WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Recipe suggestion status toggled successfully'
    });
  });

  /**
   * Toggle recipe suggestion featured status
   */
  toggleRecipeSuggestionFeatured = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    await pool.execute(
      'UPDATE recipe_suggestions SET is_featured = NOT is_featured WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Recipe suggestion featured status toggled successfully'
    });
  });

  /**
   * Get public meal suggestions (for users to browse)
   */
  getPublicMealSuggestions = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { page = 1, limit = 10, meal_type, difficulty, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Build WHERE clause
    let whereClause = 'WHERE ms.is_active = TRUE';
    const params: any[] = [];

    if (meal_type) {
      whereClause += ' AND ms.meal_type = ?';
      params.push(meal_type);
    }

    if (difficulty) {
      whereClause += ' AND ms.difficulty = ?';
      params.push(difficulty);
    }

    if (search) {
      whereClause += ' AND (ms.title LIKE ? OR ms.description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Get total count
    const [countResult] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM meal_suggestions ms ${whereClause}`,
      params
    );

    const total = countResult[0].total;

    // Get meal suggestions
    const [suggestions] = await pool.execute<RowDataPacket[]>(
      `SELECT ms.*, u.first_name as creator_name
       FROM meal_suggestions ms
       LEFT JOIN users u ON ms.created_by = u.id
       ${whereClause}
       ORDER BY ms.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    // Parse JSON fields
    const suggestionsWithParsedData = suggestions.map(suggestion => ({
      ...suggestion,
      dietary_tags: suggestion.dietary_tags ? JSON.parse(suggestion.dietary_tags) : [],
      ingredients: suggestion.ingredients ? JSON.parse(suggestion.ingredients) : [],
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
   * Get public recipe suggestions (for users to browse)
   */
  getPublicRecipeSuggestions = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { page = 1, limit = 10, difficulty, is_featured, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Build WHERE clause
    let whereClause = 'WHERE rs.is_active = TRUE';
    const params: any[] = [];

    if (difficulty) {
      whereClause += ' AND rs.difficulty = ?';
      params.push(difficulty);
    }

    if (is_featured !== undefined) {
      whereClause += ' AND rs.is_featured = ?';
      params.push(is_featured === 'true');
    }

    if (search) {
      whereClause += ' AND (rs.title LIKE ? OR rs.description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    // Get total count
    const [countResult] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM recipe_suggestions rs ${whereClause}`,
      params
    );

    const total = countResult[0].total;

    // Get recipe suggestions
    const [suggestions] = await pool.execute<RowDataPacket[]>(
      `SELECT rs.*, u.first_name as creator_name
       FROM recipe_suggestions rs
       LEFT JOIN users u ON rs.created_by = u.id
       ${whereClause}
       ORDER BY rs.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    // Parse JSON fields
    const suggestionsWithParsedData = suggestions.map(suggestion => ({
      ...suggestion,
      dietary_tags: suggestion.dietary_tags ? JSON.parse(suggestion.dietary_tags) : [],
      ingredients: suggestion.ingredients ? JSON.parse(suggestion.ingredients) : [],
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
   * Interact with meal suggestion (view, like, save, try)
   */
  interactWithMealSuggestion = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { interaction_type } = req.body;
    const userId = req.user!.userId;

    // Check if meal suggestion exists and is active
    const [suggestions] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM meal_suggestions WHERE id = ? AND is_active = TRUE',
      [id]
    );

    if (suggestions.length === 0) {
      throw new OperationalError('Meal suggestion not found', 404);
    }

    // Check if interaction already exists
    const [existingInteractions] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM user_meal_suggestion_interactions WHERE user_id = ? AND meal_suggestion_id = ? AND interaction_type = ?',
      [userId, id, interaction_type]
    );

    if (existingInteractions.length > 0) {
      // Remove existing interaction (toggle off)
      await pool.execute(
        'DELETE FROM user_meal_suggestion_interactions WHERE user_id = ? AND meal_suggestion_id = ? AND interaction_type = ?',
        [userId, id, interaction_type]
      );
    } else {
      // Add new interaction
      await pool.execute(
        'INSERT INTO user_meal_suggestion_interactions (user_id, meal_suggestion_id, interaction_type) VALUES (?, ?, ?)',
        [userId, id, interaction_type]
      );
    }

    // Update view count if it's a view interaction
    if (interaction_type === 'view') {
      await pool.execute(
        'UPDATE meal_suggestions SET view_count = view_count + 1 WHERE id = ?',
        [id]
      );
    }

    // Update like count if it's a like interaction
    if (interaction_type === 'like') {
      const likeCount = existingInteractions.length > 0 ? -1 : 1;
      await pool.execute(
        'UPDATE meal_suggestions SET like_count = like_count + ? WHERE id = ?',
        [likeCount, id]
      );
    }

    res.json({
      success: true,
      message: `Meal suggestion ${interaction_type} ${existingInteractions.length > 0 ? 'removed' : 'added'} successfully`
    });
  });

  /**
   * Interact with recipe suggestion (view, like, save, try)
   */
  interactWithRecipeSuggestion = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { interaction_type } = req.body;
    const userId = req.user!.userId;

    // Check if recipe suggestion exists and is active
    const [suggestions] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM recipe_suggestions WHERE id = ? AND is_active = TRUE',
      [id]
    );

    if (suggestions.length === 0) {
      throw new OperationalError('Recipe suggestion not found', 404);
    }

    // Check if interaction already exists
    const [existingInteractions] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM user_recipe_suggestion_interactions WHERE user_id = ? AND recipe_suggestion_id = ? AND interaction_type = ?',
      [userId, id, interaction_type]
    );

    if (existingInteractions.length > 0) {
      // Remove existing interaction (toggle off)
      await pool.execute(
        'DELETE FROM user_recipe_suggestion_interactions WHERE user_id = ? AND recipe_suggestion_id = ? AND interaction_type = ?',
        [userId, id, interaction_type]
      );
    } else {
      // Add new interaction
      await pool.execute(
        'INSERT INTO user_recipe_suggestion_interactions (user_id, recipe_suggestion_id, interaction_type) VALUES (?, ?, ?)',
        [userId, id, interaction_type]
      );
    }

    // Update view count if it's a view interaction
    if (interaction_type === 'view') {
      await pool.execute(
        'UPDATE recipe_suggestions SET view_count = view_count + 1 WHERE id = ?',
        [id]
      );
    }

    // Update like count if it's a like interaction
    if (interaction_type === 'like') {
      const likeCount = existingInteractions.length > 0 ? -1 : 1;
      await pool.execute(
        'UPDATE recipe_suggestions SET like_count = like_count + ? WHERE id = ?',
        [likeCount, id]
      );
    }

    res.json({
      success: true,
      message: `Recipe suggestion ${interaction_type} ${existingInteractions.length > 0 ? 'removed' : 'added'} successfully`
    });
  });

  /**
   * Get user's saved suggestions
   */
  getUserSavedSuggestions = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user!.userId;

    // Get saved meal suggestions
    const [savedMeals] = await pool.execute<RowDataPacket[]>(
      `SELECT ms.*, 'meal' as type
       FROM meal_suggestions ms
       INNER JOIN user_meal_suggestion_interactions umsi ON ms.id = umsi.meal_suggestion_id
       WHERE umsi.user_id = ? AND umsi.interaction_type = 'save' AND ms.is_active = TRUE`,
      [userId]
    );

    // Get saved recipe suggestions
    const [savedRecipes] = await pool.execute<RowDataPacket[]>(
      `SELECT rs.*, 'recipe' as type
       FROM recipe_suggestions rs
       INNER JOIN user_recipe_suggestion_interactions ursi ON rs.id = ursi.recipe_suggestion_id
       WHERE ursi.user_id = ? AND ursi.interaction_type = 'save' AND rs.is_active = TRUE`,
      [userId]
    );

    // Parse JSON fields for meal suggestions
    const parsedMeals = savedMeals.map(meal => ({
      ...meal,
      dietary_tags: meal.dietary_tags ? JSON.parse(meal.dietary_tags) : [],
      ingredients: meal.ingredients ? JSON.parse(meal.ingredients) : [],
      created_at: new Date(meal.created_at),
      updated_at: new Date(meal.updated_at)
    }));

    // Parse JSON fields for recipe suggestions
    const parsedRecipes = savedRecipes.map(recipe => ({
      ...recipe,
      dietary_tags: recipe.dietary_tags ? JSON.parse(recipe.dietary_tags) : [],
      ingredients: recipe.ingredients ? JSON.parse(recipe.ingredients) : [],
      created_at: new Date(recipe.created_at),
      updated_at: new Date(recipe.updated_at)
    }));

    res.json({
      success: true,
      data: {
        meals: parsedMeals,
        recipes: parsedRecipes,
        total: parsedMeals.length + parsedRecipes.length
      }
    });
  });

  /**
   * Get suggestion analytics
   */
  getSuggestionAnalytics = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Get meal suggestion stats
    const [mealStats] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(view_count) as total_views,
        SUM(like_count) as total_likes,
        AVG(view_count) as avg_views,
        AVG(like_count) as avg_likes
       FROM meal_suggestions`
    );

    // Get recipe suggestion stats
    const [recipeStats] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN is_featured = 1 THEN 1 ELSE 0 END) as featured,
        SUM(view_count) as total_views,
        SUM(like_count) as total_likes,
        AVG(view_count) as avg_views,
        AVG(like_count) as avg_likes
       FROM recipe_suggestions`
    );

    // Get top performing suggestions
    const [topMealSuggestions] = await pool.execute<RowDataPacket[]>(
      `SELECT title, view_count, like_count 
       FROM meal_suggestions 
       WHERE is_active = 1 
       ORDER BY view_count DESC 
       LIMIT 5`
    );

    const [topRecipeSuggestions] = await pool.execute<RowDataPacket[]>(
      `SELECT title, view_count, like_count 
       FROM recipe_suggestions 
       WHERE is_active = 1 
       ORDER BY view_count DESC 
       LIMIT 5`
    );

    res.json({
      success: true,
      data: {
        meal_suggestions: mealStats[0],
        recipe_suggestions: recipeStats[0],
        top_meal_suggestions: topMealSuggestions,
        top_recipe_suggestions: topRecipeSuggestions
      }
    });
  });
}

export default new AdminSuggestionController();
