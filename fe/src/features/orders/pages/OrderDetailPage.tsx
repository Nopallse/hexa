import {
  Container,
  Typography,
  Box,
  Stack,
  Alert,
  Skeleton,
  useTheme,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  Chip,
  Button,
  Avatar,
  Divider,
  Grid,
} from '@mui/material';
import {
  Home,
  ShoppingBag,
  Receipt,
  ArrowBack,
  Cancel as CancelIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Order } from '../types';
import { orderApi } from '../services/orderApi';
import { useOrderStore } from '../store/orderStore';

export default function OrderDetailPage() {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [cancelling, setCancelling] = useState(false);

  const { setCurrentOrder } = useOrderStore();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Menunggu Konfirmasi';
      case 'confirmed':
        return 'Dikonfirmasi';
      case 'shipped':
        return 'Dikirim';
      case 'delivered':
        return 'Selesai';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'unpaid':
        return 'error';
      case 'paid':
        return 'success';
      case 'failed':
        return 'error';
      case 'refunded':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'unpaid':
        return 'Belum Dibayar';
      case 'paid':
        return 'Sudah Dibayar';
      case 'failed':
        return 'Gagal Bayar';
      case 'refunded':
        return 'Dikembalikan';
      default:
        return status;
    }
  };

  const fetchOrder = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await orderApi.getOrderById(id);

      if (response.success) {
        setOrder(response.data);
        setCurrentOrder(response.data);
      } else {
        setError('Pesanan tidak ditemukan');
      }
    } catch (err: any) {
      console.error('Error fetching order:', err);
      setError(err.response?.data?.error || 'Gagal memuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!order || !window.confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) {
      return;
    }

    try {
      setCancelling(true);
      const response = await orderApi.cancelOrder(order.id);

      if (response.success) {
        await fetchOrder();
      }
    } catch (err: any) {
      console.error('Error cancelling order:', err);
      setError(err.response?.data?.error || 'Gagal membatalkan pesanan');
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
        </Container>
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto' }}>
            {error || 'Pesanan tidak ditemukan'}
          </Alert>
        </Container>
      </Box>
    );
  }

  const canCancel = order.status === 'pending';

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' },
            }}
          >
            <Home sx={{ mr: 0.5, fontSize: '1rem' }} />
            Beranda
          </Link>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/orders')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' },
            }}
          >
            <Receipt sx={{ mr: 0.5, fontSize: '1rem' }} />
            Pesanan
          </Link>
          <Typography variant="body2" color="text.primary">
            #{order.id.slice(-8).toUpperCase()}
          </Typography>
        </Breadcrumbs>

        {/* Back Button */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/orders')}
          sx={{ mb: 4 }}
        >
          Kembali ke Daftar Pesanan
        </Button>

        {/* Success Message */}
        {location.state?.message && (
          <Alert severity="success" sx={{ mb: 4 }}>
            {location.state.message}
          </Alert>
        )}

        {/* Order Header */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={2}>
              <Box>
                <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                  Order #{order.id.slice(-8).toUpperCase()}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  Dibuat pada {formatDate(order.created_at)}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Chip
                    label={getStatusLabel(order.status)}
                    color={getStatusColor(order.status) as any}
                    variant="outlined"
                  />
                  <Chip
                    label={getPaymentStatusLabel(order.payment_status)}
                    color={getPaymentStatusColor(order.payment_status) as any}
                    variant="outlined"
                  />
                </Stack>
              </Box>

              {canCancel && (
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  color="error"
                  sx={{ borderRadius: 2 }}
                >
                  {cancelling ? 'Membatalkan...' : 'Batalkan Pesanan'}
                </Button>
              )}
            </Stack>
          </CardContent>
        </Card>

        <Grid container spacing={4}>
          {/* Order Items */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                  Item Pesanan ({order.order_items.length})
                </Typography>
                <Stack spacing={3}>
                  {order.order_items.map((item) => {
                    const primaryImage = item.product_variant.product.product_images?.[0]?.image_name;
                    
  return (
                      <Box
                        key={item.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                          p: 3,
                          borderRadius: 2,
                          backgroundColor: '#f8f9fa',
                          border: `1px solid ${theme.palette.grey[200]}`,
                        }}
                      >
                        <Avatar
                          src={primaryImage || `https://placehold.co/80x80/9682DB/FFFFFF/png?text=${encodeURIComponent(item.product_variant.product.name)}`}
                          alt={item.product_variant.product.name}
                          sx={{
                            width: 80,
                            height: 80,
                            borderRadius: 2,
                            flexShrink: 0,
                          }}
                          variant="rounded"
                        />
                        
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
                            {item.product_variant.product.name}
                          </Typography>
                          <Typography variant="subtitle1" color="primary.main" fontWeight={600} sx={{ mb: 1 }}>
                            {item.product_variant.variant_name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            SKU: {item.product_variant.sku}
                          </Typography>
                          {item.product_variant.variant_options && item.product_variant.variant_options.length > 0 && (
                            <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
                              {item.product_variant.variant_options.map((option, index) => (
                                <Chip
                                  key={index}
                                  label={`${option.option_name}: ${option.option_value}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.75rem' }}
                                />
                              ))}
                            </Stack>
                          )}
                          <Typography variant="body2" color="text.secondary">
                            Qty: {item.quantity} × {formatPrice(item.price)}
                          </Typography>
                        </Box>
                        
                        <Typography variant="h6" color="primary.main" fontWeight={700}>
                          {formatPrice(item.price * item.quantity)}
                        </Typography>
                      </Box>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            {order.shipping && (
              <Card sx={{ mb: 4 }}>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                    Informasi Pengiriman
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Kurir
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {order.shipping.courier}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Status Pengiriman
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {order.shipping.shipping_status}
                      </Typography>
                    </Grid>
                    {order.shipping.tracking_number && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Nomor Resi
                        </Typography>
                        <Typography variant="body1" fontWeight={600} color="primary.main">
                          {order.shipping.tracking_number}
                        </Typography>
                      </Grid>
                    )}
                    {order.shipping.estimated_delivery && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Estimasi Sampai
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {formatDate(order.shipping.estimated_delivery)}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            )}

            {/* Payment Information */}
            {order.payments && order.payments.length > 0 && (
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                    Riwayat Pembayaran
                  </Typography>
                  <Stack spacing={2}>
                    {order.payments.map((payment) => (
                      <Box
                        key={payment.id}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: '#f8f9fa',
                          border: `1px solid ${theme.palette.grey[200]}`,
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {payment.payment_method}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(payment.payment_date)}
                            </Typography>
                            {payment.payment_reference && (
                              <Typography variant="body2" color="text.secondary">
                                Ref: {payment.payment_reference}
                              </Typography>
                            )}
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h6" fontWeight={700} color="primary.main">
                              {formatPrice(payment.amount)}
                            </Typography>
                            <Chip
                              label={payment.payment_status}
                              color={getPaymentStatusColor(payment.payment_status) as any}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ position: 'sticky', top: 24 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                  Ringkasan Pesanan
                </Typography>
                
                <Stack spacing={2}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1">
                      Subtotal
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {formatPrice(order.total_amount)}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1">
                      Biaya Pengiriman
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {formatPrice(order.shipping_cost)}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" fontWeight={700}>
                      Total
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="primary.main">
                      {formatPrice(order.total_amount + order.shipping_cost)}
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ my: 3 }} />

                {/* Delivery Address */}
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  Alamat Pengiriman
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: '#f8f9fa',
                    border: `1px solid ${theme.palette.grey[200]}`,
                  }}
                >
                  <Typography variant="body1" fontWeight={600}>
                    {order.address.address_line}
          </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.address.city}, {order.address.province} {order.address.postal_code}
          </Typography>
        </Box>

                {order.payment_status === 'unpaid' && order.status !== 'cancelled' && (
                  <>
                    <Divider sx={{ my: 3 }} />
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<PaymentIcon />}
                      onClick={() => navigate(`/payment/${order.id}`)}
                      fullWidth
                      sx={{
                        py: 1.5,
                        borderRadius: 2,
                        fontWeight: 600,
                      }}
                    >
                      Bayar Sekarang
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
    </Container>
    </Box>
  );
}
