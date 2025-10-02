import axiosInstance from '@/services/axiosInstance';
import { 
  PaymentResponse,
  PaymentInfoResponse,
  PayPalPaymentResponseData,
  PayPalCaptureResponseData,
  PayPalRefundResponseData,
  ApiResponse,
  CreatePaymentRequest,
  CreatePayPalPaymentRequest,
  CapturePayPalPaymentRequest,
  RefundPayPalPaymentRequest,
  VerifyPaymentRequest
} from '../types';

export const paymentApi = {
  // Create payment (traditional methods)
  createPayment: async (data: CreatePaymentRequest): Promise<PaymentResponse> => {
    const response = await axiosInstance.post('/payments', data);
    return response.data;
  },

  // Create PayPal payment
  createPayPalPayment: async (data: CreatePayPalPaymentRequest): Promise<PayPalPaymentResponseData> => {
    const response = await axiosInstance.post('/payments/paypal/create', data);
    return response.data;
  },

  // Capture PayPal payment
  capturePayPalPayment: async (data: CapturePayPalPaymentRequest): Promise<PayPalCaptureResponseData> => {
    const response = await axiosInstance.post('/payments/paypal/capture', data);
    return response.data;
  },

  // Refund PayPal payment (admin only)
  refundPayPalPayment: async (data: RefundPayPalPaymentRequest): Promise<PayPalRefundResponseData> => {
    const response = await axiosInstance.post('/payments/paypal/refund', data);
    return response.data;
  },

  // Get payment info for order
  getPaymentInfo: async (orderId: string): Promise<PaymentInfoResponse> => {
    const response = await axiosInstance.get(`/payments/${orderId}`);
    return response.data;
  },

  // Verify payment (admin only)
  verifyPayment: async (paymentId: string, data: VerifyPaymentRequest): Promise<PaymentResponse> => {
    const response = await axiosInstance.put(`/payments/${paymentId}/verify`, data);
    return response.data;
  },
};
