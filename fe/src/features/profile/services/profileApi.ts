import axiosInstance from '@/services/axiosInstance';
import { ProfileResponse } from '../types';

export const profileApi = {
  // Get current user profile
  getProfile: async (): Promise<ProfileResponse> => {
    const response = await axiosInstance.get('/auth/me');
    return response.data;
  },
};
