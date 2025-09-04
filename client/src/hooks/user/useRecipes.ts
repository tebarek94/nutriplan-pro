import { useState, useCallback } from 'react';
import recipeService from '../../services/user/recipeService';
import { Recipe, RecipeSuggestion } from '../../types';

export const useRecipes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getAllRecipes = useCallback(async (params?: { page?: number; limit?: number; search?: string; is_approved?: boolean; is_featured?: boolean; difficulty?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await recipeService.getAllRecipes(params);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch recipes');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch recipes');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getFeaturedRecipes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await recipeService.getFeaturedRecipes();
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch featured recipes');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch featured recipes');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getRecipeById = useCallback(async (recipeId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await recipeService.getRecipeById(recipeId);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch recipe');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch recipe');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateRecipe = useCallback(async (recipeData: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await recipeService.generateRecipe(recipeData);
      if (response.success) {
        return response;
      } else {
        setError(response.message || 'Failed to generate recipe');
        return response;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate recipe');
      return { success: false, message: err.response?.data?.message || 'Failed to generate recipe' };
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleFavorite = useCallback(async (recipeId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await recipeService.toggleFavorite(recipeId);
      if (response.success) {
        return true;
      } else {
        setError(response.message || 'Failed to toggle favorite');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle favorite');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);



  const getUserFavorites = useCallback(async (params?: { page?: number; limit?: number }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await recipeService.getUserFavorites(params);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch favorites');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch favorites');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleRecipeLike = useCallback(async (recipeId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await recipeService.toggleRecipeLike(recipeId);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to toggle like');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle like');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getRecipeSuggestions = useCallback(async (params?: { limit?: number }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await recipeService.getRecipeSuggestions(params);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch recipe suggestions');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch recipe suggestions');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getAllRecipes,
    getFeaturedRecipes,
    getRecipeById,
    toggleFavorite,
    getUserFavorites,
    toggleRecipeLike,
    getRecipeSuggestions,
    generateRecipe,
    loading,
    error,
    clearError: () => setError(null)
  };
};
