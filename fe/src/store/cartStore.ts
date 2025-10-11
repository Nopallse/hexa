import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types/global';
import axiosInstance from '@/services/interceptors';
import { AddToCartRequest, UpdateCartItemRequest } from '@/features/cart/types';

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  addItem: (item: AddToCartRequest) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  syncWithServer: () => Promise<void>;
  refreshCartCount: () => Promise<void>;
  getCartSummary: () => { totalItems: number; totalPrice: number };
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      totalItems: 0,
      totalPrice: 0,
      isLoading: false,
      error: null,

      addItem: async (itemData: AddToCartRequest) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axiosInstance.post<{ data: CartItem }>('/cart', itemData);
          const newItem = response.data.data;

          const currentItems = get().items;
          const existingItemIndex = currentItems.findIndex(
            item => item.productId === newItem.productId && item.variantId === newItem.variantId
          );

          let updatedItems: CartItem[];
          if (existingItemIndex >= 0) {
            // Update existing item
            updatedItems = currentItems.map((item, index) =>
              index === existingItemIndex
                ? { ...item, quantity: item.quantity + newItem.quantity, subtotal: item.subtotal + newItem.subtotal }
                : item
            );
          } else {
            // Add new item
            updatedItems = [...currentItems, newItem];
          }

          const summary = calculateCartSummary(updatedItems);
          
          // Get updated count from server
          const summaryResponse = await axiosInstance.get<{ data: { totalItems: number; itemCount: number } }>('/cart/summary');
          const serverSummary = summaryResponse.data.data;
          
          set({
            items: updatedItems,
            totalItems: serverSummary.totalItems, // Use server count
            totalPrice: summary.totalPrice,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Gagal menambahkan item ke keranjang',
          });
          throw error;
        }
      },

      removeItem: async (cartItemId: string) => {
        set({ isLoading: true, error: null });
        try {
          await axiosInstance.delete(`/cart/${cartItemId}`);

          const currentItems = get().items;
          const updatedItems = currentItems.filter(item => item.id !== cartItemId);
          const summary = calculateCartSummary(updatedItems);

          // Get updated count from server
          const summaryResponse = await axiosInstance.get<{ data: { totalItems: number; itemCount: number } }>('/cart/summary');
          const serverSummary = summaryResponse.data.data;

          set({
            items: updatedItems,
            totalItems: serverSummary.totalItems, // Use server count
            totalPrice: summary.totalPrice,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Gagal menghapus item dari keranjang',
          });
          throw error;
        }
      },

      updateQuantity: async (cartItemId: string, quantity: number) => {
        if (quantity <= 0) {
          await get().removeItem(cartItemId);
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const updateData: UpdateCartItemRequest = { quantity };
          const response = await axiosInstance.put<{ data: CartItem }>(`/cart/${cartItemId}`, updateData);
          const updatedItem = response.data.data;

          const currentItems = get().items;
          const updatedItems = currentItems.map(item =>
            item.id === cartItemId ? updatedItem : item
          );
          const summary = calculateCartSummary(updatedItems);

          // Get updated count from server
          const summaryResponse = await axiosInstance.get<{ data: { totalItems: number; itemCount: number } }>('/cart/summary');
          const serverSummary = summaryResponse.data.data;

          set({
            items: updatedItems,
            totalItems: serverSummary.totalItems, // Use server count
            totalPrice: summary.totalPrice,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Gagal mengupdate jumlah item',
          });
          throw error;
        }
      },

      clearCart: async () => {
        set({ isLoading: true, error: null });
        try {
          await axiosInstance.delete('/cart');
          
          set({
            items: [],
            totalItems: 0,
            totalPrice: 0,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Gagal mengosongkan keranjang',
          });
          throw error;
        }
      },

      syncWithServer: async () => {
        set({ isLoading: true, error: null });
        try {
          // Get both cart items and summary
          const [cartResponse, summaryResponse] = await Promise.all([
            axiosInstance.get<{ data: CartItem[] }>('/cart'),
            axiosInstance.get<{ data: { totalItems: number; itemCount: number } }>('/cart/summary')
          ]);
          
          const items = cartResponse.data.data;
          const summary = calculateCartSummary(items);
          const serverSummary = summaryResponse.data.data;

          set({
            items,
            totalItems: serverSummary.totalItems, // Use server count
            totalPrice: summary.totalPrice,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Gagal sinkronisasi keranjang',
          });
        }
      },

      getCartSummary: () => {
        const items = get().items;
        return calculateCartSummary(items);
      },

      refreshCartCount: async () => {
        try {
          const response = await axiosInstance.get<{ data: { totalItems: number; itemCount: number } }>('/cart/summary');
          const serverSummary = response.data.data;

          set({
            totalItems: serverSummary.totalItems,
          });
        } catch (error: any) {
          console.error('Failed to refresh cart count:', error);
        }
      },
    }),
    {
      name: 'cart-store',
      partialize: (state) => ({ 
        items: state.items,
        totalItems: state.totalItems,
        totalPrice: state.totalPrice,
      }),
    }
  )
);

// Helper function untuk menghitung summary keranjang
function calculateCartSummary(items: CartItem[]) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.subtotal, 0);
  
  return { totalItems, totalPrice };
}
