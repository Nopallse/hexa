import { create } from 'zustand';
import { Notification } from '@/types/global';

interface UiState {
  // Sidebar state (admin)
  sidebarOpen: boolean;
  
  // Cart drawer state (customer)
  cartDrawerOpen: boolean;
  
  // Notification state
  notification: Notification | null;
  
  // Loading state
  loading: boolean;
  
  // Theme mode
  darkMode: boolean;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  
  toggleCartDrawer: () => void;
  setCartDrawerOpen: (open: boolean) => void;
  
  showNotification: (notification: Omit<Notification, 'id' | 'open'>) => void;
  hideNotification: () => void;
  
  setLoading: (loading: boolean) => void;
  
  toggleDarkMode: () => void;
  setDarkMode: (darkMode: boolean) => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  sidebarOpen: true,
  cartDrawerOpen: false,
  notification: null,
  loading: false,
  darkMode: false,

  toggleSidebar: () => {
    set((state) => ({ sidebarOpen: !state.sidebarOpen }));
  },

  setSidebarOpen: (open: boolean) => {
    set({ sidebarOpen: open });
  },

  toggleCartDrawer: () => {
    set((state) => ({ cartDrawerOpen: !state.cartDrawerOpen }));
  },

  setCartDrawerOpen: (open: boolean) => {
    set({ cartDrawerOpen: open });
  },

  showNotification: (notificationData) => {
    const notification: Notification = {
      id: Date.now().toString(),
      open: true,
      autoHideDuration: 5000,
      ...notificationData,
    };
    
    set({ notification });

    // Auto hide notification
    if (notification.autoHideDuration && notification.autoHideDuration > 0) {
      setTimeout(() => {
        const currentNotification = get().notification;
        if (currentNotification?.id === notification.id) {
          set({ notification: { ...currentNotification, open: false } });
        }
      }, notification.autoHideDuration);
    }
  },

  hideNotification: () => {
    const currentNotification = get().notification;
    if (currentNotification) {
      set({ notification: { ...currentNotification, open: false } });
    }
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  toggleDarkMode: () => {
    set((state) => ({ darkMode: !state.darkMode }));
  },

  setDarkMode: (darkMode: boolean) => {
    set({ darkMode });
  },
}));
