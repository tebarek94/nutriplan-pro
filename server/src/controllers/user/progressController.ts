import { Request, Response, NextFunction } from 'express';
import { RowDataPacket } from 'mysql2';
import pool from '../../config/database';
import { OperationalError, asyncHandler } from '../../middleware/errorHandler';

class ProgressController {
  /**
   * Get user progress data
   */
  getUserProgress = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user!.userId;
    const { period = 'week' } = req.query;

    // Get meal plan stats
    const [mealPlanStats] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM meal_plans WHERE user_id = ?',
      [userId]
    );

    // Get AI-generated meal plans
    const [aiGeneratedPlans] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM meal_plans WHERE user_id = ? AND is_ai_generated = TRUE',
      [userId]
    );

    // Get average calories from recent meal plans
    const [avgCalories] = await pool.execute<RowDataPacket[]>(
      'SELECT AVG(COALESCE(total_calories, 0)) as avg_calories FROM meal_plans WHERE user_id = ?',
      [userId]
    );

    // Calculate goal completion based on meal plan adherence
    const [completedMeals] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as completed FROM meal_plans 
       WHERE user_id = ? AND end_date < CURDATE()`,
      [userId]
    );

    const [totalMeals] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as total FROM meal_plans 
       WHERE user_id = ? AND start_date <= CURDATE()`,
      [userId]
    );

    const goalCompletion = totalMeals[0].total > 0 
      ? Math.round((completedMeals[0].completed / totalMeals[0].total) * 100)
      : 0;

    // Calculate streak (consecutive days with meal plans)
    const [streakData] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as streak FROM (
        SELECT DISTINCT DATE(created_at) as plan_date
        FROM meal_plans 
        WHERE user_id = ? 
        ORDER BY created_at DESC
      ) as dates`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        goalCompletion,
        streakDays: streakData[0].streak,
        totalMealPlans: mealPlanStats[0].total,
        averageCalories: Math.round(avgCalories[0].avg_calories || 0),
        aiGeneratedPlans: aiGeneratedPlans[0].total
      }
    });
  });

  /**
   * Get weight progress
   */
  getWeightProgress = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user!.userId;

    // For now, we'll use placeholder data since weight tracking isn't implemented
    // In a real app, you'd have a weight_logs table
    const currentWeight = 75.5; // This would come from the latest weight log
    const targetWeight = 70.0; // This would come from user profile
    const progress = Math.max(0, Math.min(100, ((currentWeight - targetWeight) / (currentWeight - targetWeight)) * 100));

    res.json({
      success: true,
      data: {
        currentWeight,
        targetWeight,
        progress: Math.round(progress)
      }
    });
  });

  /**
   * Get nutrition trends
   */
  getNutritionTrends = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user!.userId;
    const { period = 'week' } = req.query;

    let dateFilter = '';
    switch (period) {
      case 'week':
        dateFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)';
        break;
      case 'month':
        dateFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)';
        break;
      case 'year':
        dateFilter = 'AND created_at >= DATE_SUB(NOW(), INTERVAL 365 DAY)';
        break;
    }

    // Get nutrition data from meal plans
    const [nutritionData] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        AVG(COALESCE(total_calories, 0)) as avg_calories,
        AVG(COALESCE(total_protein, 0)) as avg_protein,
        AVG(COALESCE(total_carbs, 0)) as avg_carbs,
        AVG(COALESCE(total_fat, 0)) as avg_fat
       FROM meal_plans 
       WHERE user_id = ? ${dateFilter}`,
      [userId]
    );

    // Get daily breakdown for the selected period
    const [dailyBreakdown] = await pool.execute<RowDataPacket[]>(
      `SELECT 
        DATE(created_at) as date,
        AVG(COALESCE(total_calories, 0)) as calories,
        AVG(COALESCE(total_protein, 0)) as protein,
        AVG(COALESCE(total_carbs, 0)) as carbs,
        AVG(COALESCE(total_fat, 0)) as fat
       FROM meal_plans 
       WHERE user_id = ? ${dateFilter}
       GROUP BY DATE(created_at)
       ORDER BY date`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        averages: {
          calories: Math.round(nutritionData[0].avg_calories || 0),
          protein: Math.round(nutritionData[0].avg_protein || 0),
          carbs: Math.round(nutritionData[0].avg_carbs || 0),
          fat: Math.round(nutritionData[0].avg_fat || 0)
        },
        dailyBreakdown: dailyBreakdown.map(day => ({
          date: day.date,
          calories: Math.round(day.calories || 0),
          protein: Math.round(day.protein || 0),
          carbs: Math.round(day.carbs || 0),
          fat: Math.round(day.fat || 0)
        }))
      }
    });
  });

  /**
   * Get achievements
   */
  getAchievements = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user!.userId;

    // Get various stats to determine achievements
    const [totalMealPlans] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM meal_plans WHERE user_id = ?',
      [userId]
    );

    const [aiGeneratedPlans] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM meal_plans WHERE user_id = ? AND is_ai_generated = TRUE',
      [userId]
    );

    const [completedPlans] = await pool.execute<RowDataPacket[]>(
      'SELECT COUNT(*) as total FROM meal_plans WHERE user_id = ? AND end_date < CURDATE()',
      [userId]
    );

    const [streakDays] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as streak FROM (
        SELECT DISTINCT DATE(created_at) as plan_date
        FROM meal_plans 
        WHERE user_id = ? 
        ORDER BY created_at DESC
      ) as dates`,
      [userId]
    );

    // Define achievements based on stats
    const achievements = [];

    if (totalMealPlans[0].total >= 1) {
      achievements.push({
        id: 'first_meal_plan',
        title: 'First Meal Plan',
        description: 'Created your first meal plan',
        icon: '🎯',
        unlocked: true,
        unlockedAt: new Date().toISOString()
      });
    }

    if (aiGeneratedPlans[0].total >= 1) {
      achievements.push({
        id: 'ai_explorer',
        title: 'AI Explorer',
        description: 'Generated your first AI meal plan',
        icon: '🤖',
        unlocked: true,
        unlockedAt: new Date().toISOString()
      });
    }

    if (completedPlans[0].total >= 7) {
      achievements.push({
        id: 'week_warrior',
        title: 'Week Warrior',
        description: 'Completed 7 days of meal planning',
        icon: '🏆',
        unlocked: true,
        unlockedAt: new Date().toISOString()
      });
    }

    if (streakDays[0].streak >= 10) {
      achievements.push({
        id: 'consistency_king',
        title: 'Consistency King',
        description: 'Maintained a 10-day streak',
        icon: '👑',
        unlocked: true,
        unlockedAt: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      data: achievements
    });
  });

  /**
   * Get streak data
   */
  getStreakData = asyncHandler(async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = req.user!.userId;

    // Calculate current streak
    const [streakData] = await pool.execute<RowDataPacket[]>(
      `SELECT COUNT(*) as current_streak FROM (
        SELECT DISTINCT DATE(created_at) as plan_date
        FROM meal_plans 
        WHERE user_id = ? 
        ORDER BY created_at DESC
      ) as dates`,
      [userId]
    );

    // Get longest streak
    const [longestStreak] = await pool.execute<RowDataPacket[]>(
      `SELECT MAX(streak_length) as longest_streak FROM (
        SELECT COUNT(*) as streak_length FROM (
          SELECT DISTINCT DATE(created_at) as plan_date
          FROM meal_plans 
          WHERE user_id = ? 
          ORDER BY created_at DESC
        ) as dates
      ) as streak`,
      [userId]
    );

    res.json({
      success: true,
      data: {
        currentStreak: streakData[0].current_streak,
        longestStreak: longestStreak[0].longest_streak || 0
      }
    });
  });
}

export default new ProgressController();
