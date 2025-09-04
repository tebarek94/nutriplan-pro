import { Request, Response, NextFunction } from 'express';
import { RowDataPacket } from 'mysql2';
import pool from '../../config/database';
import { OperationalError, asyncHandler } from '../../middleware/errorHandler';

class AdminController {
  /**
   * Get dashboard analytics
   */
  getDashboardAnalytics = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Get total users and user statistics
      const [userCount] = await pool.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as total FROM users WHERE role = "user"'
      );

      const [activeUsers] = await pool.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as total FROM users WHERE role = "user" AND is_active = TRUE'
      );

      const [newThisMonth] = await pool.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as total FROM users WHERE role = "user" AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)'
      );

      const [lastMonthUsers] = await pool.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as total FROM users WHERE role = "user" AND created_at >= DATE_SUB(NOW(), INTERVAL 60 DAY) AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY)'
      );

      const growthRate = lastMonthUsers[0].total > 0 
        ? ((newThisMonth[0].total - lastMonthUsers[0].total) / lastMonthUsers[0].total) * 100 
        : 0;

      // Get recipe statistics
      const [recipeCount] = await pool.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as total FROM recipes'
      );

      const [approvedRecipes] = await pool.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as total FROM recipes WHERE is_approved = TRUE'
      );

      const [pendingRecipes] = await pool.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as total FROM recipes WHERE is_approved = FALSE'
      );

      // Get average rating and total likes
      let avgRating = 0;
      let totalLikes = 0;
      try {
        const [ratingResult] = await pool.execute<RowDataPacket[]>(
          'SELECT AVG(avg_rating) as avg_rating FROM recipes WHERE avg_rating IS NOT NULL'
        );
        avgRating = ratingResult[0].avg_rating || 0;

        const [likesResult] = await pool.execute<RowDataPacket[]>(
          'SELECT SUM(like_count) as total_likes FROM recipes'
        );
        totalLikes = likesResult[0].total_likes || 0;
      } catch (error) {
        console.warn('Error getting recipe ratings/likes:', error);
      }

      // Get meal plan statistics
      const [mealPlanCount] = await pool.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as total FROM meal_plans'
      );

      const [aiGeneratedPlans] = await pool.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as total FROM meal_plans WHERE is_ai_generated = TRUE'
      );

      const [userCreatedPlans] = await pool.execute<RowDataPacket[]>(
        'SELECT COUNT(*) as total FROM meal_plans WHERE is_ai_generated = FALSE'
      );

      // Get average calories
      let avgCalories = 0;
      try {
        const [caloriesResult] = await pool.execute<RowDataPacket[]>(
          'SELECT AVG(COALESCE(total_calories, 0)) as avg_calories FROM meal_plans'
        );
        avgCalories = caloriesResult[0].avg_calories || 0;
      } catch (error) {
        console.warn('Error getting average calories:', error);
      }

      // Get suggestion statistics
      let suggestionStats = { total: 0, pending: 0, approved: 0, implemented: 0, rejected: 0 };
      try {
        const [suggestionCount] = await pool.execute<RowDataPacket[]>(
          'SELECT COUNT(*) as total FROM suggestions'
        );
        const [pendingSuggestions] = await pool.execute<RowDataPacket[]>(
          'SELECT COUNT(*) as total FROM suggestions WHERE status = "pending"'
        );
        const [approvedSuggestions] = await pool.execute<RowDataPacket[]>(
          'SELECT COUNT(*) as total FROM suggestions WHERE status = "approved"'
        );
        const [implementedSuggestions] = await pool.execute<RowDataPacket[]>(
          'SELECT COUNT(*) as total FROM suggestions WHERE status = "implemented"'
        );
        const [rejectedSuggestions] = await pool.execute<RowDataPacket[]>(
          'SELECT COUNT(*) as total FROM suggestions WHERE status = "rejected"'
        );

        suggestionStats = {
          total: suggestionCount[0].total,
          pending: pendingSuggestions[0].total,
          approved: approvedSuggestions[0].total,
          implemented: implementedSuggestions[0].total,
          rejected: rejectedSuggestions[0].total
        };
      } catch (error) {
        console.warn('Suggestions table might not exist:', error);
      }

      // Get recent activity
      const [recentUsers] = await pool.execute<RowDataPacket[]>(
        `SELECT id, first_name, last_name, email, created_at
         FROM users 
         WHERE role = "user"
         ORDER BY created_at DESC 
         LIMIT 5`
      );

      const [recentRecipes] = await pool.execute<RowDataPacket[]>(
        `SELECT r.id, r.title, r.created_by as user_id, r.created_at, u.first_name, u.last_name
         FROM recipes r
         LEFT JOIN users u ON r.created_by = u.id
         ORDER BY r.created_at DESC 
         LIMIT 5`
      );

      const [popularRecipes] = await pool.execute<RowDataPacket[]>(
        `SELECT r.id, r.title, COALESCE(r.avg_rating, 0) as avg_rating, COALESCE(r.like_count, 0) as like_count, u.first_name, u.last_name
         FROM recipes r
         LEFT JOIN users u ON r.created_by = u.id
         WHERE r.is_approved = TRUE
         ORDER BY COALESCE(r.like_count, 0) DESC, COALESCE(r.avg_rating, 0) DESC
         LIMIT 5`
      );

      res.json({
        success: true,
        data: {
          users: {
            total: userCount[0].total,
            active: activeUsers[0].total,
            newThisMonth: newThisMonth[0].total,
            growthRate: growthRate
          },
          recipes: {
            total: recipeCount[0].total,
            approved: approvedRecipes[0].total,
            pending: pendingRecipes[0].total,
            avgRating: avgRating,
            totalLikes: totalLikes
          },
          mealPlans: {
            total: mealPlanCount[0].total,
            aiGenerated: aiGeneratedPlans[0].total,
            userCreated: userCreatedPlans[0].total,
            avgCalories: avgCalories
          },
          suggestions: suggestionStats,
          recentActivity: {
            newUsers: recentUsers,
            newRecipes: recentRecipes,
            popularRecipes: popularRecipes
          },
          monthlyStats: {
            users: [0, 0, 0, 0, 0, 0], // Placeholder for monthly data
            recipes: [0, 0, 0, 0, 0, 0],
            mealPlans: [0, 0, 0, 0, 0, 0]
          }
        }
      });
    } catch (error) {
      console.error('Error in getDashboardAnalytics:', error);
      throw error;
    }
  });

  /**
   * Get all users with pagination
   */
  getAllUsers = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { page = 1, limit = 10, search } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = '';
    let params: any[] = [];

    if (search) {
      whereClause = 'WHERE (email LIKE ? OR first_name LIKE ? OR last_name LIKE ?)';
      params = [`%${search}%`, `%${search}%`, `%${search}%`];
    }

    // Get total count
    const [countResult] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM users ${whereClause}`,
      params
    );

    const total = countResult[0].total;

    // Get users
    const [users] = await pool.execute<RowDataPacket[]>(
      `SELECT id, email, first_name, last_name, role, is_active, email_verified, created_at, updated_at
       FROM users ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    res.json({
      success: true,
      data: users.map(user => ({
        ...user,
        created_at: new Date(user.created_at),
        updated_at: new Date(user.updated_at)
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
   * Get user profile by ID (for admin)
   */
  getUserProfile = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    // Get user with profile
    const [users] = await pool.execute<RowDataPacket[]>(
      `SELECT u.id, u.email, u.first_name, u.last_name, u.role, u.is_active, 
              u.email_verified, u.created_at, u.updated_at,
              up.age, up.gender, up.weight, up.height, up.activity_level, 
              up.fitness_goal, up.dietary_preferences, up.allergies, up.medical_conditions
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       WHERE u.id = ?`,
      [id]
    );

    if (users.length === 0) {
      throw new OperationalError('User not found', 404);
    }

    const userData = users[0];
    const user = {
      id: userData.id,
      email: userData.email,
      first_name: userData.first_name,
      last_name: userData.last_name,
      role: userData.role,
      is_active: userData.is_active,
      email_verified: userData.email_verified,
      created_at: new Date(userData.created_at),
      updated_at: new Date(userData.updated_at),
      profile: userData.age ? {
        age: userData.age,
        gender: userData.gender,
        weight: userData.weight,
        height: userData.height,
        activity_level: userData.activity_level,
        fitness_goal: userData.fitness_goal,
        dietary_preferences: userData.dietary_preferences ? JSON.parse(userData.dietary_preferences) : [],
        allergies: userData.allergies ? JSON.parse(userData.allergies) : [],
        medical_conditions: userData.medical_conditions
      } : null
    };

    res.json({
      success: true,
      data: user
    });
  });

  /**
   * Update user status
   */
  updateUserStatus = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { is_active } = req.body;

    // Check if user exists
    const [users] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      throw new OperationalError('User not found', 404);
    }

    // Update user status
    await pool.execute(
      'UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [is_active, id]
    );

    res.json({
      success: true,
      message: `User ${is_active ? 'activated' : 'deactivated'} successfully`
    });
  });

  /**
   * Get pending recipe approvals
   */
  getPendingRecipes = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Get total count
    const [countResult] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM recipes WHERE is_approved = FALSE'
    );

    const total = countResult[0].total;

    // Get pending recipes
    const [recipes] = await pool.execute<RowDataPacket[]>(
      `SELECT r.*, u.first_name, u.last_name, u.email
       FROM recipes r
       LEFT JOIN users u ON r.created_by = u.id
       WHERE r.is_approved = FALSE
       ORDER BY r.created_at DESC
       LIMIT ? OFFSET ?`,
      [Number(limit), offset]
    );

    res.json({
      success: true,
      data: recipes.map(recipe => ({
        ...recipe,
        dietary_tags: recipe.dietary_tags ? JSON.parse(recipe.dietary_tags) : [],
        created_at: new Date(recipe.created_at),
        updated_at: new Date(recipe.updated_at)
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
   * Approve/reject recipe
   */
  approveRecipe = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const { is_approved, is_featured = false } = req.body;

    // Check if recipe exists
    const [recipes] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM recipes WHERE id = ?',
      [id]
    );

    if (recipes.length === 0) {
      throw new OperationalError('Recipe not found', 404);
    }

    // Update recipe approval status
    await pool.execute(
      'UPDATE recipes SET is_approved = ?, is_featured = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [is_approved, is_featured, id]
    );

    res.json({
      success: true,
      message: `Recipe ${is_approved ? 'approved' : 'rejected'} successfully`
    });
  });

  /**
   * Get AI analysis logs
   */
  getAIAnalysisLogs = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { page = 1, limit = 10, analysis_type } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = '';
    let params: any[] = [];

    if (analysis_type) {
      whereClause = 'WHERE analysis_type = ?';
      params.push(analysis_type);
    }

    // Get total count
    const [countResult] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM ai_analysis_logs ${whereClause}`,
      params
    );

    const total = countResult[0].total;

    // Get AI logs
    const [logs] = await pool.execute<RowDataPacket[]>(
      `SELECT al.*, u.email, u.first_name, u.last_name
       FROM ai_analysis_logs al
       LEFT JOIN users u ON al.user_id = u.id
       ${whereClause}
       ORDER BY al.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    res.json({
      success: true,
      data: logs.map(log => ({
        ...log,
        created_at: new Date(log.created_at)
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
   * Get food categories
   */
  getFoodCategories = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const [categories] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM food_categories ORDER BY name'
    );

    res.json({
      success: true,
      data: categories.map(category => ({
        ...category,
        created_at: new Date(category.created_at),
        updated_at: new Date(category.updated_at)
      }))
    });
  });

  /**
   * Create food category
   */
  createFoodCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { name, description, color, icon } = req.body;

    // Check if category already exists
    const [existingCategories] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM food_categories WHERE name = ?',
      [name]
    );

    if (existingCategories.length > 0) {
      throw new OperationalError('Category with this name already exists', 409);
    }

    // Create category
    const [result] = await pool.execute(
      'INSERT INTO food_categories (name, description, color, icon) VALUES (?, ?, ?, ?)',
      [name, description || null, color || null, icon || null]
    );

    const categoryId = (result as any).insertId;

    res.status(201).json({
      success: true,
      message: 'Food category created successfully',
      data: { id: categoryId }
    });
  });

  /**
   * Update food category
   */
  updateFoodCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const updateData = req.body;

    // Check if category exists
    const [categories] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM food_categories WHERE id = ?',
      [id]
    );

    if (categories.length === 0) {
      throw new OperationalError('Food category not found', 404);
    }

    // Update category
    const updateFields = [];
    const updateValues = [];

    Object.keys(updateData).forEach(key => {
      if (key !== 'id' && key !== 'created_at') {
        updateFields.push(`${key} = ?`);
        updateValues.push(updateData[key]);
      }
    });

    if (updateFields.length > 0) {
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(id);

      await pool.execute(
        `UPDATE food_categories SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
    }

    res.json({
      success: true,
      message: 'Food category updated successfully'
    });
  });

  /**
   * Delete food category
   */
  deleteFoodCategory = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    // Check if category exists and has no ingredients
    const [ingredients] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM ingredients WHERE category_id = ?',
      [id]
    );

    if (ingredients[0].count > 0) {
      throw new OperationalError('Cannot delete category with existing ingredients', 400);
    }

    // Delete category
    await pool.execute('DELETE FROM food_categories WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Food category deleted successfully'
    });
  });

  /**
   * Get ingredients with pagination
   */
  getAllIngredients = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { page = 1, limit = 10, search, category_id } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = '';
    let params: any[] = [];

    if (search) {
      whereClause = 'WHERE i.name LIKE ?';
      params.push(`%${search}%`);
    }

    if (category_id) {
      whereClause = whereClause ? `${whereClause} AND i.category_id = ?` : 'WHERE i.category_id = ?';
      params.push(category_id);
    }

    // Get total count
    const [countResult] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM ingredients i ${whereClause}`,
      params
    );

    const total = countResult[0].total;

    // Get ingredients
    const [ingredients] = await pool.execute<RowDataPacket[]>(
      `SELECT i.*, fc.name as category_name
       FROM ingredients i
       LEFT JOIN food_categories fc ON i.category_id = fc.id
       ${whereClause}
       ORDER BY i.name
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    res.json({
      success: true,
      data: ingredients.map(ingredient => ({
        ...ingredient,
        vitamins: ingredient.vitamins ? JSON.parse(ingredient.vitamins) : {},
        allergens: ingredient.allergens ? JSON.parse(ingredient.allergens) : [],
        created_at: new Date(ingredient.created_at),
        updated_at: new Date(ingredient.updated_at)
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
   * Create ingredient
   */
  createIngredient = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const {
      name,
      category_id,
      calories_per_100g,
      protein_per_100g,
      carbs_per_100g,
      fat_per_100g,
      fiber_per_100g,
      sugar_per_100g,
      sodium_per_100g,
      vitamins,
      allergens,
      image_url
    } = req.body;

    // Check if ingredient already exists
    const [existingIngredients] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM ingredients WHERE name = ?',
      [name]
    );

    if (existingIngredients.length > 0) {
      throw new OperationalError('Ingredient with this name already exists', 409);
    }

    // Create ingredient
    const [result] = await pool.execute(
      `INSERT INTO ingredients (
        name, category_id, calories_per_100g, protein_per_100g, carbs_per_100g,
        fat_per_100g, fiber_per_100g, sugar_per_100g, sodium_per_100g,
        vitamins, allergens, image_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        category_id || null,
        calories_per_100g || null,
        protein_per_100g || null,
        carbs_per_100g || null,
        fat_per_100g || null,
        fiber_per_100g || null,
        sugar_per_100g || null,
        sodium_per_100g || null,
        vitamins ? JSON.stringify(vitamins) : null,
        allergens ? JSON.stringify(allergens) : null,
        image_url || null
      ]
    );

    const ingredientId = (result as any).insertId;

    res.status(201).json({
      success: true,
      message: 'Ingredient created successfully',
      data: { id: ingredientId }
    });
  });

  /**
   * Update ingredient
   */
  updateIngredient = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const updateData = req.body;

    // Check if ingredient exists
    const [ingredients] = await pool.execute<RowDataPacket[]>(
      'SELECT id FROM ingredients WHERE id = ?',
      [id]
    );

    if (ingredients.length === 0) {
      throw new OperationalError('Ingredient not found', 404);
    }

    // Update ingredient
    const updateFields = [];
    const updateValues = [];

    Object.keys(updateData).forEach(key => {
      if (key !== 'id' && key !== 'created_at') {
        updateFields.push(`${key} = ?`);
        if (key === 'vitamins' || key === 'allergens') {
          updateValues.push(updateData[key] ? JSON.stringify(updateData[key]) : null);
        } else {
          updateValues.push(updateData[key]);
        }
      }
    });

    if (updateFields.length > 0) {
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(id);

      await pool.execute(
        `UPDATE ingredients SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
    }

    res.json({
      success: true,
      message: 'Ingredient updated successfully'
    });
  });

  /**
   * Delete ingredient
   */
  deleteIngredient = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;

    // Check if ingredient is used in recipes
    const [recipes] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as count FROM recipe_ingredients WHERE ingredient_id = ?',
      [id]
    );

    if (recipes[0].count > 0) {
      throw new OperationalError('Cannot delete ingredient used in recipes', 400);
    }

    // Delete ingredient
    await pool.execute('DELETE FROM ingredients WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Ingredient deleted successfully'
    });
  });
}

export default new AdminController();
