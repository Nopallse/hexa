import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order, PaymentMethod } from '../types';

interface OrderStore {
  orders: Order[];
  paymentMethods: PaymentMethod[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setOrders: (orders: Order[]) => void;
  addOrder: (order: Order) => void;
  updateOrder: (id: string, updates: Partial<Order>) => void;
  setPaymentMethods: (methods: PaymentMethod[]) => void;
  setCurrentOrder: (order: Order | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set, get) => ({
      orders: [],
      paymentMethods: [],
      currentOrder: null,
      loading: false,
      error: null,

      setOrders: (orders) => set({ orders }),
      
      addOrder: (order) => set((state) => ({
        orders: [order, ...state.orders]
      })),
      
      updateOrder: (id, updates) => set((state) => ({
        orders: state.orders.map(order =>
          order.id === id ? { ...order, ...updates } : order
        ),
        currentOrder: state.currentOrder?.id === id 
          ? { ...state.currentOrder, ...updates } 
          : state.currentOrder
      })),
      
      setPaymentMethods: (paymentMethods) => set({ paymentMethods }),
      
      setCurrentOrder: (order) => set({ currentOrder: order }),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'order-storage',
      partialize: (state) => ({ 
        orders: state.orders,
        paymentMethods: state.paymentMethods 
      }),
    }
  )
);
