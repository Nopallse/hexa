import { useState, useEffect, useCallback } from 'react';
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
  Paper,
  Stack,
  IconButton,
  Tooltip,
  CircularProgress,
  useTheme,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import {
  Home as HomeIcon,
  LocalShipping as ShippingIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  OpenInNew as OpenInNewIcon,
  CheckCircle,
  RadioButtonUnchecked,
  Person as PersonIcon,
  LocationOn as LocationIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { shippingApi } from '../services/shippingApi';
import Loading from '@/components/ui/Loading';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'delivered':
      return 'success';
    case 'in_transit':
      return 'info';
    case 'pending':
      return 'warning';
    default:
      return 'default';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'delivered':
      return 'Terkirim';
    case 'in_transit':
      return 'Dalam Perjalanan';
    case 'pending':
      return 'Menunggu Pengiriman';
    default:
      return status;
  }
};

export default function ShippingDetailPage() {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formatPrice } = useCurrencyConversion();

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const [shipping, setShipping] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [showTrackingDetails, setShowTrackingDetails] = useState(false);

  const fetchShipping = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await shippingApi.getShippingDetail(id);

      if (response.success && response.data) {
        setShipping(response.data);
      } else {
        setError(response.error || 'Gagal memuat data pengiriman');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal memuat data pengiriman');
    } finally {
      setLoading(false);
    }
  };

  const handleTrackShipment = useCallback(async () => {
    if (!shipping?.tracking_number) return;

    setTrackingLoading(true);
    setTrackingError(null);

    try {
      const result: any = await shippingApi.getTrackingInfo(
        shipping.tracking_number,
        shipping.courier?.toLowerCase()
      );

      if (result.success) {
        setTrackingData(result);
      } else {
        setTrackingError(result.error || 'Gagal mendapatkan informasi tracking');
      }
    } catch (error: any) {
      setTrackingError(error.response?.data?.error || 'Gagal mendapatkan informasi tracking');
    } finally {
      setTrackingLoading(false);
    }
  }, [shipping?.tracking_number, shipping?.courier]);

  const getTrackingUrl = (courier: string, trackingNumber: string) => {
    const courierLower = courier?.toLowerCase();
    const trackingUrls: { [key: string]: string } = {
      'jne': `https://www.jne.co.id/id/tracking/tariff-and-service`,
      'jnt': `https://www.jet.co.id/track`,
      'sicepat': `https://www.sicepat.com/check-resi`,
      'pos': `https://www.posindonesia.co.id/tracking`,
      'anteraja': `https://anteraja.id/tracking`,
      'tiki': `https://tiki.id/tracking`,
    };
    return trackingUrls[courierLower || ''] || null;
  };

  useEffect(() => {
    fetchShipping();
  }, [id]);

  // Auto-load tracking when shipping is loaded and has tracking_number
  useEffect(() => {
    if (shipping?.tracking_number && !trackingData && !trackingLoading) {
      handleTrackShipment();
    }
  }, [shipping?.tracking_number, trackingData, trackingLoading, handleTrackShipment]);

  if (loading) {
    return <Loading message="Memuat data pengiriman..." />;
  }

  if (error && !shipping) {
    return (
      <Box sx={{ bgcolor: 'grey.50', minHeight: '100vh', pb: 4 }}>
      <Container maxWidth="xl" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/admin/shipping')}
            sx={{ 
              borderRadius: 2,
              fontWeight: 500,
              color: 'text.secondary',
              '&:hover': { 
                color: 'primary.main',
                backgroundColor: 'action.hover',
              },
            }}
          >
          Kembali ke Daftar Pengiriman
        </Button>
      </Container>
      </Box>
    );
  }

  if (!shipping) {
    return null;
  }

  const trackingUrl = shipping.tracking_number 
    ? getTrackingUrl(shipping.courier, shipping.tracking_number)
    : null;

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
          onClick={() => navigate('/admin/shipping')}
          sx={{ 
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' },
            }}
          >
            <ShippingIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
            Pengiriman
          </Link>
          <Typography variant="body2" color="text.primary" fontWeight={500}>
            #{shipping.id.slice(-8).toUpperCase()}
          </Typography>
        </Breadcrumbs>

        {/* Back Button */}
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/shipping')}
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
          Kembali ke Daftar Pengiriman
        </Button>

        {/* Shipping Header - Redesigned */}
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
                    Shipping #{shipping.id.slice(-8).toUpperCase()}
            </Typography>
                  <Chip
                    label={getStatusText(shipping.shipping_status)}
                    color={getStatusColor(shipping.shipping_status) as any}
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
                {shipping.created_at && (
                  <Typography variant="body2" color="text.secondary">
                    Dibuat pada {formatDate(shipping.created_at)}
                  </Typography>
                )}
              </Box>
            </Stack>
          </Box>
        </Paper>

      {/* Error Alert */}
      {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
          {/* Left Column - Main Content */}
          <Grid item xs={12} lg={8}>
            <Stack spacing={3}>
          {/* Shipping Information */}
              <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
            <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <ShippingIcon color="primary" />
                      <Typography variant="h6" fontWeight={700}>
                  Informasi Pengiriman
                </Typography>
                    </Stack>
              {shipping.tracking_number && (
                      <Stack direction="row" spacing={1}>
                        {shipping.courier && trackingUrl && (
                      <Tooltip title="Buka di website kurir">
                        <IconButton
                          size="small"
                              onClick={() => {
                                if (trackingUrl) window.open(trackingUrl, '_blank');
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
                          Status
                        </Typography>
                        <Chip
                          label={getStatusText(shipping.shipping_status)}
                          color={getStatusColor(shipping.shipping_status) as any}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                            Kurir
                        </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          {shipping.courier || 'N/A'}
                        </Typography>
                      </Paper>
                    </Grid>
                    {shipping.tracking_number && (
                      <Grid item xs={12} sm={6}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
                          <Typography variant="caption" color="primary.dark" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block', fontWeight: 600 }}>
                            Nomor Resi
                          </Typography>
                          <Typography variant="body1" fontWeight={700} color="primary.main" sx={{ fontFamily: 'monospace' }}>
                            {shipping.tracking_number}
                          </Typography>
                        </Paper>
                      </Grid>
                    )}
                    {shipping.estimated_delivery && (
                      <Grid item xs={12} sm={6}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                            Estimasi Sampai
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {formatDate(shipping.estimated_delivery)}
                          </Typography>
                        </Paper>
                      </Grid>
                    )}
                    {shipping.shipped_at && (
                      <Grid item xs={12} sm={6}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                            Tanggal Dikirim
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {formatDate(shipping.shipped_at)}
                          </Typography>
                        </Paper>
                      </Grid>
                    )}
                    {shipping.delivered_at && (
                      <Grid item xs={12} sm={6}>
                        <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                            Tanggal Diterima
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {formatDate(shipping.delivered_at)}
                          </Typography>
                        </Paper>
                      </Grid>
                      )}
                    {shipping.tracking_number && (
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

                      {trackingData?.data?.history && Array.isArray(trackingData.data.history) && trackingData.data.history.length > 0 && (
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
                      )}

                      {trackingData?.data && !(trackingData?.data?.history && Array.isArray(trackingData.data.history) && trackingData.data.history.length > 0) && (
                        <Box>
                          {trackingData.data.waybill_id && (
                            <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                                Waybill ID
                              </Typography>
                              <Typography variant="body1" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
                                {trackingData.data.waybill_id}
                              </Typography>
                            </Paper>
                          )}
                          {trackingData.data.status && (
                            <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                                Status
                              </Typography>
                              <Chip
                                label={trackingData.data.status}
                                color="primary"
                                size="small"
                                sx={{ fontWeight: 600 }}
                              />
                            </Paper>
                          )}
                          {trackingData.data.courier && (
                            <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                                Kurir
                              </Typography>
                              <Typography variant="body1" fontWeight={600}>
                                {trackingData.data.courier.company || 'N/A'} {trackingData.data.courier.name ? `- ${trackingData.data.courier.name}` : ''}
                              </Typography>
                            </Paper>
                          )}
                          {trackingData.data.link && (
                            <Button
                              variant="outlined"
                              startIcon={<OpenInNewIcon />}
                              onClick={() => window.open(trackingData.data.link, '_blank')}
                              fullWidth
                              sx={{ 
                                textTransform: 'none',
                                borderRadius: 2,
                                mb: 2,
                              }}
                            >
                              Buka Tracking di Biteship
                            </Button>
                          )}
                          <Alert severity="info" sx={{ borderRadius: 2 }}>
                            Riwayat tracking belum tersedia
                          </Alert>
                        </Box>
                      )}

                      {trackingData && !trackingData?.data && (
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

          {/* Order Information */}
          {shipping.order && (
                <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
              <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                      <ReceiptIcon color="primary" />
                      <Typography variant="h6" fontWeight={700}>
                        Informasi Pesanan
                </Typography>
                    </Stack>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                      Order ID
                    </Typography>
                        <Typography variant="body1" fontWeight={600}>
                          #{shipping.order.id.slice(-8).toUpperCase()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                      Status Order
                    </Typography>
                    <Chip
                      label={shipping.order.status}
                      size="small"
                      color="primary"
                          sx={{ fontWeight: 600 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                      Total Amount
                    </Typography>
                        <Typography variant="body1" fontWeight={600}>
                      {formatPrice(parseFloat(shipping.order.total_amount || 0))}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                      Shipping Cost
                    </Typography>
                        <Typography variant="body1" fontWeight={600}>
                      {formatPrice(parseFloat(shipping.order.shipping_cost || 0))}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
            </Stack>
        </Grid>

          {/* Right Column - Summary */}
          <Grid item xs={12} lg={4}>
            <Stack spacing={3}>
          {/* Customer Info */}
          {shipping.order?.user && (
                <Card elevation={0} sx={{ 
                  position: 'sticky', 
                  top: 24,
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                }}>
              <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                      <PersonIcon color="primary" />
                      <Typography variant="h6" fontWeight={700}>
                        Informasi Pelanggan
                      </Typography>
                    </Stack>
                    {shipping.order.user && (
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                            Nama
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {shipping.order.user.full_name || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                            Email
                          </Typography>
                          <Typography variant="body1">
                            {shipping.order.user.email || 'N/A'}
                          </Typography>
                        </Grid>
                        {shipping.order.user.phone && (
                          <Grid item xs={12}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5, display: 'block' }}>
                              Telepon
                            </Typography>
                            <Typography variant="body1">
                              {shipping.order.user.phone}
                </Typography>
                          </Grid>
                        )}
                      </Grid>
                    )}
              </CardContent>
            </Card>
          )}

          {/* Address Info */}
          {shipping.order?.address && (
                <Card elevation={0} sx={{ 
                  position: 'sticky', 
                  top: shipping.order?.user ? 400 : 24,
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                }}>
              <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                      <LocationIcon color="primary" />
                      <Typography variant="subtitle1" fontWeight={700}>
                  Alamat Pengiriman
                </Typography>
                    </Stack>
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                      {shipping.order.address.recipient_name && (
                        <Typography variant="body1" fontWeight={600} sx={{ mb: 0.5 }}>
                          {shipping.order.address.recipient_name}
                </Typography>
                      )}
                      <Typography variant="body1" fontWeight={600} sx={{ mb: 0.5 }}>
                  {shipping.order.address.address_line || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {shipping.order.address.city || 'N/A'}, {shipping.order.address.province || 'N/A'} {shipping.order.address.postal_code || 'N/A'}
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

