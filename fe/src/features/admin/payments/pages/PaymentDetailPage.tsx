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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  Home as HomeIcon,
  Payment as PaymentIcon,
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Receipt as ReceiptIcon,
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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useUiStore();
  const { formatPrice } = useCurrencyConversion();

  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editData, setEditData] = useState({
    payment_status: '',
    payment_date: '',
  });

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
        setEditData({
          payment_status: response.data.payment_status || '',
          payment_date: response.data.payment_date
            ? new Date(response.data.payment_date).toISOString().split('T')[0]
            : '',
        });
      } else {
        setError(response.error || 'Gagal memuat data pembayaran');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal memuat data pembayaran');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!id) return;

    try {
      setUpdating(true);
      setError(null);

      const response = await adminPaymentApi.verifyPayment(id, {
        payment_status: editData.payment_status,
        payment_date: editData.payment_date || undefined,
      });

      if (response.success) {
        showNotification({
          type: 'success',
          message: 'Status pembayaran berhasil diperbarui',
        });
        setEditDialogOpen(false);
        await fetchPayment();
      } else {
        setError(response.error || 'Gagal memperbarui status pembayaran');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal memperbarui status pembayaran');
    } finally {
      setUpdating(false);
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
          onClick={() => navigate('/admin/payments')}
          sx={{ 
            color: 'text.secondary',
            textDecoration: 'none',
            '&:hover': {
              color: 'primary.main',
              textDecoration: 'underline'
            }
          }}
        >
          Pembayaran
        </Link>
        <Typography variant="body2" color="textPrimary" sx={{ fontWeight: 500 }}>
          Detail Pembayaran
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton onClick={() => navigate('/admin/payments')} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <PaymentIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" fontWeight={700} color="text.primary">
              Detail Pembayaran
            </Typography>
            <Typography variant="body2" color="text.secondary">
              ID: {payment.id}
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => setEditDialogOpen(true)}
          sx={{ borderRadius: 2, px: 3, py: 1 }}
        >
          Edit Status
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
          {/* Payment Information */}
          <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 16px rgba(150, 130, 219, 0.12)' }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <PaymentIcon sx={{ fontSize: '1.5rem', color: 'primary.main' }} />
                <Typography variant="h6" fontWeight={600}>
                  Informasi Pembayaran
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Status
                  </Typography>
                  <Chip
                    label={getPaymentStatusText(payment.payment_status)}
                    color={getPaymentStatusColor(payment.payment_status) as any}
                    sx={{ fontWeight: 600 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Metode Pembayaran
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {getPaymentMethodText(payment.payment_method)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Jumlah
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="primary.main">
                    {formatPrice(parseFloat(payment.amount || 0))}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Currency
                  </Typography>
                  <Typography variant="body1" fontWeight={500}>
                    {payment.currency_code || 'IDR'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Payment Reference
                  </Typography>
                  <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                    {payment.payment_reference || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Tanggal Pembayaran
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(payment.payment_date)}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Order Information */}
          {payment.order && (
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 16px rgba(150, 130, 219, 0.12)' }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                  <ReceiptIcon sx={{ fontSize: '1.5rem', color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight={600}>
                    Informasi Order
                  </Typography>
                </Box>

                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Order ID
                    </Typography>
                    <Typography variant="body1" fontWeight={500} sx={{ fontFamily: 'monospace' }}>
                      {payment.order.id}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Status Order
                    </Typography>
                    <Chip
                      label={getOrderStatusText(payment.order.status)}
                      color={getOrderStatusColor(payment.order.status) as any}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Total Amount
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formatPrice(parseFloat(payment.order.total_amount || 0))}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Shipping Cost
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formatPrice(parseFloat(payment.order.shipping_cost || 0))}
                    </Typography>
                  </Grid>
                </Grid>

                {/* Order Items */}
                {payment.order.order_items && payment.order.order_items.length > 0 && (
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                      Order Items
                    </Typography>
                    <TableContainer component={Paper} variant="outlined">
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Produk</TableCell>
                            <TableCell>Varian</TableCell>
                            <TableCell align="right">Quantity</TableCell>
                            <TableCell align="right">Harga</TableCell>
                            <TableCell align="right">Subtotal</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {payment.order.order_items.map((item: any) => (
                            <TableRow key={item.id}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  {item.product_variant?.product?.product_images?.[0]?.image_name && (
                                    <Box
                                      component="img"
                                      src={getImageUrl(item.product_variant.product.product_images[0].image_name)}
                                      alt={item.product_variant.product.name}
                                      sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 1 }}
                                    />
                                  )}
                                  <Typography variant="body2">
                                    {item.product_variant?.product?.name || 'N/A'}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {item.product_variant?.variant_name || 'N/A'}
                                </Typography>
                                {item.product_variant?.variant_options && item.product_variant.variant_options.length > 0 && (
                                  <Typography variant="caption" color="text.secondary">
                                    {item.product_variant.variant_options.map((opt: any) => `${opt.option_name}: ${opt.option_value}`).join(', ')}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2">
                                  {item.quantity}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2">
                                  {formatPrice(parseFloat(item.price || 0))}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" fontWeight={500}>
                                  {formatPrice(parseFloat(item.price || 0) * item.quantity)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} md={4}>
          {/* Customer Info */}
          {payment.order?.user && (
            <Card sx={{ mb: 3, borderRadius: 3, boxShadow: '0 4px 16px rgba(150, 130, 219, 0.12)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Informasi Customer
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Nama"
                      secondary={payment.order.user.full_name || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Email"
                      secondary={payment.order.user.email || 'N/A'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Telepon"
                      secondary={payment.order.user.phone || 'N/A'}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          )}

          {/* Address Info */}
          {payment.order?.address && (
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 16px rgba(150, 130, 219, 0.12)' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Alamat Pengiriman
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>{payment.order.address.recipient_name || 'N/A'}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {payment.order.address.address_line || 'N/A'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {payment.order.address.city || 'N/A'}, {payment.order.address.province || 'N/A'} {payment.order.address.postal_code || 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Status Pembayaran</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Status Pembayaran</InputLabel>
              <Select
                value={editData.payment_status}
                onChange={(e) => setEditData({ ...editData, payment_status: e.target.value })}
                label="Status Pembayaran"
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="paid">Paid</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
                <MenuItem value="refunded">Refunded</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Tanggal Pembayaran"
              type="date"
              value={editData.payment_date}
              onChange={(e) => setEditData({ ...editData, payment_date: e.target.value })}
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

