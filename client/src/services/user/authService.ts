import { ApiResponse, LoginRequest, RegisterRequest, AuthResponse, User, UserProfile } from '../../types';
import httpService from '../httpService';

class AuthService {

  async login(credentials: LoginRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await httpService.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    const response = await httpService.post<ApiResponse<AuthResponse>>('/auth/register', userData);
    return response.data;
  }

  async getProfile(): Promise<ApiResponse<User>> {
    const response = await httpService.get<ApiResponse<User>>('/auth/profile');
    return response.data;
  }

  async updateProfile(profileData: Partial<UserProfile>): Promise<ApiResponse<User>> {
    const response = await httpService.put<ApiResponse<User>>('/auth/profile', profileData);
    return response.data;
  }

  async updateUserInfo(userData: { first_name: string; last_name: string; email: string }): Promise<ApiResponse<User>> {
    const response = await httpService.put<ApiResponse<User>>('/auth/user-info', userData);
    return response.data;
  }

  async changePassword(passwordData: { currentPassword: string; newPassword: string }): Promise<ApiResponse<void>> {
    const response = await httpService.put<ApiResponse<void>>('/auth/change-password', passwordData);
    return response.data;
  }

  async logout(): Promise<ApiResponse<void>> {
    const response = await httpService.post<ApiResponse<void>>('/auth/logout');
    return response.data;
  }
}

export default new AuthService();
