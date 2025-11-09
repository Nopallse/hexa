import {
  Container,
  Typography,
  Box,
  Stack,
  Alert,
  Skeleton,
  useTheme,
  Link,
  Tabs,
  Tab,
  Pagination,
} from '@mui/material';
import {
  Home,
  ShoppingBag,
  Receipt,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Order, OrderQueryParams } from '../types';
import { orderApi } from '../services/orderApi';
import { useOrderStore } from '../store/orderStore';
import OrderCard from '../components/OrderCard';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';

export default function OrderListPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { loading: currencyLoading, error: currencyError } = useCurrencyConversion();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const { setOrders: setStoreOrders } = useOrderStore();

  const statusTabs = [
    { label: 'Semua', value: '' },
    { label: 'Belum Bayar', value: 'belum_bayar' },
    { label: 'Dikemas', value: 'dikemas' },
    { label: 'Dikirim', value: 'dikirim' },
    { label: 'Diterima', value: 'diterima' },
    { label: 'Dibatalkan', value: 'dibatalkan' },
  ];

  const fetchOrders = async (params: OrderQueryParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = {
        page: pagination.page,
        limit: pagination.limit,
        ...params,
      };

      const response = await orderApi.getUserOrders(queryParams);

      if (response.success) {
        setOrders(response.data);
        setStoreOrders(response.data);
        setPagination(response.pagination);
      } else {
        setError('Gagal memuat pesanan');
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.response?.data?.error || 'Gagal memuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    const status = statusTabs[newValue].value;
    fetchOrders({ status });
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    const status = statusTabs[tabValue].value;
    fetchOrders({ page, status });
  };

  const handleOrderView = (order: Order) => {
    navigate(`/orders/${order.id}`);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Loading skeleton
  const renderSkeleton = () => (
    <Stack spacing={2}>
      {[...Array(3)].map((_, index) => (
        <Skeleton key={index} variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
      ))}
    </Stack>
  );

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Breadcrumbs */}
        

        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
            Daftar Pesanan
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Kelola dan lacak pesanan Anda
          </Typography>
        </Box>

        {/* Currency Loading State */}
        {currencyLoading && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Loading exchange rates...
          </Alert>
        )}

        {/* Currency Error State */}
        {currencyError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Failed to load exchange rates. Prices will be displayed in default currency.
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Status Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            {statusTabs.map((tab, index) => (
              <Tab key={index} label={tab.label} />
            ))}
          </Tabs>
        </Box>

        {/* Orders List */}
        {loading ? (
          renderSkeleton()
        ) : orders.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 4,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #faf8ff 0%, #f0f4ff 100%)',
              border: `1px solid ${theme.palette.primary.light}20`,
            }}
          >
            <Receipt sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" fontWeight={600} sx={{ mb: 1 }}>
              Belum Ada Pesanan
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Mulai berbelanja untuk melihat pesanan Anda di sini
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link
                component="button"
                variant="button"
                onClick={() => navigate('/products')}
                sx={{
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  backgroundColor: 'primary.main',
                  color: 'white',
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                }}
              >
                Mulai Berbelanja
              </Link>
            </Box>
          </Box>
        ) : (
          <Stack spacing={3}>
            {orders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onView={handleOrderView}
              />
            ))}
          </Stack>
        )}

        {/* Pagination */}
        {!loading && !error && orders.length > 0 && pagination.pages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <Pagination
              count={pagination.pages}
              page={pagination.page}
              onChange={handlePageChange}
              color="primary"
              size="large"
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: 2,
                  fontWeight: 600,
                },
              }}
            />
          </Box>
        )}
      </Container>
    </Box>
  );
}
