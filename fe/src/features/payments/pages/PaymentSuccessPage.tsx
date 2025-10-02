import {
  Container,
  Typography,
  Box,
  Stack,
  Alert,
  Button,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Home as HomeIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { orderApi } from '@/features/orders/services/orderApi';
import { Order } from '@/features/orders/types';

// Simple price formatter for IDR
const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export default function PaymentSuccessPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // Get order ID from URL parameter or navigation state
  const orderIdFromUrl = searchParams.get('order_id');
  const orderIdFromState = location.state?.orderId;
  const orderId = orderIdFromUrl || orderIdFromState;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    console.log('PaymentSuccessPage - Order ID Debug:', {
      orderIdFromUrl,
      orderIdFromState,
      finalOrderId: orderId,
      locationState: location.state,
      searchParams: Object.fromEntries(searchParams.entries())
    });

    if (!orderId) {
      setError('Order ID tidak ditemukan dalam URL atau state');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching order with ID:', orderId);
      const response = await orderApi.getOrderById(orderId);
      
      if (response.success) {
        setOrder(response.data);
      } else {
        setError('Order tidak ditemukan di server');
      }
    } catch (err: any) {
      console.error('Error fetching order:', err);
      setError(err.response?.data?.error || 'Gagal memuat order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handleViewOrder = () => {
    if (orderId) {
      navigate(`/orders/${orderId}`);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', py: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography>Memuat...</Typography>
      </Box>
    );
  }

  if (error || !order) {
    return (
      <Box sx={{ minHeight: '100vh', py: 8 }}>
        <Container maxWidth="md">
          <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto' }}>
            {error || 'Order tidak ditemukan'}
          </Alert>
          
          {/* Debug Info */}
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>Debug Info:</strong><br />
              Order ID from URL: {orderIdFromUrl || 'null'}<br />
              Order ID from State: {orderIdFromState || 'null'}<br />
              Final Order ID: {orderId || 'null'}
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button variant="contained" onClick={handleGoHome} startIcon={<HomeIcon />}>
              Kembali ke Beranda
            </Button>
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', py: 8 }}>
      <Container maxWidth="md">
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <CheckCircleIcon 
            sx={{ 
              fontSize: 80, 
              color: 'success.main', 
              mb: 3,
              animation: 'pulse 2s infinite',
              '@keyframes pulse': {
                '0%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.05)' },
                '100%': { transform: 'scale(1)' },
              },
            }} 
          />
          <Typography variant="h3" fontWeight={700} color="success.main" sx={{ mb: 2 }}>
            Pembayaran Berhasil!
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Terima kasih atas pembelian Anda. Pesanan Anda sedang diproses.
          </Typography>
        </Box>

        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
              Detail Pesanan
            </Typography>
            
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1" color="text.secondary">Order ID:</Typography>
                <Typography variant="body1" fontWeight={500}>{order.id}</Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1" color="text.secondary">Total Pembayaran:</Typography>
                <Typography variant="h6" fontWeight={600} color="primary.main">
                  {formatPrice(Number(order.total_amount) + Number(order.shipping_cost))}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1" color="text.secondary">Status:</Typography>
                <Typography 
                  variant="body1" 
                  fontWeight={500}
                  color={order.payment_status === 'paid' ? 'success.main' : 'warning.main'}
                >
                  {order.payment_status === 'paid' ? 'Lunas' : order.payment_status}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1" color="text.secondary">Tanggal Pesanan:</Typography>
                <Typography variant="body1" fontWeight={500}>
                  {new Date(order.created_at).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Alert severity="info" sx={{ mb: 4 }}>
          <Typography variant="body2">
            Kami akan mengirimkan email konfirmasi dan detail pengiriman ke alamat email Anda. 
            Anda juga dapat melacak status pesanan di halaman "Pesanan Saya".
          </Typography>
        </Alert>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
          <Button
            variant="contained"
            size="large"
            startIcon={<ReceiptIcon />}
            onClick={handleViewOrder}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            Lihat Detail Pesanan
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            startIcon={<HomeIcon />}
            onClick={handleGoHome}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            Kembali ke Beranda
          </Button>
        </Stack>
      </Container>
    </Box>
  );
}
