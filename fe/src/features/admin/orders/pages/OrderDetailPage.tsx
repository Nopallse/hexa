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
  CircularProgress,
  IconButton,
  Tooltip,
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import {
  Home,
  ShoppingBag,
  Receipt,
  ArrowBack,
  Refresh as RefreshIcon,
  LocalShipping as ShippingIcon,
  OpenInNew as OpenInNewIcon,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Payment as PaymentIcon,
  Inventory as InventoryIcon,
  CheckCircle,
  RadioButtonUnchecked,
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
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [showTrackingDetails, setShowTrackingDetails] = useState(false);

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

  // Get valid next statuses based on current status and payment status
  const getValidNextStatuses = (currentStatus: string, paymentStatus: string) => {
    const validTransitions: { [key: string]: string[] } = {
      'belum_bayar': paymentStatus === 'paid' ? ['dikemas', 'dibatalkan'] : ['dibatalkan'], // Hanya bisa dikemas jika sudah dibayar
      'dikemas': ['dikirim', 'dibatalkan'],
      'dikirim': [], // Status diterima akan diupdate melalui webhook, admin tidak bisa ubah manual
      'diterima': [], // Final state
      'dibatalkan': [] // Final state
    };
    return validTransitions[currentStatus] || [];
  };

  // Handle show tracking details
  const handleShowTrackingDetails = async () => {
    if (!order?.shipping?.tracking_number) return;
    
    if (!trackingData && !trackingLoading) {
      await handleTrackShipment();
    }
    setShowTrackingDetails(true);
  };

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order || newStatus === order.status) {
      return;
    }

    try {
      setUpdating(true);
      const response = await adminOrderApi.updateOrderStatus(order.id, newStatus);
      
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
          <Typography variant="body2" color="text.primary" fontWeight={500}>
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
              backgroundColor: 'action.hover',
          },
        }}
      >
        Kembali ke Daftar Pesanan
      </Button>

        {/* Order Header - Redesigned */}
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
            <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={3}>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1.5 }}>
                  <Typography variant="h4" fontWeight={700} sx={{ color: 'text.primary' }}>
                    Order #{order.id.slice(-8).toUpperCase()}
                  </Typography>
                  <Chip
                    label={getStatusLabel(order.status)}
                    color={getStatusColor(order.status) as any}
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
                  Dibuat pada {formatDate(order.created_at)}
                </Typography>
              </Box>

              {/* Status Actions */}
              <Box sx={{ minWidth: { xs: '100%', md: 280 } }}>
                {(() => {
                  const validNextStatuses = getValidNextStatuses(order.status, order.payment_status);
                  
                  if (validNextStatuses.length === 0) {
                    return null; // Tidak tampilkan apa-apa jika sudah final
                  }

                  const canChangeToDikemas = order.status === 'belum_bayar' && order.payment_status !== 'paid';

                  return (
                    <Stack spacing={1.5}>
                      {canChangeToDikemas && (
                        <Alert severity="warning" sx={{ borderRadius: 2, fontSize: '0.875rem' }}>
                          Pesanan belum dibayar
                        </Alert>
                      )}
                      
                      {validNextStatuses.map((nextStatus) => {
                        const isDikirim = nextStatus === 'dikirim';
                        const isDibatalkan = nextStatus === 'dibatalkan';
                        
                        return (
                          <Button
                            key={nextStatus}
                            variant={isDibatalkan ? "outlined" : "contained"}
                            color={isDibatalkan ? "error" : "primary"}
                            fullWidth
                            startIcon={updating ? <CircularProgress size={16} /> : null}
                            onClick={() => handleStatusUpdate(nextStatus)}
                            disabled={updating}
                            sx={{ 
                              borderRadius: 2,
                              fontWeight: 600,
                              py: 1.5,
                              textTransform: 'none',
                              borderWidth: isDibatalkan ? 2 : 1,
                            }}
                          >
                            {updating ? 'Memproses...' : (
                              <>
                                {isDikirim ? 'Kirim Pesanan' : getStatusLabel(nextStatus)}
                                {isDikirim && (
                                  <Typography variant="caption" sx={{ ml: 1, opacity: 0.9 }}>
                                    (Buat Waybill)
                                  </Typography>
                                )}
                              </>
                            )}
                          </Button>
                        );
                      })}
                    </Stack>
                  );
                })()}
              </Box>
          </Stack>
          </Box>
        </Paper>

        <Grid container spacing={3}>
          {/* Left Column - Main Content */}
        <Grid item xs={12} lg={8}>
            <Stack spacing={3}>
              {/* Customer Information */}
              <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                    <PersonIcon color="primary" />
                    <Typography variant="h6" fontWeight={700}>
                      Informasi Pelanggan
              </Typography>
                          </Stack>
                  {order.user && (
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                          Nama
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {order.user.full_name}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                          Email
                        </Typography>
                        <Typography variant="body1">
                          {order.user.email}
                        </Typography>
                      </Grid>
                      {order.user.phone && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                            Telepon
                          </Typography>
                          <Typography variant="body1">
                            {order.user.phone}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  )}
            </CardContent>
          </Card>

          {/* Shipping Information */}
          {order.shipping && (
                <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
              <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <ShippingIcon color="primary" />
                        <Typography variant="h6" fontWeight={700}>
                    Informasi Pengiriman
                  </Typography>
                      </Stack>
                  {order.shipping.tracking_number && (
                    <Stack direction="row" spacing={1}>
                          {order.shipping.courier && getTrackingUrl(order.shipping.courier, order.shipping.tracking_number) && (
                        <Tooltip title="Buka di website kurir">
                          <IconButton
                            size="small"
                            onClick={() => {
                              const url = getTrackingUrl(order.shipping!.courier, order.shipping!.tracking_number!);
                                  if (url) window.open(url, '_blank');
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
                              {trackingLoading ? <CircularProgress size={20} /> : <RefreshIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  )}
                </Stack>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                        Kurir
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {order.shipping.courier}
                      </Typography>
                        </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                        Status Pengiriman
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {order.shipping.shipping_status}
                      </Typography>
                        </Paper>
                  </Grid>
                  {order.shipping.tracking_number && (
                    <Grid item xs={12} sm={6}>
                          <Paper elevation={0} sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
                            <Typography variant="caption" color="primary.dark" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block', fontWeight: 600 }}>
                          Nomor Resi
                        </Typography>
                            <Typography variant="body1" fontWeight={700} color="primary.main">
                          {order.shipping.tracking_number}
                        </Typography>
                          </Paper>
                    </Grid>
                  )}
                  {order.shipping.estimated_delivery && (
                    <Grid item xs={12} sm={6}>
                          <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                          Estimasi Sampai
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {formatDate(order.shipping.estimated_delivery)}
                        </Typography>
                          </Paper>
                    </Grid>
                  )}
                      {order.shipping.tracking_number && (
                        <Grid item xs={12}>
                          <Button
                            variant="outlined"
                            onClick={() => setShowTrackingDetails(!showTrackingDetails)}
                            sx={{ 
                              textTransform: 'none',
                              borderRadius: 2,
                              mt: 1,
                            }}
                            fullWidth
                          >
                            {showTrackingDetails ? 'Sembunyikan' : 'Lihat'} Detail Tracking
                          </Button>
                          </Grid>
                        )}
                          </Grid>

                    {/* Tracking Details with Stepper */}
                    {showTrackingDetails && (
                      <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
                        {trackingError && (
                          <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setTrackingError(null)}>
                            {trackingError}
                          </Alert>
                        )}

                        {trackingLoading && !trackingData && (
                          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress />
                            </Box>
                        )}

                        {trackingData?.data?.history && Array.isArray(trackingData.data.history) && trackingData.data.history.length > 0 ? (
                          <Box>
                            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 3 }}>
                              Riwayat Tracking
                              </Typography>
                            <Stepper orientation="vertical" sx={{ '& .MuiStepLabel-root': { alignItems: 'flex-start' } }}>
                              {trackingData.data.history.map((item: any, index: number) => (
                                <Step key={index} active={index === 0} completed={index > 0}>
                                  <StepLabel
                                    StepIconComponent={() => (
                                      <Box
                                sx={{ 
                                          width: 24,
                                          height: 24,
                                          borderRadius: '50%',
                                          bgcolor: index === 0 ? 'primary.main' : 'grey.300',
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                          color: 'white',
                                        }}
                                      >
                                        {index === 0 ? <CheckCircle sx={{ fontSize: 20 }} /> : <RadioButtonUnchecked sx={{ fontSize: 20 }} />}
                            </Box>
                                    )}
                                  >
                              <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                                      {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'Update'}
                              </Typography>
                                    {item.note && (
                                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                        {item.note}
                              </Typography>
                                    )}
                                    {item.updated_at && (
                              <Typography variant="caption" color="text.secondary">
                                        {formatDate(item.updated_at)}
                              </Typography>
                                    )}
                                  </StepLabel>
                                </Step>
                              ))}
                            </Stepper>
                            </Box>
                        ) : trackingData && (
                          <Alert severity="info" sx={{ borderRadius: 2 }}>
                            Informasi tracking belum tersedia
                          </Alert>
                        )}

                        {!trackingData && !trackingLoading && (
                          <Alert severity="info" sx={{ borderRadius: 2 }}>
                            Klik tombol refresh untuk memuat detail tracking
                          </Alert>
                        )}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Order Items */}
              <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                    <InventoryIcon color="primary" />
                    <Typography variant="h6" fontWeight={700}>
                      Item Pesanan ({order.order_items.length})
                        </Typography>
                  </Stack>
                        <Stack spacing={2}>
                    {order.order_items.map((item) => {
                      const primaryImage = item.product_variant.product.product_images?.[0]?.image_name;
                      
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
                            src={primaryImage ? `/uploads/${primaryImage}` : `https://placehold.co/80x80/9682DB/FFFFFF/png?text=${encodeURIComponent(item.product_variant.product.name.substring(0, 10))}`}
                            alt={item.product_variant.product.name}
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
                              title={item.product_variant.product.name}
                            >
                              {item.product_variant.product.name}
                                  </Typography>
                            
                            {item.product_variant.variant_options && item.product_variant.variant_options.length > 0 && (
                              <Stack direction="row" spacing={0.5} sx={{ mb: 1, flexWrap: 'wrap' }}>
                                {item.product_variant.variant_options.map((option, index) => (
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
                              Qty: {item.quantity} × {formatPrice(Number(item.price))}
                            </Typography>
                                </Box>

                          <Box sx={{ textAlign: 'right', minWidth: 120 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                              Total
                                  </Typography>
                            <Typography variant="h6" color="primary.main" fontWeight={700}>
                              {formatPrice(Number(item.price) * Number(item.quantity))}
                            </Typography>
                            </Box>
                        </Paper>
                      );
                    })}
                        </Stack>
              </CardContent>
            </Card>
            </Stack>
        </Grid>

          {/* Right Column - Summary */}
        <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
              {/* Order Summary */}
              <Card elevation={0} sx={{ 
            position: 'sticky', 
            top: 24,
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
          }}>
            <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 3, color: 'text.primary' }}>
                Ringkasan Pesanan
              </Typography>
              
              <Stack spacing={2}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  py: 2,
                  px: 2,
                      bgcolor: 'grey.50',
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
                      bgcolor: 'grey.50',
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
                      py: 2.5,
                      px: 2.5,
                      bgcolor: 'primary.main',
                  borderRadius: 2,
                  color: 'white',
                }}>
                      <Typography variant="h6" fontWeight={700}>
                    Total
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {formatPrice(Number(order.total_amount) + Number(order.shipping_cost))}
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 3 }} />

              {/* Delivery Address */}
                  <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                    <LocationIcon color="primary" />
                    <Typography variant="subtitle1" fontWeight={700}>
                Alamat Pengiriman
              </Typography>
                  </Stack>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="body1" fontWeight={600} sx={{ mb: 0.5 }}>
                  {order.address.address_line}
          </Typography>
                <Typography variant="body2" color="text.secondary">
                  {order.address.city}, {order.address.province} {order.address.postal_code}
          </Typography>
                  </Paper>
            </CardContent>
          </Card>
            </Stack>
        </Grid>
      </Grid>
    </Container>
    </Box>
  );
}
