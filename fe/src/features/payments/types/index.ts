// Payment API types

export interface Payment {
  id: string;
  order_id: string;
  payment_method: string;
  amount: number;
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_date: string;
  payment_reference: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePaymentRequest {
  order_id: string;
  payment_method: 'transfer' | 'e-wallet' | 'COD';
  amount: number;
  payment_reference?: string;
}

export interface CreatePayPalPaymentRequest {
  order_id: string;
}

export interface CapturePayPalPaymentRequest {
  paypal_order_id: string;
}

export interface RefundPayPalPaymentRequest {
  payment_id: string;
  amount?: number;
  reason?: string;
}

export interface VerifyPaymentRequest {
  payment_status: 'paid' | 'failed' | 'refunded';
  payment_date?: string;
}

export interface PaymentInfo {
  order_id: string;
  total_amount: number;
  shipping_cost: number;
  payment_status: string;
  payments: Payment[];
}

export interface PayPalPaymentResponse {
  paypal_order_id: string;
  approval_url: string;
  order_id: string;
}

export interface PayPalCaptureResponse {
  capture_id: string;
  order_id: string;
  status: string;
}

export interface PayPalRefundResponse {
  refund_id: string;
  status: string;
}

export interface PaymentResponse {
  success: boolean;
  data: Payment;
  message?: string;
}

export interface PaymentInfoResponse {
  success: boolean;
  data: PaymentInfo;
}

export interface PayPalPaymentResponseData {
  success: boolean;
  data: PayPalPaymentResponse;
  message?: string;
}

export interface PayPalCaptureResponseData {
  success: boolean;
  data: PayPalCaptureResponse;
  message?: string;
}

export interface PayPalRefundResponseData {
  success: boolean;
  data: PayPalRefundResponse;
  message?: string;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}
