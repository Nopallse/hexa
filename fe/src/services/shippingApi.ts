import axiosInstance from '@/services/axiosInstance';
import { 
  ShippingItem, 
  ShippingRateRequest, 
  ShippingMethod, 
  ShippingRatesResponse 
} from '@/features/checkout/types/shipping';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  provider?: string;
  origin_country?: string;
  destination_country?: string;
}

export const shippingApi = {
  // Get shipping rates
  getShippingRates: async (params: ShippingRateRequest): Promise<ApiResponse<ShippingRatesResponse>> => {
    try {
      const response = await axiosInstance.post('/shipping/rates', params);
      return {
        success: true,
        data: response.data.data,
        provider: response.data.provider,
        origin_country: response.data.origin_country,
        destination_country: response.data.destination_country
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch shipping rates'
      };
    }
  },

  // Get areas for autocomplete
  getAreas: async (params: {
    countries?: string;
    input?: string;
    type?: string;
    limit?: number;
  } = {}): Promise<ApiResponse<any[]>> => {
    try {
      const response = await axiosInstance.get('/shipping/areas', { params });
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch areas'
      };
    }
  },

  // Track shipment
  trackShipment: async (waybillId: string, courier?: string): Promise<ApiResponse<any>> => {
    try {
      const params = courier ? { courier } : {};
      const response = await axiosInstance.get(`/shipping/track/${waybillId}`, { params });
      return {
        success: true,
        data: response.data.data,
        provider: response.data.provider
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to track shipment'
      };
    }
  },

  // Track FedEx shipment specifically
  trackFedExShipment: async (waybillId: string): Promise<ApiResponse<any>> => {
    try {
      const response = await axiosInstance.get(`/shipping/track/fedex/${waybillId}`);
      return {
        success: true,
        data: response.data.data,
        provider: response.data.provider
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to track FedEx shipment'
      };
    }
  }
};
