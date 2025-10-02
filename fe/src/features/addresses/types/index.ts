// Address API types

export interface Address {
  id: string;
  user_id: string;
  address_line: string;
  city: string;
  province: string;
  postal_code: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressRequest {
  address_line: string;
  city: string;
  province: string;
  postal_code: string;
  is_primary?: boolean;
}

export interface UpdateAddressRequest {
  address_line?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  is_primary?: boolean;
}

export interface AddressResponse {
  success: boolean;
  data: Address;
  message?: string;
}

export interface AddressesListResponse {
  success: boolean;
  data: Address[];
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}
