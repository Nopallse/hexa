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
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import AccountSidebar from '@/components/common/AccountSidebar';
import {
  Home,
  ShoppingBag,
  Receipt,
  ArrowBack,
  Cancel as CancelIcon,
  Payment as PaymentIcon,
  Refresh as RefreshIcon,
  LocalShipping as ShippingIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { useState, useEffect, useCallback } from 'react';
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
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);

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

  const getStatusLabel = (status: string) => {
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
    switch (status) {
      case 'unpaid':
        return 'error';
      case 'pending':
        return 'warning';
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
      case 'pending':
        return 'Menunggu Pembayaran';
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

  const handleTrackShipment = useCallback(async () => {
    if (!order?.shipping?.tracking_number) return;
    
    setTrackingLoading(true);
    setTrackingError(null);
    
    try {
      const result: any = await orderApi.trackShipment(
        order.shipping.tracking_number,
        order.shipping.courier?.toLowerCase()
      );
      
      if (result.success) {
        // Response structure: { success: true, data: { ...tracking data... }, provider: "biteship" }
        setTrackingData(result);
      } else {
        setTrackingError(result.error || 'Gagal mendapatkan informasi tracking');
      }
    } catch (error: any) {
      setTrackingError(error.response?.data?.error || 'Gagal mendapatkan informasi tracking');
    } finally {
      setTrackingLoading(false);
    }
  }, [order?.shipping?.tracking_number, order?.shipping?.courier]);

  const getTrackingUrl = (courier: string, trackingNumber: string) => {
    const courierLower = courier.toLowerCase();
    const trackingUrls: { [key: string]: string } = {
      'jne': `https://www.jne.co.id/id/tracking/tariff-and-service`,
      'jnt': `https://www.jet.co.id/track`,
      'sicepat': `https://www.sicepat.com/check-resi`,
      'pos': `https://www.posindonesia.co.id/tracking`,
      'anteraja': `https://anteraja.id/tracking`,
      'ninja': `https://www.ninjaxpress.co.id/tracking`,
      'lion': `https://lionparcel.com/tracking`,
      'ide': `https://idexpress.com/tracking`,
    };
    
    return trackingUrls[courierLower] || null;
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

  // Auto-load tracking when order is loaded and has tracking_number
  useEffect(() => {
    if (order?.shipping?.tracking_number && !trackingData && !trackingLoading) {
      handleTrackShipment();
    }
  }, [order?.shipping?.tracking_number, trackingData, trackingLoading, handleTrackShipment]);

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

  const canCancel = order.status === 'belum_bayar';

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        <Grid container spacing={4}>
          {/* Sidebar */}
          <Grid item xs={12} md={3}>
            <AccountSidebar />
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={9}>
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
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ShippingIcon />
                      Informasi Pengiriman
                    </Typography>
                    {order.shipping.tracking_number && (
                      <Stack direction="row" spacing={1}>
                        {order.shipping.courier && order.shipping.tracking_number && getTrackingUrl(order.shipping.courier, order.shipping.tracking_number) && (
                          <Tooltip title="Buka di website kurir">
                            <IconButton
                              size="small"
                              onClick={() => {
                                const url = getTrackingUrl(order.shipping!.courier, order.shipping!.tracking_number!);
                                if (url) {
                                  window.open(url, '_blank');
                                }
                              }}
                              sx={{ color: 'primary.main' }}
                            >
                              <OpenInNewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Refresh tracking">
                          <IconButton
                            size="small"
                            onClick={handleTrackShipment}
                            disabled={trackingLoading}
                            sx={{ color: 'primary.main' }}
                          >
                            {trackingLoading ? (
                              <CircularProgress size={20} />
                            ) : (
                              <RefreshIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    )}
                  </Stack>

                  {trackingError && (
                    <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setTrackingError(null)}>
                      {trackingError}
                    </Alert>
                  )}

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

                  {/* Tracking Details */}
                  {trackingData && (
                    <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 3 }}>
                        Detail Tracking
                      </Typography>

                      {/* Tracking Info */}
                      {trackingData.data && (
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                          {trackingData.data.waybill_id && (
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ 
                                p: 2,
                                backgroundColor: 'grey.50',
                                borderRadius: 2,
                              }}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                                  Waybill ID
                                </Typography>
                                <Typography variant="body1" fontWeight={600}>
                                  {trackingData.data.waybill_id}
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                          {trackingData.data.status && (
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ 
                                p: 2,
                                backgroundColor: 'grey.50',
                                borderRadius: 2,
                              }}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                                  Status Tracking
                                </Typography>
                                <Typography variant="body1" fontWeight={600}>
                                  {trackingData.data.status}
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                          {trackingData.data.courier?.company && (
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
                                  {trackingData.data.courier.company.toUpperCase()}
                                </Typography>
                                {trackingData.data.courier.service_type && (
                                  <Typography variant="caption" color="text.secondary">
                                    {trackingData.data.courier.service_type}
                                  </Typography>
                                )}
                              </Box>
                            </Grid>
                          )}
                          {trackingData.data.link && (
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ 
                                p: 2,
                                backgroundColor: 'primary.light',
                                borderRadius: 2,
                              }}>
                                <Typography variant="subtitle2" color="primary.dark" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                                  Link Tracking
                                </Typography>
                                <Button
                                  size="small"
                                  variant="text"
                                  onClick={() => window.open(trackingData.data.link, '_blank')}
                                  sx={{ 
                                    p: 0,
                                    textTransform: 'none',
                                    color: 'primary.main',
                                    '&:hover': { textDecoration: 'underline' }
                                  }}
                                >
                                  Buka di Biteship
                                </Button>
                              </Box>
                            </Grid>
                          )}
                        </Grid>
                      )}

                      {/* Origin & Destination */}
                      {trackingData.data && (trackingData.data.origin || trackingData.data.destination) && (
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                          {trackingData.data.origin && (
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ 
                                p: 2,
                                backgroundColor: 'grey.50',
                                borderRadius: 2,
                              }}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 1 }}>
                                  Asal Pengiriman
                                </Typography>
                                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                                  {trackingData.data.origin.contact_name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {trackingData.data.origin.address}
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                          {trackingData.data.destination && (
                            <Grid item xs={12} sm={6}>
                              <Box sx={{ 
                                p: 2,
                                backgroundColor: 'grey.50',
                                borderRadius: 2,
                              }}>
                                <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 1 }}>
                                  Tujuan Pengiriman
                                </Typography>
                                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                                  {trackingData.data.destination.contact_name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {trackingData.data.destination.address}
                                </Typography>
                              </Box>
                            </Grid>
                          )}
                        </Grid>
                      )}

                      {/* Courier Info */}
                      {trackingData.data?.courier && (trackingData.data.courier.driver_name || trackingData.data.courier.driver_phone) && (
                        <Box sx={{ 
                          p: 2,
                          backgroundColor: 'info.light',
                          borderRadius: 2,
                          mb: 3,
                        }}>
                          <Typography variant="subtitle2" color="info.dark" sx={{ fontSize: '0.75rem', mb: 1 }}>
                            Informasi Kurir
                          </Typography>
                          {trackingData.data.courier.driver_name && (
                            <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                              Nama Driver: {trackingData.data.courier.driver_name}
                            </Typography>
                          )}
                          {trackingData.data.courier.driver_phone && (
                            <Typography variant="body2" color="text.secondary">
                              No. Telepon: {trackingData.data.courier.driver_phone}
                            </Typography>
                          )}
                        </Box>
                      )}

                      {/* History Tracking */}
                      {trackingData.data?.history && Array.isArray(trackingData.data.history) && trackingData.data.history.length > 0 ? (
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                            Riwayat Tracking
                          </Typography>
                          <Stack spacing={2}>
                            {trackingData.data.history.map((item: any, index: number) => (
                              <Box
                                key={index}
                                sx={{
                                  p: 2,
                                  backgroundColor: 'grey.50',
                                  borderRadius: 2,
                                  borderLeft: '3px solid',
                                  borderColor: index === 0 ? 'primary.main' : 'grey.300',
                                }}
                              >
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                                  <Box sx={{ flex: 1 }}>
                                    <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                                      {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Update'}
                                    </Typography>
                                    {item.note && (
                                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {item.note}
                                      </Typography>
                                    )}
                                    {item.service_type && (
                                      <Chip
                                        label={item.service_type}
                                        size="small"
                                        variant="outlined"
                                        sx={{ 
                                          fontSize: '0.7rem',
                                          height: 20,
                                          mr: 1,
                                        }}
                                      />
                                    )}
                                  </Box>
                                  {item.updated_at && (
                                    <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                                      {formatDate(item.updated_at)}
                                    </Typography>
                                  )}
                                </Stack>
                              </Box>
                            ))}
                          </Stack>
                        </Box>
                      ) : (
                        <Alert severity="info" sx={{ borderRadius: 2 }}>
                          Informasi tracking belum tersedia
                        </Alert>
                      )}
                    </Box>
                  )}
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

                {(order.payment_status === 'unpaid' || order.payment_status === 'pending') && order.status !== 'dibatalkan' && (
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
          </Grid>
        </Grid>
    </Container>
    </Box>
  );
}
