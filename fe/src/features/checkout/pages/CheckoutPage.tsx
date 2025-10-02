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
} from '@mui/material';
import {
  Home,
  ShoppingCart,
  Payment,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/features/cart/store/cartStore';
import { useOrderStore } from '@/features/orders/store/orderStore';
import { orderApi } from '@/features/orders/services/orderApi';
import { CartItem } from '@/features/cart/types';
import { PaymentMethod } from '@/features/orders/types';
import CheckoutSummary from '../components/CheckoutSummary';
import AddressSelector from '../components/AddressSelector';
import PaymentMethodSelector from '../components/PaymentMethodSelector';

export default function CheckoutPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [shippingCost, setShippingCost] = useState(15000); // Default shipping cost

  const { items: cartItems, clearCart } = useCartStore();
  const { addOrder, setPaymentMethods, paymentMethods } = useOrderStore();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Filter available cart items
  const availableItems = cartItems.filter(item => item.product_variant.product.deleted_at === null);

  const subtotal = availableItems.reduce((sum, item) => 
    sum + (parseFloat(item.product_variant.price) * item.quantity), 0
  );

  const total = subtotal + shippingCost;

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

  const handleCreateOrder = async () => {
    if (!selectedAddress) {
      setError('Pilih alamat pengiriman terlebih dahulu');
      return;
    }

    if (!selectedPaymentMethod) {
      setError('Pilih metode pembayaran terlebih dahulu');
      return;
    }

    if (availableItems.length === 0) {
      setError('Tidak ada item yang tersedia untuk checkout');
      return;
    }

    try {
      setCreatingOrder(true);
      setError(null);

      const response = await orderApi.createOrder({
        address_id: selectedAddress,
        shipping_cost: shippingCost
      });

      if (response.success) {
        addOrder(response.data);
        clearCart();
        // Redirect to payment page instead of order detail
        navigate(`/payment/${response.data.id}`, { 
          state: { 
            message: 'Order berhasil dibuat! Silakan lakukan pembayaran.' 
          } 
        });
      }
    } catch (err: any) {
      console.error('Error creating order:', err);
      setError(err.response?.data?.error || 'Gagal membuat order');
    } finally {
      setCreatingOrder(false);
    }
  };

  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/cart');
      return;
    }

    fetchPaymentMethods();
    setLoading(false);
  }, [cartItems.length, navigate]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          <Typography>Loading...</Typography>
        </Container>
      </Box>
    );
  }

  if (availableItems.length === 0) {
    return (
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          <Alert severity="warning" sx={{ mb: 4 }}>
            Tidak ada item yang tersedia untuk checkout. Semua item di keranjang sudah tidak tersedia.
          </Alert>
          <Button
            variant="contained"
            onClick={() => navigate('/cart')}
          >
            Kembali ke Keranjang
          </Button>
        </Container>
      </Box>
    );
  }

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
            onClick={() => navigate('/cart')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' },
            }}
          >
            <ShoppingCart sx={{ mr: 0.5, fontSize: '1rem' }} />
            Keranjang
          </Link>
          <Typography variant="body2" color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <Payment sx={{ mr: 0.5, fontSize: '1rem' }} />
            Checkout
          </Typography>
        </Breadcrumbs>

        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
            Checkout
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Lengkapi informasi pengiriman dan pembayaran
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Main Content */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', lg: 'row' }, 
          gap: 4, 
          alignItems: 'flex-start' 
        }}>
          {/* Checkout Form */}
          <Box sx={{ 
            flex: 1, 
            minWidth: 0,
            order: { xs: 1, lg: 1 }
          }}>
            <Stack spacing={4}>
              {/* Address Selection */}
              <AddressSelector
                selectedAddress={selectedAddress}
                onAddressSelect={setSelectedAddress}
              />

              {/* Payment Method Selection */}
              <PaymentMethodSelector
                paymentMethods={paymentMethods}
                selectedMethod={selectedPaymentMethod}
                onMethodSelect={setSelectedPaymentMethod}
              />

              {/* Shipping Cost */}
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    Biaya Pengiriman
                  </Typography>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body1">
                      Standard Delivery (2-3 hari kerja)
                    </Typography>
                    <Typography variant="h6" color="primary.main" fontWeight={700}>
                      {formatPrice(shippingCost)}
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Box>

          {/* Order Summary */}
          <Box sx={{ 
            width: { xs: '100%', lg: '400px' }, 
            flexShrink: 0,
            order: { xs: 2, lg: 2 }
          }}>
            <CheckoutSummary
              items={availableItems}
              subtotal={subtotal}
              shippingCost={shippingCost}
              total={total}
              onCreateOrder={handleCreateOrder}
              creatingOrder={creatingOrder}
              disabled={!selectedAddress || !selectedPaymentMethod}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}