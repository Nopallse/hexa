import axiosInstance from '@/services/axiosInstance';
import { 
  ProductResponse, 
  ProductsListResponse, 
  ProductQueryParams 
} from '../types';

export const productApi = {
  // Get all products with pagination and filters
  getProducts: async (params?: ProductQueryParams): Promise<ProductsListResponse> => {
    const response = await axiosInstance.get('/products', { params });
    return response.data;
  },

  // Get product by ID
  getProductById: async (id: string): Promise<ProductResponse> => {
    const response = await axiosInstance.get(`/products/${id}`);
    return response.data;
  },

  // Search products
  searchProducts: async (query: string, params?: Omit<ProductQueryParams, 'search'>): Promise<ProductsListResponse> => {
    const response = await axiosInstance.get('/products', { 
      params: { ...params, search: query } 
    });
    return response.data;
  },

  // Get products by category
  getProductsByCategory: async (categoryId: string, params?: Omit<ProductQueryParams, 'category'>): Promise<ProductsListResponse> => {
    const response = await axiosInstance.get('/products', { 
      params: { ...params, category: categoryId } 
    });
    return response.data;
  },
};
