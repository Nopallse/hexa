import {
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Divider,
  Box,
  useTheme,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  ClearAll as ClearAllIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartItem } from '../types';
import { useCartStore } from '@/store/cartStore';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';

interface CartSummaryProps {
  items: CartItem[];
  onCartCleared: () => void;
}

export default function CartSummary({ items, onCartCleared }: CartSummaryProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [clearing, setClearing] = useState(false);
  const { formatPrice } = useCurrencyConversion();
  
  const { clearCart } = useCartStore();

  const formatCartPrice = (price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return formatPrice(numPrice);
  };

  const handleClearCart = async () => {
    if (!window.confirm('Apakah Anda yakin ingin mengosongkan keranjang?')) {
      return;
    }

    try {
      setClearing(true);
      await clearCart();
      onCartCleared();
    } catch (err: any) {
      console.error('Error clearing cart:', err);
      alert(err.response?.data?.error || 'Gagal mengosongkan keranjang');
    } finally {
      setClearing(false);
    }
  };

  const handleCheckout = () => {
    try {
      // Ensure we have available items before navigating
      if (totalItems === 0) {
        console.warn('Cannot checkout: No available items in cart');
        return;
      }
      navigate('/checkout');
    } catch (error) {
      console.error('Error navigating to checkout:', error);
    }
  };

  // Filter available items (not deleted)
  const availableItems = items.filter(item => item.product_variant.product.deleted_at === null);
  const deletedItems = items.filter(item => item.product_variant.product.deleted_at !== null);

  const totalItems = availableItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = availableItems.reduce((sum, item) => sum + (parseFloat(item.product_variant.price) * item.quantity), 0);

  return (
    <Card sx={{ 
      position: 'sticky', 
      top: 24,
      borderRadius: 2,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: 'none',
    }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 3, color: 'text.primary' }}>
          Ringkasan Belanja
        </Typography>

        <Stack spacing={2}>
          {/* Item Count */}
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
              Total Item ({totalItems})
            </Typography>
            <Typography variant="h6" fontWeight={600} color="primary.main">
              {totalPrice > 0 ? formatCartPrice(totalPrice) : 'Rp 0'}
            </Typography>
          </Box>

          {/* Deleted Items Warning */}
          {deletedItems.length > 0 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 1.5,
              px: 2,
              backgroundColor: 'error.light',
              borderRadius: 2,
            }}>
              <Typography variant="body2" color="error.dark" fontWeight={500}>
                Item tidak tersedia ({deletedItems.length})
              </Typography>
              <Typography variant="body2" color="error.dark" fontWeight={500}>
                Tidak dihitung
              </Typography>
            </Box>
          )}

          {/* Total Price */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            py: 2,
            px: 2,
            backgroundColor: 'primary.main',
            borderRadius: 2,
            color: 'white',
          }}>
            <Typography variant="h6" fontWeight={600}>
              Total Belanja
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {formatPrice(totalPrice)}
            </Typography>
          </Box>

          {/* Action Buttons */}
          <Stack spacing={1.5}>
            <Button
              variant="contained"
              size="large"
              startIcon={<PaymentIcon />}
              onClick={handleCheckout}
              disabled={totalItems === 0}
              fullWidth
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontWeight: 600,
                fontSize: '1rem',
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
                '&:disabled': {
                  backgroundColor: 'grey.300',
                  color: 'grey.500',
                },
              }}
            >
              {totalItems === 0 ? 'Keranjang Kosong' : 'Lanjut ke Checkout'}
            </Button>

            {items.length > 0 && (
              <Button
                variant="outlined"
                size="large"
                startIcon={<ClearAllIcon />}
                onClick={handleClearCart}
                disabled={clearing}
                fullWidth
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  borderColor: 'error.main',
                  color: 'error.main',
                  '&:hover': {
                    backgroundColor: 'error.light',
                    borderColor: 'error.dark',
                  },
                }}
              >
                {clearing ? 'Mengosongkan...' : 'Kosongkan Keranjang'}
              </Button>
            )}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
