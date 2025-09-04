import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, LoginRequest, RegisterRequest, AuthResponse, User, UserProfile, Recipe, MealPlan, MealSuggestion, RecipeSuggestion, AIGenerateMealPlanRequest } from '../types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: '/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor to handle errors
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.api.post('/auth/login', credentials);
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await this.api.post('/auth/register', userData);
    return response.data;
  }

  async getProfile(): Promise<ApiResponse<User>> {
    const response = await this.api.get('/auth/profile');
    return response.data;
  }

  async updateProfile(profileData: Partial<UserProfile>): Promise<ApiResponse<User>> {
    const response = await this.api.put('/auth/profile', profileData);
    return response.data;
  }

  async updateUserInfo(userData: { first_name: string; last_name: string; email: string }): Promise<ApiResponse<User>> {
    const response = await this.api.put('/auth/user-info', userData);
    return response.data;
  }

  async changePassword(passwordData: { currentPassword: string; newPassword: string }): Promise<ApiResponse<void>> {
    const response = await this.api.put('/auth/change-password', passwordData);
    return response.data;
  }

  async logout(): Promise<ApiResponse<void>> {
    const response = await this.api.post('/auth/logout');
    return response.data;
  }

  // Recipes
  async getAllRecipes(params?: { page?: number; limit?: number; search?: string; is_approved?: boolean; is_featured?: boolean; difficulty?: string }): Promise<ApiResponse<any>> {
    const response = await this.api.get('/recipes', { params });
    return response.data;
  }

  async getFeaturedRecipes(): Promise<ApiResponse<Recipe[]>> {
    const response = await this.api.get('/recipes/featured');
    return response.data;
  }

  async getRecipeById(recipeId: number): Promise<ApiResponse<any>> {
    const response = await this.api.get(`/recipes/${recipeId}`);
    return response.data;
  }



  async toggleFavorite(recipeId: number): Promise<ApiResponse<void>> {
    const response = await this.api.post(`/recipes/${recipeId}/favorite`);
    return response.data;
  }

  async deleteRecipe(recipeId: number): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/recipes/${recipeId}`);
    return response.data;
  }

  // User Recipe Management
  async getUserFavorites(params?: { page?: number; limit?: number }): Promise<ApiResponse<any>> {
    const response = await this.api.get('/recipes/favorites', { params });
    return response.data;
  }

  async toggleRecipeLike(recipeId: number): Promise<ApiResponse<{ liked: boolean; message: string }>> {
    const response = await this.api.post(`/recipes/${recipeId}/like`);
    return response.data;
  }

  async getRecipeSuggestions(params?: { limit?: number }): Promise<ApiResponse<RecipeSuggestion[]>> {
    const response = await this.api.get('/recipes/suggestions', { params });
    return response.data;
  }

  // Meal Plans
  async getUserMealPlans(params?: { page?: number; limit?: number }): Promise<ApiResponse<MealPlan[]>> {
    const response = await this.api.get('/meal-plans', { params });
    return response.data;
  }

  async getMealPlanById(id: number): Promise<ApiResponse<MealPlan>> {
    const response = await this.api.get(`/meal-plans/${id}`);
    return response.data;
  }

  async createMealPlan(mealPlanData: Partial<MealPlan>): Promise<ApiResponse<MealPlan>> {
    const response = await this.api.post('/meal-plans', mealPlanData);
    return response.data;
  }

  async generateMealPlan(request: AIGenerateMealPlanRequest): Promise<ApiResponse<MealPlan>> {
    const response = await this.api.post('/meal-plans/generate', request);
    return response.data;
  }

  async updateMealPlan(id: number, mealPlanData: Partial<MealPlan>): Promise<ApiResponse<MealPlan>> {
    const response = await this.api.put(`/meal-plans/${id}`, mealPlanData);
    return response.data;
  }

  async deleteMealPlan(id: number): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/meal-plans/${id}`);
    return response.data;
  }

  async getMealPlanStats(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/meal-plans/stats');
    return response.data;
  }

  async generateGroceryList(mealPlanId: number): Promise<ApiResponse<any>> {
    const response = await this.api.post(`/meal-plans/${mealPlanId}/grocery-list`);
    return response.data;
  }

  async getNutritionSummary(mealPlanId: number): Promise<ApiResponse<any>> {
    const response = await this.api.get(`/meal-plans/${mealPlanId}/nutrition`);
    return response.data;
  }

  // Suggestions
  async getMealSuggestions(params?: { page?: number; limit?: number }): Promise<ApiResponse<MealSuggestion[]>> {
    const response = await this.api.get('/suggestions/meals', { params });
    return response.data;
  }

  async toggleMealSuggestionInteraction(suggestionId: number, interactionType: 'view' | 'like' | 'save' | 'try'): Promise<ApiResponse<void>> {
    const response = await this.api.post(`/suggestions/meals/${suggestionId}/interact`, { interaction_type: interactionType });
    return response.data;
  }

  async toggleRecipeSuggestionInteraction(suggestionId: number, interactionType: 'view' | 'like' | 'save' | 'try'): Promise<ApiResponse<void>> {
    const response = await this.api.post(`/suggestions/recipes/${suggestionId}/interact`, { interaction_type: interactionType });
    return response.data;
  }

  async getUserSavedSuggestions(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/suggestions/saved');
    return response.data;
  }

  // Admin endpoints
  async getAdminDashboard(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/admin/dashboard');
    return response.data;
  }

  async getAllUsers(params?: { page?: number; limit?: number; search?: string }): Promise<ApiResponse<any>> {
    const response = await this.api.get('/admin/users', { params });
    return response.data;
  }

  async getUserProfile(userId: number): Promise<ApiResponse<any>> {
    const response = await this.api.get(`/admin/users/${userId}/profile`);
    return response.data;
  }

  async updateUserStatus(userId: number, status: { is_active: boolean }): Promise<ApiResponse<void>> {
    const response = await this.api.put(`/admin/users/${userId}/status`, status);
    return response.data;
  }

  async getPendingRecipes(params?: { page?: number; limit?: number }): Promise<ApiResponse<any>> {
    const response = await this.api.get('/admin/recipes/pending', { params });
    return response.data;
  }

  async approveRecipe(recipeId: number, data?: { is_approved: boolean; is_featured?: boolean }): Promise<ApiResponse<void>> {
    const response = await this.api.put(`/admin/recipes/${recipeId}/approve`, data || { is_approved: true });
    return response.data;
  }

  async getAIAnalysisLogs(params?: { page?: number; limit?: number; analysis_type?: string }): Promise<ApiResponse<any>> {
    const response = await this.api.get('/admin/ai-logs', { params });
    return response.data;
  }

  async getFoodCategories(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/admin/categories');
    return response.data;
  }

  async createFoodCategory(categoryData: { name: string; description?: string; color?: string; icon?: string }): Promise<ApiResponse<any>> {
    const response = await this.api.post('/admin/categories', categoryData);
    return response.data;
  }

  async updateFoodCategory(categoryId: number, categoryData: { name?: string; description?: string; color?: string; icon?: string }): Promise<ApiResponse<any>> {
    const response = await this.api.put(`/admin/categories/${categoryId}`, categoryData);
    return response.data;
  }

  async deleteFoodCategory(categoryId: number): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/admin/categories/${categoryId}`);
    return response.data;
  }

  async getAllIngredients(params?: { page?: number; limit?: number; search?: string; category_id?: number }): Promise<ApiResponse<any>> {
    const response = await this.api.get('/admin/ingredients', { params });
    return response.data;
  }

  // Progress endpoints
  async getUserProgress(period: 'week' | 'month' | 'year' = 'week'): Promise<ApiResponse<any>> {
    const response = await this.api.get(`/progress?period=${period}`);
    return response.data;
  }

  async getWeightProgress(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/progress/weight');
    return response.data;
  }

  async getNutritionTrends(period: 'week' | 'month' | 'year' = 'week'): Promise<ApiResponse<any>> {
    const response = await this.api.get(`/progress/nutrition?period=${period}`);
    return response.data;
  }

  async getAchievements(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/progress/achievements');
    return response.data;
  }

  async getStreakData(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/progress/streak');
    return response.data;
  }

  async createIngredient(ingredientData: any): Promise<ApiResponse<any>> {
    const response = await this.api.post('/admin/ingredients', ingredientData);
    return response.data;
  }

  async updateIngredient(ingredientId: number, ingredientData: any): Promise<ApiResponse<any>> {
    const response = await this.api.put(`/admin/ingredients/${ingredientId}`, ingredientData);
    return response.data;
  }

  async deleteIngredient(ingredientId: number): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/admin/ingredients/${ingredientId}`);
    return response.data;
  }

  // Admin Suggestion Management


  async generateAIMealPlan(prompt: string): Promise<ApiResponse<any>> {
    const response = await this.api.post('/meal-plans/ai-generate', { prompt });
    return response.data;
  }

  // Admin meal plans
  async getAllMealPlans(params?: { page?: number; limit?: number; search?: string; is_ai_generated?: boolean; user_id?: string }): Promise<ApiResponse<any>> {
    const response = await this.api.get('/admin/meal-plans', { params });
    return response.data;
  }

  // Admin suggestions
  async getAllSuggestions(params?: { page?: number; limit?: number; search?: string; suggestion_type?: string; status?: string }): Promise<ApiResponse<any>> {
    const response = await this.api.get('/admin/suggestions', { params });
    return response.data;
  }

  async getSuggestionById(suggestionId: number): Promise<ApiResponse<any>> {
    const response = await this.api.get(`/admin/suggestions/${suggestionId}`);
    return response.data;
  }

  async createSuggestion(suggestionData: { title: string; description: string; content: string; suggestion_type: 'recipe' | 'meal_plan' }): Promise<ApiResponse<any>> {
    const response = await this.api.post('/suggestions', suggestionData);
    return response.data;
  }

  async updateSuggestionStatus(suggestionId: number, data: { status: string; admin_response?: string }): Promise<ApiResponse<any>> {
    const response = await this.api.put(`/admin/suggestions/${suggestionId}/status`, data);
    return response.data;
  }

  async deleteSuggestion(suggestionId: number): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/admin/suggestions/${suggestionId}`);
    return response.data;
  }

  // Meal Suggestions CRUD
  async getAllMealSuggestions(params?: { page?: number; limit?: number; search?: string; is_active?: boolean }): Promise<ApiResponse<MealSuggestion[]>> {
    const response = await this.api.get('/admin/suggestions/meals', { params });
    return response.data;
  }

  async getMealSuggestionById(suggestionId: number): Promise<ApiResponse<MealSuggestion>> {
    const response = await this.api.get(`/admin/suggestions/meals/${suggestionId}`);
    return response.data;
  }

  async createMealSuggestion(suggestionData: Partial<MealSuggestion>): Promise<ApiResponse<MealSuggestion>> {
    const response = await this.api.post('/admin/suggestions/meals', suggestionData);
    return response.data;
  }

  async updateMealSuggestion(suggestionId: number, data: Partial<MealSuggestion>): Promise<ApiResponse<MealSuggestion>> {
    const response = await this.api.put(`/admin/suggestions/meals/${suggestionId}`, data);
    return response.data;
  }

  async deleteMealSuggestion(suggestionId: number): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/admin/suggestions/meals/${suggestionId}`);
    return response.data;
  }

  async toggleMealSuggestionStatus(suggestionId: number): Promise<ApiResponse<void>> {
    const response = await this.api.post(`/admin/suggestions/meals/${suggestionId}/toggle-status`);
    return response.data;
  }

  // Recipe Suggestions CRUD
  async getAllRecipeSuggestions(params?: { page?: number; limit?: number; search?: string; is_active?: boolean; is_featured?: boolean }): Promise<ApiResponse<RecipeSuggestion[]>> {
    const response = await this.api.get('/admin/suggestions/recipes', { params });
    return response.data;
  }

  async getRecipeSuggestionById(suggestionId: number): Promise<ApiResponse<RecipeSuggestion>> {
    const response = await this.api.get(`/admin/suggestions/recipes/${suggestionId}`);
    return response.data;
  }

  async createRecipeSuggestion(suggestionData: Partial<RecipeSuggestion>): Promise<ApiResponse<RecipeSuggestion>> {
    const response = await this.api.post('/admin/suggestions/recipes', suggestionData);
    return response.data;
  }

  async updateRecipeSuggestion(suggestionId: number, data: Partial<RecipeSuggestion>): Promise<ApiResponse<RecipeSuggestion>> {
    const response = await this.api.put(`/admin/suggestions/recipes/${suggestionId}`, data);
    return response.data;
  }

  async deleteRecipeSuggestion(suggestionId: number): Promise<ApiResponse<void>> {
    const response = await this.api.delete(`/admin/suggestions/recipes/${suggestionId}`);
    return response.data;
  }

  async toggleRecipeSuggestionStatus(suggestionId: number): Promise<ApiResponse<void>> {
    const response = await this.api.post(`/admin/suggestions/recipes/${suggestionId}/toggle-status`);
    return response.data;
  }

  async toggleRecipeSuggestionFeatured(suggestionId: number): Promise<ApiResponse<void>> {
    const response = await this.api.post(`/admin/suggestions/recipes/${suggestionId}/toggle-featured`);
    return response.data;
  }

  // Admin analytics
  async getDashboardAnalytics(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/admin/dashboard');
    return response.data;
  }

  // Admin User Suggestion Management
  async getUsersForSuggestions(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/admin/user-suggestions/users');
    return response.data;
  }

  async sendMealSuggestionToUser(data: { user_id: number; suggestion_id: number }): Promise<ApiResponse<any>> {
    const response = await this.api.post('/admin/user-suggestions/meals', data);
    return response.data;
  }

  async sendRecipeSuggestionToUser(data: { user_id: number; suggestion_id: number }): Promise<ApiResponse<any>> {
    const response = await this.api.post('/admin/user-suggestions/recipes', data);
    return response.data;
  }

  async sendWeeklyMealSuggestion(data: { user_id: number; meal_plan_data: any }): Promise<ApiResponse<any>> {
    const response = await this.api.post('/admin/user-suggestions/weekly', data);
    return response.data;
  }

  async getUserSuggestions(params?: { page?: number; limit?: number }): Promise<ApiResponse<any>> {
    const response = await this.api.get('/admin/user-suggestions', { params });
    return response.data;
  }

  async getWeeklyMealSuggestions(params?: { page?: number; limit?: number }): Promise<ApiResponse<any>> {
    const response = await this.api.get('/admin/user-suggestions/weekly', { params });
    return response.data;
  }

  async getWeeklyMealSuggestionDetails(id: number): Promise<ApiResponse<any>> {
    const response = await this.api.get(`/admin/user-suggestions/weekly/${id}`);
    return response.data;
  }

  async updateUserSuggestionStatus(id: number, status: { status: string }): Promise<ApiResponse<any>> {
    const response = await this.api.put(`/admin/user-suggestions/${id}/status`, status);
    return response.data;
  }

  async updateWeeklyMealSuggestionStatus(id: number, status: { status: string }): Promise<ApiResponse<any>> {
    const response = await this.api.put(`/admin/user-suggestions/weekly/${id}/status`, status);
    return response.data;
  }

  async getSuggestionAnalytics(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/admin/suggestions/analytics');
    return response.data;
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<any>> {
    const response = await this.api.get('/health');
    return response.data;
  }

  // User Approved Content
  async getApprovedMealPlans(params: { page?: number; limit?: number } = {}): Promise<ApiResponse<any>> {
    const response = await this.api.get('/meal-plans/approved', { params });
    return response.data;
  }

  async getApprovedSuggestions(params: { page?: number; limit?: number } = {}): Promise<ApiResponse<any>> {
    const response = await this.api.get('/suggestions/approved', { params });
    return response.data;
  }
}

export default new ApiService();
