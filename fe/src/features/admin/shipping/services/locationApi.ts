import axiosInstance from '@/services/axiosInstance';
import { 
  Location, 
  CreateLocationRequest, 
  UpdateLocationRequest, 
  LocationResponse, 
  LocationsListResponse,
  ActiveOriginResponse 
} from '../types';

export const locationApi = {
  // Check API configuration status
  checkConfigStatus: async (): Promise<{ success: boolean; data?: any; error?: string }> => {
    const response = await axiosInstance.get('/shipping/config-status');
    return response.data;
  },

  // Get all locations
  getLocations: async (): Promise<LocationsListResponse> => {
    const response = await axiosInstance.get('/shipping/locations');
    return response.data;
  },

  // Get location by ID
  getLocationById: async (id: string): Promise<LocationResponse> => {
    const response = await axiosInstance.get(`/shipping/locations/${id}`);
    return response.data;
  },

  // Get active origin location
  getActiveOriginLocation: async (): Promise<ActiveOriginResponse> => {
    const response = await axiosInstance.get('/shipping/locations/active-origin');
    return response.data;
  },

  // Create new location
  createLocation: async (data: CreateLocationRequest): Promise<LocationResponse> => {
    const response = await axiosInstance.post('/shipping/locations', data);
    return response.data;
  },

  // Update location
  updateLocation: async (id: string, data: UpdateLocationRequest): Promise<LocationResponse> => {
    const response = await axiosInstance.put(`/shipping/locations/${id}`, data);
    return response.data;
  },

  // Update location status
  updateLocationStatus: async (id: string, status: 'active' | 'inactive'): Promise<LocationResponse> => {
    const response = await axiosInstance.patch(`/shipping/locations/${id}/status`, { status });
    return response.data;
  },

  // Delete location
  deleteLocation: async (id: string): Promise<{ success: boolean; message?: string }> => {
    const response = await axiosInstance.delete(`/shipping/locations/${id}`);
    return response.data;
  },
};
