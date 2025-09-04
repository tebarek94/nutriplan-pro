import { useState, useCallback } from 'react';
import adminService from '../../services/admin/adminService';
import { MealSuggestion, RecipeSuggestion } from '../../types';

export const useAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dashboard
  const getAdminDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getAdminDashboard();
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch admin dashboard');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch admin dashboard');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getDashboardAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getDashboardAnalytics();
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch dashboard analytics');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard analytics');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // User Management
  const getAllUsers = useCallback(async (params?: { page?: number; limit?: number; search?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getAllUsers(params);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch users');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserStatus = useCallback(async (userId: number, status: { is_active: boolean }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.updateUserStatus(userId, status);
      if (response.success) {
        return true;
      } else {
        setError(response.message || 'Failed to update user status');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user status');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Recipe Management
  const getPendingRecipes = useCallback(async (params?: { page?: number; limit?: number }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getPendingRecipes(params);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch pending recipes');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch pending recipes');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const approveRecipe = useCallback(async (recipeId: number, data?: { is_approved: boolean; is_featured?: boolean }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.approveRecipe(recipeId, data);
      if (response.success) {
        return true;
      } else {
        setError(response.message || 'Failed to approve recipe');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to approve recipe');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Categories
  const getFoodCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getFoodCategories();
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch food categories');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch food categories');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createFoodCategory = useCallback(async (categoryData: { name: string; description?: string; color?: string; icon?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.createFoodCategory(categoryData);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to create food category');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create food category');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // Meal Suggestions
  const getAllMealSuggestions = useCallback(async (params?: { page?: number; limit?: number; search?: string; is_active?: boolean }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getAllMealSuggestions(params);
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

  const toggleMealSuggestionStatus = useCallback(async (suggestionId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.toggleMealSuggestionStatus(suggestionId);
      if (response.success) {
        return true;
      } else {
        setError(response.message || 'Failed to toggle meal suggestion status');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle meal suggestion status');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Recipe Suggestions
  const getAllRecipeSuggestions = useCallback(async (params?: { page?: number; limit?: number; search?: string; is_active?: boolean; is_featured?: boolean }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getAllRecipeSuggestions(params);
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

  const toggleRecipeSuggestionStatus = useCallback(async (suggestionId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.toggleRecipeSuggestionStatus(suggestionId);
      if (response.success) {
        return true;
      } else {
        setError(response.message || 'Failed to toggle recipe suggestion status');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle recipe suggestion status');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleRecipeSuggestionFeatured = useCallback(async (suggestionId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.toggleRecipeSuggestionFeatured(suggestionId);
      if (response.success) {
        return true;
      } else {
        setError(response.message || 'Failed to toggle recipe suggestion featured status');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle recipe suggestion featured status');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // User Suggestions Management
  const getSuggestions = useCallback(async (params?: { page?: number; limit?: number; search?: string; suggestion_type?: string; status?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getSuggestions(params);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch suggestions');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch suggestions');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSuggestionStatus = useCallback(async (suggestionId: number, data: { status: string; admin_response?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.updateSuggestionStatus(suggestionId, data);
      if (response.success) {
        return true;
      } else {
        setError(response.message || 'Failed to update suggestion status');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update suggestion status');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSuggestionAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getSuggestionAnalytics();
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch suggestion analytics');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch suggestion analytics');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    // Dashboard
    getAdminDashboard,
    getDashboardAnalytics,
    // User Management
    getAllUsers,
    updateUserStatus,
    // Recipe Management
    getPendingRecipes,
    approveRecipe,
    // Categories
    getFoodCategories,
    createFoodCategory,
    // Meal Suggestions
    getAllMealSuggestions,
    toggleMealSuggestionStatus,
    // Recipe Suggestions
    getAllRecipeSuggestions,
    toggleRecipeSuggestionStatus,
    toggleRecipeSuggestionFeatured,
    // User Suggestions Management
    getSuggestions,
    updateSuggestionStatus,
    getSuggestionAnalytics,
    loading,
    error,
    clearError: () => setError(null)
  };
};
