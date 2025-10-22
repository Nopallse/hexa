export interface Location {
  id: string;
  name: string;
  address: string;
  note?: string;
  coordinate?: {
    latitude: number;
    longitude: number;
  };
  postal_code: number;
  contact_name: string;
  contact_phone: string;
  connected_users: any[];
  owned: boolean;
  status: 'active' | 'inactive';
  stores: any[];
  created_at: string;
  updated_at: string;
  type: 'origin' | 'destination';
}

export interface CreateLocationRequest {
  name: string;
  contact_name: string;
  contact_phone: string;
  address: string;
  note?: string;
  postal_code: number;
}

export interface UpdateLocationRequest {
  name?: string;
  contact_name?: string;
  contact_phone?: string;
  address?: string;
  note?: string;
  postal_code?: number;
}

export interface LocationResponse {
  success: boolean;
  message?: string;
  data: Location;
}

export interface LocationsListResponse {
  success: boolean;
  data: Location[];
}

export interface ActiveOriginResponse {
  success: boolean;
  data: Location | null;
}
