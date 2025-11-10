import {
  Container,
  Typography,
  Box,
  Stack,
  Alert,
  Skeleton,
  useTheme,
  useMediaQuery,
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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { loading: currencyLoading, error: currencyError } = useCurrencyConversion();
  
  // Gunakan store global untuk items dan state
  const { items, isLoading, error: storeError, syncWithServer } = useCartStore();
  const [error, setError] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

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
    // Reset selected items
    setSelectedItems(new Set());
  };

  const handleItemSelect = (itemId: string, selected: boolean) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(itemId);
      } else {
        newSet.delete(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (select: boolean) => {
    if (select) {
      const allAvailableIds = availableItems.map(item => item.id);
      setSelectedItems(new Set(allAvailableIds));
    } else {
      setSelectedItems(new Set());
    }
  };

  // Filter items
  const availableItems = items.filter(item => item.product_variant.product.deleted_at === null);
  const deletedItems = items.filter(item => item.product_variant.product.deleted_at !== null);

  // Set default: select all available items when items are loaded
  useEffect(() => {
    if (!initialLoading && availableItems.length > 0) {
      const allAvailableIds = availableItems.map(item => item.id);
      setSelectedItems(prev => {
        // If no items are selected yet (first load), select all available items
        if (prev.size === 0) {
          return new Set(allAvailableIds);
        }
        // Otherwise, keep user's manual selections but:
        // - Add new items that were added to cart
        // - Remove items that are no longer available
        const newSet = new Set(prev);
        allAvailableIds.forEach(id => {
          // Add new items automatically (default selected)
          if (!newSet.has(id)) {
            newSet.add(id);
          }
        });
        // Remove items that are no longer available
        Array.from(newSet).forEach(id => {
          if (!allAvailableIds.includes(id)) {
            newSet.delete(id);
          }
        });
        return newSet;
      });
    } else if (availableItems.length === 0) {
      // If no available items, clear selection
      setSelectedItems(new Set());
    }
  }, [availableItems.map(item => item.id).join(','), initialLoading]);

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 2, sm: 4 } }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* Navigation Header */}
        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
          <Typography 
            variant="h4" 
            fontWeight={600} 
            sx={{ 
              mb: 1, 
              color: 'text.primary',
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
            }}
          >
            Keranjang Belanja
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            Kelola item di keranjang belanja Anda
          </Typography>
        </Box>

        {/* Currency Loading State */}
        {currencyLoading && (
          <Alert 
            severity="info" 
            sx={{ 
              mb: 2,
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
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
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          >
            Failed to load exchange rates. Prices will be displayed in default currency.
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: { xs: 2, sm: 4 },
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }} 
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Main Content */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', lg: 'row' }, 
          gap: { xs: 2, sm: 3, lg: 4 }, 
          alignItems: 'flex-start' 
        }}>
          {/* Cart Items */}
          <Box sx={{ 
            flex: 1, 
            minWidth: 0,
            width: { xs: '100%', lg: 'auto' },
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
                  py: { xs: 4, sm: 8 },
                  px: { xs: 2, sm: 4 },
                  borderRadius: 2,
                  backgroundColor: 'grey.50',
                }}
              >
                <ShoppingCart sx={{ fontSize: { xs: 48, sm: 64 }, color: 'text.secondary', mb: 2 }} />
                
                <Typography 
                  variant="h5" 
                  fontWeight={600} 
                  sx={{ 
                    mb: 1, 
                    color: 'text.primary',
                    fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
                  }}
                >
                  Keranjang Anda Kosong
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 3,
                    fontSize: { xs: '0.875rem', sm: '1rem' }
                  }}
                >
                  Belum ada item di keranjang belanja Anda
                </Typography>
                
                <Stack 
                  direction={{ xs: 'column', sm: 'row' }} 
                  spacing={2} 
                  justifyContent="center"
                  sx={{ width: '100%' }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<ShoppingBag />}
                    onClick={() => navigate('/products')}
                    fullWidth={isMobile}
                    sx={{
                      px: { xs: 2, sm: 3 },
                      py: { xs: 1.25, sm: 1.5 },
                      borderRadius: 2,
                      fontWeight: 600,
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      minHeight: { xs: 44, sm: 48 }
                    }}
                  >
                    Mulai Berbelanja
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => navigate('/')}
                    fullWidth={isMobile}
                    sx={{
                      px: { xs: 2, sm: 3 },
                      py: { xs: 1.25, sm: 1.5 },
                      borderRadius: 2,
                      fontWeight: 500,
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      minHeight: { xs: 44, sm: 48 }
                    }}
                  >
                    Kembali ke Beranda
                  </Button>
                </Stack>
              </Box>
            ) : (
              <Stack spacing={{ xs: 1.5, sm: 2 }}>
                {/* Available Items */}
                {availableItems.length > 0 && (
                  <>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: 'space-between', 
                      alignItems: { xs: 'flex-start', sm: 'center' }, 
                      gap: { xs: 1, sm: 0 },
                      mb: { xs: 1.5, sm: 2 } 
                    }}>
                      <Typography 
                        variant="h6" 
                        fontWeight={600} 
                        sx={{ 
                          color: 'text.primary',
                          fontSize: { xs: '1rem', sm: '1.25rem' }
                        }}
                      >
                        Item Tersedia ({availableItems.length})
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => handleSelectAll(selectedItems.size !== availableItems.length)}
                        sx={{ 
                          textTransform: 'none',
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                      >
                        {selectedItems.size === availableItems.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                      </Button>
                    </Box>
                    {availableItems.map((item) => (
                      <CartItem
                        key={item.id}
                        item={item}
                        onUpdate={handleItemUpdate}
                        onRemove={handleItemRemove}
                        selected={selectedItems.has(item.id)}
                        onSelectChange={handleItemSelect}
                        selectable={true}
                      />
                    ))}
                  </>
                )}

                {/* Deleted Items */}
                {deletedItems.length > 0 && (
                  <>
                    <Typography 
                      variant="h6" 
                      fontWeight={600} 
                      sx={{ 
                        mb: { xs: 1.5, sm: 2 }, 
                        color: 'error.main',
                        fontSize: { xs: '1rem', sm: '1.25rem' }
                      }}
                    >
                      Item Tidak Tersedia ({deletedItems.length})
                    </Typography>
                    <Alert 
                      severity="warning" 
                      sx={{ 
                        mb: { xs: 1.5, sm: 2 },
                        borderRadius: 2,
                        fontSize: { xs: '0.75rem', sm: '0.875rem' }
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
              width: { xs: '100%', lg: 400 }, 
              flexShrink: 0,
              order: { xs: 2, lg: 2 },
              position: { xs: 'static', lg: 'sticky' },
              top: { lg: 24 }
            }}>
              <CartSummary
                items={items}
                onCartCleared={handleCartCleared}
                selectedItems={selectedItems}
              />
            </Box>
          )}
        </Box>
      </Container>
    </Box>
  );
}
