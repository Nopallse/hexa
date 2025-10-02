// Category API types

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  image?: string; // Image filename
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  image?: string | null; // Image filename or null to remove
}

export interface CategoryResponse {
  success: boolean;
  message?: string;
  data: {
    id: string;
    name: string;
    description?: string | null;
    image?: string | null; // Image filename
    created_at: string;
    updated_at: string;
    is_active: boolean;
    deleted_at?: string | null;
    products?: {
      id: string;
      name: string;
      price: string;
      stock: number;
      created_at: string;
    }[];
  };
}

export interface CategoriesListResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    description?: string | null;
    image?: string | null; // Image filename
    created_at: string;
    updated_at: string;
    is_active: boolean;
    deleted_at?: string | null;
  }[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DeletedCategoriesResponse {
  success: boolean;
  data: {
    id: string;
    name: string;
    description?: string | null;
    created_at: string;
    updated_at: string;
    deleted_at: string;
  }[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
