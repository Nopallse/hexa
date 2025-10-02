// Auth API types

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
  phone: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      email: string;
      full_name: string;
      phone: string;
      role: 'admin' | 'user';
      created_at: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data?: {
    user: {
      id: string;
      email: string;
      full_name: string;
      phone: string;
      role: 'admin' | 'user';
      created_at: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}

export interface MeResponse {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      full_name: string;
      phone: string;
      role: 'admin' | 'user';
      created_at: string;
      updated_at: string;
    };
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
  };
}
