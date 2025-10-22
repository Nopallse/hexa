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
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/features/cart/store/cartStore';
import { useOrderStore } from '@/features/orders/store/orderStore';
import { orderApi } from '@/features/orders/services/orderApi';
import { CartItem } from '@/features/cart/types';
import { PaymentMethod } from '@/features/orders/types';
import CheckoutSummary from '../components/CheckoutSummary';
import AddressSelector from '../components/AddressSelector';
import ShippingMethodSelector from '../components/ShippingMethodSelector';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';
import { ShippingMethod } from '../types/shipping';

export default function CheckoutPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { formatPrice, loading: currencyLoading, error: currencyError } = useCurrencyConversion();
  
  const [loading, setLoading] = useState(true);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderCreated, setOrderCreated] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [selectedAddressData, setSelectedAddressData] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>('midtrans'); // Auto-select Midtrans
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<ShippingMethod | null>(null);
  const [shippingCost, setShippingCost] = useState(15000); // Default shipping cost

  const { items: cartItems, clearCart } = useCartStore();
  const { addOrder, setPaymentMethods, paymentMethods } = useOrderStore();

  // Filter available cart items with memoization
  const availableItems = React.useMemo(() => 
    cartItems.filter(item => item.product_variant.product.deleted_at === null),
    [cartItems]
  );

  const subtotal = React.useMemo(() => 
    availableItems.reduce((sum, item) => 
      sum + (parseFloat(item.product_variant.price) * item.quantity), 0
    ), [availableItems]
  );

  const total = React.useMemo(() => 
    subtotal + shippingCost,
    [subtotal, shippingCost]
  );

  const fetchPaymentMethods = React.useCallback(async () => {
    try {
      const response = await orderApi.getPaymentMethods();
      if (response.success) {
        setPaymentMethods(response.data);
      }
    } catch (err) {
      console.error('Error fetching payment methods:', err);
    }
  }, [setPaymentMethods]);

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

    // Only fetch payment methods once
    if (paymentMethods.length === 0) {
      fetchPaymentMethods();
    }
    
    setLoading(false);
  }, [cartItems.length, navigate, creatingOrder, orderCreated, fetchPaymentMethods, paymentMethods.length]);

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
                onAddressSelect={(addressId) => {
                  setSelectedAddress(addressId);
                  // Find address data from addresses list
                  const addressData = addresses.find(addr => addr.id === addressId);
                  setSelectedAddressData(addressData);
                  // Reset shipping method when address changes
                  setSelectedShippingMethod(null);
                  setShippingCost(15000); // Reset to default
                }}
                onAddressesLoaded={setAddresses}
              />

              {/* Shipping Method Selection */}
              <ShippingMethodSelector
                selectedAddress={selectedAddressData}
                cartItems={availableItems}
                selectedMethod={selectedShippingMethod ? `${selectedShippingMethod.courier_code}_${selectedShippingMethod.courier_service_code}` : null}
                onMethodSelect={(method: ShippingMethod) => {
                  setSelectedShippingMethod(method);
                  setShippingCost(method.price);
                }}
              />
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
              disabled={!selectedAddress || !selectedShippingMethod}
              selectedPaymentMethod={selectedPaymentMethod}
              selectedShippingMethod={selectedShippingMethod}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
}