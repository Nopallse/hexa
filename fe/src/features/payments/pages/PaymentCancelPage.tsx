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
  Cancel as CancelIcon,
  Home as HomeIcon,
  ShoppingCart as CartIcon,
} from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { orderApi } from '@/features/orders/services/orderApi';
import { Order } from '@/features/orders/types';

export default function PaymentCancelPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id');
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = async () => {
    if (!orderId) {
      setError('Order ID tidak ditemukan');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await orderApi.getOrderById(orderId);
      
      if (response.success) {
        setOrder(response.data);
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

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const handleTryAgain = () => {
    if (orderId) {
      navigate(`/payment/${orderId}`);
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleViewCart = () => {
    navigate('/cart');
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
          <CancelIcon 
            sx={{ 
              fontSize: 80, 
              color: 'error.main', 
              mb: 3,
            }} 
          />
          <Typography variant="h3" fontWeight={700} color="error.main" sx={{ mb: 2 }}>
            Pembayaran Dibatalkan
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Pembayaran Anda telah dibatalkan. Tidak ada biaya yang dikenakan.
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
                <Typography variant="body1" color="text.secondary">Total Pesanan:</Typography>
                <Typography variant="h6" fontWeight={600} color="primary.main">
                  ${(order.total_amount + order.shipping_cost).toFixed(2)}
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1" color="text.secondary">Status:</Typography>
                <Typography variant="body1" fontWeight={500} color="warning.main">
                  Pembayaran Dibatalkan
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Alert severity="warning" sx={{ mb: 4 }}>
          <Typography variant="body2">
            Pesanan Anda masih tersimpan dan dapat dilanjutkan pembayarannya kapan saja. 
            Anda juga dapat mengubah metode pembayaran atau membatalkan pesanan.
          </Typography>
        </Alert>

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
          <Button
            variant="contained"
            size="large"
            startIcon={<CartIcon />}
            onClick={handleTryAgain}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            Coba Bayar Lagi
          </Button>
          
          <Button
            variant="outlined"
            size="large"
            startIcon={<CartIcon />}
            onClick={handleViewCart}
            sx={{
              px: 4,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            Lihat Keranjang
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
