import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import Loading from '@/components/ui/Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  requireUser?: boolean;
}

export default function ProtectedRoute({
  children,
  requireAuth = false,
  requireAdmin = false,
  requireUser = false,
}: ProtectedRouteProps) {
  const { user, isAuthenticated, checkAuth, isLoading } = useAuthStore();
  const location = useLocation();
  const hasToken = !!localStorage.getItem('access_token');

  useEffect(() => {
    // Always check auth if token exists but not authenticated
    console.log('[ProtectedRoute] Effect:', { hasToken, isAuthenticated, isLoading });
    if (hasToken && !isAuthenticated && !isLoading) {
      console.log('[ProtectedRoute] Calling checkAuth...');
      checkAuth();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasToken, isAuthenticated, isLoading]);

  // Show loading while checking authentication OR if token exists but not yet verified
  if (isLoading || (hasToken && !isAuthenticated)) {
    console.log('[ProtectedRoute] Showing loading...');
    return <Loading fullScreen message="Memverifikasi akses..." />;
  }

  // If no token and requires auth, redirect to login immediately
  if (!hasToken && (requireAuth || requireAdmin || requireUser)) {
    console.log('[ProtectedRoute] No token, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to login if authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    console.log('[ProtectedRoute] requireAuth but not authenticated');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect to login if admin access is required but user is not admin
  if (requireAdmin) {
    if (!isAuthenticated) {
      console.log('[ProtectedRoute] requireAdmin but not authenticated');
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
    if (user?.role !== 'admin') {
      console.log('[ProtectedRoute] User is not admin');
      // User is authenticated but not admin, redirect to home
      return <Navigate to="/" replace />;
    }
  }

  // Redirect to login if user access is required but user is not authenticated
  if (requireUser && !isAuthenticated) {
    console.log('[ProtectedRoute] requireUser but not authenticated');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If user is authenticated and tries to access login/register, redirect based on role
  if (isAuthenticated && (location.pathname === '/login' || location.pathname === '/register')) {
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
