import {
  Container,
  Typography,
  Box,
  Stack,
  Alert,
  Skeleton,
  useTheme,
  Button,
  Chip,
} from '@mui/material';
import {
  ArrowBack,
  ShoppingCart,
  ShoppingBag,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartItem as CartItemType } from '../types';
import { cartApi } from '../services/cartApi';
import { useCartStore } from '../store/cartStore';
import CartItem from '../components/CartItem';
import CartSummary from '../components/CartSummary';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';

export default function CartPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { loading: currencyLoading, error: currencyError } = useCurrencyConversion();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<CartItemType[]>([]);

  const { setItems: setStoreItems } = useCartStore();

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await cartApi.getCart();

      if (response.success) {
        setItems(response.data);
        setStoreItems(response.data);
      } else {
        setError('Gagal memuat keranjang');
      }
    } catch (err: any) {
      console.error('Error fetching cart:', err);
      setError(err.response?.data?.error || 'Gagal memuat keranjang');
    } finally {
      setLoading(false);
    }
  };

  const handleItemUpdate = () => {
    fetchCart();
  };

  const handleItemRemove = () => {
    fetchCart();
  };

  const handleCartCleared = () => {
    setItems([]);
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // Filter items
  const availableItems = items.filter(item => item.product_variant.product.deleted_at === null);
  const deletedItems = items.filter(item => item.product_variant.product.deleted_at !== null);

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">
        {/* Navigation Header */}
        <Box sx={{ mb: 3 }}>
         
          
          <Typography variant="h4" fontWeight={600} sx={{ mb: 1, color: 'text.primary' }}>
            Keranjang Belanja
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Kelola item di keranjang belanja Anda
          </Typography>
        </Box>

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
          {/* Cart Items */}
          <Box sx={{ 
            flex: 1, 
            minWidth: 0,
            order: { xs: 1, lg: 1 }
          }}>
            {loading ? (
              <Stack spacing={2}>
                {[...Array(3)].map((_, index) => (
                  <Skeleton key={index} variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
                ))}
              </Stack>
            ) : items.length === 0 ? (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 8,
                  px: 4,
                  borderRadius: 2,
                  backgroundColor: 'grey.50',
                }}
              >
                <ShoppingCart sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                
                <Typography variant="h5" fontWeight={600} sx={{ mb: 1, color: 'text.primary' }}>
                  Keranjang Anda Kosong
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Belum ada item di keranjang belanja Anda
                </Typography>
                
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<ShoppingBag />}
                    onClick={() => navigate('/products')}
                    sx={{
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                    }}
                  >
                    Mulai Berbelanja
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/')}
                    sx={{
                      px: 3,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 500,
                    }}
                  >
                    Kembali ke Beranda
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Stack spacing={2}>
                {/* Available Items */}
                {availableItems.length > 0 && (
                  <>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'text.primary' }}>
                      Item Tersedia ({availableItems.length})
                    </Typography>
                    {availableItems.map((item) => (
                      <CartItem
                        key={item.id}
                        item={item}
                        onUpdate={handleItemUpdate}
                        onRemove={handleItemRemove}
                      />
                    ))}
                  </>
                )}

                {/* Deleted Items */}
                {deletedItems.length > 0 && (
                  <>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'error.main' }}>
                      Item Tidak Tersedia ({deletedItems.length})
                    </Typography>
                    <Alert 
                      severity="warning" 
                      sx={{ 
                        mb: 2,
                        borderRadius: 2,
                      }}
                    >
                      Beberapa item di keranjang Anda sudah tidak tersedia. Item ini akan diabaikan saat checkout.
                    </Alert>
                    {deletedItems.map((item) => (
                      <CartItem
                        key={item.id}
                        item={item}
                        onUpdate={handleItemUpdate}
                        onRemove={handleItemRemove}
                      />
                    ))}
                  </>
                )}
              </Stack>
            )}
          </Box>

          {/* Cart Summary */}
          {items.length > 0 && (
            <Box sx={{ 
              width: { xs: '100%', lg: '400px' }, 
              flexShrink: 0,
              order: { xs: 2, lg: 2 }
            }}>
              <CartSummary
                items={items}
                onCartCleared={handleCartCleared}
              />
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}
