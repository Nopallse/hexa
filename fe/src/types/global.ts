// Global types untuk aplikasi Hexa Crochet
import { OrderStatus, PaymentStatus } from './enum';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  gender?: string;
  date_of_birth?: string;
  role: 'admin' | 'user';
  avatar?: string;
  created_at: string;
  updated_at: string;
}

export interface Address {
  id: string;
  userId: string;
  name: string;
  phone: string;
  street: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string | null;
  image?: string | null; // Image filename
  created_at: string;
  updated_at?: string;
  products?: CategoryProduct[];
}

export interface CategoryProduct {
  id: string;
  name: string;
  price: string;
  stock: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  category?: Category;
  images: string[];
  variants: ProductVariant[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  weight: number;
  isActive: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  variantId: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  userId: string;
  user?: User;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
  shippingAddress: Address;
  shippingMethod: ShippingMethod;
  paymentMethod: PaymentMethod;
  subtotal: number;
  shippingCost: number;
  total: number;
  notes?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  product: Product;
  variant: ProductVariant;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  cost: number;
  estimatedDays: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'bank_transfer' | 'e_wallet' | 'cod';
  isActive: boolean;
}

export interface Payment {
  id: string;
  orderId: string;
  order?: Order;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  proofImage?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Pagination interface
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

// Filter interfaces
export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: 'name' | 'price' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export interface OrderFilters {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
}

// Notification interface
export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  open: boolean;
  autoHideDuration?: number;
}
