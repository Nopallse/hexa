import axiosInstance from '@/services/axiosInstance';
import { ShippingMethod, TrackingResponse } from '../types/shipping';

export interface CheckoutApi {
  // Get shipping configuration status
  getShippingConfigStatus: () => Promise<{
    success: boolean;
    data?: {
      biteshipConfigured: boolean;
      biteshipApiKeyPresent: boolean;
      fedexConfigured: boolean;
      message: {
        biteship: string;
        fedex: string;
      };
    };
    error?: string;
  }>;

  // Track shipment with automatic provider detection
  trackShipment: (trackingNumber: string, courier?: string) => Promise<{
    success: boolean;
    data?: TrackingResponse;
    provider?: string;
    error?: string;
  }>;

  // Track FedEx shipment specifically
  trackFedExShipment: (trackingNumber: string) => Promise<{
    success: boolean;
    data?: TrackingResponse;
    provider?: string;
    error?: string;
  }>;
}

export const checkoutApi: CheckoutApi = {
  // Get shipping configuration status
  getShippingConfigStatus: async () => {
    try {
      const response = await axiosInstance.get('/shipping/config-status');
      return {
        success: true,
        data: response.data.data
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to get shipping configuration status'
      };
    }
  },

  // Track shipment with automatic provider detection
  trackShipment: async (trackingNumber: string, courier?: string) => {
    try {
      const params = courier ? { courier } : {};
      const response = await axiosInstance.get(`/shipping/track/${trackingNumber}`, { params });
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
  trackFedExShipment: async (trackingNumber: string) => {
    try {
      const response = await axiosInstance.get(`/shipping/track/fedex/${trackingNumber}`);
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
