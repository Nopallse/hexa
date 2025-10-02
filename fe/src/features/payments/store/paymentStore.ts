import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Payment, PaymentInfo } from '../types';

interface PaymentStore {
  payments: Payment[];
  currentPaymentInfo: PaymentInfo | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setPayments: (payments: Payment[]) => void;
  addPayment: (payment: Payment) => void;
  updatePayment: (id: string, updates: Partial<Payment>) => void;
  setCurrentPaymentInfo: (info: PaymentInfo | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const usePaymentStore = create<PaymentStore>()(
  persist(
    (set, get) => ({
      payments: [],
      currentPaymentInfo: null,
      loading: false,
      error: null,

      setPayments: (payments) => set({ payments }),
      
      addPayment: (payment) => set((state) => ({
        payments: [payment, ...state.payments]
      })),
      
      updatePayment: (id, updates) => set((state) => ({
        payments: state.payments.map(payment =>
          payment.id === id ? { ...payment, ...updates } : payment
        ),
        currentPaymentInfo: state.currentPaymentInfo ? {
          ...state.currentPaymentInfo,
          payments: state.currentPaymentInfo.payments.map(payment =>
            payment.id === id ? { ...payment, ...updates } : payment
          )
        } : null
      })),
      
      setCurrentPaymentInfo: (info) => set({ currentPaymentInfo: info }),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),
    }),
    {
      name: 'payment-storage',
      partialize: (state) => ({ 
        payments: state.payments,
        currentPaymentInfo: state.currentPaymentInfo 
      }),
    }
  )
);
