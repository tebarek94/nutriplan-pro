import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/user/authService';
import { LoginRequest, RegisterRequest, User, UserProfile } from '../../types';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const login = useCallback(async (credentials: LoginRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login(credentials);
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/dashboard');
        return response.data;
      } else {
        setError(response.message || 'Login failed');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const register = useCallback(async (userData: RegisterRequest) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(userData);
      if (response.success) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        navigate('/dashboard');
        return response.data;
      } else {
        setError(response.message || 'Registration failed');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      return null;
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (err) {
      // Continue with logout even if API call fails
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
      setLoading(false);
    }
  }, [navigate]);

  const getProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.getProfile();
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to get profile');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to get profile');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (profileData: Partial<UserProfile>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.updateProfile(profileData);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to update profile');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserInfo = useCallback(async (userData: { first_name: string; last_name: string; email: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.updateUserInfo(userData);
      if (response.success) {
        return response.data;
      } else {
        setError(response.message || 'Failed to update user info');
        return null;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update user info');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const changePassword = useCallback(async (passwordData: { currentPassword: string; newPassword: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.changePassword(passwordData);
      if (response.success) {
        return true;
      } else {
        setError(response.message || 'Failed to change password');
        return false;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    login,
    register,
    logout,
    getProfile,
    updateProfile,
    updateUserInfo,
    changePassword,
    loading,
    error,
    clearError: () => setError(null)
  };
};
