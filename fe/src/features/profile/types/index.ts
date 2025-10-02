// Profile API types

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface ProfileResponse {
  success: boolean;
  user: UserProfile;
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}
