import { ApiResponse, MealSuggestion, RecipeSuggestion } from '../../types';
import httpService from '../httpService';

class AdminService {

  // Dashboard
  async getAdminDashboard(): Promise<ApiResponse<any>> {
    const response = await httpService.get<ApiResponse<any>>('/admin/dashboard');
    return response.data;
  }

  async getDashboardAnalytics(): Promise<ApiResponse<any>> {
    const response = await httpService.get<ApiResponse<any>>('/admin/dashboard');
    return response.data;
  }

  // User Management
  async getAllUsers(params?: { page?: number; limit?: number; search?: string }): Promise<ApiResponse<any>> {
    const response = await httpService.get<ApiResponse<any>>('/admin/users', { params });
    return response.data;
  }

  async getUserProfile(userId: number): Promise<ApiResponse<any>> {
    const response = await httpService.get<ApiResponse<any>>(`/admin/users/${userId}/profile`);
    return response.data;
  }

  async updateUserStatus(userId: number, status: { is_active: boolean }): Promise<ApiResponse<void>> {
    const response = await httpService.put<ApiResponse<void>>(`/admin/users/${userId}/status`, status);
    return response.data;
  }

  // Recipe Management
  async getPendingRecipes(params?: { page?: number; limit?: number }): Promise<ApiResponse<any>> {
    const response = await httpService.get<ApiResponse<any>>('/admin/recipes/pending', { params });
    return response.data;
  }

  async approveRecipe(recipeId: number, data?: { is_approved: boolean; is_featured?: boolean }): Promise<ApiResponse<void>> {
    const response = await httpService.put<ApiResponse<void>>(`/admin/recipes/${recipeId}/approve`, data || { is_approved: true });
    return response.data;
  }

  // AI Analysis
  async getAIAnalysisLogs(params?: { page?: number; limit?: number; analysis_type?: string }): Promise<ApiResponse<any>> {
    const response = await httpService.get<ApiResponse<any>>('/admin/ai-logs', { params });
    return response.data;
  }

  // Categories
  async getFoodCategories(): Promise<ApiResponse<any>> {
    const response = await httpService.get<ApiResponse<any>>('/admin/categories');
    return response.data;
  }

  async createFoodCategory(categoryData: { name: string; description?: string; color?: string; icon?: string }): Promise<ApiResponse<any>> {
    const response = await httpService.post<ApiResponse<any>>('/admin/categories', categoryData);
    return response.data;
  }

  async updateFoodCategory(categoryId: number, categoryData: { name?: string; description?: string; color?: string; icon?: string }): Promise<ApiResponse<any>> {
    const response = await httpService.put<ApiResponse<any>>(`/admin/categories/${categoryId}`, categoryData);
    return response.data;
  }

  async deleteFoodCategory(categoryId: number): Promise<ApiResponse<void>> {
    const response = await httpService.delete<ApiResponse<void>>(`/admin/categories/${categoryId}`);
    return response.data;
  }

  // Ingredients
  async getAllIngredients(params?: { page?: number; limit?: number; search?: string; category_id?: number }): Promise<ApiResponse<any>> {
    const response = await httpService.get<ApiResponse<any>>('/admin/ingredients', { params });
    return response.data;
  }

  async createIngredient(ingredientData: any): Promise<ApiResponse<any>> {
    const response = await httpService.post<ApiResponse<any>>('/admin/ingredients', ingredientData);
    return response.data;
  }

  async updateIngredient(ingredientId: number, ingredientData: any): Promise<ApiResponse<any>> {
    const response = await httpService.put<ApiResponse<any>>(`/admin/ingredients/${ingredientId}`, ingredientData);
    return response.data;
  }

  async deleteIngredient(ingredientId: number): Promise<ApiResponse<void>> {
    const response = await httpService.delete<ApiResponse<void>>(`/admin/ingredients/${ingredientId}`);
    return response.data;
  }

  // Meal Plans
  async getAllMealPlans(params?: { page?: number; limit?: number; search?: string; is_ai_generated?: boolean; user_id?: string }): Promise<ApiResponse<any>> {
    const response = await httpService.get<ApiResponse<any>>('/admin/meal-plans', { params });
    return response.data;
  }

  // Suggestions
  async getSuggestions(params?: { page?: number; limit?: number; search?: string; suggestion_type?: string; status?: string }): Promise<ApiResponse<any>> {
    const response = await httpService.get<ApiResponse<any>>('/admin/suggestions', { params });
    return response.data;
  }

  async getSuggestionById(suggestionId: number): Promise<ApiResponse<any>> {
    const response = await httpService.get<ApiResponse<any>>(`/admin/suggestions/${suggestionId}`);
    return response.data;
  }

  async createSuggestion(suggestionData: { title: string; description: string; content: string; suggestion_type: 'recipe' | 'meal_plan' }): Promise<ApiResponse<any>> {
    const response = await httpService.post<ApiResponse<any>>('/suggestions', suggestionData);
    return response.data;
  }

  async updateSuggestionStatus(suggestionId: number, data: { status: string; admin_response?: string }): Promise<ApiResponse<any>> {
    const response = await httpService.put<ApiResponse<any>>(`/admin/suggestions/${suggestionId}/status`, data);
    return response.data;
  }

  async deleteSuggestion(suggestionId: number): Promise<ApiResponse<void>> {
    const response = await httpService.delete<ApiResponse<void>>(`/admin/suggestions/${suggestionId}`);
    return response.data;
  }

  // Meal Suggestions CRUD
  async getAllMealSuggestions(params?: { page?: number; limit?: number; search?: string; is_active?: boolean }): Promise<ApiResponse<MealSuggestion[]>> {
    const response = await httpService.get<ApiResponse<MealSuggestion[]>>('/admin/suggestions/meals', { params });
    return response.data;
  }

  async getMealSuggestionById(suggestionId: number): Promise<ApiResponse<MealSuggestion>> {
    const response = await httpService.get<ApiResponse<MealSuggestion>>(`/admin/suggestions/meals/${suggestionId}`);
    return response.data;
  }

  async createMealSuggestion(suggestionData: Partial<MealSuggestion>): Promise<ApiResponse<MealSuggestion>> {
    const response = await httpService.post<ApiResponse<MealSuggestion>>('/admin/suggestions/meals', suggestionData);
    return response.data;
  }

  async updateMealSuggestion(suggestionId: number, data: Partial<MealSuggestion>): Promise<ApiResponse<MealSuggestion>> {
    const response = await httpService.put<ApiResponse<MealSuggestion>>(`/admin/suggestions/meals/${suggestionId}`, data);
    return response.data;
  }

  async deleteMealSuggestion(suggestionId: number): Promise<ApiResponse<void>> {
    const response = await httpService.delete<ApiResponse<void>>(`/admin/suggestions/meals/${suggestionId}`);
    return response.data;
  }

  async toggleMealSuggestionStatus(suggestionId: number): Promise<ApiResponse<void>> {
    const response = await httpService.post<ApiResponse<void>>(`/admin/suggestions/meals/${suggestionId}/toggle-status`);
    return response.data;
  }

  // Recipe Suggestions CRUD
  async getAllRecipeSuggestions(params?: { page?: number; limit?: number; search?: string; is_active?: boolean; is_featured?: boolean }): Promise<ApiResponse<RecipeSuggestion[]>> {
    const response = await httpService.get<ApiResponse<RecipeSuggestion[]>>('/admin/suggestions/recipes', { params });
    return response.data;
  }

  async getRecipeSuggestionById(suggestionId: number): Promise<ApiResponse<RecipeSuggestion>> {
    const response = await httpService.get<ApiResponse<RecipeSuggestion>>(`/admin/suggestions/recipes/${suggestionId}`);
    return response.data;
  }

  async createRecipeSuggestion(suggestionData: Partial<RecipeSuggestion>): Promise<ApiResponse<RecipeSuggestion>> {
    const response = await httpService.post<ApiResponse<RecipeSuggestion>>('/admin/suggestions/recipes', suggestionData);
    return response.data;
  }

  async updateRecipeSuggestion(suggestionId: number, data: Partial<RecipeSuggestion>): Promise<ApiResponse<RecipeSuggestion>> {
    const response = await httpService.put<ApiResponse<RecipeSuggestion>>(`/admin/suggestions/recipes/${suggestionId}`, data);
    return response.data;
  }

  async deleteRecipeSuggestion(suggestionId: number): Promise<ApiResponse<void>> {
    const response = await httpService.delete<ApiResponse<void>>(`/admin/suggestions/recipes/${suggestionId}`);
    return response.data;
  }

  async toggleRecipeSuggestionStatus(suggestionId: number): Promise<ApiResponse<void>> {
    const response = await httpService.post<ApiResponse<void>>(`/admin/suggestions/recipes/${suggestionId}/toggle-status`);
    return response.data;
  }

  async toggleRecipeSuggestionFeatured(suggestionId: number): Promise<ApiResponse<void>> {
    const response = await httpService.post<ApiResponse<void>>(`/admin/suggestions/recipes/${suggestionId}/toggle-featured`);
    return response.data;
  }

  // User Suggestion Management
  async getUsersForSuggestions(): Promise<ApiResponse<any>> {
    const response = await httpService.get<ApiResponse<any>>('/admin/user-suggestions/users');
    return response.data;
  }

  async sendMealSuggestionToUser(data: { user_id: number; suggestion_id: number }): Promise<ApiResponse<any>> {
    const response = await httpService.post<ApiResponse<any>>('/admin/user-suggestions/meals', data);
    return response.data;
  }

  async sendRecipeSuggestionToUser(data: { user_id: number; suggestion_id: number }): Promise<ApiResponse<any>> {
    const response = await httpService.post<ApiResponse<any>>('/admin/user-suggestions/recipes', data);
    return response.data;
  }

  async sendWeeklyMealSuggestion(data: { user_id: number; meal_plan_data: any }): Promise<ApiResponse<any>> {
    const response = await httpService.post<ApiResponse<any>>('/admin/user-suggestions/weekly', data);
    return response.data;
  }

  async getUserSuggestions(params?: { page?: number; limit?: number }): Promise<ApiResponse<any>> {
    const response = await httpService.get<ApiResponse<any>>('/admin/user-suggestions', { params });
    return response.data;
  }

  async getWeeklyMealSuggestions(params?: { page?: number; limit?: number }): Promise<ApiResponse<any>> {
    const response = await httpService.get<ApiResponse<any>>('/admin/user-suggestions/weekly', { params });
    return response.data;
  }

  async getWeeklyMealSuggestionDetails(id: number): Promise<ApiResponse<any>> {
    const response = await httpService.get<ApiResponse<any>>(`/admin/user-suggestions/weekly/${id}`);
    return response.data;
  }

  async updateUserSuggestionStatus(id: number, status: { status: string }): Promise<ApiResponse<any>> {
    const response = await httpService.put<ApiResponse<any>>(`/admin/user-suggestions/${id}/status`, status);
    return response.data;
  }

  async updateWeeklyMealSuggestionStatus(id: number, status: { status: string }): Promise<ApiResponse<any>> {
    const response = await httpService.put<ApiResponse<any>>(`/admin/user-suggestions/weekly/${id}/status`, status);
    return response.data;
  }

  async getSuggestionAnalytics(): Promise<ApiResponse<any>> {
    const response = await httpService.get<ApiResponse<any>>('/admin/suggestions/analytics');
    return response.data;
  }
}

export default new AdminService();
