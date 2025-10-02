import axiosInstance from '@/services/axiosInstance';
import { 
  LoginRequest, 
  RegisterRequest, 
  LoginResponse, 
  RegisterResponse, 
  MeResponse,
  RefreshTokenResponse
} from '../types';

export const authApi = {
  // Register new user
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await axiosInstance.post<RegisterResponse>('/auth/register', data);
    return response.data;
  },

  // Login user
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>('/auth/login', credentials);
    return response.data;
  },

  // Get current user info
  me: async (): Promise<MeResponse> => {
    const response = await axiosInstance.get<MeResponse>('/auth/me');
    return response.data;
  },

  // Logout user
  logout: async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
  },

  // Refresh token
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await axiosInstance.post<RefreshTokenResponse>('/auth/refresh', {
      refreshToken: refreshToken
    });
    return response.data;
  },

  // Resend verification email
  resendVerification: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.post<{ success: boolean; message: string }>('/auth/resend-verification', {
      email
    });
    return response.data;
  },

  // Verify email
  verifyEmail: async (token: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.post<{ success: boolean; message: string }>('/auth/verify-email', {
      token
    });
    return response.data;
  },
};
