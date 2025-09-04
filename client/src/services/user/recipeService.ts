import { ApiResponse, Recipe, RecipeSuggestion } from '../../types';
import httpService from '../httpService';

class RecipeService {

  // Public Recipes
  async getAllRecipes(params?: { page?: number; limit?: number; search?: string; is_approved?: boolean; is_featured?: boolean; difficulty?: string }): Promise<ApiResponse<any>> {
    const response = await httpService.get<ApiResponse<any>>('/recipes', { params });
    return response.data;
  }

  async getFeaturedRecipes(): Promise<ApiResponse<Recipe[]>> {
    const response = await httpService.get<ApiResponse<Recipe[]>>('/recipes/featured');
    return response.data;
  }

  async getRecipeById(recipeId: number): Promise<ApiResponse<any>> {
    const response = await httpService.get<ApiResponse<any>>(`/recipes/${recipeId}`);
    return response.data;
  }

  async toggleFavorite(recipeId: number): Promise<ApiResponse<void>> {
    const response = await httpService.post<ApiResponse<void>>(`/recipes/${recipeId}/favorite`);
    return response.data;
  }

  async getUserFavorites(params?: { page?: number; limit?: number }): Promise<ApiResponse<any>> {
    const response = await httpService.get<ApiResponse<any>>('/recipes/favorites', { params });
    return response.data;
  }

  async toggleRecipeLike(recipeId: number): Promise<ApiResponse<{ liked: boolean; message: string }>> {
    const response = await httpService.post<ApiResponse<{ liked: boolean; message: string }>>(`/recipes/${recipeId}/like`);
    return response.data;
  }

  async getRecipeSuggestions(params?: { limit?: number }): Promise<ApiResponse<RecipeSuggestion[]>> {
    const response = await httpService.get<ApiResponse<RecipeSuggestion[]>>('/recipes/suggestions', { params });
    return response.data;
  }

  // AI Generation
  async generateRecipe(recipeData: any): Promise<ApiResponse<any>> {
    const response = await httpService.post<ApiResponse<any>>('/recipes/generate', recipeData);
    return response.data;
  }
}

export default new RecipeService();
