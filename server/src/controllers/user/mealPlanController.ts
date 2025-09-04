import { Request, Response, NextFunction } from 'express';
import { RowDataPacket } from 'mysql2';
import pool from '../../config/database';
import { OperationalError, asyncHandler } from '../../middleware/errorHandler';
import { CreateMealPlanRequest, AIGenerateMealPlanRequest, AIGenerateWeeklyMealPlanRequest, MealPlan, MealPlanItem } from '../../types';
import geminiService from '../../services/geminiService';

class MealPlanController {
  /**
   * Get meal plan statistics for dashboard
   */
  getMealPlanStats = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user!.userId;

    // Get total meal plans count
    const [mealPlansCount] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM meal_plans WHERE user_id = ?',
      [userId]
    );

    // Get AI-generated meal plans count
    const [aiGeneratedMealPlans] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM meal_plans WHERE user_id = ? AND is_ai_generated = TRUE',
      [userId]
    );

    // Get AI-generated recipes count
    const [aiGeneratedRecipes] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM recipes WHERE created_by = ? AND is_ai_generated = TRUE',
      [userId]
    );

    // Get total recipes count (from favorites)
    const [favoritesCount] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM user_favorites WHERE user_id = ?',
      [userId]
    );

    // Get total grocery lists count
    const [groceryListsCount] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM grocery_lists WHERE user_id = ?',
      [userId]
    );

    // Get active meal plans (current date falls within start_date and end_date)
    const [activeMealPlans] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM meal_plans 
       WHERE user_id = ? 
       AND start_date <= CURDATE() 
       AND end_date >= CURDATE()`,
      [userId]
    );

    // Get total calories from active meal plans
    const [totalCalories] = await pool.execute<RowDataPacket[]>(
      `SELECT COALESCE(SUM(mp.total_calories), 0) as total FROM meal_plans mp
       WHERE mp.user_id = ? 
       AND mp.start_date <= CURDATE() 
       AND mp.end_date >= CURDATE()`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        totalMealPlans: mealPlansCount[0].total,
        totalRecipes: favoritesCount[0].total,
        totalGroceryLists: groceryListsCount[0].total,
        activeMealPlans: activeMealPlans[0].total,
        totalCalories: totalCalories[0].total,
        aiGeneratedPlans: aiGeneratedMealPlans[0].total,
        aiGeneratedRecipes: aiGeneratedRecipes[0].total
      }
    });
  });

  /**
   * Get user's meal plans
   */
  getUserMealPlans = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user!.userId;
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Get total count
    const [countResult] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM meal_plans WHERE user_id = ?',
      [userId]
    );

    const total = countResult[0].total;

    // Get meal plans
    const [mealPlans] = await pool.execute<RowDataPacket[]>(
      `SELECT * FROM meal_plans 
       WHERE user_id = ? 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [userId, Number(limit), offset]
    );

    // Get meal items for each plan
    const mealPlansWithItems = await Promise.all(
      mealPlans.map(async (mealPlan) => {
        const [mealItems] = await pool.execute<RowDataPacket[]>(
          `SELECT mpi.*, r.title as recipe_title, r.image_url as recipe_image,
                  r.calories_per_serving, r.protein_per_serving, r.carbs_per_serving, r.fat_per_serving
           FROM meal_plan_items mpi
           LEFT JOIN recipes r ON mpi.recipe_id = r.id
           WHERE mpi.meal_plan_id = ?
           ORDER BY 
             CASE mpi.day_of_week 
               WHEN 'monday' THEN 1 WHEN 'tuesday' THEN 2 WHEN 'wednesday' THEN 3 
               WHEN 'thursday' THEN 4 WHEN 'friday' THEN 5 WHEN 'saturday' THEN 6 
               WHEN 'sunday' THEN 7 END,
             CASE mpi.meal_type 
               WHEN 'breakfast' THEN 1 WHEN 'lunch' THEN 2 WHEN 'dinner' THEN 3 
               WHEN 'snack' THEN 4 END`,
          [mealPlan.id]
        );

        return {
          ...mealPlan,
          start_date: new Date(mealPlan.start_date),
          end_date: new Date(mealPlan.end_date),
          created_at: new Date(mealPlan.created_at),
          updated_at: new Date(mealPlan.updated_at),
          meals: mealItems.map(item => ({
            ...item,
            custom_ingredients: item.custom_ingredients ? JSON.parse(item.custom_ingredients) : [],
            custom_nutrition: item.custom_nutrition ? JSON.parse(item.custom_nutrition) : {},
            created_at: new Date(item.created_at)
          }))
        };
      })
    );

    res.json({
      success: true,
      data: mealPlansWithItems,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  });

  /**
   * Get meal plan by ID
   */
  getMealPlanById = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Get meal plan
    const [mealPlans] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM meal_plans WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (mealPlans.length === 0) {
      throw new OperationalError('Meal plan not found', 404);
    }

    const mealPlan = mealPlans[0];

    // Get meal items
    const [mealItems] = await pool.execute<RowDataPacket[]>(
      `SELECT mpi.*, r.title as recipe_title, r.image_url as recipe_image,
              r.calories_per_serving, r.protein_per_serving, r.carbs_per_serving, r.fat_per_serving
       FROM meal_plan_items mpi
       LEFT JOIN recipes r ON mpi.recipe_id = r.id
       WHERE mpi.meal_plan_id = ?
       ORDER BY 
         CASE mpi.day_of_week 
           WHEN 'monday' THEN 1 WHEN 'tuesday' THEN 2 WHEN 'wednesday' THEN 3 
           WHEN 'thursday' THEN 4 WHEN 'friday' THEN 5 WHEN 'saturday' THEN 6 
           WHEN 'sunday' THEN 7 END,
         CASE mpi.meal_type 
           WHEN 'breakfast' THEN 1 WHEN 'lunch' THEN 2 WHEN 'dinner' THEN 3 
           WHEN 'snack' THEN 4 END`,
      [id]
    );

    const mealPlanData = {
      ...mealPlan,
      start_date: new Date(mealPlan.start_date),
      end_date: new Date(mealPlan.end_date),
      created_at: new Date(mealPlan.created_at),
      updated_at: new Date(mealPlan.updated_at),
      meals: mealItems.map(item => ({
        ...item,
        custom_ingredients: item.custom_ingredients ? JSON.parse(item.custom_ingredients) : [],
        custom_nutrition: item.custom_nutrition ? JSON.parse(item.custom_nutrition) : {},
        created_at: new Date(item.created_at)
      }))
    };

    res.json({
      success: true,
      data: mealPlanData
    });
  });

  /**
   * Create meal plan manually
   */
  createMealPlan = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user!.userId;
    const mealPlanData: CreateMealPlanRequest = req.body;

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Create meal plan
      const [mealPlanResult] = await connection.execute(
        `INSERT INTO meal_plans (
          user_id, name, description, start_date, end_date,
          total_calories, total_protein, total_carbs, total_fat,
          is_ai_generated
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          mealPlanData.name,
          mealPlanData.description || null,
          mealPlanData.start_date,
          mealPlanData.end_date,
          mealPlanData.total_calories || null,
          mealPlanData.total_protein || null,
          mealPlanData.total_carbs || null,
          mealPlanData.total_fat || null,
          false
        ]
      );

      const mealPlanId = (mealPlanResult as any).insertId;

      // Add meal items
      for (const meal of mealPlanData.meals) {
        await connection.execute(
          `INSERT INTO meal_plan_items (
            meal_plan_id, recipe_id, meal_type, day_of_week,
            custom_meal_name, custom_ingredients, custom_nutrition
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            mealPlanId,
            meal.recipe_id || null,
            meal.meal_type,
            meal.day_of_week,
            meal.custom_meal_name || null,
            meal.custom_ingredients ? JSON.stringify(meal.custom_ingredients) : null,
            meal.custom_nutrition ? JSON.stringify(meal.custom_nutrition) : null
          ]
        );
      }

      await connection.commit();

      res.status(201).json({
        success: true,
        message: 'Meal plan created successfully',
        data: { id: mealPlanId }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  });

  /**
   * Generate meal plan using AI
   */
  generateMealPlan = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user!.userId;
    const requestData: AIGenerateMealPlanRequest = req.body;

    // Generate meal plan using AI
    const aiMealPlan = await geminiService.generateMealPlan(requestData);

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Create meal plan
      const [mealPlanResult] = await connection.execute(
        `INSERT INTO meal_plans (
          user_id, name, description, start_date, end_date,
          total_calories, total_protein, total_carbs, total_fat,
          is_ai_generated, ai_prompt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          aiMealPlan.name,
          aiMealPlan.description,
          aiMealPlan.start_date,
          aiMealPlan.end_date,
          aiMealPlan.total_calories,
          aiMealPlan.total_protein,
          aiMealPlan.total_carbs,
          aiMealPlan.total_fat,
          true,
          JSON.stringify(requestData)
        ]
      );

      const mealPlanId = (mealPlanResult as any).insertId;

      // Add meal items
      for (const meal of aiMealPlan.meals) {
        await connection.execute(
          `INSERT INTO meal_plan_items (
            meal_plan_id, recipe_id, meal_type, day_of_week,
            custom_meal_name, custom_ingredients, custom_nutrition
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            mealPlanId,
            meal.recipe_id || null,
            meal.meal_type,
            meal.day_of_week,
            meal.custom_meal_name || null,
            meal.custom_ingredients ? JSON.stringify(meal.custom_ingredients) : null,
            meal.custom_nutrition ? JSON.stringify(meal.custom_nutrition) : null
          ]
        );
      }

      await connection.commit();

      res.status(201).json({
        success: true,
        message: 'AI meal plan generated successfully',
        data: { 
          id: mealPlanId,
          meal_plan: aiMealPlan
        }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  });

  /**
   * Generate weekly meal plan using AI
   */
  generateWeeklyMealPlan = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user!.userId;
    const requestData: AIGenerateWeeklyMealPlanRequest = req.body;

    // Generate weekly meal plan using AI
    const generatedWeeklyPlan = await geminiService.generateWeeklyMealPlan(requestData);

    // Save the generated weekly meal plan to database
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Calculate end date (7 days from start)
      const startDate = new Date(requestData.week_start_date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 6);

      // Create meal plan
      const [mealPlanResult] = await connection.execute(
        `INSERT INTO meal_plans (
          user_id, name, description, start_date, end_date,
          total_calories, total_protein, total_carbs, total_fat,
          is_ai_generated, ai_prompt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          'AI Generated Weekly Meal Plan',
          'Weekly meal plan generated using AI',
          startDate.toISOString().split('T')[0],
          endDate.toISOString().split('T')[0],
          generatedWeeklyPlan.total_calories || null,
          generatedWeeklyPlan.total_protein || null,
          generatedWeeklyPlan.total_carbs || null,
          generatedWeeklyPlan.total_fat || null,
          true,
          JSON.stringify(requestData)
        ]
      );

      const mealPlanId = (mealPlanResult as any).insertId;

      // Add meal items for each day
      for (const dayMeals of generatedWeeklyPlan.meals) {
        for (const meal of dayMeals.meals) {
          await connection.execute(
            `INSERT INTO meal_plan_items (
              meal_plan_id, recipe_id, meal_type, day_of_week,
              custom_meal_name, custom_ingredients, custom_nutrition
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              mealPlanId,
              meal.recipe_id || null,
              meal.meal_type,
              dayMeals.day,
              meal.custom_meal_name || null,
              null,
              JSON.stringify({
                calories: meal.calories,
                protein: meal.protein,
                carbs: meal.carbs,
                fat: meal.fat
              })
            ]
          );
        }
      }

      await connection.commit();

      res.status(201).json({
        success: true,
        message: 'Weekly meal plan generated successfully',
        data: { 
          id: mealPlanId,
          meal_plan: generatedWeeklyPlan
        }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  });

  /**
   * Update meal plan
   */
  updateMealPlan = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const userId = req.user!.userId;
    const updateData = req.body;

    // Check if meal plan exists and user has permission
    const [mealPlans] = await pool.execute<RowDataPacket[]>(
      'SELECT user_id FROM meal_plans WHERE id = ?',
      [id]
    );

    if (mealPlans.length === 0) {
      throw new OperationalError('Meal plan not found', 404);
    }

    if (mealPlans[0].user_id !== userId) {
      throw new OperationalError('Not authorized to update this meal plan', 403);
    }

    // Update meal plan
    const updateFields = [];
    const updateValues = [];

    Object.keys(updateData).forEach(key => {
      if (key !== 'id' && key !== 'user_id' && key !== 'created_at' && key !== 'meals') {
        updateFields.push(`${key} = ?`);
        updateValues.push(updateData[key]);
      }
    });

    if (updateFields.length > 0) {
      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(id);

      await pool.execute(
        `UPDATE meal_plans SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues
      );
    }

    // Update meals if provided
    if (updateData.meals) {
      // Delete existing meals
      await pool.execute('DELETE FROM meal_plan_items WHERE meal_plan_id = ?', [id]);

      // Add new meals
      for (const meal of updateData.meals) {
        await pool.execute(
          `INSERT INTO meal_plan_items (
            meal_plan_id, recipe_id, meal_type, day_of_week,
            custom_meal_name, custom_ingredients, custom_nutrition
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            id,
            meal.recipe_id || null,
            meal.meal_type,
            meal.day_of_week,
            meal.custom_meal_name || null,
            meal.custom_ingredients ? JSON.stringify(meal.custom_ingredients) : null,
            meal.custom_nutrition ? JSON.stringify(meal.custom_nutrition) : null
          ]
        );
      }
    }

    res.json({
      success: true,
      message: 'Meal plan updated successfully'
    });
  });

  /**
   * Delete meal plan
   */
  deleteMealPlan = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Check if meal plan exists and user has permission
    const [mealPlans] = await pool.execute<RowDataPacket[]>(
      'SELECT user_id FROM meal_plans WHERE id = ?',
      [id]
    );

    if (mealPlans.length === 0) {
      throw new OperationalError('Meal plan not found', 404);
    }

    if (mealPlans[0].user_id !== userId) {
      throw new OperationalError('Not authorized to delete this meal plan', 403);
    }

    // Delete meal plan (cascade will handle meal items)
    await pool.execute('DELETE FROM meal_plans WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Meal plan deleted successfully'
    });
  });

  /**
   * Generate grocery list from meal plan
   */
  generateGroceryList = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { name = 'Grocery List' } = req.body;

    // Check if meal plan exists and user has permission
    const [mealPlans] = await pool.execute<RowDataPacket[]>(
      'SELECT user_id FROM meal_plans WHERE id = ?',
      [id]
    );

    if (mealPlans.length === 0) {
      throw new OperationalError('Meal plan not found', 404);
    }

    if (mealPlans[0].user_id !== userId) {
      throw new OperationalError('Not authorized to access this meal plan', 403);
    }

    // Get all ingredients from meal plan
    const [ingredients] = await pool.execute<RowDataPacket[]>(
      `SELECT DISTINCT 
         i.id as ingredient_id,
         i.name,
         i.category_id,
         fc.name as category_name,
         SUM(ri.quantity) as total_quantity,
         ri.unit,
         'recipe' as source_type,
         r.title as recipe_title
       FROM meal_plan_items mpi
       JOIN recipe_ingredients ri ON mpi.recipe_id = ri.recipe_id
       JOIN ingredients i ON ri.ingredient_id = i.id
       LEFT JOIN food_categories fc ON i.category_id = fc.id
       LEFT JOIN recipes r ON mpi.recipe_id = r.id
       WHERE mpi.meal_plan_id = ?
       GROUP BY i.id, ri.unit`,
      [id]
    );

    // Get custom ingredients separately
    const [customIngredients] = await pool.execute<RowDataPacket[]>(
      `SELECT 
         mpi.custom_ingredients,
         mpi.custom_meal_name
       FROM meal_plan_items mpi
       WHERE mpi.meal_plan_id = ? AND mpi.custom_ingredients IS NOT NULL`,
      [id]
    );

    // Parse custom ingredients
    const parsedCustomIngredients = customIngredients.flatMap(item => {
      if (!item.custom_ingredients) return [];
      try {
        const ingredients = JSON.parse(item.custom_ingredients);
        return ingredients.map((ingredient: any) => ({
          ingredient_id: null,
          name: ingredient.name,
          category_id: null,
          category_name: null,
          total_quantity: ingredient.quantity,
          unit: ingredient.unit,
          source_type: 'custom',
          recipe_title: item.custom_meal_name
        }));
      } catch (error) {
        console.error('Error parsing custom ingredients:', error);
        return [];
      }
    });

    // Combine recipe ingredients and custom ingredients
    const allIngredients = [...ingredients, ...parsedCustomIngredients];

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Create grocery list
      const [groceryListResult] = await connection.execute(
        'INSERT INTO grocery_lists (user_id, meal_plan_id, name) VALUES (?, ?, ?)',
        [userId, id, name]
      );

      const groceryListId = (groceryListResult as any).insertId;

      // Add grocery items
      for (const ingredient of allIngredients) {
        await connection.execute(
          `INSERT INTO grocery_list_items (
            grocery_list_id, ingredient_id, custom_item_name,
            quantity, unit, category_id
          ) VALUES (?, ?, ?, ?, ?, ?)`,
          [
            groceryListId,
            ingredient.ingredient_id,
            ingredient.ingredient_id ? null : ingredient.name,
            ingredient.total_quantity,
            ingredient.unit,
            ingredient.category_id
          ]
        );
      }

      await connection.commit();

      res.status(201).json({
        success: true,
        message: 'Grocery list generated successfully',
        data: { 
          id: groceryListId,
          name,
          item_count: allIngredients.length
        }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  });

  /**
   * Get nutrition summary for meal plan
   */
  getNutritionSummary = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const userId = req.user!.userId;

    // Check if meal plan exists and user has permission
    const [mealPlans] = await pool.execute<RowDataPacket[]>(
      'SELECT user_id FROM meal_plans WHERE id = ?',
      [id]
    );

    if (mealPlans.length === 0) {
      throw new OperationalError('Meal plan not found', 404);
    }

    if (mealPlans[0].user_id !== userId) {
      throw new OperationalError('Not authorized to access this meal plan', 403);
    }

    // Calculate nutrition summary
    const [nutritionData] = await pool.execute<RowDataPacket[]>(
      `SELECT 
         SUM(r.calories_per_serving) as total_calories,
         SUM(r.protein_per_serving) as total_protein,
         SUM(r.carbs_per_serving) as total_carbs,
         SUM(r.fat_per_serving) as total_fat,
         SUM(r.fiber_per_serving) as total_fiber,
         SUM(r.sugar_per_serving) as total_sugar,
         SUM(r.sodium_per_serving) as total_sodium,
         COUNT(DISTINCT mpi.day_of_week) as days_count
       FROM meal_plan_items mpi
       LEFT JOIN recipes r ON mpi.recipe_id = r.id
       WHERE mpi.meal_plan_id = ?`,
      [id]
    );

    const summary = nutritionData[0];

    res.json({
      success: true,
      data: {
        total_calories: summary.total_calories || 0,
        total_protein: summary.total_protein || 0,
        total_carbs: summary.total_carbs || 0,
        total_fat: summary.total_fat || 0,
        total_fiber: summary.total_fiber || 0,
        total_sugar: summary.total_sugar || 0,
        total_sodium: summary.total_sodium || 0,
        days_count: summary.days_count || 0,
        daily_averages: {
          calories: summary.total_calories ? Math.round(summary.total_calories / summary.days_count) : 0,
          protein: summary.total_protein ? Math.round(summary.total_protein / summary.days_count) : 0,
          carbs: summary.total_carbs ? Math.round(summary.total_carbs / summary.days_count) : 0,
          fat: summary.total_fat ? Math.round(summary.total_fat / summary.days_count) : 0
        }
      }
    });
  });

  /**
   * Get approved meal plans for users
   */
  getApprovedMealPlans = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Get total count of approved meal plans
    const [countResult] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM meal_plans WHERE is_approved = TRUE',
      []
    );

    const total = countResult[0].total;

    // Get approved meal plans with user information
    const [mealPlans] = await pool.execute<RowDataPacket[]>(
      `SELECT mp.*, u.first_name, u.last_name 
       FROM meal_plans mp
       LEFT JOIN users u ON mp.user_id = u.id
       WHERE mp.is_approved = TRUE
       ORDER BY mp.created_at DESC 
       LIMIT ? OFFSET ?`,
      [Number(limit), offset]
    );

    res.json({
      success: true,
      data: mealPlans,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    });
  });

  /**
   * Get all meal plans (Admin)
   */
  getAllMealPlans = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { page = 1, limit = 10, search, is_ai_generated, user_id } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereConditions = [];
    let queryParams = [];

    if (search) {
      whereConditions.push('(mp.name LIKE ? OR mp.description LIKE ?)');
      queryParams.push(`%${search}%`, `%${search}%`);
    }

    if (is_ai_generated !== undefined) {
      whereConditions.push('mp.is_ai_generated = ?');
      queryParams.push(is_ai_generated === 'true' ? 1 : 0);
    }

    if (user_id) {
      whereConditions.push('mp.user_id = ?');
      queryParams.push(user_id);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    // Get total count
    const [countResult] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM meal_plans mp ${whereClause}`,
      queryParams
    );

    const total = countResult[0].total;
    const totalPages = Math.ceil(total / Number(limit));

    // Get meal plans with user information
    const [mealPlans] = await pool.execute<RowDataPacket[]>(
      `SELECT mp.*, u.first_name, u.last_name, u.email
       FROM meal_plans mp
       LEFT JOIN users u ON mp.user_id = u.id
       ${whereClause}
       ORDER BY mp.created_at DESC 
       LIMIT ? OFFSET ?`,
      [...queryParams, Number(limit), offset]
    );

    // Get meal items for each plan
    const mealPlansWithItems = await Promise.all(
      mealPlans.map(async (mealPlan) => {
        const [mealItems] = await pool.execute<RowDataPacket[]>(
          `SELECT mpi.*, r.title as recipe_title, r.image_url as recipe_image,
                  r.calories_per_serving, r.protein_per_serving, r.carbs_per_serving, r.fat_per_serving
           FROM meal_plan_items mpi
           LEFT JOIN recipes r ON mpi.recipe_id = r.id
           WHERE mpi.meal_plan_id = ?
           ORDER BY 
             CASE mpi.day_of_week 
               WHEN 'monday' THEN 1 WHEN 'tuesday' THEN 2 WHEN 'wednesday' THEN 3 
               WHEN 'thursday' THEN 4 WHEN 'friday' THEN 5 WHEN 'saturday' THEN 6 
               WHEN 'sunday' THEN 7 ELSE 8 END,
             CASE mpi.meal_type 
               WHEN 'breakfast' THEN 1 WHEN 'lunch' THEN 2 
               WHEN 'dinner' THEN 3 WHEN 'snack' THEN 4 ELSE 5 END`,
          [mealPlan.id]
        );

        return {
          ...mealPlan,
          meals: mealItems,
          user: {
            id: mealPlan.user_id,
            first_name: mealPlan.first_name,
            last_name: mealPlan.last_name,
            email: mealPlan.email
          }
        };
      })
    );

    res.json({
      success: true,
      data: mealPlansWithItems,
      pagination: {
        currentPage: Number(page),
        totalPages,
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  });

  /**
   * Copy meal plan
   */
  copyMealPlan = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id } = req.params;
    const userId = req.user!.userId;
    const { name, start_date, end_date } = req.body;

    // Check if meal plan exists and user has permission
    const [mealPlans] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM meal_plans WHERE id = ?',
      [id]
    );

    if (mealPlans.length === 0) {
      throw new OperationalError('Meal plan not found', 404);
    }

    const originalPlan = mealPlans[0];

    // Get meal items
    const [mealItems] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM meal_plan_items WHERE meal_plan_id = ?',
      [id]
    );

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Create new meal plan
      const [mealPlanResult] = await connection.execute(
        `INSERT INTO meal_plans (
          user_id, name, description, start_date, end_date,
          total_calories, total_protein, total_carbs, total_fat,
          is_ai_generated, ai_prompt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          name || `${originalPlan.name} (Copy)`,
          originalPlan.description,
          start_date || originalPlan.start_date,
          end_date || originalPlan.end_date,
          originalPlan.total_calories,
          originalPlan.total_protein,
          originalPlan.total_carbs,
          originalPlan.total_fat,
          originalPlan.is_ai_generated,
          originalPlan.ai_prompt
        ]
      );

      const newMealPlanId = (mealPlanResult as any).insertId;

      // Copy meal items
      for (const mealItem of mealItems) {
        await connection.execute(
          `INSERT INTO meal_plan_items (
            meal_plan_id, recipe_id, meal_type, day_of_week,
            custom_meal_name, custom_ingredients, custom_nutrition
          ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            newMealPlanId,
            mealItem.recipe_id,
            mealItem.meal_type,
            mealItem.day_of_week,
            mealItem.custom_meal_name,
            mealItem.custom_ingredients,
            mealItem.custom_nutrition
          ]
        );
      }

      await connection.commit();

      res.status(201).json({
        success: true,
        message: 'Meal plan copied successfully',
        data: { id: newMealPlanId }
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  });
}

export default new MealPlanController();

