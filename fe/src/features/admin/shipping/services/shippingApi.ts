import axiosInstance from '@/services/axiosInstance';

export interface ShippingStats {
  totalOrders: number;
  pendingShipment: number;
  inTransit: number;
  delivered: number;
  totalRevenue: number;
}

export interface ShippingData {
  id: string;
  orderId: string;
  recipient: string;
  destination: string;
  courier: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'failed';
  trackingNumber: string | null;
  createdAt: string;
  deliveredAt: string | null;
  estimatedDelivery?: string;
  shippingCost?: number;
}

export interface ShippingResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

export interface ShippingStatsResponse {
  success: boolean;
  message: string;
  data?: ShippingStats;
  error?: string;
}

export interface ShippingListResponse {
  success: boolean;
  message: string;
  data?: ShippingData[];
  error?: string;
}

// Mock data untuk development - akan diganti dengan API calls yang sesungguhnya
const mockShippingStats: ShippingStats = {
  totalOrders: 156,
  pendingShipment: 23,
  inTransit: 45,
  delivered: 88,
  totalRevenue: 12500000,
};

const mockShippingData: ShippingData[] = [
  {
    id: 'SH001',
    orderId: 'ORD-2024-001',
    recipient: 'John Doe',
    destination: 'Jakarta Selatan',
    courier: 'JNE',
    status: 'delivered',
    trackingNumber: 'JNE123456789',
    createdAt: '2024-01-15',
    deliveredAt: '2024-01-17',
    shippingCost: 15000,
  },
  {
    id: 'SH002',
    orderId: 'ORD-2024-002',
    recipient: 'Jane Smith',
    destination: 'Bandung',
    courier: 'TIKI',
    status: 'in_transit',
    trackingNumber: 'TIKI987654321',
    createdAt: '2024-01-16',
    deliveredAt: null,
    estimatedDelivery: '2024-01-18',
    shippingCost: 12000,
  },
  {
    id: 'SH003',
    orderId: 'ORD-2024-003',
    recipient: 'Bob Johnson',
    destination: 'Surabaya',
    courier: 'POS',
    status: 'pending',
    trackingNumber: null,
    createdAt: '2024-01-17',
    deliveredAt: null,
    estimatedDelivery: '2024-01-19',
    shippingCost: 18000,
  },
  {
    id: 'SH004',
    orderId: 'ORD-2024-004',
    recipient: 'Alice Brown',
    destination: 'Medan',
    courier: 'JNE',
    status: 'in_transit',
    trackingNumber: 'JNE456789123',
    createdAt: '2024-01-18',
    deliveredAt: null,
    estimatedDelivery: '2024-01-20',
    shippingCost: 20000,
  },
  {
    id: 'SH005',
    orderId: 'ORD-2024-005',
    recipient: 'Charlie Wilson',
    destination: 'Yogyakarta',
    courier: 'TIKI',
    status: 'delivered',
    trackingNumber: 'TIKI789123456',
    createdAt: '2024-01-19',
    deliveredAt: '2024-01-21',
    shippingCost: 14000,
  },
];

export const shippingApi = {
  // Get shipping statistics
  getShippingStats: async (): Promise<ShippingStatsResponse> => {
    try {
      const response = await axiosInstance.get('/shipping/stats');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to fetch shipping statistics',
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // Get shipping data list
  getShippingData: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    courier?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ShippingListResponse & { pagination?: any }> => {
    try {
      const response = await axiosInstance.get('/shipping', { params });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to fetch shipping data',
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // Get shipping detail by ID
  getShippingDetail: async (id: string): Promise<ShippingResponse> => {
    try {
      const response = await axiosInstance.get(`/shipping/detail/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to fetch shipping detail',
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // Update shipping status
  updateShippingStatus: async (id: string, data: {
    courier?: string;
    tracking_number?: string;
    shipping_status?: string;
    estimated_delivery?: string;
    shipped_at?: string;
    delivered_at?: string;
  }): Promise<ShippingResponse> => {
    try {
      const response = await axiosInstance.put(`/shipping/${id}`, data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to update shipping status',
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // Get tracking information
  getTrackingInfo: async (trackingNumber: string, courier?: string): Promise<ShippingResponse> => {
    try {
      const params = courier ? { courier } : {};
      const response = await axiosInstance.get(`/shipping/track/${trackingNumber}`, { params });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to fetch tracking information',
        error: error.response?.data?.error || error.message,
      };
    }
  },

};
