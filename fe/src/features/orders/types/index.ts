// Order API types

export interface Address {
  id: string;
  address_line: string;
  city: string;
  province: string;
  postal_code: string;
}

export interface ProductImage {
  image_name: string;
}

export interface Product {
  name: string;
  product_images: ProductImage[];
}

export interface VariantOption {
  option_name: string;
  option_value: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  variant_name: string;
  price: number;
  stock: number;
  product: Product;
  variant_options: VariantOption[];
}

export interface OrderItem {
  id: string;
  product_variant_id: string;
  quantity: number;
  price: number;
  product_variant: ProductVariant;
}

export interface Shipping {
  id: string;
  courier: string;
  tracking_number: string | null;
  shipping_status: string;
  estimated_delivery: string | null;
}

export interface Payment {
  id: string;
  payment_method: string;
  amount: number;
  payment_status: string;
  payment_date: string;
  payment_reference: string | null;
}

export interface Order {
  id: string;
  user_id: string;
  address_id: string;
  total_amount: number;
  shipping_cost: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'unpaid' | 'paid' | 'failed' | 'refunded';
  created_at: string;
  updated_at: string;
  address: Address;
  order_items: OrderItem[];
  shipping: Shipping | null;
  payments: Payment[];
}

export interface CreateOrderRequest {
  address_id: string;
  shipping_cost: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: string;
  available: boolean;
  requires_approval?: boolean;
  is_local?: boolean;
  is_international?: boolean;
  supported_methods?: string[];
}

export interface OrderResponse {
  success: boolean;
  data: Order;
  message?: string;
}

export interface OrdersListResponse {
  success: boolean;
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PaymentMethodsResponse {
  success: boolean;
  data: PaymentMethod[];
}

export interface PaymentStatusResponse {
  success: boolean;
  data: {
    order_id: string;
    payment_status: string;
    total_amount: number;
    shipping_cost: number;
    payments: Payment[];
  };
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  status?: string;
}
