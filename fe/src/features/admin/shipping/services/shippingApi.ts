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
      // TODO: Replace with actual API call to backend
      // const response = await axiosInstance.get('/api/shipping/stats');
      // return response.data;
      
      // Mock response for development
      return {
        success: true,
        message: 'Shipping statistics retrieved successfully',
        data: mockShippingStats,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to fetch shipping statistics',
        error: error.message,
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
  }): Promise<ShippingListResponse> => {
    try {
      // TODO: Replace with actual API call to backend
      // const response = await axiosInstance.get('/api/shipping/data', { params });
      // return response.data;
      
      // Mock response for development
      let filteredData = [...mockShippingData];
      
      // Apply filters
      if (params?.status) {
        filteredData = filteredData.filter(item => item.status === params.status);
      }
      
      if (params?.courier) {
        filteredData = filteredData.filter(item => item.courier === params.courier);
      }
      
      // Apply pagination
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedData = filteredData.slice(startIndex, endIndex);
      
      return {
        success: true,
        message: 'Shipping data retrieved successfully',
        data: paginatedData,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to fetch shipping data',
        error: error.message,
      };
    }
  },

  // Get shipping detail by ID
  getShippingDetail: async (id: string): Promise<ShippingResponse> => {
    try {
      // TODO: Replace with actual API call to backend
      // const response = await axiosInstance.get(`/api/shipping/${id}`);
      // return response.data;
      
      // Mock response for development
      const shippingData = mockShippingData.find(item => item.id === id);
      
      if (!shippingData) {
        return {
          success: false,
          message: 'Shipping data not found',
          error: 'Shipping data not found',
        };
      }
      
      return {
        success: true,
        message: 'Shipping detail retrieved successfully',
        data: shippingData,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to fetch shipping detail',
        error: error.message,
      };
    }
  },

  // Update shipping status
  updateShippingStatus: async (id: string, status: string): Promise<ShippingResponse> => {
    try {
      // TODO: Replace with actual API call to backend
      // const response = await axiosInstance.patch(`/api/shipping/${id}/status`, { status });
      // return response.data;
      
      // Mock response for development
      const shippingData = mockShippingData.find(item => item.id === id);
      
      if (!shippingData) {
        return {
          success: false,
          message: 'Shipping data not found',
          error: 'Shipping data not found',
        };
      }
      
      // Mock update
      shippingData.status = status as any;
      
      return {
        success: true,
        message: 'Shipping status updated successfully',
        data: shippingData,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to update shipping status',
        error: error.message,
      };
    }
  },

  // Get tracking information
  getTrackingInfo: async (trackingNumber: string): Promise<ShippingResponse> => {
    try {
      // TODO: Replace with actual API call to Biteship API
      // const response = await axiosInstance.get(`/api/shipping/tracking/${trackingNumber}`);
      // return response.data;
      
      // Mock response for development
      const mockTrackingData = {
        trackingNumber,
        status: 'in_transit',
        courier: 'JNE',
        origin: 'Jakarta',
        destination: 'Bandung',
        estimatedDelivery: '2024-01-20',
        history: [
          {
            status: 'picked_up',
            description: 'Paket telah diambil oleh kurir',
            timestamp: '2024-01-18T10:00:00Z',
            location: 'Jakarta',
          },
          {
            status: 'in_transit',
            description: 'Paket dalam perjalanan ke tujuan',
            timestamp: '2024-01-18T14:30:00Z',
            location: 'Jakarta',
          },
          {
            status: 'in_transit',
            description: 'Paket tiba di hub Bandung',
            timestamp: '2024-01-19T08:15:00Z',
            location: 'Bandung',
          },
        ],
      };
      
      return {
        success: true,
        message: 'Tracking information retrieved successfully',
        data: mockTrackingData,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to fetch tracking information',
        error: error.message,
      };
    }
  },

  // Refresh shipping data from Biteship
  refreshShippingData: async (): Promise<ShippingResponse> => {
    try {
      // TODO: Replace with actual API call to backend
      // const response = await axiosInstance.post('/api/shipping/refresh');
      // return response.data;
      
      // Mock response for development
      return {
        success: true,
        message: 'Shipping data refreshed successfully',
        data: { refreshedAt: new Date().toISOString() },
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Failed to refresh shipping data',
        error: error.message,
      };
    }
  },
};
