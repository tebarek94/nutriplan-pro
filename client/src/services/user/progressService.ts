import { ApiResponse } from '../../types';
import api from '../api';

class ProgressService {
  /**
   * Get user progress data
   */
  async getUserProgress(period: 'week' | 'month' | 'year' = 'week'): Promise<ApiResponse<any>> {
    return await api.getUserProgress(period);
  }

  /**
   * Get weight progress
   */
  async getWeightProgress(): Promise<ApiResponse<any>> {
    return await api.getWeightProgress();
  }

  /**
   * Get nutrition trends
   */
  async getNutritionTrends(period: 'week' | 'month' | 'year' = 'week'): Promise<ApiResponse<any>> {
    return await api.getNutritionTrends(period);
  }

  /**
   * Get achievements
   */
  async getAchievements(): Promise<ApiResponse<any>> {
    return await api.getAchievements();
  }

  /**
   * Get streak data
   */
  async getStreakData(): Promise<ApiResponse<any>> {
    return await api.getStreakData();
  }
}

export default new ProgressService();
