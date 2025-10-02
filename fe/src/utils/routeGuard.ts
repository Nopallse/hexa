import { User } from '@/types/global';

export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('access_token');
  return !!token;
  // Token expiry is now handled by backend and auto-refresh in interceptors
};

export const isAdmin = (user: User | null): boolean => {
  return user?.role === 'admin';
};

export const isUser = (user: User | null): boolean => {
  return user?.role === 'user';
};

export const canAccessAdminRoutes = (user: User | null): boolean => {
  return isAuthenticated() && isAdmin(user);
};

export const canAccessUserRoutes = (user: User | null): boolean => {
  return isAuthenticated() && (isUser(user) || isAdmin(user));
};

export const getRedirectPath = (user: User | null): string => {
  if (!isAuthenticated()) {
    return '/login';
  }

  if (isAdmin(user)) {
    return '/admin';
  }

  return '/';
};
