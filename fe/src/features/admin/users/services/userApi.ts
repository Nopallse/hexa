import axiosInstance from '@/services/axiosInstance';
import {
  UserResponse,
  UserDetailResponse,
  UserStatsResponse,
  UpdateRoleRequest,
  UpdateRoleResponse,
  UserQueryParams
} from '../types';

export const userApi = {
  /**
   * Get all users with pagination and filtering
   */
  getUsers: async (params?: UserQueryParams): Promise<UserResponse> => {
    const response = await axiosInstance.get('/admin/users', { params });
    return response.data;
  },

  /**
   * Get user by ID
   */
  getUserById: async (id: string): Promise<UserDetailResponse> => {
    const response = await axiosInstance.get(`/admin/users/${id}`);
    return response.data;
  },

  /**
   * Get user statistics
   */
  getUserStats: async (): Promise<UserStatsResponse> => {
    const response = await axiosInstance.get('/admin/users/stats');
    return response.data;
  },

  /**
   * Update user role
   */
  updateUserRole: async (id: string, roleData: UpdateRoleRequest): Promise<UpdateRoleResponse> => {
    const response = await axiosInstance.put(`/admin/users/${id}/role`, roleData);
    return response.data;
  },

  /**
   * Delete user
   */
  deleteUser: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.delete(`/admin/users/${id}`);
    return response.data;
  }
};
