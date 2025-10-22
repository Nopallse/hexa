export interface Address {
  id: string;
  user_id: string;
  recipient_name: string;
  phone_number: string;
  address_line: string;
  city: string;
  province: string;
  postal_code: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressData {
  recipient_name: string;
  phone_number: string;
  address_line: string;
  city: string;
  province: string;
  postal_code: string;
  is_primary: boolean;
}

export interface UpdateAddressData {
  recipient_name?: string;
  phone_number?: string;
  address_line?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  is_primary?: boolean;
}
