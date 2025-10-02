import axiosInstance from '@/services/interceptors';
import { 
  CreateProductRequest, 
  UpdateProductRequest, 
  ProductResponse,
  ProductsListResponse,
  DeletedProductsResponse,
  ProductQueryParams,
  CreateProductVariantRequest,
  UpdateProductVariantRequest,
  ProductVariantResponse,
  ProductVariantsResponse,
  CreateVariantOptionRequest,
  UpdateVariantOptionRequest,
  VariantOptionResponse,
  VariantOptionsResponse,
  CreateProductImageRequest,
  ProductImageResponse,
  ProductImagesResponse
} from '@/features/products/types';
import { ApiResponse } from '@/types';

export const productApi = {
  // Get all products with pagination and filters
  getProducts: async (params?: ProductQueryParams): Promise<ProductsListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.min_price) queryParams.append('min_price', params.min_price.toString());
    if (params?.max_price) queryParams.append('max_price', params.max_price.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const url = `/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await axiosInstance.get<ProductsListResponse>(url);
    return response.data;
  },

  // Get product by ID
  getProductById: async (id: string): Promise<ProductResponse> => {
    const response = await axiosInstance.get<ProductResponse>(`/products/${id}`);
    return response.data;
  },

  // Create new product
  createProduct: async (data: CreateProductRequest): Promise<ProductResponse> => {
    const response = await axiosInstance.post<ProductResponse>('/products', data);
    return response.data;
  },

  // Update product
  updateProduct: async (id: string, data: UpdateProductRequest): Promise<ProductResponse> => {
    const response = await axiosInstance.put<ProductResponse>(`/products/${id}`, data);
    return response.data;
  },

  // Delete product (soft delete)
  deleteProduct: async (id: string): Promise<ApiResponse> => {
    const response = await axiosInstance.delete<ApiResponse>(`/products/${id}`);
    return response.data;
  },

  // Restore deleted product
  restoreProduct: async (id: string): Promise<ApiResponse> => {
    const response = await axiosInstance.patch<ApiResponse>(`/products/${id}/restore`);
    return response.data;
  },

  // Get deleted products
  getDeletedProducts: async (params?: ProductQueryParams): Promise<DeletedProductsResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.category) queryParams.append('category', params.category);
    if (params?.search) queryParams.append('search', params.search);
    if (params?.min_price) queryParams.append('min_price', params.min_price.toString());
    if (params?.max_price) queryParams.append('max_price', params.max_price.toString());
    if (params?.sort) queryParams.append('sort', params.sort);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const url = `/products/deleted/list${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await axiosInstance.get<DeletedProductsResponse>(url);
    return response.data;
  },

  // ========== PRODUCT VARIANT METHODS ==========

  // Bulk create product variants with images
  createProductVariantsBulk: async (productId: string, variants: any[]): Promise<any> => {
    const formData = new FormData();
    
    // Add variants data as JSON string
    formData.append('variants', JSON.stringify(variants.map(v => ({
      sku: v.sku,
      variant_name: v.variant_name,
      price: v.price,
      stock: v.stock,
      affects_image: v.affects_image,
      attributes: v.attributes
    }))));
    
    // Add images for variants that have affects_image = true
    variants.forEach((variant, index) => {
      if (variant._imageFile) {
        formData.append(`image_${index}`, variant._imageFile);
      }
    });
    
    const response = await axiosInstance.post(`/products/${productId}/variants/bulk`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Create product variant
  createProductVariant: async (productId: string, data: CreateProductVariantRequest): Promise<ProductVariantResponse> => {
    const response = await axiosInstance.post<ProductVariantResponse>(`/products/${productId}/variants`, data);
    return response.data;
  },

  // Get all variants for a product
  getProductVariants: async (productId: string): Promise<ProductVariantsResponse> => {
    const response = await axiosInstance.get<ProductVariantsResponse>(`/products/${productId}/variants`);
    return response.data;
  },

  // Get variant by ID
  getVariantById: async (variantId: string): Promise<ProductVariantResponse> => {
    const response = await axiosInstance.get<ProductVariantResponse>(`/products/variants/${variantId}`);
    return response.data;
  },

  // Update product variant
  updateProductVariant: async (variantId: string, data: UpdateProductVariantRequest): Promise<ProductVariantResponse> => {
    const response = await axiosInstance.put<ProductVariantResponse>(`/products/variants/${variantId}`, data);
    return response.data;
  },

  // Update variant image
  updateVariantImage: async (variantId: string, imageFile: File): Promise<ProductVariantResponse> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await axiosInstance.put<ProductVariantResponse>(
      `/products/variants/${variantId}/image`, 
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  },

  // Delete product variant
  deleteProductVariant: async (variantId: string): Promise<ApiResponse> => {
    const response = await axiosInstance.delete<ApiResponse>(`/products/variants/${variantId}`);
    return response.data;
  },

  // ========== VARIANT OPTION METHODS ==========

  // Create variant option
  createVariantOption: async (variantId: string, data: CreateVariantOptionRequest): Promise<VariantOptionResponse> => {
    const response = await axiosInstance.post<VariantOptionResponse>(`/products/variants/${variantId}/options`, data);
    return response.data;
  },

  // Get variant options
  getVariantOptions: async (variantId: string): Promise<VariantOptionsResponse> => {
    const response = await axiosInstance.get<VariantOptionsResponse>(`/products/variants/${variantId}/options`);
    return response.data;
  },

  // Update variant option
  updateVariantOption: async (optionId: string, data: UpdateVariantOptionRequest): Promise<VariantOptionResponse> => {
    const response = await axiosInstance.put<VariantOptionResponse>(`/products/options/${optionId}`, data);
    return response.data;
  },

  // Delete variant option
  deleteVariantOption: async (optionId: string): Promise<ApiResponse> => {
    const response = await axiosInstance.delete<ApiResponse>(`/products/options/${optionId}`);
    return response.data;
  },

  // ========== PRODUCT IMAGE METHODS ==========

  // Create product image
  createProductImage: async (productId: string, data: CreateProductImageRequest & { _imageFile?: File }): Promise<ProductImageResponse> => {
    const formData = new FormData();
    
    if (data._imageFile) {
      formData.append('image', data._imageFile);
      formData.append('upload_type', 'product');
    }
    
    if (data.is_primary !== undefined) {
      formData.append('is_primary', data.is_primary.toString());
    }
    
    const response = await axiosInstance.post<ProductImageResponse>(`/products/${productId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get product images
  getProductImages: async (productId: string): Promise<ProductImagesResponse> => {
    const response = await axiosInstance.get<ProductImagesResponse>(`/products/${productId}/images`);
    return response.data;
  },

  // Update product image
  updateProductImage: async (imageId: string, data: any): Promise<ProductImageResponse> => {
    // If there's an image file, send as FormData
    if (data._imageFile) {
      const formData = new FormData();
      formData.append('image', data._imageFile);
      
      if (data.is_primary !== undefined) {
        formData.append('is_primary', String(data.is_primary));
      }
      
      const response = await axiosInstance.put<ProductImageResponse>(
        `/products/images/${imageId}`, 
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    }
    
    // Otherwise send as JSON
    const response = await axiosInstance.put<ProductImageResponse>(`/products/images/${imageId}`, data);
    return response.data;
  },

  // Delete product image
  deleteProductImage: async (imageId: string): Promise<ApiResponse> => {
    const response = await axiosInstance.delete<ApiResponse>(`/products/images/${imageId}`);
    return response.data;
  },
};
