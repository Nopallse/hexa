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
import { cartApi } from '../services/cartApi';
import { useCartStore } from '../store/cartStore';

// Simple price formatter for IDR
const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

interface CartSummaryProps {
  items: CartItem[];
  onCartCleared: () => void;
}

export default function CartSummary({ items, onCartCleared }: CartSummaryProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const [clearing, setClearing] = useState(false);
  
  const { clearCart, getTotalItems, getTotalPrice } = useCartStore();

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
      const response = await cartApi.clearCart();

      if (response.success) {
        clearCart();
        onCartCleared();
      }
    } catch (err: any) {
      console.error('Error clearing cart:', err);
      alert(err.response?.data?.error || 'Gagal mengosongkan keranjang');
    } finally {
      setClearing(false);
    }
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  // Filter available items (not deleted)
  const availableItems = items.filter(item => item.product_variant.product.deleted_at === null);
  const deletedItems = items.filter(item => item.product_variant.product.deleted_at !== null);

  const totalItems = availableItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = availableItems.reduce((sum, item) => sum + (parseFloat(item.product_variant.price) * item.quantity), 0);

  return (
    <Card sx={{ position: 'sticky', top: 24 }}>
      <CardContent>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
          Ringkasan Belanja
        </Typography>

        <Stack spacing={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body1">
              Total Item ({totalItems})
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {totalPrice > 0 ? formatCartPrice(totalPrice) : 'Rp 0'}
            </Typography>
          </Box>

          {deletedItems.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" color="error.main">
                Item tidak tersedia ({deletedItems.length})
              </Typography>
              <Typography variant="body2" color="error.main">
                Tidak dihitung
              </Typography>
            </Box>
          )}

          <Divider />

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight={700}>
              Total Belanja
            </Typography>
            <Typography variant="h6" fontWeight={700} color="primary.main">
              {formatPrice(totalPrice)}
            </Typography>
          </Box>

          <Divider />

          <Stack spacing={2}>
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
                color="error"
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: '1rem',
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
