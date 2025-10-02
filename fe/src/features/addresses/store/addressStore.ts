import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Address } from '../types';

interface AddressStore {
  addresses: Address[];
  loading: boolean;
  error: string | null;
  
  // Actions
  setAddresses: (addresses: Address[]) => void;
  addAddress: (address: Address) => void;
  updateAddress: (id: string, updates: Partial<Address>) => void;
  removeAddress: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  
  // Computed values
  getPrimaryAddress: () => Address | null;
}

export const useAddressStore = create<AddressStore>()(
  persist(
    (set, get) => ({
      addresses: [],
      loading: false,
      error: null,

      setAddresses: (addresses) => set({ addresses }),
      
      addAddress: (address) => set((state) => ({
        addresses: [address, ...state.addresses]
      })),
      
      updateAddress: (id, updates) => set((state) => ({
        addresses: state.addresses.map(addr =>
          addr.id === id ? { ...addr, ...updates } : addr
        )
      })),
      
      removeAddress: (id) => set((state) => ({
        addresses: state.addresses.filter(addr => addr.id !== id)
      })),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),

      getPrimaryAddress: () => {
        const { addresses } = get();
        return addresses.find(addr => addr.is_primary) || null;
      },
    }),
    {
      name: 'address-storage',
      partialize: (state) => ({ 
        addresses: state.addresses 
      }),
    }
  )
);
