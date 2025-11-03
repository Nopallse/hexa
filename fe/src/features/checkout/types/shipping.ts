export interface ShippingMethod {
  courier_name: string;
  courier_code: string;
  courier_service_name: string;
  courier_service_code: string;
  service_type: 'express' | 'standard' | 'economy' | 'overnight';
  description: string;
  shipping_type: string;
  ship_type: string;
  service_name: string;
  price: number;
  currency?: string;
  type: string;
  min_day: number;
  max_day: number;
  provider?: 'biteship' | 'fedex' | 'fedex-estimated' | 'indonesia-estimated';
}

export interface ShippingRatesResponse {
  pricing: ShippingMethod[];
  origin: {
    postal_code: string;
    country: string;
  };
  destination: {
    postal_code: string;
    country: string;
  };
}

export interface ShippingRateRequest {
  origin_postal_code: string;
  destination_postal_code: string;
  origin_country?: string;
  destination_country?: string;
  couriers?: string;
  items: ShippingItem[];
}

export interface ShippingItem {
  name: string;
  description?: string;
  length?: number;
  width?: number;
  height?: number;
  weight: number;
  quantity: number;
  value: number;
}

export interface TrackingEvent {
  status: string;
  description: string;
  location: string;
  timestamp: string;
  details?: string;
}

export interface TrackingResponse {
  status: 'pending' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled' | 'exception' | 'unknown';
  message: string;
  tracking_number: string;
  events: TrackingEvent[];
  estimated_delivery?: string;
  carrier?: string;
}

export interface ShippingConfigStatus {
  biteshipConfigured: boolean;
  biteshipApiKeyPresent: boolean;
  fedexConfigured: boolean;
  message: {
    biteship: string;
    fedex: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  provider?: string;
  cached?: boolean;
  origin_country?: string;
  destination_country?: string;
}
