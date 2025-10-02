// Common API types untuk aplikasi Hexa Crochet

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

// File upload types
export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
}

// Dashboard stats types
export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: any[];
  topProducts: any[];
  salesChart: {
    labels: string[];
    data: number[];
  };
}
