import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Paper,
  Alert,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as AttachMoneyIcon,
  People as PeopleIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingUpIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  LocalShipping as ShippingIcon,
  Category as CategoryIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { dashboardApi, DashboardStats } from '../services/dashboardApi';
import Loading from '@/components/ui/Loading';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';

const getOrderStatusColor = (status: string) => {
  switch (status) {
    case 'belum_bayar':
      return 'warning';
    case 'dikemas':
      return 'primary';
    case 'dikirim':
      return 'info';
    case 'diterima':
      return 'success';
    case 'dibatalkan':
      return 'error';
    default:
      return 'default';
  }
};

const getOrderStatusText = (status: string) => {
  switch (status) {
    case 'belum_bayar':
      return 'Belum Bayar';
    case 'dikemas':
      return 'Dikemas';
    case 'dikirim':
      return 'Dikirim';
    case 'diterima':
      return 'Diterima';
    case 'dibatalkan':
      return 'Dibatalkan';
    default:
      return status;
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'paid':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
      return 'error';
    default:
      return 'default';
  }
};

const getPaymentStatusText = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'paid':
      return 'Lunas';
    case 'pending':
      return 'Pending';
    case 'failed':
      return 'Gagal';
    default:
      return status;
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const { formatPrice } = useCurrencyConversion();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await dashboardApi.getDashboardStats();

      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.error || 'Gagal memuat data dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal memuat data dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return <Loading message="Memuat data dashboard..." />;
  }

  if (error && !stats) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button startIcon={<RefreshIcon />} onClick={fetchDashboardStats}>
          Coba Lagi
        </Button>
      </Container>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="text.primary" gutterBottom>
            Dashboard Admin
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Ringkasan statistik dan informasi penting
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchDashboardStats}
          sx={{ borderRadius: 2, px: 3, py: 1 }}
        >
          Refresh
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Main Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Total Orders */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderRadius: 3,
            boxShadow: '0 4px 16px rgba(150, 130, 219, 0.12)',
            border: '1px solid rgba(150, 130, 219, 0.08)',
            height: '100%',
            background: 'linear-gradient(135deg, rgba(150, 130, 219, 0.1) 0%, rgba(150, 130, 219, 0.05) 100%)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="text.primary">
                    {stats.orders.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Total Pesanan
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: '50%', 
                  backgroundColor: 'primary.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <ShoppingCartIcon sx={{ fontSize: '2rem' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Revenue */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderRadius: 3,
            boxShadow: '0 4px 16px rgba(39, 174, 96, 0.12)',
            border: '1px solid rgba(39, 174, 96, 0.08)',
            height: '100%',
            background: 'linear-gradient(135deg, rgba(39, 174, 96, 0.1) 0%, rgba(39, 174, 96, 0.05) 100%)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="text.primary">
                    {formatPrice(stats.payments.revenue)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Total Pendapatan
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: '50%', 
                  backgroundColor: 'success.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AttachMoneyIcon sx={{ fontSize: '2rem' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Users */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderRadius: 3,
            boxShadow: '0 4px 16px rgba(243, 156, 18, 0.12)',
            border: '1px solid rgba(243, 156, 18, 0.08)',
            height: '100%',
            background: 'linear-gradient(135deg, rgba(243, 156, 18, 0.1) 0%, rgba(243, 156, 18, 0.05) 100%)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="text.primary">
                    {stats.users.total}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Total Pengguna
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: '50%', 
                  backgroundColor: 'warning.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PeopleIcon sx={{ fontSize: '2rem' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Products */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ 
            borderRadius: 3,
            boxShadow: '0 4px 16px rgba(52, 152, 219, 0.12)',
            border: '1px solid rgba(52, 152, 219, 0.08)',
            height: '100%',
            background: 'linear-gradient(135deg, rgba(52, 152, 219, 0.1) 0%, rgba(52, 152, 219, 0.05) 100%)'
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" fontWeight={700} color="text.primary">
                    {stats.products.active}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Produk Aktif
                  </Typography>
                </Box>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: '50%', 
                  backgroundColor: 'info.main',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <InventoryIcon sx={{ fontSize: '2rem' }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Secondary Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Order Status Breakdown */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 16px rgba(150, 130, 219, 0.12)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <ShoppingCartIcon sx={{ fontSize: '1.5rem', color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={600}>
                  Status Pesanan
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, backgroundColor: 'rgba(243, 156, 18, 0.1)' }}>
                    <Typography variant="h5" fontWeight={700} color="warning.main">
                      {stats.orders.byStatus.belum_bayar}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Belum Bayar
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, backgroundColor: 'rgba(150, 130, 219, 0.1)' }}>
                    <Typography variant="h5" fontWeight={700} color="primary.main">
                      {stats.orders.byStatus.dikemas}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Dikemas
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, backgroundColor: 'rgba(52, 152, 219, 0.1)' }}>
                    <Typography variant="h5" fontWeight={700} color="info.main">
                      {stats.orders.byStatus.dikirim}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Dikirim
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, backgroundColor: 'rgba(39, 174, 96, 0.1)' }}>
                    <Typography variant="h5" fontWeight={700} color="success.main">
                      {stats.orders.byStatus.diterima}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Diterima
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Payment & Shipping Stats */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 16px rgba(150, 130, 219, 0.12)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <PaymentIcon sx={{ fontSize: '1.5rem', color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={600}>
                  Pembayaran & Pengiriman
                </Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, backgroundColor: 'rgba(39, 174, 96, 0.1)' }}>
                    <Typography variant="h5" fontWeight={700} color="success.main">
                      {stats.payments.paid}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Lunas
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, backgroundColor: 'rgba(243, 156, 18, 0.1)' }}>
                    <Typography variant="h5" fontWeight={700} color="warning.main">
                      {stats.payments.pending}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Pending
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, backgroundColor: 'rgba(52, 152, 219, 0.1)' }}>
                    <Typography variant="h5" fontWeight={700} color="info.main">
                      {stats.shipping.inTransit}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Dalam Perjalanan
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2, borderRadius: 2, backgroundColor: 'rgba(39, 174, 96, 0.1)' }}>
                    <Typography variant="h5" fontWeight={700} color="success.main">
                      {stats.shipping.delivered}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Terkirim
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Orders & Payments */}
      <Grid container spacing={3}>
        {/* Recent Orders */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 16px rgba(150, 130, 219, 0.12)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <ShoppingCartIcon sx={{ fontSize: '1.5rem', color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight={600}>
                    Pesanan Terbaru
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={() => navigate('/admin/orders')}
                  sx={{ textTransform: 'none' }}
                >
                  Lihat Semua
                </Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Customer</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="right">Aksi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.orders.recentOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography variant="body2" color="text.secondary">
                            Tidak ada pesanan
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      stats.orders.recentOrders.slice(0, 5).map((order) => (
                        <TableRow key={order.id} hover>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {order.user?.full_name || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(order.created_at)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getOrderStatusText(order.status)}
                              color={getOrderStatusColor(order.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={500}>
                              {formatPrice(parseFloat(String(order.total_amount)))}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Lihat Detail">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/admin/orders/${order.id}`)}
                              >
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Payments */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: '0 4px 16px rgba(150, 130, 219, 0.12)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <PaymentIcon sx={{ fontSize: '1.5rem', color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight={600}>
                    Pembayaran Terbaru
                  </Typography>
                </Box>
                <Button
                  size="small"
                  onClick={() => navigate('/admin/payments')}
                  sx={{ textTransform: 'none' }}
                >
                  Lihat Semua
                </Button>
              </Box>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Customer</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Jumlah</TableCell>
                      <TableCell align="right">Aksi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.payments.recentPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          <Typography variant="body2" color="text.secondary">
                            Tidak ada pembayaran
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      stats.payments.recentPayments.slice(0, 5).map((payment) => (
                        <TableRow key={payment.id} hover>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight={500}>
                                {payment.order?.user?.full_name || 'N/A'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {payment.payment_date ? formatDate(payment.payment_date) : 'N/A'}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={getPaymentStatusText(payment.payment_status)}
                              color={getPaymentStatusColor(payment.payment_status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={500}>
                              {formatPrice(parseFloat(String(payment.amount)))}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Tooltip title="Lihat Detail">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/admin/payments/${payment.id}`)}
                              >
                                <ViewIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
