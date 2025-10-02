import axiosInstance from './axiosInstance';
import { ApiError } from '@/types';

// Request interceptor untuk menambahkan JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor untuk handle errors dan refresh token
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle token expired, coba refresh token
    if (error.response?.status === 403 && 
        error.response?.data?.error === 'Token expired' && 
        !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axiosInstance.post('/auth/refresh', {
            refreshToken: refreshToken,
          });

          const { data } = response.data;
          localStorage.setItem('access_token', data.accessToken);

          // Retry original request dengan token baru
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh token gagal, redirect ke login
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // Handle error response
    const apiError: ApiError = {
      success: false,
      message: error.response?.data?.error || error.response?.data?.message || 'Terjadi kesalahan pada server',
      errors: error.response?.data?.errors,
      statusCode: error.response?.status,
    };

    // Redirect ke login jika unauthorized dan bukan:
    // - refresh request
    // - /auth/me (di-handle oleh checkAuth)
    // - /auth/login (biar form login yang handle error)
    // - /auth/register (biar form register yang handle error)
    if ((error.response?.status === 401 || error.response?.status === 403) && 
        !originalRequest.url?.includes('/auth/refresh') &&
        !originalRequest.url?.includes('/auth/me') &&
        !originalRequest.url?.includes('/auth/login') &&
        !originalRequest.url?.includes('/auth/register') &&
        !originalRequest._retry) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
    }

    return Promise.reject(apiError);
  }
);

export default axiosInstance;
