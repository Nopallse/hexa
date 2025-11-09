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

  // Create PayPal payment
  createPayPalPayment: async (orderId: string): Promise<ApiResponse> => {
    const response = await axiosInstance.post('/payments/paypal/create', { order_id: orderId });
    return response.data;
  },

  // Capture PayPal payment
  capturePayPalPayment: async (paypalOrderId: string): Promise<ApiResponse> => {
    const response = await axiosInstance.post('/payments/paypal/capture', { paypal_order_id: paypalOrderId });
    return response.data;
  },

  // Create Midtrans payment
  createMidtransPayment: async (orderId: string, paymentMethod: string = 'bank_transfer'): Promise<ApiResponse> => {
    const response = await axiosInstance.post('/payments/midtrans/create', { 
      order_id: orderId, 
      payment_method: paymentMethod 
    });
    return response.data;
  },

  // Get payment status
  getPaymentStatus: async (orderId: string): Promise<ApiResponse> => {
    const response = await axiosInstance.get(`/payments/status/${orderId}`);
    return response.data;
  },

  // Cancel active payment
  cancelActivePayment: async (orderId: string): Promise<ApiResponse> => {
    const response = await axiosInstance.post(`/payments/cancel/${orderId}`);
    return response.data;
  },

  // Get Midtrans transaction status
  getMidtransTransactionStatus: async (orderId: string): Promise<ApiResponse> => {
    const response = await axiosInstance.get(`/payments/midtrans/${orderId}/status`);
    return response.data;
  },

  // Continue existing Midtrans payment
  continueMidtransPayment: async (orderId: string, paymentMethod: string = 'bank_transfer'): Promise<ApiResponse> => {
    const response = await axiosInstance.post('/payments/midtrans/continue', { 
      order_id: orderId, 
      payment_method: paymentMethod 
    });
    return response.data;
  },

  // Track shipment
  trackShipment: async (waybillId: string, courier?: string): Promise<ApiResponse> => {
    const params = courier ? { courier } : {};
    const response = await axiosInstance.get(`/shipping/track/${waybillId}`, { params });
    return response.data;
  },
};
