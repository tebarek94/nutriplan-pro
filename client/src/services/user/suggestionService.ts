import { ApiResponse, MealSuggestion, RecipeSuggestion } from '../../types';
import httpService from '../httpService';

class SuggestionService {

  // User Suggestions
  async getMealSuggestions(params?: { page?: number; limit?: number }): Promise<ApiResponse<MealSuggestion[]>> {
    const response = await httpService.get<ApiResponse<MealSuggestion[]>>('/suggestions/meals', { params });
    return response.data;
  }

  async toggleMealSuggestionInteraction(suggestionId: number, interactionType: 'view' | 'like' | 'save' | 'try'): Promise<ApiResponse<void>> {
    const response = await httpService.post<ApiResponse<void>>(`/suggestions/meals/${suggestionId}/interact`, { interaction_type: interactionType });
    return response.data;
  }

  async toggleRecipeSuggestionInteraction(suggestionId: number, interactionType: 'view' | 'like' | 'save' | 'try'): Promise<ApiResponse<void>> {
    const response = await httpService.post<ApiResponse<void>>(`/suggestions/recipes/${suggestionId}/interact`, { interaction_type: interactionType });
    return response.data;
  }

  async getUserSavedSuggestions(): Promise<ApiResponse<any>> {
    const response = await httpService.get<ApiResponse<any>>('/suggestions/saved');
    return response.data;
  }

  // Approved Content
  async getApprovedSuggestions(params: { page?: number; limit?: number } = {}): Promise<ApiResponse<any>> {
    const response = await httpService.get<ApiResponse<any>>('/suggestions/approved', { params });
    return response.data;
  }

  // User creating suggestions for admin
  async createSuggestion(suggestionData: {
    suggestion_type: 'meal' | 'recipe';
    title: string;
    description: string;
    content: string;
  }): Promise<ApiResponse<any>> {
    const response = await httpService.post<ApiResponse<any>>('/suggestions', suggestionData);
    return response.data;
  }

  // Get user's own suggestions
  async getUserSuggestions(params?: { page?: number; limit?: number; status?: string }): Promise<ApiResponse<any>> {
    const response = await httpService.get<ApiResponse<any>>('/suggestions', { params });
    return response.data;
  }
}

export default new SuggestionService();
