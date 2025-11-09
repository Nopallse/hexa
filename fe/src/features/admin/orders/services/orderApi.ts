import axiosInstance from '@/services/axiosInstance';
import { Order, OrderQueryParams, ApiResponse, OrderResponse, OrdersListResponse } from '@/features/orders/types';

export interface AdminOrderQueryParams extends OrderQueryParams {
  user_id?: string;
  payment_status?: string;
}

export interface OrderWithUser extends Order {
  user?: {
    id: string;
    full_name: string;
    email: string;
    phone: string | null;
  };
}

export const adminOrderApi = {
  // Get all orders (admin)
  getAllOrders: async (params?: AdminOrderQueryParams): Promise<OrdersListResponse> => {
    const response = await axiosInstance.get('/admin/orders', { params });
    return response.data;
  },

  // Get order by ID (admin)
  getOrderById: async (id: string): Promise<OrderResponse> => {
    const response = await axiosInstance.get(`/admin/orders/${id}`);
    return response.data;
  },

  // Update order status (admin)
  updateOrderStatus: async (id: string, status: string): Promise<ApiResponse> => {
    const response = await axiosInstance.put(`/orders/${id}/status`, { status });
    return response.data;
  },
};

