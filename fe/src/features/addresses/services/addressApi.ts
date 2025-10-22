import axiosInstance from '@/services/axiosInstance';

export interface Address {
  id: string;
  user_id: string;
  recipient_name: string;
  phone_number: string;
  address_line: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressData {
  recipient_name: string;
  phone_number: string;
  address_line: string;
  city: string;
  province: string;
  postal_code: string;
  country: string;
  is_primary: boolean;
}

export interface UpdateAddressData {
  recipient_name?: string;
  phone_number?: string;
  address_line?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  country?: string;
  is_primary?: boolean;
}

export const addressApi = {
  // Get all addresses for current user
  getAddresses: async (): Promise<{ success: boolean; data?: Address[]; error?: string }> => {
    try {
      const response = await axiosInstance.get('/addresses');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch addresses'
      };
    }
  },

  // Create new address
  createAddress: async (data: CreateAddressData): Promise<{ success: boolean; data?: Address; error?: string }> => {
    try {
      const response = await axiosInstance.post('/addresses', data);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to create address'
      };
    }
  },

  // Update existing address
  updateAddress: async (id: string, data: UpdateAddressData): Promise<{ success: boolean; data?: Address; error?: string }> => {
    try {
      const response = await axiosInstance.put(`/addresses/${id}`, data);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update address'
      };
    }
  },

  // Delete address
  deleteAddress: async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      await axiosInstance.delete(`/addresses/${id}`);
      return {
        success: true
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to delete address'
      };
    }
  },

  // Set primary address
  setPrimaryAddress: async (id: string): Promise<{ success: boolean; data?: Address; error?: string }> => {
    try {
      const response = await axiosInstance.patch(`/addresses/${id}/primary`);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to set primary address'
      };
    }
  }
};
