import { create } from 'zustand';
import { Address, ShippingMethod, PaymentMethod } from '@/types/global';

interface CheckoutState {
  // Current step (0: Address, 1: Shipping, 2: Payment, 3: Review)
  step: number;
  
  // Checkout data
  shippingAddress: Address | null;
  shippingMethod: ShippingMethod | null;
  paymentMethod: PaymentMethod | null;
  notes: string;
  
  // Loading state
  isLoading: boolean;
  error: string | null;

  // Actions
  nextStep: () => void;
  prevStep: () => void;
  setStep: (step: number) => void;
  
  setShippingAddress: (address: Address) => void;
  setShippingMethod: (method: ShippingMethod) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setNotes: (notes: string) => void;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  reset: () => void;
  
  // Validation
  canProceedToNextStep: () => boolean;
  isStepValid: (stepIndex: number) => boolean;
}

export const useCheckoutStore = create<CheckoutState>((set, get) => ({
  step: 0,
  shippingAddress: null,
  shippingMethod: null,
  paymentMethod: null,
  notes: '',
  isLoading: false,
  error: null,

  nextStep: () => {
    const currentStep = get().step;
    const canProceed = get().canProceedToNextStep();
    
    if (canProceed && currentStep < 3) {
      set({ step: currentStep + 1, error: null });
    }
  },

  prevStep: () => {
    const currentStep = get().step;
    if (currentStep > 0) {
      set({ step: currentStep - 1, error: null });
    }
  },

  setStep: (step: number) => {
    if (step >= 0 && step <= 3) {
      set({ step, error: null });
    }
  },

  setShippingAddress: (address: Address) => {
    set({ shippingAddress: address, error: null });
  },

  setShippingMethod: (method: ShippingMethod) => {
    set({ shippingMethod: method, error: null });
  },

  setPaymentMethod: (method: PaymentMethod) => {
    set({ paymentMethod: method, error: null });
  },

  setNotes: (notes: string) => {
    set({ notes });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  reset: () => {
    set({
      step: 0,
      shippingAddress: null,
      shippingMethod: null,
      paymentMethod: null,
      notes: '',
      isLoading: false,
      error: null,
    });
  },

  canProceedToNextStep: () => {
    const state = get();
    return state.isStepValid(state.step);
  },

  isStepValid: (stepIndex: number) => {
    const state = get();
    
    switch (stepIndex) {
      case 0: // Address step
        return state.shippingAddress !== null;
      
      case 1: // Shipping step
        return state.shippingMethod !== null;
      
      case 2: // Payment step
        return state.paymentMethod !== null;
      
      case 3: // Review step
        return (
          state.shippingAddress !== null &&
          state.shippingMethod !== null &&
          state.paymentMethod !== null
        );
      
      default:
        return false;
    }
  },
}));
