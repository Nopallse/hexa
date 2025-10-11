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
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';

export default function CheckoutPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { formatPrice, loading: currencyLoading, error: currencyError } = useCurrencyConversion();
  
  const [loading, setLoading] = useState(true);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>('midtrans'); // Auto-select Midtrans
  const [shippingCost, setShippingCost] = useState(15000); // Default shipping cost

  const { items: cartItems, clearCart } = useCartStore();
  const { addOrder, setPaymentMethods, paymentMethods } = useOrderStore();

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

    if (availableItems.length === 0) {
      setError('Tidak ada item yang tersedia untuk checkout');
      return;
    }

    try {
      setCreatingOrder(true);
      setError(null);

      // Create order first
      const response = await orderApi.createOrder({
        address_id: selectedAddress,
        shipping_cost: shippingCost
      });

      if (response.success) {
        addOrder(response.data);
        setOrderCreated(true);
        clearCart();
        
        // Always redirect to orders page
        navigate(`/orders/${(response.data as any).order_id}`, { 
          state: { 
            message: 'Order berhasil dibuat! Silakan lakukan pembayaran.',
            selectedPaymentMethod: selectedPaymentMethod
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
    // Only redirect to cart if we're not in the middle of creating an order and order hasn't been created
    if (cartItems.length === 0 && !creatingOrder && !orderCreated) {
      navigate('/cart');
      return;
    }

    fetchPaymentMethods();
    setLoading(false);
  }, [cartItems.length, navigate, creatingOrder, orderCreated]);

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


        {/* Page Header */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" fontWeight={600} sx={{ mb: 1, color: 'text.primary' }}>
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

        {/* Currency Loading State */}
        {currencyLoading && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Loading exchange rates...
          </Alert>
        )}

        {/* Currency Error State */}
        {currencyError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Failed to load exchange rates. Prices will be displayed in default currency.
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

              {/* Shipping Cost */}
              <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                    Biaya Pengiriman
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    py: 2,
                    px: 2,
                    backgroundColor: 'grey.50',
                    borderRadius: 2,
                  }}>
                    <Typography variant="body1" fontWeight={500}>
                      Standard Delivery (2-3 hari kerja)
                    </Typography>
                    <Typography variant="h6" color="primary.main" fontWeight={700}>
                      {formatPrice(shippingCost)}
                    </Typography>
                  </Box>
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
              disabled={!selectedAddress}
              selectedPaymentMethod={selectedPaymentMethod}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}