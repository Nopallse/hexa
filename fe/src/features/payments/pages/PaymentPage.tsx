import {
  Container,
  Typography,
  Box,
  Stack,
  Alert,
  Card,
  CardContent,
  Button,
  useTheme,
  Breadcrumbs,
  Link,
  Divider,
  Grid,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Home,
  Receipt,
  Payment as PaymentIcon,
  ArrowBack,
  CreditCard as CreditCardIcon,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Order } from '@/features/orders/types';
import { PaymentMethod } from '@/features/orders/types';
import { paymentApi } from '../services/paymentApi';
import { orderApi } from '@/features/orders/services/orderApi';
import { usePaymentStore } from '../store/paymentStore';
import PaymentMethodCard from '../components/PaymentMethodCard';
import PayPalPaymentButton from '../components/PayPalPaymentButton';

export default function PaymentPage() {
  const theme = useTheme();
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>('paypal');

  const { setCurrentPaymentInfo, addPayment } = usePaymentStore();

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

  const fetchOrder = async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await orderApi.getOrderById(orderId);

      if (response.success) {
        setOrder(response.data);
        
        // Check if order is already paid
        if (response.data.payment_status === 'paid') {
          navigate(`/orders/${orderId}`, {
            state: { message: 'Order sudah dibayar' }
          });
          return;
        }

        // Check if order can be paid
        if (response.data.status === 'cancelled') {
          setError('Order sudah dibatalkan dan tidak dapat dibayar');
          return;
        }
      } else {
        setError('Order tidak ditemukan');
      }
    } catch (err: any) {
      console.error('Error fetching order:', err);
      setError(err.response?.data?.error || 'Gagal memuat order');
    } finally {
      setLoading(false);
    }
  };

  // PayPal sudah dipilih secara default, tidak perlu fetch payment methods

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          <Typography>Loading...</Typography>
        </Container>
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto' }}>
            {error || 'Order tidak ditemukan'}
          </Alert>
        </Container>
      </Box>
    );
  }

  const totalAmount = order.total_amount + order.shipping_cost;

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
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate(`/orders/${order.id}`)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' },
            }}
          >
            #{order.id.slice(-8).toUpperCase()}
          </Link>
          <Typography variant="body2" color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <PaymentIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
            Pembayaran
          </Typography>
        </Breadcrumbs>

        {/* Back Button */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(`/orders/${order.id}`)}
          sx={{ mb: 4 }}
        >
          Kembali ke Detail Order
        </Button>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
            Pembayaran Order #{order.id.slice(-8).toUpperCase()}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Lakukan pembayaran menggunakan PayPal Payment Gateway
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* PayPal Payment */}
          <Grid item xs={12} lg={8}>
            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                  Metode Pembayaran - PayPal
                </Typography>

                {/* PayPal Info */}
                <Box sx={{ 
                  p: 3, 
                  backgroundColor: '#f8f9fa', 
                  borderRadius: 2, 
                  mb: 3,
                  border: '1px solid #e9ecef'
                }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                    <CreditCardIcon sx={{ fontSize: '2rem', color: '#003087' }} />
                    <Box>
                      <Typography variant="h6" fontWeight={600} color="#003087">
                        PayPal Payment Gateway
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pembayaran aman dan terpercaya dengan PayPal
                      </Typography>
                    </Box>
                  </Stack>
                  
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Keunggulan PayPal:</strong><br />
                      • Pembayaran instan dan aman<br />
                      • Dilindungi oleh PayPal Buyer Protection<br />
                      • Tidak perlu berbagi informasi kartu kredit<br />
                      • Mendukung berbagai mata uang
                    </Typography>
                  </Alert>
                  
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      <strong>Mode Sandbox:</strong> Ini adalah environment testing PayPal. 
                      Gunakan akun PayPal sandbox untuk testing. Tidak ada transaksi sungguhan.
                    </Typography>
                  </Alert>
                </Box>

                {/* PayPal Payment Button */}
                <PayPalPaymentButton
                  order={order}
                  onSuccess={(payment) => {
                    console.log('Payment success, navigating with order ID:', order.id);
                    addPayment(payment);
                    // Navigate with both state and URL parameter for redundancy
                    navigate(`/payment/success?order_id=${order.id}`, {
                      state: { orderId: order.id }
                    });
                  }}
                  onError={(error) => setError(error)}
                />
              </CardContent>
            </Card>

            {/* PayPal Information */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Informasi PayPal
                </Typography>
                
                <Stack spacing={2}>
                  <Typography variant="body1">
                    <strong>Cara Pembayaran PayPal:</strong>
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    1. Klik tombol "Bayar dengan PayPal" di atas<br />
                    2. Anda akan diarahkan ke halaman PayPal<br />
                    3. Login ke akun PayPal Anda<br />
                    4. Konfirmasi pembayaran<br />
                    5. Anda akan diarahkan kembali ke halaman sukses
                  </Typography>
                  
                  <Alert severity="info">
                    <Typography variant="body2">
                      <strong>Catatan:</strong> Jika Anda belum memiliki akun PayPal, 
                      Anda dapat membuat akun baru langsung di halaman PayPal.
                    </Typography>
                  </Alert>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Order Summary */}
          <Grid item xs={12} lg={4}>
            <Card sx={{ position: 'sticky', top: 24 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                  Ringkasan Pembayaran
                </Typography>
                
                {/* Order Info */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Order ID
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    #{order.id.slice(-8).toUpperCase()}
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                    Tanggal Order
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {formatDate(order.created_at)}
                  </Typography>
                </Box>

                <Divider sx={{ my: 3 }} />

                {/* Price Breakdown */}
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
                      Total Pembayaran
                    </Typography>
                    <Typography variant="h6" fontWeight={700} color="primary.main">
                      {formatPrice(totalAmount)}
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ my: 3 }} />

                {/* Order Items Preview */}
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  Item ({order.order_items.length})
                </Typography>
                <Stack spacing={1}>
                  {order.order_items.slice(0, 3).map((item) => {
                    const primaryImage = item.product_variant.product.product_images?.[0]?.image_name;
                    
                    return (
                      <Box
                        key={item.id}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 2,
                          p: 1,
                          borderRadius: 1,
                          backgroundColor: '#f8f9fa',
                        }}
                      >
                        <Avatar
                          src={primaryImage || `https://placehold.co/40x40/9682DB/FFFFFF/png?text=${encodeURIComponent(item.product_variant.product.name)}`}
                          alt={item.product_variant.product.name}
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 1,
                            flexShrink: 0,
                          }}
                          variant="rounded"
                        />
                        
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={600} noWrap>
                            {item.product_variant.product.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Qty: {item.quantity}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                  
                  {order.order_items.length > 3 && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 1 }}>
                      dan {order.order_items.length - 3} item lainnya
                    </Typography>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
