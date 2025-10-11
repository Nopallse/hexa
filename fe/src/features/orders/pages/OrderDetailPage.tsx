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
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';
import MidtransPaymentButton from '@/features/payments/components/MidtransPaymentButton';

export default function OrderDetailPage() {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { formatPrice, loading: currencyLoading, error: currencyError } = useCurrencyConversion();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<string | null>(null);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const { setCurrentOrder } = useOrderStore();

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
      case 'processing':
        return 'primary';
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
      case 'processing':
        return 'Sedang Diproses';
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

  const handlePaymentSuccess = (payment: any) => {
    console.log('Payment successful:', payment);
    setPaymentSuccess('Pembayaran berhasil! Status pesanan akan diperbarui.');
    setPaymentError(null);
    // Refresh order data to get updated payment status
    fetchOrder();
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
    setPaymentError(error);
    setPaymentSuccess(null);
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
        <Breadcrumbs sx={{ mb: 3 }}>
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
          sx={{ 
            mb: 3,
            borderRadius: 2,
            fontWeight: 500,
            color: 'text.secondary',
            '&:hover': { 
              color: 'primary.main',
              backgroundColor: 'primary.light',
            },
          }}
        >
          Kembali ke Daftar Pesanan
        </Button>

        {/* Payment Success/Error Messages */}
        {paymentSuccess && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2 }}>
            {paymentSuccess}
          </Alert>
        )}

        {paymentError && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setPaymentError(null)}>
            {paymentError}
          </Alert>
        )}

        {/* Currency Loading State */}
        {currencyLoading && (
          <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
            Loading exchange rates...
          </Alert>
        )}

        {/* Currency Error State */}
        {currencyError && (
          <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
            Failed to load exchange rates. Prices will be displayed in default currency.
          </Alert>
        )}

        {/* Order Header */}
        <Card sx={{ mb: 4, borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" spacing={2}>
              <Box>
                <Typography variant="h4" fontWeight={600} sx={{ mb: 1, color: 'text.primary' }}>
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
                    sx={{ borderRadius: 2 }}
                  />
                  <Chip
                    label={getPaymentStatusLabel(order.payment_status)}
                    color={getPaymentStatusColor(order.payment_status) as any}
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
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
                  sx={{ 
                    borderRadius: 2,
                    fontWeight: 500,
                    '&:hover': {
                      backgroundColor: 'error.light',
                    },
                  }}
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
            <Card sx={{ mb: 4, borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: 'text.primary' }}>
                  Item Pesanan ({order.order_items.length})
                </Typography>
                <Stack spacing={2}>
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
                          backgroundColor: 'grey.50',
                          border: 'none',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: 'grey.100',
                          },
                        }}
                      >
                        {/* Product Image */}
                        <Box sx={{ flexShrink: 0 }}>
                          <Avatar
                            src={primaryImage ? `/uploads/${primaryImage}` : `https://placehold.co/80x80/9682DB/FFFFFF/png?text=${encodeURIComponent(item.product_variant.product.name.substring(0, 10))}`}
                            alt={item.product_variant.product.name}
                            sx={{
                              width: 80,
                              height: 80,
                              borderRadius: 2,
                              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            }}
                            variant="rounded"
                          />
                        </Box>

                        {/* Product Info */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography 
                            variant="h6" 
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
                              fontSize: '1rem',
                            }}
                            title={item.product_variant.product.name}
                          >
                            {item.product_variant.product.name}
                          </Typography>
                          
                          {/* Variant Options */}
                          {item.product_variant.variant_options && item.product_variant.variant_options.length > 0 && (
                            <Stack direction="row" spacing={0.5} sx={{ mb: 1, flexWrap: 'wrap' }}>
                              {item.product_variant.variant_options.map((option, index) => (
                                <Chip
                                  key={index}
                                  label={`${option.option_value}`}
                                  size="small"
                                  variant="outlined"
                                  sx={{ 
                                    fontSize: '0.7rem',
                                    height: 20,
                                    borderColor: 'primary.main',
                                    color: 'primary.main',
                                    '& .MuiChip-label': {
                                      px: 1,
                                    }
                                  }}
                                />
                              ))}
                            </Stack>
                          )}

                    
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                            Qty: {item.quantity} × {formatPrice(Number(item.price))}
                          </Typography>
                        </Box>

                        {/* Price */}
                        <Box sx={{ textAlign: 'right', minWidth: 100 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                            Total
                          </Typography>
                          <Typography variant="h6" color="primary.main" fontWeight={700} sx={{ fontSize: '1rem' }}>
                            {formatPrice(Number(item.price) * Number(item.quantity))}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              </CardContent>
            </Card>

            {/* Shipping Information */}
            {order.shipping && (
              <Card sx={{ mb: 4, borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: 'text.primary' }}>
                    Informasi Pengiriman
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ 
                        p: 2,
                        backgroundColor: 'grey.50',
                        borderRadius: 2,
                      }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                          Kurir
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {order.shipping.courier}
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ 
                        p: 2,
                        backgroundColor: 'grey.50',
                        borderRadius: 2,
                      }}>
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                          Status Pengiriman
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {order.shipping.shipping_status}
                        </Typography>
                      </Box>
                    </Grid>
                    {order.shipping.tracking_number && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 2,
                          backgroundColor: 'primary.light',
                          borderRadius: 2,
                        }}>
                          <Typography variant="subtitle2" color="primary.dark" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                            Nomor Resi
                          </Typography>
                          <Typography variant="body1" fontWeight={600} color="primary.main">
                            {order.shipping.tracking_number}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                    {order.shipping.estimated_delivery && (
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ 
                          p: 2,
                          backgroundColor: 'grey.50',
                          borderRadius: 2,
                        }}>
                          <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                            Estimasi Sampai
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {formatDate(order.shipping.estimated_delivery)}
                          </Typography>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </Card>
            )}

          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ 
              position: 'sticky', 
              top: 24,
              borderRadius: 2,
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: 'none',
            }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: 'text.primary' }}>
                  Ringkasan Pesanan
                </Typography>
                
                <Stack spacing={2}>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    py: 2,
                    px: 2,
                    backgroundColor: 'grey.50',
                    borderRadius: 2,
                  }}>
                    <Typography variant="body1" fontWeight={500}>
                      Subtotal
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {formatPrice(Number(order.total_amount))}
                    </Typography>
                  </Box>

                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    py: 2,
                    px: 2,
                    backgroundColor: 'grey.50',
                    borderRadius: 2,
                  }}>
                    <Typography variant="body1" fontWeight={500}>
                      Biaya Pengiriman
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {formatPrice(Number(order.shipping_cost))}
                    </Typography>
                  </Box>

                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    py: 2,
                    px: 2,
                    backgroundColor: 'primary.main',
                    borderRadius: 2,
                    color: 'white',
                  }}>
                    <Typography variant="h6" fontWeight={600}>
                      Total
                    </Typography>
                    <Typography variant="h6" fontWeight={700}>
                      {formatPrice(Number(order.total_amount) + Number(order.shipping_cost))}
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ my: 3 }} />

                {/* Delivery Address */}
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: 'text.primary' }}>
                  Alamat Pengiriman
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: 'grey.50',
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
                    <MidtransPaymentButton
                      order={order}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                      paymentMethod="bank_transfer"
                    />
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
