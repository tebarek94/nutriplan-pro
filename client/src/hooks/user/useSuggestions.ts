import { useState, useCallback } from 'react';
import suggestionService from '../../services/user/suggestionService';
import { MealSuggestion, RecipeSuggestion } from '../../types';

export const useSuggestions = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getMealSuggestions = useCallback(async (params?: { page?: number; limit?: number }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await suggestionService.getMealSuggestions(params);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch meal suggestions');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch meal suggestions');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleMealSuggestionInteraction = useCallback(async (suggestionId: number, interactionType: 'view' | 'like' | 'save' | 'try') => {
    setLoading(true);
    setError(null);
    try {
      const response = await suggestionService.toggleMealSuggestionInteraction(suggestionId, interactionType);
      if (response.success) {
        return true;
      } else {
        setError(response.message || 'Failed to interact with meal suggestion');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to interact with meal suggestion');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleRecipeSuggestionInteraction = useCallback(async (suggestionId: number, interactionType: 'view' | 'like' | 'save' | 'try') => {
    setLoading(true);
    setError(null);
    try {
      const response = await suggestionService.toggleRecipeSuggestionInteraction(suggestionId, interactionType);
      if (response.success) {
        return true;
      } else {
        setError(response.message || 'Failed to interact with recipe suggestion');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to interact with recipe suggestion');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserSavedSuggestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await suggestionService.getUserSavedSuggestions();
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch saved suggestions');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch saved suggestions');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getApprovedSuggestions = useCallback(async (params: { page?: number; limit?: number } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await suggestionService.getApprovedSuggestions(params);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch approved suggestions');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch approved suggestions');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createSuggestion = useCallback(async (suggestionData: {
    suggestion_type: 'meal' | 'recipe';
    title: string;
    description: string;
    content: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await suggestionService.createSuggestion(suggestionData);
      if (response.success) {
        return true;
      } else {
        setError(response.message || 'Failed to create suggestion');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create suggestion');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserSuggestions = useCallback(async (params?: { page?: number; limit?: number; status?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await suggestionService.getUserSuggestions(params);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch user suggestions');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch user suggestions');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getMealSuggestions,
    toggleMealSuggestionInteraction,
    toggleRecipeSuggestionInteraction,
    getUserSavedSuggestions,
    getApprovedSuggestions,
    createSuggestion,
    getUserSuggestions,
    loading,
    error,
    clearError: () => setError(null)
  };
};
