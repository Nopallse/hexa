export interface User {
  id: string;
  full_name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
  _count?: {
    addresses: number;
    cart_items: number;
    orders: number;
    transactions?: number;
  };
  addresses?: UserAddress[];
}

export interface UserAddress {
  id: string;
  address_line: string;
  city: string;
  province: string;
  postal_code: string;
  is_primary: boolean;
  created_at: string;
}

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  sort?: 'name' | 'email' | 'role' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export interface UserStats {
  total_users: number;
  total_admins: number;
  total_regular_users: number;
  recent_users: number;
  users_with_orders: number;
  users_without_orders: number;
}

export interface UserPagination {
  current_page: number;
  total_pages: number;
  total_items: number;
  items_per_page: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

export interface UserResponse {
  success: boolean;
  data: User[];
  pagination: UserPagination;
}

export interface UserDetailResponse {
  success: boolean;
  data: User;
}

export interface UserStatsResponse {
  success: boolean;
  data: UserStats;
}

export interface UpdateRoleRequest {
  role: 'user' | 'admin';
}

export interface UpdateRoleResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    updated_at: string;
  };
}
