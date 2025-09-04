import { RowDataPacket } from 'mysql2';
import pool from '../../config/database';
import { MealPlan, MealPlanItem, CreateMealPlanRequest, NutritionSummary } from '../../types';

export class MealPlanModel {
  /**
   * Create a new meal plan
   */
  static async create(mealPlanData: CreateMealPlanRequest, userId: number): Promise<number> {
    const [result] = await pool.execute(
      `INSERT INTO meal_plans (
        user_id, name, description, start_date, end_date,
        total_calories, total_protein, total_carbs, total_fat,
        is_ai_generated, ai_prompt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, mealPlanData.name, mealPlanData.description,
        mealPlanData.start_date, mealPlanData.end_date,
        mealPlanData.total_calories, mealPlanData.total_protein,
        mealPlanData.total_carbs, mealPlanData.total_fat,
        false, null
      ]
    );
    return (result as any).insertId;
  }

  /**
   * Add meals to meal plan
   */
  static async addMeals(mealPlanId: number, meals: CreateMealPlanRequest['meals']): Promise<void> {
    for (const meal of meals) {
      await pool.execute(
        `INSERT INTO meal_plan_items (
          meal_plan_id, recipe_id, meal_type, day_of_week,
          custom_meal_name, custom_ingredients, custom_nutrition
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          mealPlanId, meal.recipe_id, meal.meal_type, meal.day_of_week,
          meal.custom_meal_name,
          meal.custom_ingredients ? JSON.stringify(meal.custom_ingredients) : null,
          meal.custom_nutrition ? JSON.stringify(meal.custom_nutrition) : null
        ]
      );
    }
  }

  /**
   * Get user's meal plans
   */
  static async findByUserId(userId: number): Promise<MealPlan[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM meal_plans WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return rows as MealPlan[];
  }

  /**
   * Get meal plan by ID
   */
  static async findById(id: number): Promise<MealPlan | null> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM meal_plans WHERE id = ?',
      [id]
    );
    return rows.length > 0 ? rows[0] as MealPlan : null;
  }

  /**
   * Get meal plan items
   */
  static async getMealItems(mealPlanId: number): Promise<MealPlanItem[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM meal_plan_items WHERE meal_plan_id = ? ORDER BY day_of_week, meal_type',
      [mealPlanId]
    );
    
    return rows.map(row => ({
      ...row,
      custom_ingredients: row.custom_ingredients ? JSON.parse(row.custom_ingredients) : null,
      custom_nutrition: row.custom_nutrition ? JSON.parse(row.custom_nutrition) : null
    })) as MealPlanItem[];
  }

  /**
   * Update meal plan
   */
  static async update(id: number, mealPlanData: Partial<MealPlan>): Promise<void> {
    const fields = Object.keys(mealPlanData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(mealPlanData);
    
    await pool.execute(
      `UPDATE meal_plans SET ${fields}, updated_at = NOW() WHERE id = ?`,
      [...values, id]
    );
  }

  /**
   * Delete meal plan
   */
  static async delete(id: number): Promise<void> {
    await pool.execute('DELETE FROM meal_plan_items WHERE meal_plan_id = ?', [id]);
    await pool.execute('DELETE FROM meal_plans WHERE id = ?', [id]);
  }

  /**
   * Copy meal plan
   */
  static async copy(originalId: number, userId: number, newName: string): Promise<number> {
    // Get original meal plan
    const originalPlan = await this.findById(originalId);
    if (!originalPlan) throw new Error('Original meal plan not found');

    // Create new meal plan
    const [result] = await pool.execute(
      `INSERT INTO meal_plans (
        user_id, name, description, start_date, end_date,
        total_calories, total_protein, total_carbs, total_fat,
        is_ai_generated, ai_prompt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId, newName, originalPlan.description,
        originalPlan.start_date, originalPlan.end_date,
        originalPlan.total_calories, originalPlan.total_protein,
        originalPlan.total_carbs, originalPlan.total_fat,
        false, null
      ]
    );
    const newMealPlanId = (result as any).insertId;

    // Copy meal items
    const originalItems = await this.getMealItems(originalId);
    for (const item of originalItems) {
      await pool.execute(
        `INSERT INTO meal_plan_items (
          meal_plan_id, recipe_id, meal_type, day_of_week,
          custom_meal_name, custom_ingredients, custom_nutrition
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          newMealPlanId, item.recipe_id, item.meal_type, item.day_of_week,
          item.custom_meal_name,
          item.custom_ingredients ? JSON.stringify(item.custom_ingredients) : null,
          item.custom_nutrition ? JSON.stringify(item.custom_nutrition) : null
        ]
      );
    }

    return newMealPlanId;
  }

  /**
   * Get meal plan statistics
   */
  static async getStats(userId: number): Promise<{
    total: number;
    aiGenerated: number;
    userCreated: number;
    thisMonth: number;
    avgCalories: number;
  }> {
    const [totalResult] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM meal_plans WHERE user_id = ?',
      [userId]
    );

    const [aiGeneratedResult] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM meal_plans WHERE user_id = ? AND is_ai_generated = TRUE',
      [userId]
    );

    const [thisMonthResult] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM meal_plans WHERE user_id = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)',
      [userId]
    );

    const [avgCaloriesResult] = await pool.execute<RowDataPacket[]>(
      'SELECT AVG(COALESCE(total_calories, 0)) as avg_calories FROM meal_plans WHERE user_id = ?',
      [userId]
    );

    return {
      total: totalResult[0].total,
      aiGenerated: aiGeneratedResult[0].total,
      userCreated: totalResult[0].total - aiGeneratedResult[0].total,
      thisMonth: thisMonthResult[0].total,
      avgCalories: avgCaloriesResult[0].avg_calories || 0
    };
  }

  /**
   * Get approved meal plans (for public viewing)
   */
  static async getApproved(): Promise<MealPlan[]> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      'SELECT * FROM meal_plans WHERE is_ai_generated = TRUE ORDER BY created_at DESC LIMIT 20'
    );
    return rows as MealPlan[];
  }

  /**
   * Calculate nutrition summary for meal plan
   */
  static async getNutritionSummary(mealPlanId: number): Promise<NutritionSummary> {
    const [rows] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        SUM(COALESCE(total_calories, 0)) as total_calories,
        SUM(COALESCE(total_protein, 0)) as total_protein,
        SUM(COALESCE(total_carbs, 0)) as total_carbs,
        SUM(COALESCE(total_fat, 0)) as total_fat,
        SUM(COALESCE(total_fiber, 0)) as total_fiber,
        SUM(COALESCE(total_sugar, 0)) as total_sugar,
        SUM(COALESCE(total_sodium, 0)) as total_sodium
      FROM meal_plans WHERE id = ?`,
      [mealPlanId]
    );

    const result = rows[0];
    return {
      calories: result.total_calories || 0,
      protein: result.total_protein || 0,
      carbs: result.total_carbs || 0,
      fat: result.total_fat || 0,
      fiber: result.total_fiber || 0,
      sugar: result.total_sugar || 0,
      sodium: result.total_sodium || 0
    };
  }
}
