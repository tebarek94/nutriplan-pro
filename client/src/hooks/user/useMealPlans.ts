import { useState, useCallback } from 'react';
import mealPlanService from '../../services/user/mealPlanService';
import { MealPlan, AIGenerateMealPlanRequest } from '../../types';

export const useMealPlans = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserMealPlans = useCallback(async (params?: { page?: number; limit?: number }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await mealPlanService.getUserMealPlans(params);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch meal plans');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch meal plans');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMealPlanById = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await mealPlanService.getMealPlanById(id);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch meal plan');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch meal plan');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createMealPlan = useCallback(async (mealPlanData: Partial<MealPlan>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await mealPlanService.createMealPlan(mealPlanData);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to create meal plan');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create meal plan');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateMealPlan = useCallback(async (request: AIGenerateMealPlanRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await mealPlanService.generateMealPlan(request);
      if (response.success) {
        return response;
      } else {
        setError(response.message || 'Failed to generate meal plan');
        return response;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate meal plan');
      return { success: false, message: err.response?.data?.message || 'Failed to generate meal plan' };
    } finally {
      setLoading(false);
    }
  }, []);

  const generateWeeklyMealPlan = useCallback(async (request: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await mealPlanService.generateWeeklyMealPlan(request);
      if (response.success) {
        return response;
      } else {
        setError(response.message || 'Failed to generate weekly meal plan');
        return response;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate weekly meal plan');
      return { success: false, message: err.response?.data?.message || 'Failed to generate weekly meal plan' };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMealPlan = useCallback(async (id: number, mealPlanData: Partial<MealPlan>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await mealPlanService.updateMealPlan(id, mealPlanData);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to update meal plan');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update meal plan');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMealPlan = useCallback(async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await mealPlanService.deleteMealPlan(id);
      if (response.success) {
        return true;
      } else {
        setError(response.message || 'Failed to delete meal plan');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete meal plan');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMealPlanStats = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await mealPlanService.getMealPlanStats();
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch meal plan stats');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch meal plan stats');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateGroceryList = useCallback(async (mealPlanId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await mealPlanService.generateGroceryList(mealPlanId);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to generate grocery list');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate grocery list');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getNutritionSummary = useCallback(async (mealPlanId: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await mealPlanService.getNutritionSummary(mealPlanId);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch nutrition summary');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch nutrition summary');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const generateAIMealPlan = useCallback(async (prompt: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await mealPlanService.generateAIMealPlan(prompt);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to generate AI meal plan');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to generate AI meal plan');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getApprovedMealPlans = useCallback(async (params: { page?: number; limit?: number } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response = await mealPlanService.getApprovedMealPlans(params);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch approved meal plans');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch approved meal plans');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getUserMealPlans,
    getMealPlanById,
    createMealPlan,
    generateMealPlan,
    generateWeeklyMealPlan,
    updateMealPlan,
    deleteMealPlan,
    getMealPlanStats,
    generateGroceryList,
    getNutritionSummary,
    generateAIMealPlan,
    getApprovedMealPlans,
    loading,
    error,
    clearError: () => setError(null)
  };
};
