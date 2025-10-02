import { create } from 'zustand';
import { Product, ProductFilters, PaginationMeta } from '@/types/global';

interface ProductState {
  // Product list
  products: Product[];
  filteredProducts: Product[];
  
  // Pagination
  pagination: PaginationMeta;
  
  // Filters
  filters: ProductFilters;
  
  // Search
  searchQuery: string;
  
  // Loading states
  isLoading: boolean;
  isLoadingMore: boolean;
  
  // Error state
  error: string | null;

  // Actions
  setProducts: (products: Product[]) => void;
  addProducts: (products: Product[]) => void;
  
  setPagination: (pagination: PaginationMeta) => void;
  
  setFilters: (filters: Partial<ProductFilters>) => void;
  clearFilters: () => void;
  
  setSearchQuery: (query: string) => void;
  
  setLoading: (loading: boolean) => void;
  setLoadingMore: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed
  applyFilters: () => void;
  getFilteredProducts: () => Product[];
}

const initialFilters: ProductFilters = {
  category: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  search: undefined,
  sortBy: 'name',
  sortOrder: 'asc',
};

const initialPagination: PaginationMeta = {
  page: 1,
  limit: 12,
  total: 0,
  totalPages: 0,
  hasNext: false,
  hasPrev: false,
};

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  filteredProducts: [],
  pagination: initialPagination,
  filters: initialFilters,
  searchQuery: '',
  isLoading: false,
  isLoadingMore: false,
  error: null,

  setProducts: (products: Product[]) => {
    set({ products });
    get().applyFilters();
  },

  addProducts: (newProducts: Product[]) => {
    const currentProducts = get().products;
    const products = [...currentProducts, ...newProducts];
    set({ products });
    get().applyFilters();
  },

  setPagination: (pagination: PaginationMeta) => {
    set({ pagination });
  },

  setFilters: (newFilters: Partial<ProductFilters>) => {
    const currentFilters = get().filters;
    const filters = { ...currentFilters, ...newFilters };
    set({ filters });
    get().applyFilters();
  },

  clearFilters: () => {
    set({ filters: initialFilters });
    get().applyFilters();
  },

  setSearchQuery: (query: string) => {
    set({ searchQuery: query });
    const currentFilters = get().filters;
    const filters = { ...currentFilters, search: query || undefined };
    set({ filters });
    get().applyFilters();
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setLoadingMore: (loading: boolean) => {
    set({ isLoadingMore: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  applyFilters: () => {
    const { products, filters } = get();
    let filtered = [...products];

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(product => 
        product.categoryId === filters.category || 
        product.category?.slug === filters.category
      );
    }

    // Filter by price range
    if (filters.minPrice !== undefined) {
      filtered = filtered.filter(product => {
        const minVariantPrice = Math.min(...product.variants.map(v => v.price));
        return minVariantPrice >= filters.minPrice!;
      });
    }

    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter(product => {
        const maxVariantPrice = Math.max(...product.variants.map(v => v.price));
        return maxVariantPrice <= filters.maxPrice!;
      });
    }

    // Filter by search query
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchLower) ||
        product.description.toLowerCase().includes(searchLower) ||
        product.category?.name.toLowerCase().includes(searchLower)
      );
    }

    // Sort products
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (filters.sortBy) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'price':
            aValue = Math.min(...a.variants.map(v => v.price));
            bValue = Math.min(...b.variants.map(v => v.price));
            break;
          case 'created_at':
            aValue = new Date(a.createdAt).getTime();
            bValue = new Date(b.createdAt).getTime();
            break;
          default:
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
        }

        if (filters.sortOrder === 'desc') {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        } else {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        }
      });
    }

    set({ filteredProducts: filtered });
  },

  getFilteredProducts: () => {
    return get().filteredProducts;
  },
}));
