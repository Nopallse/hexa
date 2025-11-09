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
import { useCartStore } from '@/store/cartStore';
import CartItem from '../components/CartItem';
import CartSummary from '../components/CartSummary';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';

export default function CartPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { loading: currencyLoading, error: currencyError } = useCurrencyConversion();
  
  // Gunakan store global untuk items dan state
  const { items, isLoading, error: storeError, syncWithServer } = useCartStore();
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Sync dengan server saat component mount
  useEffect(() => {
    const fetchData = async () => {
      await syncWithServer();
      setInitialLoading(false);
    };
    fetchData();
  }, [syncWithServer]);

  // Handle error dari store
  useEffect(() => {
    if (storeError) {
      setError(storeError);
    }
  }, [storeError]);

  const handleItemUpdate = async () => {
    // Sync dengan server untuk mendapatkan data terbaru
    await syncWithServer();
  };

  const handleItemRemove = async () => {
    // Sync dengan server untuk mendapatkan data terbaru
    await syncWithServer();
  };

  const handleCartCleared = async () => {
    // Sync dengan server untuk mendapatkan data terbaru
    await syncWithServer();
  };

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
            {initialLoading ? (
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
