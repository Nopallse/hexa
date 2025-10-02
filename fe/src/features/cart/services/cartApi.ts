import axiosInstance from '@/services/axiosInstance';
import { 
  CartResponse, 
  CartListResponse, 
  AddToCartRequest, 
  UpdateCartItemRequest,
  ApiResponse 
} from '../types';

export const cartApi = {
  // Get user's cart
  getCart: async (): Promise<CartListResponse> => {
    const response = await axiosInstance.get('/cart');
    return response.data;
  },

  // Add item to cart
  addToCart: async (data: AddToCartRequest): Promise<CartResponse> => {
    const response = await axiosInstance.post('/cart', data);
    return response.data;
  },

  // Update cart item quantity
  updateCartItem: async (id: string, data: UpdateCartItemRequest): Promise<CartResponse> => {
    const response = await axiosInstance.put(`/cart/${id}`, data);
    return response.data;
  },

  // Remove item from cart
  removeFromCart: async (id: string): Promise<ApiResponse> => {
    const response = await axiosInstance.delete(`/cart/${id}`);
    return response.data;
  },

  // Clear entire cart
  clearCart: async (): Promise<ApiResponse> => {
    const response = await axiosInstance.delete('/cart');
    return response.data;
  },
};
