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
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Home as HomeIcon,
  LocalShipping as ShippingIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  OpenInNew as OpenInNewIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  LocalShippingOutlined as ShippingOutlinedIcon,
} from '@mui/icons-material';
import { shippingApi } from '../services/shippingApi';
import Loading from '@/components/ui/Loading';
import { useUiStore } from '@/store/uiStore';
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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useUiStore();
  const { formatPrice } = useCurrencyConversion();

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const [shipping, setShipping] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingData, setTrackingData] = useState<any>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editData, setEditData] = useState({
    courier: '',
    tracking_number: '',
    shipping_status: '',
    estimated_delivery: '',
  });

  const fetchShipping = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const response = await shippingApi.getShippingDetail(id);

      if (response.success && response.data) {
        setShipping(response.data);
        setEditData({
          courier: response.data.courier || '',
          tracking_number: response.data.tracking_number || '',
          shipping_status: response.data.shipping_status || '',
          estimated_delivery: response.data.estimated_delivery 
            ? new Date(response.data.estimated_delivery).toISOString().split('T')[0]
            : '',
        });
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

  const handleUpdate = async () => {
    if (!id) return;

    try {
      setUpdating(true);
      setError(null);

      const response = await shippingApi.updateShippingStatus(id, {
        courier: editData.courier,
        tracking_number: editData.tracking_number,
        shipping_status: editData.shipping_status,
        estimated_delivery: editData.estimated_delivery || undefined,
      });

      if (response.success) {
        showNotification({
          type: 'success',
          message: 'Data pengiriman berhasil diperbarui',
        });
        setEditDialogOpen(false);
        await fetchShipping();
      } else {
        setError(response.error || 'Gagal memperbarui data pengiriman');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal memperbarui data pengiriman');
    } finally {
      setUpdating(false);
    }
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
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/admin/shipping')}>
          Kembali ke Daftar Pengiriman
        </Button>
      </Container>
    );
  }

  if (!shipping) {
    return null;
  }

  const trackingUrl = shipping.tracking_number 
    ? getTrackingUrl(shipping.courier, shipping.tracking_number)
    : null;

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
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate('/admin/shipping')}
          sx={{ 
            color: 'text.secondary',
            textDecoration: 'none',
            '&:hover': {
              color: 'primary.main',
              textDecoration: 'underline'
            }
          }}
        >
          Pengiriman
        </Link>
        <Typography variant="body2" color="textPrimary" sx={{ fontWeight: 500 }}>
          Detail Pengiriman
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton onClick={() => navigate('/admin/shipping')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <ShippingIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              Detail Pengiriman
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ID: {shipping.id}
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => setEditDialogOpen(true)}
          sx={{ borderRadius: 2, px: 3, py: 1 }}
        >
          Edit
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Main Info */}
        <Grid item xs={12} md={8}>
          {/* Shipping Information */}
          <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 16px rgba(150, 130, 219, 0.12)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <ShippingIcon sx={{ fontSize: '1.5rem', color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={600}>
                  Informasi Pengiriman
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Status
                  </Typography>
                  <Chip
                    label={getStatusText(shipping.shipping_status)}
                    color={getStatusColor(shipping.shipping_status) as any}
                    sx={{ fontWeight: 600 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Kurir
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {shipping.courier || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Nomor Tracking
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                    {shipping.tracking_number || 'Belum tersedia'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Estimasi Pengiriman
                  </Typography>
                  <Typography variant="body1">
                    {shipping.estimated_delivery
                      ? formatDate(new Date(shipping.estimated_delivery))
                      : 'Belum tersedia'}
                  </Typography>
                </Grid>
                {shipping.shipped_at && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Tanggal Dikirim
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(new Date(shipping.shipped_at))}
                    </Typography>
                  </Grid>
                )}
                {shipping.delivered_at && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Tanggal Diterima
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(new Date(shipping.delivered_at))}
                    </Typography>
                  </Grid>
                )}
              </Grid>

              {shipping.tracking_number && (
                <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid rgba(150, 130, 219, 0.1)' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Typography variant="h6" fontWeight={600}>
                      Tracking
                    </Typography>
                    {trackingUrl && (
                      <Tooltip title="Buka di website kurir">
                        <IconButton
                          size="small"
                          onClick={() => window.open(trackingUrl, '_blank')}
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
                      >
                        {trackingLoading ? (
                          <CircularProgress size={20} />
                        ) : (
                          <RefreshIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Box>

                  {trackingError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                      {trackingError}
                    </Alert>
                  )}

                  {trackingData?.data?.data && (
                    <Box>
                      <Paper sx={{ p: 2, mb: 2, backgroundColor: 'rgba(150, 130, 219, 0.05)' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          Waybill ID
                        </Typography>
                        <Typography variant="body1" fontWeight={500} sx={{ fontFamily: 'monospace' }}>
                          {trackingData.data.data.waybill_id || 'N/A'}
                        </Typography>
                      </Paper>

                      <Paper sx={{ p: 2, mb: 2 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          Status
                        </Typography>
                        <Chip
                          label={trackingData.data.data.status || 'N/A'}
                          color="primary"
                          size="small"
                        />
                      </Paper>

                      {trackingData.data.data.courier && (
                        <Paper sx={{ p: 2, mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Kurir
                          </Typography>
                          <Typography variant="body1">
                            {trackingData.data.data.courier.company || 'N/A'} - {trackingData.data.data.courier.service_type || 'N/A'}
                          </Typography>
                        </Paper>
                      )}

                      {trackingData.data.data.link && (
                        <Box sx={{ mb: 2 }}>
                          <Button
                            variant="outlined"
                            startIcon={<OpenInNewIcon />}
                            onClick={() => window.open(trackingData.data.data.link, '_blank')}
                            fullWidth
                          >
                            Buka Tracking di Biteship
                          </Button>
                        </Box>
                      )}

                      {trackingData.data.data.history && trackingData.data.data.history.length > 0 && (
                        <Box>
                          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
                            Riwayat Tracking
                          </Typography>
                          <List>
                            {trackingData.data.data.history.map((item: any, index: number) => (
                              <ListItem key={index} sx={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                  <Chip
                                    label={item.status || 'N/A'}
                                    size="small"
                                    color="primary"
                                  />
                                  <Typography variant="caption" color="text.secondary">
                                    {item.updated_at ? formatDate(new Date(item.updated_at)) : 'N/A'}
                                  </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                  {item.note || 'N/A'}
                                </Typography>
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Order Information */}
          {shipping.order && (
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 16px rgba(150, 130, 219, 0.12)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Informasi Order
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Order ID
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {shipping.order.id}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Status Order
                    </Typography>
                    <Chip
                      label={shipping.order.status}
                      size="small"
                      color="primary"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Total Amount
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formatPrice(parseFloat(shipping.order.total_amount || 0))}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Shipping Cost
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formatPrice(parseFloat(shipping.order.shipping_cost || 0))}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Customer Info */}
          {shipping.order?.user && (
            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 16px rgba(150, 130, 219, 0.12)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Informasi Customer
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Nama"
                      secondary={shipping.order.user.full_name || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Email"
                      secondary={shipping.order.user.email || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Telepon"
                      secondary={shipping.order.user.phone || 'N/A'}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          )}

          {/* Address Info */}
          {shipping.order?.address && (
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 16px rgba(150, 130, 219, 0.12)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Alamat Pengiriman
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>{shipping.order.address.recipient_name || 'N/A'}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {shipping.order.address.address_line || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {shipping.order.address.city || 'N/A'}, {shipping.order.address.province || 'N/A'} {shipping.order.address.postal_code || 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Data Pengiriman</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Kurir"
              value={editData.courier}
              onChange={(e) => setEditData({ ...editData, courier: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Nomor Tracking"
              value={editData.tracking_number}
              onChange={(e) => setEditData({ ...editData, tracking_number: e.target.value })}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={editData.shipping_status}
                onChange={(e) => setEditData({ ...editData, shipping_status: e.target.value })}
                label="Status"
              >
                <MenuItem value="pending">Menunggu Pengiriman</MenuItem>
                <MenuItem value="shipped">Terkirim</MenuItem>
                <MenuItem value="in_transit">Dalam Perjalanan</MenuItem>
                <MenuItem value="delivered">Terkirim</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Estimasi Pengiriman"
              type="date"
              value={editData.estimated_delivery}
              onChange={(e) => setEditData({ ...editData, estimated_delivery: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Batal</Button>
          <Button onClick={handleUpdate} variant="contained" disabled={updating}>
            {updating ? <CircularProgress size={20} /> : 'Simpan'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

