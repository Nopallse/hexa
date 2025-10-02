// Cart API types

export interface VariantOption {
  id: string;
  option_name: string;
  option_value: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  variant_name: string;
  price: string; // Backend returns as string
  stock: number;
  variant_options?: VariantOption[];
}

export interface Product {
  id: string;
  name: string;
  deleted_at: string | null;
  product_images: Array<{
    image_name: string;
  }>;
}

export interface CartItem {
  id: string;
  user_id: string;
  product_variant_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product_variant: ProductVariant & {
    product: Product;
  };
}

export interface AddToCartRequest {
  product_variant_id: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export interface CartResponse {
  success: boolean;
  data: CartItem;
  message?: string;
}

export interface CartListResponse {
  success: boolean;
  data: CartItem[];
}

export interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
}
