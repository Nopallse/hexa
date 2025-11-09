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
import ConfirmDialog from '@/components/common/ConfirmDialog';

interface CartSummaryProps {
  items: CartItem[];
  onCartCleared: () => void;
  selectedItems?: Set<string>;
}

export default function CartSummary({ items, onCartCleared, selectedItems = new Set() }: CartSummaryProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [clearing, setClearing] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const { formatPrice } = useCurrencyConversion();
  
  const { clearCart } = useCartStore();

  const formatCartPrice = (price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return formatPrice(numPrice);
  };

  const handleClearCart = () => {
    setShowClearDialog(true);
  };

  const handleClearCartConfirm = async () => {
    try {
      setClearing(true);
      setShowClearDialog(false);
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
      // Ensure we have selected items before navigating
      if (selectedItems.size === 0) {
        alert('Pilih minimal satu item untuk checkout');
        return;
      }
      
      // Convert Set to Array for navigation state
      const selectedItemsArray = Array.from(selectedItems);
      navigate('/checkout', { 
        state: { 
          selectedCartItemIds: selectedItemsArray 
        } 
      });
    } catch (error) {
      console.error('Error navigating to checkout:', error);
    }
  };

  // Filter available items (not deleted)
  const availableItems = items.filter(item => item.product_variant.product.deleted_at === null);
  const deletedItems = items.filter(item => item.product_variant.product.deleted_at !== null);

  // Filter selected items only
  const selectedAvailableItems = availableItems.filter(item => selectedItems.has(item.id));

  const totalItems = selectedAvailableItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = selectedAvailableItems.reduce((sum, item) => sum + (parseFloat(item.product_variant.price) * item.quantity), 0);

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
              disabled={selectedItems.size === 0}
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
              {selectedItems.size === 0 ? 'Pilih Item untuk Checkout' : `Checkout (${selectedItems.size} item)`}
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

      {/* Confirm Clear Cart Dialog */}
      <ConfirmDialog
        open={showClearDialog}
        onClose={() => setShowClearDialog(false)}
        onConfirm={handleClearCartConfirm}
        title="Kosongkan Keranjang"
        message="Apakah Anda yakin ingin mengosongkan seluruh keranjang? Semua item di keranjang akan dihapus."
        confirmText="Kosongkan"
        cancelText="Batal"
        variant="warning"
        confirmColor="error"
        loading={clearing}
      />
    </Card>
  );
}
