import { useState, useCallback } from 'react';
import progressService from '../../services/user/progressService';

export const useProgress = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getUserProgress = useCallback(async (period: 'week' | 'month' | 'year' = 'week') => {
    setLoading(true);
    setError(null);
    try {
      const response = await progressService.getUserProgress(period);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch progress data');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch progress data');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getWeightProgress = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await progressService.getWeightProgress();
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch weight progress');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch weight progress');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getNutritionTrends = useCallback(async (period: 'week' | 'month' | 'year' = 'week') => {
    setLoading(true);
    setError(null);
    try {
      const response = await progressService.getNutritionTrends(period);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch nutrition trends');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch nutrition trends');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAchievements = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await progressService.getAchievements();
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch achievements');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch achievements');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getStreakData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await progressService.getStreakData();
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to fetch streak data');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch streak data');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    getUserProgress,
    getWeightProgress,
    getNutritionTrends,
    getAchievements,
    getStreakData,
    loading,
    error,
    clearError: () => setError(null)
  };
};
