import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types/global';
import { authApi } from '@/features/auth/services/authApi';
import { LoginRequest, RegisterRequest, LoginResponse, RegisterResponse } from '@/features/auth/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  requiresVerification: boolean;
  
  // Actions
  login: (credentials: LoginRequest) => Promise<User>;
  register: (userData: RegisterRequest) => Promise<RegisterResponse>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
  checkAuth: () => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      requiresVerification: false,

      login: async (credentials: LoginRequest): Promise<User> => {
        set({ isLoading: true, error: null, requiresVerification: false });
        try {
          const response = await authApi.login(credentials);
          
          if (!response.success) {
            throw new Error(response.message);
          }

          const { user, accessToken, refreshToken } = response.data;

          // Store tokens
          localStorage.setItem('access_token', accessToken);
          localStorage.setItem('refresh_token', refreshToken);

          // Convert user data to our format
          const userData: User = {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            phone: user.phone || '',
            role: user.role,
            avatar: undefined,
            created_at: user.created_at,
            updated_at: user.created_at,
          };

          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });

          return userData;
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Login gagal',
          });
          throw error;
        }
      },

      register: async (userData: RegisterRequest): Promise<RegisterResponse> => {
        set({ isLoading: true, error: null, requiresVerification: false });
        try {
          const response = await authApi.register(userData);
          
          if (!response.success) {
            throw new Error(response.message);
          }

          // If registration includes data (auto-login), handle it
          if (response.data) {
            const { user, accessToken, refreshToken } = response.data;

            // Store tokens
            localStorage.setItem('access_token', accessToken);
            localStorage.setItem('refresh_token', refreshToken);

            // Convert user data to our format
            const userData: User = {
              id: user.id,
              email: user.email,
              full_name: user.full_name,
              phone: user.phone || '',
              role: user.role,
              avatar: undefined,
              created_at: user.created_at,
              updated_at: user.created_at,
            };

            set({
              user: userData,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            });
          } else {
            // Check if email verification is required
            if (response.message.includes('verification') || response.message.includes('email')) {
              set({
                isLoading: false,
                error: null,
                requiresVerification: true,
              });
            } else {
              set({
                isLoading: false,
                error: null,
              });
            }
          }

          return response;
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Registrasi gagal',
          });
          throw error;
        }
      },

      logout: () => {
        // Call logout API
        authApi.logout().catch(console.error);
        
        // Clear local storage
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        
        set({
          user: null,
          isAuthenticated: false,
          error: null,
          requiresVerification: false,
        });
      },

      updateProfile: async (userData: Partial<User>) => {
        set({ isLoading: true, error: null });
        try {
          // TODO: Implement update profile API when available
          // For now, just update local state
          const currentUser = useAuthStore.getState().user;
          if (currentUser) {
            const updatedUser = { ...currentUser, ...userData };
            set({
              user: updatedUser,
              isLoading: false,
              error: null,
            });
          }
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Update profil gagal',
          });
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      checkAuth: async () => {
        console.log('[AuthStore] checkAuth called');
        const token = localStorage.getItem('access_token');
        if (!token) {
          console.log('[AuthStore] No token found');
          set({ isAuthenticated: false, user: null, isLoading: false });
          return;
        }

        console.log('[AuthStore] Token found, verifying...');
        set({ isLoading: true });

        try {
          const response = await authApi.me();
          console.log('[AuthStore] API response:', response);
          
          if (!response.success) {
            throw new Error('Failed to get user info');
          }

          const userData: User = {
            id: response.data.user.id,
            email: response.data.user.email,
            full_name: response.data.user.full_name,
            phone: response.data.user.phone,
            role: response.data.user.role,
            avatar: undefined,
            created_at: response.data.user.created_at,
            updated_at: response.data.user.updated_at,
          };

          console.log('[AuthStore] Auth successful, user:', userData);
          set({
            user: userData,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('[AuthStore] CheckAuth failed:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      resendVerification: async (email: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.resendVerification(email);
          
          if (!response.success) {
            throw new Error(response.message);
          }

          set({
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message || 'Gagal mengirim ulang email verifikasi',
          });
          throw error;
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ 
        user: state.user
        // Jangan persist isAuthenticated, biar selalu di-check via token
      }),
    }
  )
);
