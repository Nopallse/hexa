import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '../types';

interface ProfileStore {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      profile: null,
      loading: false,
      error: null,

      setProfile: (profile) => set({ profile }),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      clearError: () => set({ error: null }),
      
      clearProfile: () => set({ profile: null }),
    }),
    {
      name: 'profile-storage',
      partialize: (state) => ({ 
        profile: state.profile 
      }),
    }
  )
);
