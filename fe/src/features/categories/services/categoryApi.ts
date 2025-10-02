import axiosInstance from '@/services/interceptors';
import { 
  CreateCategoryRequest, 
  UpdateCategoryRequest, 
  CategoryResponse,
  CategoriesListResponse,
  DeletedCategoriesResponse,
  CategoryQueryParams
} from '../types';
import { ApiResponse } from '@/types';

export const categoryApi = {
  // Get all categories with pagination and filters
  getCategories: async (params?: CategoryQueryParams): Promise<CategoriesListResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const url = `/categories${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await axiosInstance.get<CategoriesListResponse>(url);
    return response.data;
  },

  // Get category by ID
  getCategoryById: async (id: string): Promise<CategoryResponse> => {
    const response = await axiosInstance.get<CategoryResponse>(`/categories/${id}`);
    return response.data;
  },

  // Create new category
  createCategory: async (data: CreateCategoryRequest & { _imageFile?: File }): Promise<CategoryResponse> => {
    const formData = new FormData();
    formData.append('name', data.name);
    if (data.description) formData.append('description', data.description);
    if (data._imageFile) {
      formData.append('image', data._imageFile);
      formData.append('upload_type', 'category');
    }
    
    const response = await axiosInstance.post<CategoryResponse>('/categories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update category
  updateCategory: async (id: string, data: UpdateCategoryRequest & { _imageFile?: File; _removeImage?: boolean }): Promise<CategoryResponse> => {
    const formData = new FormData();
    if (data.name) formData.append('name', data.name);
    if (data.description !== undefined) formData.append('description', data.description || '');
    if (data._imageFile) {
      formData.append('image', data._imageFile);
      formData.append('upload_type', 'category');
    } else if (data._removeImage) {
      formData.append('remove_image', 'true');
    }
    
    const response = await axiosInstance.put<CategoryResponse>(`/categories/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Delete category (soft delete)
  deleteCategory: async (id: string): Promise<ApiResponse> => {
    const response = await axiosInstance.delete<ApiResponse>(`/categories/${id}`);
    return response.data;
  },

  // Restore deleted category
  restoreCategory: async (id: string): Promise<ApiResponse> => {
    const response = await axiosInstance.patch<ApiResponse>(`/categories/${id}/restore`);
    return response.data;
  },

  // Get deleted categories
  getDeletedCategories: async (params?: CategoryQueryParams): Promise<DeletedCategoriesResponse> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const url = `/categories/deleted/list${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await axiosInstance.get<DeletedCategoriesResponse>(url);
    return response.data;
  },
};
