import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '../types';

interface CartStore {
  items: CartItem[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setItems: (items: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  updateItem: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Computed values
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      error: null,

      setItems: (items) => set({ items }),
      
      addItem: (item) => set((state) => {
        const existingItem = state.items.find(
          existing => existing.product_variant_id === item.product_variant_id
        );
        
        if (existingItem) {
          return {
            items: state.items.map(existing =>
              existing.product_variant_id === item.product_variant_id
                ? { ...existing, quantity: existing.quantity + item.quantity }
                : existing
            )
          };
        }
        
        return { items: [...state.items, item] };
      }),
      
      updateItem: (id, quantity) => set((state) => ({
        items: state.items.map(item =>
          item.id === id ? { ...item, quantity } : item
        )
      })),
      
      removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),
      
      clearCart: () => set({ items: [] }),
      
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce((total, item) => 
          total + (parseFloat(item.product_variant.price) * item.quantity), 0
        );
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({ items: state.items }),
    }
  )
);
