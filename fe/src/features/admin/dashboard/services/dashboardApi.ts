import axiosInstance from '@/services/axiosInstance';

export interface DashboardStats {
  orders: {
    total: number;
    byStatus: {
      belum_bayar: number;
      dikemas: number;
      dikirim: number;
      diterima: number;
      dibatalkan: number;
    };
    recent: number;
    revenue: number;
    recentOrders: Array<{
      id: string;
      status: string;
      total_amount: string | number;
      created_at: string;
      user: {
        id: string;
        full_name: string;
        email: string;
      };
    }>;
  };
  payments: {
    total: number;
    paid: number;
    pending: number;
    failed: number;
    revenue: number;
    recentPayments: Array<{
      id: string;
      payment_method: string;
      payment_status: string;
      amount: string | number;
      payment_date: string | null;
      order: {
        id: string;
        user: {
          id: string;
          full_name: string;
          email: string;
        };
      };
    }>;
  };
  users: {
    total: number;
    admins: number;
    regular: number;
    recent: number;
    withOrders: number;
    withoutOrders: number;
  };
  shipping: {
    total: number;
    pending: number;
    inTransit: number;
    delivered: number;
  };
  products: {
    total: number;
    active: number;
    categories: {
      total: number;
      active: number;
    };
  };
}

export interface DashboardResponse {
  success: boolean;
  data?: DashboardStats;
  error?: string;
}

export const dashboardApi = {
  getDashboardStats: async (): Promise<DashboardResponse> => {
    try {
      const response = await axiosInstance.get('/admin/dashboard/stats');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  },
};

