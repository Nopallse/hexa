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
  useMediaQuery,
} from '@mui/material';
import {
  Home,
  ShoppingCart,
  Payment,
} from '@mui/icons-material';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCartStore } from '@/store/cartStore';
import { useOrderStore } from '@/features/orders/store/orderStore';
import { orderApi } from '@/features/orders/services/orderApi';
import { CartItem } from '@/features/cart/types';
import { PaymentMethod } from '@/features/orders/types';
import CheckoutSummary from '../components/CheckoutSummary';
import ShippingAddress from '../components/ShippingAddress';
import ShippingMethodSelector from '../components/ShippingMethodSelector';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';
import { ShippingMethod } from '../types/shipping';
import { getProductImageUrl } from '@/utils/image';

export default function CheckoutPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
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
  const [selectedCartItemIds, setSelectedCartItemIds] = useState<string[]>([]);

  const { items: cartItems, clearCart, syncWithServer } = useCartStore();
  const { addOrder, setPaymentMethods, paymentMethods } = useOrderStore();

  // Get selected cart item IDs from navigation state
  useEffect(() => {
    const state = location.state as { selectedCartItemIds?: string[] } | null;
    if (state?.selectedCartItemIds) {
      setSelectedCartItemIds(state.selectedCartItemIds);
    } else {
      // If no selected items, redirect back to cart
      navigate('/cart');
    }
  }, [location.state, navigate]);

  // Filter available cart items with memoization - only selected items
  const availableItems = React.useMemo(() => {
    const allAvailable = cartItems.filter(item => item.product_variant.product.deleted_at === null);
    if (selectedCartItemIds.length === 0) {
      return allAvailable;
    }
    return allAvailable.filter(item => selectedCartItemIds.includes(item.id));
  }, [cartItems, selectedCartItemIds]);

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

    if (selectedCartItemIds.length === 0) {
      setError('Tidak ada item yang dipilih untuk checkout');
      return;
    }

    try {
      setCreatingOrder(true);
      setError(null);

      // Create order with selected cart item IDs
      const response = await orderApi.createOrder({
        address_id: selectedAddress,
        shipping_cost: shippingCost,
        cart_item_ids: selectedCartItemIds,
        courier_code: selectedShippingMethod?.courier_code,
        courier_service_code: selectedShippingMethod?.courier_service_code
      });

      if (response.success) {
        addOrder(response.data);
        setOrderCreated(true);
        // Don't clear entire cart, only selected items will be removed by backend
        
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
    const initializeCheckout = async () => {
      try {
        // Sync cart with server first
        await syncWithServer();
      } catch (error) {
        console.error('Error syncing cart:', error);
      }
    };

    initializeCheckout();
  }, [syncWithServer]);

  useEffect(() => {
    // Only redirect to cart if we're not in the middle of creating an order and order hasn't been created
    // and if no selected items
    if (selectedCartItemIds.length === 0 && !creatingOrder && !orderCreated && !loading) {
      navigate('/cart');
      return;
    }

    // Only fetch payment methods once
    if (paymentMethods.length === 0) {
      fetchPaymentMethods();
    }
    
    if (loading) {
      setLoading(false);
    }
  }, [selectedCartItemIds.length, navigate, creatingOrder, orderCreated, fetchPaymentMethods, paymentMethods.length, loading]);

  // Sync selectedAddressData when addresses or selectedAddress changes
  useEffect(() => {
    if (selectedAddress && addresses.length > 0) {
      const addressData = addresses.find(addr => addr.id === selectedAddress);
      if (addressData && (!selectedAddressData || selectedAddressData.id !== addressData.id)) {
        setSelectedAddressData(addressData);
      }
    } else if (!selectedAddress && addresses.length > 0 && !selectedAddressData) {
      // Auto-select primary address if no address selected
      const primaryAddress = addresses.find(addr => addr.is_primary) || addresses[0];
      if (primaryAddress) {
        setSelectedAddress(primaryAddress.id);
        setSelectedAddressData(primaryAddress);
      }
    }
  }, [selectedAddress, addresses, selectedAddressData]);

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
    <Box sx={{ minHeight: '100vh', py: { xs: 2, sm: 4 } }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>


        {/* Page Header */}
        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          <Typography 
            variant="h4" 
            fontWeight={600} 
            sx={{ 
              mb: 1, 
              color: 'text.primary',
              fontSize: { xs: '1.5rem', sm: '2rem' }
            }}
          >
            Checkout
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            Lengkapi informasi pengiriman dan pembayaran
          </Typography>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: { xs: 2, sm: 4 },
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }} 
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Currency Loading State */}
        {currencyLoading && (
          <Alert 
            severity="info" 
            sx={{ 
              mb: 2,
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            Loading exchange rates...
          </Alert>
        )}

        {/* Currency Error State */}
        {currencyError && (
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 2,
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            Failed to load exchange rates. Prices will be displayed in default currency.
          </Alert>
        )}

        {/* Main Content - Mobile: vertical stack, Desktop: side by side */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', lg: 'row' }, 
          gap: { xs: 2, sm: 4 }, 
          alignItems: 'flex-start' 
        }}>
          {/* Checkout Form - Mobile order: 1 (alamat), 2 (product), 3 (shipping), 4 (summary) */}
          <Box sx={{ 
            flex: 1, 
            minWidth: 0,
            width: '100%',
            order: { xs: 1, lg: 1 }
          }}>
            <Stack spacing={{ xs: 2, sm: 4 }}>
              {/* 1. Address Selection */}
              <Box sx={{ order: { xs: 1, lg: 1 } }}>
                <ShippingAddress
                  selectedAddress={selectedAddress}
                  onAddressSelect={(addressId) => {
                    setSelectedAddress(addressId);
                    // Find address data from addresses list
                    const addressData = addresses.find(addr => addr.id === addressId);
                    if (addressData) {
                      setSelectedAddressData(addressData);
                    }
                    // Reset shipping method when address changes
                    setSelectedShippingMethod(null);
                    setShippingCost(15000); // Reset to default
                  }}
                  onAddressesLoaded={(loadedAddresses) => {
                    setAddresses(loadedAddresses);
                    // The useEffect above will handle setting selectedAddressData
                  }}
                />
              </Box>

              {/* 2. Product List - Show in mobile */}
              {isMobile && (
                <Box sx={{ order: { xs: 2, lg: 2 } }}>
                  <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                      <Typography 
                        variant="h6" 
                        fontWeight={600} 
                        sx={{ 
                          mb: 2,
                          fontSize: { xs: '1rem', sm: '1.25rem' }
                        }}
                      >
                        Produk ({availableItems.length})
                      </Typography>
                      <Stack spacing={2}>
                        {availableItems.map((item) => {
                          const primaryImage = item.product_variant.product.product_images?.[0]?.image_name;
                          return (
                            <Box
                              key={item.id}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                p: 1.5,
                                borderRadius: 2,
                                backgroundColor: 'grey.50',
                              }}
                            >
                              <Box
                                component="img"
                                src={primaryImage ? getProductImageUrl(primaryImage) : undefined}
                                alt={item.product_variant.product.name}
                                sx={{
                                  width: { xs: 50, sm: 60 },
                                  height: { xs: 50, sm: 60 },
                                  borderRadius: 1,
                                  objectFit: 'cover',
                                  flexShrink: 0,
                                  backgroundColor: 'grey.100',
                                }}
                              />
                              <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography 
                                  variant="subtitle2" 
                                  fontWeight={600} 
                                  sx={{ 
                                    mb: 0.5,
                                    fontSize: { xs: '0.875rem', sm: '0.9rem' },
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                  title={item.product_variant.product.name}
                                >
                                  {item.product_variant.product.name}
                                </Typography>
                                <Typography 
                                  variant="body2" 
                                  color="text.secondary" 
                                  sx={{ fontSize: { xs: '0.75rem', sm: '0.8rem' } }}
                                >
                                  Qty: {item.quantity}
                                </Typography>
                              </Box>
                              <Typography
                                variant="body2"
                                fontWeight={600}
                                color="primary.main"
                                sx={{ fontSize: { xs: '0.875rem', sm: '0.9rem' } }}
                              >
                                {formatPrice(parseFloat(item.product_variant.price) * item.quantity)}
                              </Typography>
                            </Box>
                          );
                        })}
                      </Stack>
                    </CardContent>
                  </Card>
                </Box>
              )}

              {/* 3. Shipping Method Selection */}
              <Box sx={{ order: { xs: 3, lg: 3 } }}>
                <ShippingMethodSelector
                  selectedAddress={selectedAddressData}
                  cartItems={availableItems}
                  selectedMethod={selectedShippingMethod ? `${selectedShippingMethod.courier_code}_${selectedShippingMethod.courier_service_code}` : null}
                  onMethodSelect={(method: ShippingMethod) => {
                    setSelectedShippingMethod(method);
                    setShippingCost(method.price);
                  }}
                />
              </Box>
            </Stack>
          </Box>

          {/* 4. Order Summary - Mobile order: 4, Desktop: 2 */}
          <Box sx={{ 
            width: { xs: '100%', lg: '400px' }, 
            flexShrink: 0,
            order: { xs: 4, lg: 2 }
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