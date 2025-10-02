import axiosInstance from '@/services/axiosInstance';
import { 
  AddressesListResponse, 
  AddressResponse, 
  CreateAddressRequest, 
  UpdateAddressRequest,
  ApiResponse 
} from '../types';

export const addressApi = {
  // Get user's addresses
  getAddresses: async (): Promise<AddressesListResponse> => {
    const response = await axiosInstance.get('/addresses');
    return response.data;
  },

  // Add new address
  addAddress: async (data: CreateAddressRequest): Promise<AddressResponse> => {
    const response = await axiosInstance.post('/addresses', data);
    return response.data;
  },

  // Update address
  updateAddress: async (id: string, data: UpdateAddressRequest): Promise<AddressResponse> => {
    const response = await axiosInstance.put(`/addresses/${id}`, data);
    return response.data;
  },

  // Delete address
  deleteAddress: async (id: string): Promise<ApiResponse> => {
    const response = await axiosInstance.delete(`/addresses/${id}`);
    return response.data;
  },
};