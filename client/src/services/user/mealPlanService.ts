import { ApiResponse, MealPlan, AIGenerateMealPlanRequest } from '../../types';
import httpService from '../httpService';

class MealPlanService {

  // User Meal Plans
  async getUserMealPlans(params?: { page?: number; limit?: number }): Promise<ApiResponse<MealPlan[]>> {
    const response = await httpService.get<ApiResponse<MealPlan[]>>('/meal-plans', { params });
    return response.data;
  }

  async getMealPlanById(id: number): Promise<ApiResponse<MealPlan>> {
    const response = await httpService.get<ApiResponse<MealPlan>>(`/meal-plans/${id}`);
    return response.data;
  }

  async createMealPlan(mealPlanData: Partial<MealPlan>): Promise<ApiResponse<MealPlan>> {
    const response = await httpService.post<ApiResponse<MealPlan>>('/meal-plans', mealPlanData);
    return response.data;
  }

  async generateMealPlan(request: AIGenerateMealPlanRequest): Promise<ApiResponse<MealPlan>> {
    const response = await httpService.post<ApiResponse<MealPlan>>('/meal-plans/generate', request);
    return response.data;
  }

  async generateWeeklyMealPlan(request: any): Promise<ApiResponse<MealPlan>> {
    const response = await httpService.post<ApiResponse<MealPlan>>('/meal-plans/generate-weekly', request);
    return response.data;
  }

  async updateMealPlan(id: number, mealPlanData: Partial<MealPlan>): Promise<ApiResponse<MealPlan>> {
    const response = await httpService.put<ApiResponse<MealPlan>>(`/meal-plans/${id}`, mealPlanData);
    return response.data;
  }

  async deleteMealPlan(id: number): Promise<ApiResponse<void>> {
    const response = await httpService.delete<ApiResponse<void>>(`/meal-plans/${id}`);
    return response.data;
  }

  async getMealPlanStats(): Promise<ApiResponse<any>> {
    const response = await httpService.get<ApiResponse<any>>('/meal-plans/stats');
    return response.data;
  }

  async generateGroceryList(mealPlanId: number): Promise<ApiResponse<any>> {
    const response = await httpService.post<ApiResponse<any>>(`/meal-plans/${mealPlanId}/grocery-list`);
    return response.data;
  }

  async getNutritionSummary(mealPlanId: number): Promise<ApiResponse<any>> {
    const response = await httpService.get<ApiResponse<any>>(`/meal-plans/${mealPlanId}/nutrition`);
    return response.data;
  }

  // AI Generation
  async generateAIMealPlan(prompt: string): Promise<ApiResponse<any>> {
    const response = await httpService.post<ApiResponse<any>>('/meal-plans/ai-generate', { prompt });
    return response.data;
  }

  // Approved Content
  async getApprovedMealPlans(params: { page?: number; limit?: number } = {}): Promise<ApiResponse<any>> {
    const response = await httpService.get<ApiResponse<any>>('/meal-plans/approved', { params });
    return response.data;
  }
}

export default new MealPlanService();
