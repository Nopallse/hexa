import axiosInstance from '@/services/axiosInstance';

export interface Payment {
  id: string;
  orderId: string;
  orderStatus: string;
  paymentMethod: string;
  paymentStatus: string;
  amount: string | number;
  currencyCode: string;
  paymentReference: string | null;
  paymentDate: string | null;
  customer: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
  };
  orderTotal: string | number;
  orderShippingCost: string | number;
  orderCreatedAt: string;
}

export interface PaymentStats {
  totalPayments: number;
  paidPayments: number;
  pendingPayments: number;
  failedPayments: number;
  totalRevenue: number;
}

export interface PaymentQueryParams {
  page?: number;
  limit?: number;
  payment_status?: string;
  payment_method?: string;
  order_id?: string;
  user_id?: string;
  startDate?: string;
  endDate?: string;
}

export interface PaymentResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

export interface PaymentsListResponse {
  success: boolean;
  data?: Payment[];
  pagination?: {
    current_page: number;
    total_pages: number;
    total_items: number;
    items_per_page: number;
    has_next_page: boolean;
    has_prev_page: boolean;
  };
  error?: string;
}

export interface PaymentStatsResponse {
  success: boolean;
  data?: PaymentStats;
  error?: string;
}

export const adminPaymentApi = {
  // Get all payments (admin)
  getAllPayments: async (params?: PaymentQueryParams): Promise<PaymentsListResponse> => {
    try {
      const response = await axiosInstance.get('/payments/admin/all', { params });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // Get payment statistics (admin)
  getPaymentStats: async (): Promise<PaymentStatsResponse> => {
    try {
      const response = await axiosInstance.get('/payments/admin/stats');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // Get payment by ID (admin)
  getPaymentById: async (id: string): Promise<PaymentResponse> => {
    try {
      const response = await axiosInstance.get(`/payments/admin/detail/${id}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  },

  // Verify payment (admin)
  verifyPayment: async (id: string, data: {
    payment_status: string;
    payment_date?: string;
  }): Promise<PaymentResponse> => {
    try {
      const response = await axiosInstance.put(`/payments/${id}/verify`, data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  },
};

