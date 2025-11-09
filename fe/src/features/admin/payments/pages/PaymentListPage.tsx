import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Breadcrumbs,
  Link,
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  useTheme,
} from '@mui/material';
import {
  Home as HomeIcon,
  Payment as PaymentIcon,
  Refresh as RefreshIcon,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { adminPaymentApi, Payment, PaymentQueryParams, PaymentStats } from '../services/paymentApi';
import PaymentFilter from '../components/PaymentFilter';
import PaymentTable from '../components/PaymentTable';
import Loading from '@/components/ui/Loading';
import { useUiStore } from '@/store/uiStore';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';

export default function PaymentListPage() {
  const navigate = useNavigate();
  const { showNotification } = useUiStore();
  const { formatPrice } = useCurrencyConversion();
  const theme = useTheme();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentStats, setPaymentStats] = useState<PaymentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PaymentQueryParams>({
    payment_status: '',
    payment_method: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10,
  });
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_items: 0,
    items_per_page: 10,
    has_next_page: false,
    has_prev_page: false,
  });

  const fetchPayments = async (filterParams?: PaymentQueryParams) => {
    try {
      setIsLoading(true);
      setError(null);

      const params = filterParams || filters;
      const response = await adminPaymentApi.getAllPayments({
        page: params.page || 1,
        limit: params.limit || 10,
        payment_status: params.payment_status || undefined,
        payment_method: params.payment_method || undefined,
        startDate: params.startDate || undefined,
        endDate: params.endDate || undefined,
      });

      if (response.success && response.data) {
        setPayments(response.data);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        setError(response.error || 'Gagal memuat data pembayaran');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Gagal memuat data pembayaran');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPaymentStats = async () => {
    try {
      const response = await adminPaymentApi.getPaymentStats();
      if (response.success && response.data) {
        setPaymentStats(response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch payment stats:', error);
    }
  };

  const handleFilterChange = (newFilters: PaymentQueryParams) => {
    setFilters(newFilters);
    fetchPayments(newFilters);
  };

  const handleView = (payment: Payment) => {
    navigate(`/admin/payments/${payment.id}`);
  };

  const handleRefresh = async () => {
    await Promise.all([
      fetchPayments(filters),
      fetchPaymentStats(),
    ]);
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchPayments(filters),
        fetchPaymentStats(),
      ]);
    };
    loadData();
  }, []);

  if (isLoading && payments.length === 0) {
    return <Loading message="Memuat data pembayaran..." />;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 4 }}>
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate('/admin')}
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5,
            color: 'text.secondary',
            textDecoration: 'none',
            '&:hover': {
              color: 'primary.main',
              textDecoration: 'underline'
            }
          }}
        >
          <HomeIcon fontSize="small" />
          Dashboard
        </Link>
        <Typography variant="body2" color="textPrimary" sx={{ fontWeight: 500 }}>
          Pembayaran
          </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <PaymentIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />
            <Typography variant="h4" fontWeight={700} color="text.primary" className="craft-heading">
              Manajemen Pembayaran
          </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 500,
              textTransform: 'none',
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'rgba(150, 130, 219, 0.05)',
                borderColor: 'primary.dark'
              }
            }}
          >
            Refresh Data
          </Button>
        </Box>
        <Typography variant="body1" color="text.secondary" className="craft-body">
          Kelola dan monitor semua transaksi pembayaran
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            backgroundColor: 'error.light',
            color: 'error.dark',
            border: '1px solid',
            borderColor: 'error.main'
          }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={6} md={3}>
          <Card sx={{ 
            borderRadius: 3,
            boxShadow: '0 4px 16px rgba(150, 130, 219, 0.12)',
            border: '1px solid rgba(150, 130, 219, 0.08)',
            height: '100%'
          }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: '50%', 
                backgroundColor: 'rgba(150, 130, 219, 0.1)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1
              }}>
                <TrendingUpIcon sx={{ fontSize: '1.5rem', color: 'primary.main' }} />
              </Box>
              <Typography variant="h6" fontWeight={700} color="text.primary">
                {paymentStats?.totalPayments || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Pembayaran
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} md={3}>
          <Card sx={{ 
            borderRadius: 3,
            boxShadow: '0 4px 16px rgba(150, 130, 219, 0.12)',
            border: '1px solid rgba(150, 130, 219, 0.08)',
            height: '100%'
          }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: '50%', 
                backgroundColor: 'rgba(39, 174, 96, 0.1)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1
              }}>
                <CheckCircleIcon sx={{ fontSize: '1.5rem', color: 'success.main' }} />
              </Box>
              <Typography variant="h6" fontWeight={700} color="text.primary">
                {paymentStats?.paidPayments || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Lunas
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} md={3}>
          <Card sx={{ 
            borderRadius: 3,
            boxShadow: '0 4px 16px rgba(150, 130, 219, 0.12)',
            border: '1px solid rgba(150, 130, 219, 0.08)',
            height: '100%'
          }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: '50%', 
                backgroundColor: 'rgba(243, 156, 18, 0.1)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1
              }}>
                <ScheduleIcon sx={{ fontSize: '1.5rem', color: 'warning.main' }} />
              </Box>
              <Typography variant="h6" fontWeight={700} color="text.primary">
                {paymentStats?.pendingPayments || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={6} md={3}>
          <Card sx={{ 
            borderRadius: 3,
            boxShadow: '0 4px 16px rgba(150, 130, 219, 0.12)',
            border: '1px solid rgba(150, 130, 219, 0.08)',
            height: '100%'
          }}>
            <CardContent sx={{ p: 2, textAlign: 'center' }}>
              <Box sx={{ 
                p: 1.5, 
                borderRadius: '50%', 
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 1
              }}>
                <ErrorIcon sx={{ fontSize: '1.5rem', color: 'error.main' }} />
              </Box>
              <Typography variant="h6" fontWeight={700} color="text.primary">
                {paymentStats?.failedPayments || 0}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Gagal
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Revenue Card */}
      {paymentStats && (
        <Card sx={{ 
          mb: 4,
          borderRadius: 3,
          boxShadow: '0 4px 16px rgba(150, 130, 219, 0.12)',
          border: '1px solid rgba(150, 130, 219, 0.08)',
          background: 'linear-gradient(135deg, rgba(150, 130, 219, 0.1) 0%, rgba(150, 130, 219, 0.05) 100%)'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ 
                p: 2, 
                borderRadius: '50%', 
                backgroundColor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <AttachMoneyIcon sx={{ fontSize: '2rem' }} />
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  Total Revenue
                </Typography>
                <Typography variant="h4" fontWeight={700} color="text.primary">
                  {formatPrice(paymentStats.totalRevenue)}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Payment Filter */}
      <PaymentFilter
        onFilterChange={handleFilterChange}
        loading={isLoading}
        initialFilters={filters}
      />

      {/* Payment Table */}
      <Card sx={{ 
        borderRadius: 3,
        boxShadow: '0 4px 16px rgba(150, 130, 219, 0.12)',
        border: '1px solid rgba(150, 130, 219, 0.08)'
      }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, borderBottom: '1px solid rgba(150, 130, 219, 0.1)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" fontWeight={600} color="text.primary" className="craft-heading">
                  Data Pembayaran
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Daftar semua transaksi pembayaran
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Total: {pagination.total_items} pembayaran
              </Typography>
            </Box>
          </Box>
          
          <Box sx={{ p: 2 }}>
            <PaymentTable
              payments={payments}
              isLoading={isLoading}
              onView={handleView}
            />
          </Box>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', gap: 2, alignItems: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => {
                  const newFilters = { ...filters, page: (pagination.current_page - 1) };
                  setFilters(newFilters);
                  fetchPayments(newFilters);
                }}
                disabled={!pagination.has_prev_page || isLoading}
                size="small"
              >
                Sebelumnya
              </Button>
              <Typography variant="body2" color="text.secondary">
                Halaman {pagination.current_page} dari {pagination.total_pages}
              </Typography>
              <Button
                variant="outlined"
                onClick={() => {
                  const newFilters = { ...filters, page: (pagination.current_page + 1) };
                  setFilters(newFilters);
                  fetchPayments(newFilters);
                }}
                disabled={!pagination.has_next_page || isLoading}
                size="small"
              >
                Selanjutnya
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
