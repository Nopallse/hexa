import axiosInstance from '@/services/axiosInstance';
import { 
  OrdersListResponse, 
  OrderResponse, 
  CreateOrderRequest, 
  PaymentMethodsResponse,
  PaymentStatusResponse,
  ApiResponse,
  OrderQueryParams 
} from '../types';

export const orderApi = {
  // Get user's orders
  getUserOrders: async (params?: OrderQueryParams): Promise<OrdersListResponse> => {
    const response = await axiosInstance.get('/orders', { params });
    return response.data;
  },

  // Get order by ID
  getOrderById: async (id: string): Promise<OrderResponse> => {
    const response = await axiosInstance.get(`/orders/${id}`);
    return response.data;
  },

  // Create new order (checkout)
  createOrder: async (data: CreateOrderRequest): Promise<OrderResponse> => {
    const response = await axiosInstance.post('/orders', data);
    return response.data;
  },

  // Cancel order
  cancelOrder: async (id: string): Promise<ApiResponse> => {
    const response = await axiosInstance.delete(`/orders/${id}`);
    return response.data;
  },

  // Get available payment methods
  getPaymentMethods: async (): Promise<PaymentMethodsResponse> => {
    const response = await axiosInstance.get('/orders/payment-methods');
    return response.data;
  },

  // Get order payment status
  getOrderPaymentStatus: async (id: string): Promise<PaymentStatusResponse> => {
    const response = await axiosInstance.get(`/orders/${id}/payment-status`);
    return response.data;
  },
};
