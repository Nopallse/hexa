export interface ProductVariant {
  id: string;
  sku: string;
  variant_name: string;
  price: string; // Backend returns as string
  currency_code?: string; // Currency code (e.g., IDR, USD)
  stock: number;
  image?: string | null; // Optional: variant-specific image filename
  affects_image?: boolean; // True if this variant type needs different image
  display_image?: string; // Computed field from backend
  has_own_image?: boolean; // Computed field from backend
  variant_options?: VariantOption[];
}

export interface VariantOption {
  id: string;
  option_name: string;
  option_value: string;
}

export interface ProductImage {
  id: string;
  image_name: string; // Filename only, not full URL
  is_primary: boolean;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: string | null; // Backend returns as string, null if has variants
  currency_code?: string; // Currency code (e.g., IDR, USD)
  stock: number | null; // null if has variants
  category_id: string;
  created_at: string;
  updated_at: string;
  category: Category;
  product_images: ProductImage[];
  product_variants: ProductVariant[];
  hasVariants?: boolean; // Computed field from backend
  price_range?: { // Computed field from backend
    min: number;
    max: number;
    display: string;
  } | null;
  total_stock?: number; // Computed field from backend
}

export interface ProductResponse {
  success: boolean;
  message?: string;
  data: Product;
}

export interface ProductsListResponse {
  success: boolean;
  data: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  min_price?: number;
  max_price?: number;
  sort?: 'created_at' | 'name' | 'price' | 'stock' | 'sold_count';
  sortOrder?: 'asc' | 'desc';
}

export interface CreateProductRequest {
  category_id: string;
  name: string;
  description?: string;
  price: number;
  currency_code?: string; // Default: IDR
  stock: number;
}

export interface UpdateProductRequest {
  category_id?: string;
  name?: string;
  description?: string;
  price?: number;
  currency_code?: string;
  stock?: number;
}

export interface DeletedProductsResponse {
  success: boolean;
  data: Product[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ===== VARIANT TYPES =====

export interface CreateProductVariantRequest {
  sku: string;
  variant_name: string;
  price: number;
  currency_code?: string; // Default: IDR
  stock: number;
  image?: string; // Optional: variant-specific image filename
  affects_image?: boolean; // True if this variant type needs different image
}

export interface UpdateProductVariantRequest {
  sku?: string;
  variant_name?: string;
  price?: number;
  currency_code?: string;
  stock?: number;
  image?: string | null; // null to remove image
}

export interface ProductVariantResponse {
  success: boolean;
  message?: string;
  data: ProductVariant;
}

export interface ProductVariantsResponse {
  success: boolean;
  data: ProductVariant[];
}

// ===== VARIANT OPTION TYPES =====

export interface CreateVariantOptionRequest {
  option_name: string;
  option_value: string;
}

export interface UpdateVariantOptionRequest {
  option_name?: string;
  option_value?: string;
}

export interface VariantOptionResponse {
  success: boolean;
  message?: string;
  data: VariantOption;
}

export interface VariantOptionsResponse {
  success: boolean;
  data: VariantOption[];
}

// ===== PRODUCT IMAGE TYPES =====

export interface CreateProductImageRequest {
  image_name: string; // Filename only
  is_primary?: boolean;
}

export interface UpdateProductImageRequest {
  image_name?: string;
  is_primary?: boolean;
}

export interface ProductImageResponse {
  success: boolean;
  message?: string;
  data: ProductImage;
}

export interface ProductImagesResponse {
  success: boolean;
  data: ProductImage[];
}