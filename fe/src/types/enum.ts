// Enums untuk aplikasi Hexa Crochet

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

export enum PaymentMethodType {
  BANK_TRANSFER = 'bank_transfer',
  E_WALLET = 'e_wallet',
  COD = 'cod',
}

// Status labels untuk UI
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Menunggu Konfirmasi',
  [OrderStatus.CONFIRMED]: 'Dikonfirmasi',
  [OrderStatus.PROCESSING]: 'Sedang Diproses',
  [OrderStatus.SHIPPED]: 'Dikirim',
  [OrderStatus.DELIVERED]: 'Diterima',
  [OrderStatus.CANCELLED]: 'Dibatalkan',
  [OrderStatus.RETURNED]: 'Dikembalikan',
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: 'Menunggu Pembayaran',
  [PaymentStatus.PAID]: 'Sudah Dibayar',
  [PaymentStatus.FAILED]: 'Pembayaran Gagal',
  [PaymentStatus.REFUNDED]: 'Dikembalikan',
};

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.ADMIN]: 'Administrator',
  [UserRole.USER]: 'Customer',
};

// Status colors untuk UI
export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: '#ff9800',
  [OrderStatus.CONFIRMED]: '#2196f3',
  [OrderStatus.PROCESSING]: '#9c27b0',
  [OrderStatus.SHIPPED]: '#3f51b5',
  [OrderStatus.DELIVERED]: '#4caf50',
  [OrderStatus.CANCELLED]: '#f44336',
  [OrderStatus.RETURNED]: '#795548',
};

export const PAYMENT_STATUS_COLORS: Record<PaymentStatus, string> = {
  [PaymentStatus.PENDING]: '#ff9800',
  [PaymentStatus.PAID]: '#4caf50',
  [PaymentStatus.FAILED]: '#f44336',
  [PaymentStatus.REFUNDED]: '#607d8b',
};
