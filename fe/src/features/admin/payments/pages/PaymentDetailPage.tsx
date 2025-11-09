import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Chip,
  Divider,
  Paper,
  Stack,
  useTheme,
  Avatar,
} from '@mui/material';
import {
  Home as HomeIcon,
  Payment as PaymentIcon,
  ArrowBack as ArrowBackIcon,
  Receipt as ReceiptIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Inventory as InventoryIcon,
} from '@mui/icons-material';
import { adminPaymentApi } from '../services/paymentApi';
import Loading from '@/components/ui/Loading';
import { useUiStore } from '@/store/uiStore';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';
import { getImageUrl } from '@/utils/image';

const getPaymentStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'paid':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
    case 'cancelled':
      return 'error';
    case 'refunded':
      return 'info';
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
    case 'refunded':
      return 'Dikembalikan';
    case 'cancelled':
      return 'Dibatalkan';
    default:
      return status || 'Unknown';
  }
};

const getPaymentMethodText = (method: string) => {
  switch (method?.toLowerCase()) {
    case 'midtrans':
      return 'Midtrans';
    case 'paypal':
      return 'PayPal';
    case 'transfer':
      return 'Transfer';
    case 'e-wallet':
      return 'E-Wallet';
    case 'cod':
      return 'COD';
    default:
      return method || 'Unknown';
  }
};

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

export default function PaymentDetailPage() {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useUiStore();
  const { formatPrice } = useCurrencyConversion();

  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (date: Date | string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const fetchPayment = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await adminPaymentApi.getPaymentById(id);

      if (response.success && response.data) {
        setPayment(response.data);
      } else {
        setError(response.error || 'Gagal memuat data pembayaran');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal memuat data pembayaran');
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchPayment();
  }, [id]);

  if (loading) {
    return <Loading message="Memuat data pembayaran..." />;
  }

  if (error && !payment) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/payments')}>
          Kembali ke Daftar Pembayaran
        </Button>
      </Container>
    );
  }

  if (!payment) {
    return null;
  }

  return (
    <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh', pb: 4 }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/admin')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' },
            }}
          >
            <HomeIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
            Dashboard
          </Link>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/admin/payments')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' },
            }}
          >
            <PaymentIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
            Pembayaran
          </Link>
          <Typography variant="body2" color="text.primary" fontWeight={500}>
            #{payment.id.slice(-8).toUpperCase()}
          </Typography>
        </Breadcrumbs>

        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/payments')}
          sx={{ 
            mb: 3,
            borderRadius: 2,
            fontWeight: 500,
            color: 'text.secondary',
            '&:hover': { 
              color: 'primary.main',
              backgroundColor: 'action.hover',
            },
          }}
        >
          Kembali ke Daftar Pembayaran
        </Button>

        {/* Payment Header - Redesigned */}
        <Paper 
          elevation={0}
          sx={{ 
            mb: 3, 
            borderRadius: 3, 
            overflow: 'hidden',
            background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.light}08 100%)`,
            border: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box sx={{ p: 4, pb: 3 }}>
            <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1.5 }}>
              <Typography variant="h4" fontWeight={700} sx={{ color: 'text.primary' }}>
                Payment #{payment.id.slice(-8).toUpperCase()}
              </Typography>
              <Chip
                label={getPaymentStatusText(payment.payment_status)}
                color={getPaymentStatusColor(payment.payment_status) as any}
                size="small"
                sx={{
                  height: 28,
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Dibuat pada {formatDate(payment.created_at)}
            </Typography>
          </Box>
        </Paper>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Left Column - Main Content */}
          <Grid item xs={12} lg={8}>
            <Stack spacing={3}>
              {/* Payment Information */}
              <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                    <PaymentIcon color="primary" />
                    <Typography variant="h6" fontWeight={700}>
                      Informasi Pembayaran
                    </Typography>
                  </Stack>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                          Status
                        </Typography>
                        <Chip
                          label={getPaymentStatusText(payment.payment_status)}
                          color={getPaymentStatusColor(payment.payment_status) as any}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                          Metode Pembayaran
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {getPaymentMethodText(payment.payment_method)}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper elevation={0} sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
                        <Typography variant="caption" color="primary.dark" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block', fontWeight: 600 }}>
                          Jumlah
                        </Typography>
                        <Typography variant="h6" fontWeight={700} color="primary.main">
                          {formatPrice(parseFloat(payment.amount || 0))}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                          Currency
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {payment.currency_code || 'IDR'}
                        </Typography>
                      </Paper>
                    </Grid>
                    {payment.payment_reference && (
                      <Grid item xs={12} sm={6}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                            Payment Reference
                          </Typography>
                          <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                            {payment.payment_reference}
                          </Typography>
                        </Paper>
                      </Grid>
                    )}
                    {payment.payment_date && (
                      <Grid item xs={12} sm={6}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                            Tanggal Pembayaran
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {formatDate(payment.payment_date)}
                          </Typography>
                        </Paper>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>

              {/* Order Information */}
              {payment.order && (
                <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                      <ReceiptIcon color="primary" />
                      <Typography variant="h6" fontWeight={700}>
                        Informasi Order
                      </Typography>
                    </Stack>

                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={12} sm={6}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                            Order ID
                          </Typography>
                          <Typography variant="body1" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
                            {payment.order.id.slice(-8).toUpperCase()}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                            Status Order
                          </Typography>
                          <Chip
                            label={getOrderStatusText(payment.order.status)}
                            color={getOrderStatusColor(payment.order.status) as any}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                            Total Amount
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {formatPrice(parseFloat(payment.order.total_amount || 0))}
                          </Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                            Shipping Cost
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {formatPrice(parseFloat(payment.order.shipping_cost || 0))}
                          </Typography>
                        </Paper>
                      </Grid>
                    </Grid>

                    {/* Order Items */}
                    {payment.order.order_items && payment.order.order_items.length > 0 && (
                      <Box>
                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                          <InventoryIcon color="primary" />
                          <Typography variant="h6" fontWeight={700}>
                            Item Pesanan ({payment.order.order_items.length})
                          </Typography>
                        </Stack>
                        <Stack spacing={2}>
                          {payment.order.order_items.map((item: any) => {
                            const primaryImage = item.product_variant?.product?.product_images?.[0]?.image_name;
                            
                            return (
                              <Paper
                                key={item.id}
                                elevation={0}
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 2,
                                  p: 2.5,
                                  borderRadius: 2,
                                  bgcolor: 'grey.50',
                                  border: `1px solid ${theme.palette.divider}`,
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    bgcolor: 'grey.100',
                                    transform: 'translateY(-2px)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                  },
                                }}
                              >
                                <Avatar
                                  src={primaryImage ? getImageUrl(primaryImage) : `https://placehold.co/80x80/9682DB/FFFFFF/png?text=${encodeURIComponent((item.product_variant?.product?.name || 'N/A').substring(0, 10))}`}
                                  alt={item.product_variant?.product?.name || 'N/A'}
                                  sx={{
                                    width: 90,
                                    height: 90,
                                    borderRadius: 2,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                                  }}
                                  variant="rounded"
                                />

                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                  <Typography 
                                    variant="subtitle1" 
                                    fontWeight={600} 
                                    sx={{ 
                                      mb: 1, 
                                      color: 'text.primary',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      lineHeight: 1.3,
                                    }}
                                    title={item.product_variant?.product?.name || 'N/A'}
                                  >
                                    {item.product_variant?.product?.name || 'N/A'}
                                  </Typography>
                                  
                                  {item.product_variant?.variant_options && item.product_variant.variant_options.length > 0 && (
                                    <Stack direction="row" spacing={0.5} sx={{ mb: 1, flexWrap: 'wrap' }}>
                                      {item.product_variant.variant_options.map((option: any, index: number) => (
                                        <Chip
                                          key={index}
                                          label={option.option_value}
                                          size="small"
                                          variant="outlined"
                                          sx={{ 
                                            fontSize: '0.7rem',
                                            height: 22,
                                            borderColor: 'primary.main',
                                            color: 'primary.main',
                                          }}
                                        />
                                      ))}
                                    </Stack>
                                  )}

                                  <Typography variant="body2" color="text.secondary">
                                    Qty: {item.quantity} × {formatPrice(parseFloat(item.price || 0))}
                                  </Typography>
                                </Box>

                                <Box sx={{ textAlign: 'right', minWidth: 120 }}>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                                    Total
                                  </Typography>
                                  <Typography variant="h6" color="primary.main" fontWeight={700}>
                                    {formatPrice(parseFloat(item.price || 0) * item.quantity)}
                                  </Typography>
                                </Box>
                              </Paper>
                            );
                          })}
                        </Stack>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              )}
            </Stack>
          </Grid>

          {/* Right Column - Summary */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              {/* Customer Info */}
              {payment.order?.user && (
                <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                      <PersonIcon color="primary" />
                      <Typography variant="h6" fontWeight={700}>
                        Informasi Pelanggan
                      </Typography>
                    </Stack>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                          Nama
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {payment.order.user.full_name || 'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                          Email
                        </Typography>
                        <Typography variant="body1">
                          {payment.order.user.email || 'N/A'}
                        </Typography>
                      </Grid>
                      {payment.order.user.phone && (
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                            Telepon
                          </Typography>
                          <Typography variant="body1">
                            {payment.order.user.phone}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Address Info */}
              {payment.order?.address && (
                <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                  <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                      <LocationIcon color="primary" />
                      <Typography variant="subtitle1" fontWeight={700}>
                        Alamat Pengiriman
                      </Typography>
                    </Stack>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      <Typography variant="body1" fontWeight={600} sx={{ mb: 0.5 }}>
                        {payment.order.address.recipient_name || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {payment.order.address.address_line || 'N/A'}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {payment.order.address.city || 'N/A'}, {payment.order.address.province || 'N/A'} {payment.order.address.postal_code || 'N/A'}
                      </Typography>
                    </Paper>
                  </CardContent>
                </Card>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

