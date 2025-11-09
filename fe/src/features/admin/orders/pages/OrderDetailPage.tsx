import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
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
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Home,
  ShoppingBag,
  Receipt,
  ArrowBack,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  LocalShipping as ShippingIcon,
  OpenInNew as OpenInNewIcon,
} from '@mui/icons-material';
import { adminOrderApi, OrderWithUser } from '../services/orderApi';
import { orderApi } from '@/features/orders/services/orderApi';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';
import { useUiStore } from '@/store/uiStore';
import Loading from '@/components/ui/Loading';

export default function OrderDetailPage() {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formatPrice } = useCurrencyConversion();
  const { showNotification } = useUiStore();
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<OrderWithUser | null>(null);
  const [status, setStatus] = useState<string>('');
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);

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
    if (!id) {
      setError('ID pesanan tidak valid');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await adminOrderApi.getOrderById(id);
      
      if (response.success) {
        const orderData = response.data as OrderWithUser;
        setOrder(orderData);
        setStatus(orderData.status);
      } else {
        throw new Error('Failed to fetch order');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || error.message || 'Gagal memuat data pesanan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  // Sync status with order.status when order changes
  useEffect(() => {
    if (order) {
      setStatus(order.status);
    }
  }, [order]);

  // Auto-load tracking when order is loaded and has tracking_number
  useEffect(() => {
    if (order?.shipping?.tracking_number && !trackingData && !trackingLoading) {
      handleTrackShipment();
    }
  }, [order?.shipping?.tracking_number, trackingData, trackingLoading, handleTrackShipment]);

  const handleStatusUpdate = async () => {
    if (!order || !status || status === order.status) {
      return;
    }

    try {
      setUpdating(true);
      const response = await adminOrderApi.updateOrderStatus(order.id, status);
      
      if (response.success) {
        showNotification({
          type: 'success',
          message: 'Status pesanan berhasil diperbarui',
        });
        fetchOrder();
      } else {
        throw new Error(response.error || 'Failed to update order status');
      }
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.response?.data?.error || error.message || 'Gagal memperbarui status pesanan',
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <Loading message="Memuat data pesanan..." />;
  }

  if (error || !order) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error">
          {error || 'Pesanan tidak ditemukan'}
        </Alert>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin/orders')}
          sx={{ mt: 2 }}
        >
          Kembali ke Daftar Pesanan
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
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
          <Home sx={{ mr: 0.5, fontSize: '1rem' }} />
          Dashboard
        </Link>
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate('/admin/orders')}
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
        onClick={() => navigate('/admin/orders')}
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
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
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
              {order.user && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Pelanggan
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {order.user.full_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {order.user.email}
                  </Typography>
                  {order.user.phone && (
                    <Typography variant="body2" color="text.secondary">
                      {order.user.phone}
                    </Typography>
                  )}
                </Box>
              )}
            </Box>

            <Box sx={{ minWidth: 200 }}>
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Status Pesanan</InputLabel>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  label="Status Pesanan"
                  disabled={updating}
                >
                  {/* Only show valid transitions based on current status */}
                  {order.status === 'belum_bayar' && [
                    <MenuItem key="belum_bayar" value="belum_bayar" disabled>Belum Bayar (Current)</MenuItem>,
                    <MenuItem key="dikemas" value="dikemas">Dikemas</MenuItem>,
                    <MenuItem key="dibatalkan" value="dibatalkan">Dibatalkan</MenuItem>
                  ]}
                  {order.status === 'dikemas' && [
                    <MenuItem key="dikemas" value="dikemas" disabled>Dikemas (Current)</MenuItem>,
                    <MenuItem key="dikirim" value="dikirim">Dikirim (Create Waybill)</MenuItem>,
                    <MenuItem key="dibatalkan" value="dibatalkan">Dibatalkan</MenuItem>
                  ]}
                  {order.status === 'dikirim' && [
                    <MenuItem key="dikirim" value="dikirim" disabled>Dikirim (Current)</MenuItem>,
                    <MenuItem key="diterima" value="diterima">Diterima</MenuItem>
                  ]}
                  {order.status === 'diterima' && (
                    <MenuItem value="diterima" disabled>Diterima (Final)</MenuItem>
                  )}
                  {order.status === 'dibatalkan' && (
                    <MenuItem value="dibatalkan" disabled>Dibatalkan (Final)</MenuItem>
                  )}
                </Select>
              </FormControl>
              <Button
                fullWidth
                variant="contained"
                startIcon={updating ? <CircularProgress size={16} /> : <SaveIcon />}
                onClick={handleStatusUpdate}
                disabled={updating || status === order.status}
                sx={{ borderRadius: 2 }}
              >
                {updating ? 'Menyimpan...' : order.status === 'dikemas' && status === 'dikirim' ? 'Kirim (Create Waybill)' : 'Simpan Status'}
              </Button>
              {order.status === 'dikemas' && status === 'dikirim' && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Akan membuat waybill di Biteship
                </Typography>
              )}
            </Box>
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
