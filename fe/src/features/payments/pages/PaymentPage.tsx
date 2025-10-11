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
  CircularProgress,
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
import MidtransPaymentButton from '../components/MidtransPaymentButton';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';

export default function PaymentPage() {
  const theme = useTheme();
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string>('midtrans'); // Auto-select Midtrans
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentStatus, setPaymentStatus] = useState<any>(null);
  
  const { formatPrice, loading: currencyLoading, error: currencyError } = useCurrencyConversion();
  const [checkingPayment, setCheckingPayment] = useState(false);

  const { setCurrentPaymentInfo, addPayment } = usePaymentStore();

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

  const fetchPaymentMethods = async () => {
    try {
      const response = await orderApi.getPaymentMethods();
      if (response.success) {
        setPaymentMethods(response.data);
      }
    } catch (err) {
      console.error('Error fetching payment methods:', err);
    }
  };

  const checkPaymentStatus = async () => {
    if (!orderId) return;
    
    try {
      setCheckingPayment(true);
      const response = await orderApi.getPaymentStatus(orderId);
      if (response.success) {
        setPaymentStatus(response.data);
        
        // If there's an active payment, set the method
        if (response.data.has_active_payment) {
          setSelectedMethod(response.data.active_payment.payment_method);
        }
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    } finally {
      setCheckingPayment(false);
    }
  };

  const cancelActivePayment = async () => {
    if (!orderId) return;
    
    try {
      setProcessing(true);
      const response = await orderApi.cancelActivePayment(orderId);
      if (response.success) {
        setPaymentStatus(null);
        setSelectedMethod('paypal');
        setError(null);
      } else {
        setError(response.error || 'Gagal membatalkan pembayaran');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || 'Gagal membatalkan pembayaran');
    } finally {
      setProcessing(false);
    }
  };

  const handleContinuePayment = async () => {
    if (!paymentStatus?.active_payment) return;
    
    try {
      setProcessing(true);
      
      // Use existing payment reference to open popup
      if (paymentStatus.active_payment.payment_method === 'midtrans') {
        // Load Snap script if not already loaded
        if (!window.snap) {
          const script = document.createElement('script');
          script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
          script.setAttribute('data-client-key', 'SB-Mid-client-UtRW_uI4F5Wz6Pv8Tq8TQ');
          script.onload = () => {
            // Open popup after script loads
            window.snap.pay(paymentStatus.active_payment.payment_reference, {
              onSuccess: (result: any) => {
                console.log('Payment success:', result);
                addPayment(result);
                navigate(`/payment/success?order_id=${orderId}`, {
                  state: { orderId: orderId }
                });
              },
              onPending: (result: any) => {
                console.log('Payment pending:', result);
                addPayment(result);
                navigate(`/payment/success?order_id=${orderId}`, {
                  state: { orderId: orderId }
                });
              },
              onError: (result: any) => {
                console.log('Payment error:', result);
                setError('Pembayaran gagal: ' + (result.message || 'Unknown error'));
                setProcessing(false);
              },
              onClose: () => {
                console.log('Payment popup closed by user');
                setProcessing(false);
                // Don't redirect, just reset the processing state
              }
            });
          };
          script.onerror = () => {
            setError('Gagal memuat Snap script');
            setProcessing(false);
          };
          document.head.appendChild(script);
        } else {
          // Script already loaded, open popup directly
          window.snap.pay(paymentStatus.active_payment.payment_reference, {
            onSuccess: (result: any) => {
              console.log('Payment success:', result);
              addPayment(result);
              navigate(`/payment/success?order_id=${orderId}`, {
                state: { orderId: orderId }
              });
            },
            onPending: (result: any) => {
              console.log('Payment pending:', result);
              addPayment(result);
              navigate(`/payment/success?order_id=${orderId}`, {
                state: { orderId: orderId }
              });
            },
            onError: (result: any) => {
              console.log('Payment error:', result);
              setError('Pembayaran gagal: ' + (result.message || 'Unknown error'));
              setProcessing(false);
            },
            onClose: () => {
              console.log('Payment popup closed by user');
              setProcessing(false);
              // Don't redirect, just reset the processing state
            }
          });
        }
      } else {
        // For other payment methods, redirect to their respective pages
        setError('Metode pembayaran ini tidak mendukung lanjutan pembayaran. Silakan batalkan dan buat pembayaran baru.');
        setProcessing(false);
      }
    } catch (error: any) {
      console.error('Continue payment error:', error);
      setError('Gagal melanjutkan pembayaran: ' + (error.message || 'Unknown error'));
      setProcessing(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrder();
      fetchPaymentMethods();
      checkPaymentStatus();
      
      // Get selected payment method from location state
      const state = location.state as any;
      if (state?.selectedPaymentMethod) {
        setSelectedMethod(state.selectedPaymentMethod);
      }
    }
  }, [orderId, location.state]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          <Typography>Loading...</Typography>
        </Container>
      </Box>
    );
  }

  if (currencyLoading) {
    return (
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto' }}>
            Memuat kurs mata uang...
          </Alert>
        </Container>
      </Box>
    );
  }

  if (currencyError) {
    return (
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto' }}>
            Gagal memuat kurs mata uang: {currencyError}
          </Alert>
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
            Pilih metode pembayaran yang paling nyaman untuk Anda
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Payment Methods Selection */}
          <Grid item xs={12} lg={8}>
            {/* Active Payment Status Alert */}
            {paymentStatus?.has_active_payment && (
              <Card sx={{ mb: 4, border: '2px solid', borderColor: 'warning.main' }}>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                    <Box sx={{ color: 'warning.main' }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                      </svg>
                    </Box>
                    <Typography variant="h6" fontWeight={600} color="warning.main">
                      Sesi Pembayaran Aktif
                    </Typography>
                  </Stack>
                  
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    Anda sudah memiliki sesi pembayaran aktif dengan metode <strong>{paymentStatus.active_payment.payment_method}</strong>.
                    Sesi ini akan berakhir pada <strong>{formatDate(paymentStatus.active_payment.expires_at)}</strong>.
                  </Typography>
                  
                  <Stack direction="row" spacing={2}>
                    <Button
                      variant="outlined"
                      color="warning"
                      onClick={cancelActivePayment}
                      disabled={processing}
                      startIcon={processing ? <CircularProgress size={16} /> : null}
                    >
                      {processing ? 'Membatalkan...' : 'Batalkan Sesi Pembayaran'}
                    </Button>
                    
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={handleContinuePayment}
                      disabled={processing}
                      startIcon={processing ? <CircularProgress size={16} /> : null}
                    >
                      {processing ? 'Membuka Pembayaran...' : 'Lanjutkan Pembayaran'}
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            )}

            <Card sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                  Metode Pembayaran
                </Typography>

                {/* Midtrans Payment Method */}
                <Box
                  sx={{
                    p: 3,
                    border: `2px solid ${theme.palette.primary.main}`,
                    borderRadius: 2,
                    backgroundColor: theme.palette.primary.light + '10',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center">
                    <CreditCardIcon sx={{ fontSize: '2rem', color: theme.palette.primary.main }} />
                    
                    <Box sx={{ flex: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          Midtrans
                        </Typography>
                        <Box
                          sx={{
                            backgroundColor: theme.palette.success.main,
                            color: 'white',
                            px: 1,
                            py: 0.25,
                            borderRadius: 1,
                            fontSize: '0.7rem',
                            fontWeight: 600,
                          }}
                        >
                          Dipilih
                        </Box>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        Pembayaran aman dengan berbagai metode: Kartu Kredit/Debit, E-Wallet, Bank Transfer, dan lainnya
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </CardContent>
            </Card>

            {/* Payment Button */}
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                  Pembayaran Midtrans
                </Typography>

                {!paymentStatus?.has_active_payment && (
                  <MidtransPaymentButton
                    order={order}
                    onSuccess={(payment) => {
                      console.log('Midtrans payment success');
                      addPayment(payment);
                    }}
                    onError={(error) => setError(error)}
                  />
                )}

                {paymentStatus?.has_active_payment && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      <strong>Sesi pembayaran aktif terdeteksi!</strong><br />
                      Anda sudah memiliki sesi pembayaran yang aktif. 
                      Batalkan sesi pembayaran untuk membuat pembayaran baru atau lanjutkan pembayaran yang sudah ada.
                    </Typography>
                  </Alert>
                )}
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
