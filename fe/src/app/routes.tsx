import { createBrowserRouter } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Layouts
import CustomerLayout from '@/components/layout/customer/CustomerLayout';
import AdminLayout from '@/components/layout/admin/AdminLayout';

// Loading component
import Loading from '@/components/ui/Loading';

// Protected Route component
import ProtectedRoute from '@/components/common/ProtectedRoute';

// Lazy load pages
const HomePage = lazy(() => import('@/features/home/pages/HomePage'));
const ContactPage = lazy(() => import('@/features/home/pages/ContactPage'));
const AboutPage = lazy(() => import('@/features/home/pages/AboutPage'));
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/features/auth/pages/ForgotPasswordPage'));

const ProductListPage = lazy(() => import('@/features/products/pages/ProductListPage'));
const ProductDetailPage = lazy(() => import('@/features/products/pages/ProductDetailPage'));

const CategoryPage = lazy(() => import('@/features/categories/pages/CategoryPage'));

const CartPage = lazy(() => import('@/features/cart/pages/CartPage'));
const CheckoutPage = lazy(() => import('@/features/checkout/pages/CheckoutPage'));

const OrdersPage = lazy(() => import('@/features/orders/pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('@/features/orders/pages/OrderDetailPage'));

const PaymentPage = lazy(() => import('@/features/payments/pages/PaymentPage'));
const PaymentSuccessPage = lazy(() => import('@/features/payments/pages/PaymentSuccessPage'));
const PaymentCancelPage = lazy(() => import('@/features/payments/pages/PaymentCancelPage'));

const ProfilePage = lazy(() => import('@/features/profile/pages/ProfilePage'));
const AccountSettingsPage = lazy(() => import('@/features/profile/pages/AccountSettingsPage'));


// Admin pages
const AdminDashboardPage = lazy(() => import('@/features/admin/dashboard/pages/DashboardPage'));
const AdminProductListPage = lazy(() => import('@/features/admin/products/pages/ProductListPage'));
const AdminProductDetailPage = lazy(() => import('@/features/admin/products/pages/ProductDetailPage'));
const AdminCreateProductPage = lazy(() => import('@/features/admin/products/pages/CreateProductPage'));
const AdminEditProductPage = lazy(() => import('@/features/admin/products/pages/EditProductPage'));
const AdminDeletedProductsPage = lazy(() => import('@/features/admin/products/pages/DeletedProductsPage'));
const AdminProductVariantsPage = lazy(() => import('@/features/admin/products/pages/ProductVariantsPage'));
const AdminProductImagesPage = lazy(() => import('@/features/admin/products/pages/ProductImagesPage'));
const AdminCategoryListPage = lazy(() => import('@/features/admin/categories/pages/CategoryListPage'));
const AdminCategoryDetailPage = lazy(() => import('@/features/admin/categories/pages/CategoryDetailPage'));
const AdminCreateCategoryPage = lazy(() => import('@/features/admin/categories/pages/CreateCategoryPage'));
const AdminEditCategoryPage = lazy(() => import('@/features/admin/categories/pages/EditCategoryPage'));
const AdminDeletedCategoriesPage = lazy(() => import('@/features/admin/categories/pages/DeletedCategoriesPage'));
const AdminOrderManagementPage = lazy(() => import('@/features/admin/orders/pages/OrderManagementPage'));
const AdminOrderDetailPage = lazy(() => import('@/features/admin/orders/pages/OrderDetailPage'));
const AdminShippingManagementPage = lazy(() => import('@/features/admin/shipping/pages/ShippingManagementPage'));
const AdminPaymentListPage = lazy(() => import('@/features/admin/payments/pages/PaymentListPage'));
const AdminUserListPage = lazy(() => import('@/features/admin/users/pages/UserListPage'));
const AdminUserDetailPage = lazy(() => import('@/features/admin/users/pages/UserDetailPage'));

// Error pages
const NotFoundPage = lazy(() => import('@/components/common/NotFoundPage'));

// Wrapper component untuk Suspense
const SuspenseWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<Loading />}>
    {children}
  </Suspense>
);

export const router = createBrowserRouter([
  // Public routes
  {
    path: '/',
    element: <CustomerLayout />,
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <HomePage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'login',
        element: (
          <SuspenseWrapper>
            <LoginPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'register',
        element: (
          <SuspenseWrapper>
            <RegisterPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'forgot-password',
        element: (
          <SuspenseWrapper>
            <ForgotPasswordPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'products',
        element: (
          <SuspenseWrapper>
            <ProductListPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'products/:id',
        element: (
          <SuspenseWrapper>
            <ProductDetailPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'categories',
        element: (
          <SuspenseWrapper>
            <CategoryPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'categories/:id',
        element: (
          <SuspenseWrapper>
            <ProductListPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'contact',
        element: (
          <SuspenseWrapper>
            <ContactPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'about',
        element: (
          <SuspenseWrapper>
            <AboutPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },

  // Protected user routes
  {
    path: '/',
    element: <CustomerLayout />,
    children: [
      {
        path: 'cart',
        element: (
          <ProtectedRoute requireUser>
            <SuspenseWrapper>
              <CartPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: 'checkout',
        element: (
          <ProtectedRoute requireUser>
            <SuspenseWrapper>
              <CheckoutPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders',
        element: (
          <ProtectedRoute requireUser>
            <SuspenseWrapper>
              <OrdersPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders/:id',
        element: (
          <ProtectedRoute requireUser>
            <SuspenseWrapper>
              <OrderDetailPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: 'payment/:orderId',
        element: (
          <ProtectedRoute requireUser>
            <SuspenseWrapper>
              <PaymentPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: 'payment/success',
        element: (
          <SuspenseWrapper>
            <PaymentSuccessPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'payment/cancel',
        element: (
          <SuspenseWrapper>
            <PaymentCancelPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'profile',
        element: (
          <ProtectedRoute requireUser>
            <SuspenseWrapper>
              <ProfilePage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile/settings',
        element: (
          <ProtectedRoute requireUser>
            <SuspenseWrapper>
              <AccountSettingsPage />
            </SuspenseWrapper>
          </ProtectedRoute>
        ),
      },
    ],
  },

  // Admin routes
  {
    path: '/admin',
    element: (
      <ProtectedRoute requireAdmin>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: (
          <SuspenseWrapper>
            <AdminDashboardPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'products',
        element: (
          <SuspenseWrapper>
            <AdminProductListPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'products/:id',
        element: (
          <SuspenseWrapper>
            <AdminProductDetailPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'products/create',
        element: (
          <SuspenseWrapper>
            <AdminCreateProductPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'products/:id/edit',
        element: (
          <SuspenseWrapper>
            <AdminEditProductPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'products/deleted',
        element: (
          <SuspenseWrapper>
            <AdminDeletedProductsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'products/:id/variants',
        element: (
          <SuspenseWrapper>
            <AdminProductVariantsPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'products/:id/images',
        element: (
          <SuspenseWrapper>
            <AdminProductImagesPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'categories',
        element: (
          <SuspenseWrapper>
            <AdminCategoryListPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'categories/:id',
        element: (
          <SuspenseWrapper>
            <AdminCategoryDetailPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'categories/create',
        element: (
          <SuspenseWrapper>
            <AdminCreateCategoryPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'categories/:id/edit',
        element: (
          <SuspenseWrapper>
            <AdminEditCategoryPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'categories/deleted',
        element: (
          <SuspenseWrapper>
            <AdminDeletedCategoriesPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'orders',
        element: (
          <SuspenseWrapper>
            <AdminOrderManagementPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'orders/:id',
        element: (
          <SuspenseWrapper>
            <AdminOrderDetailPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'shipping',
        element: (
          <SuspenseWrapper>
            <AdminShippingManagementPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'payments',
        element: (
          <SuspenseWrapper>
            <AdminPaymentListPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'users',
        element: (
          <SuspenseWrapper>
            <AdminUserListPage />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'users/:id',
        element: (
          <SuspenseWrapper>
            <AdminUserDetailPage />
          </SuspenseWrapper>
        ),
      },
    ],
  },

  // 404 page
  {
    path: '*',
    element: (
      <SuspenseWrapper>
        <NotFoundPage />
      </SuspenseWrapper>
    ),
  },
]);
