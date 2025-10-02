import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  IconButton,
  TextField,
  Chip,
  Button,
  Alert,
  useTheme,
  Avatar,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { CartItem as CartItemType } from '../types';
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

interface CartItemProps {
  item: CartItemType;
  onUpdate: () => void;
  onRemove: () => void;
}

export default function CartItem({ item, onUpdate, onRemove }: CartItemProps) {
  const theme = useTheme();
  const [quantity, setQuantity] = useState(item.quantity);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { updateItem, removeItem } = useCartStore();

  // Check if product is deleted
  const isProductDeleted = item.product_variant.product.deleted_at !== null;

  const formatItemPrice = (price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return formatPrice(numPrice);
  };

  const handleQuantityChange = async (newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > item.product_variant.stock) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await cartApi.updateCartItem(item.id, {
        quantity: newQuantity
      });

      if (response.success) {
        setQuantity(newQuantity);
        updateItem(item.id, newQuantity);
        onUpdate();
      }
    } catch (err: any) {
      console.error('Error updating cart item:', err);
      setError(err.response?.data?.error || 'Gagal mengupdate quantity');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await cartApi.removeFromCart(item.id);

      if (response.success) {
        removeItem(item.id);
        onRemove();
      }
    } catch (err: any) {
      console.error('Error removing cart item:', err);
      setError(err.response?.data?.error || 'Gagal menghapus item');
    } finally {
      setLoading(false);
    }
  };

  const primaryImage = item.product_variant.product.product_images?.[0]?.image_name;

  return (
    <Card
      sx={{
        mb: 2,
        border: isProductDeleted ? `2px solid ${theme.palette.error.main}` : 'none',
        opacity: isProductDeleted ? 0.7 : 1,
      }}
    >
      <CardContent>
        {isProductDeleted && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Produk ini sudah tidak tersedia
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
          {/* Product Image */}
          <Avatar
            src={primaryImage || `https://placehold.co/80x80/9682DB/FFFFFF/png?text=${encodeURIComponent(item.product_variant.product.name)}`}
            alt={item.product_variant.product.name}
            sx={{
              width: 80,
              height: 80,
              borderRadius: 2,
              flexShrink: 0,
            }}
            variant="rounded"
          >
            <ShoppingCartIcon />
          </Avatar>

          {/* Product Info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
              {item.product_variant.product.name}
            </Typography>
            
            <Typography variant="subtitle1" color="primary.main" fontWeight={700} sx={{ mb: 1 }}>
              {item.product_variant.variant_name}
            </Typography>

            {item.product_variant.variant_options && item.product_variant.variant_options.length > 0 && (
              <Stack direction="row" spacing={1} sx={{ mb: 1, flexWrap: 'wrap', gap: 0.5 }}>
                {item.product_variant.variant_options.map((option) => (
                  <Chip
                    key={option.id}
                    label={`${option.option_name}: ${option.option_value}`}
                    size="small"
                    variant="outlined"
                    sx={{ fontSize: '0.75rem' }}
                  />
                ))}
              </Stack>
            )}

            <Typography variant="body2" color="text.secondary">
              SKU: {item.product_variant.sku}
            </Typography>

            {isProductDeleted ? (
              <Typography variant="body2" color="error.main" fontWeight={600}>
                Stok: Tidak tersedia
              </Typography>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Stok: {item.product_variant.stock} unit
              </Typography>
            )}
          </Box>

          {/* Price */}
          <Box sx={{ textAlign: 'right', minWidth: 120 }}>
            <Typography variant="h6" color="primary.main" fontWeight={700} sx={{ mb: 1 }}>
              {formatItemPrice(parseFloat(item.product_variant.price))}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total: {formatItemPrice(parseFloat(item.product_variant.price) * quantity)}
            </Typography>
          </Box>

          {/* Quantity Controls */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={loading || quantity <= 1 || isProductDeleted}
              size="small"
              sx={{
                border: `1px solid ${theme.palette.grey[300]}`,
                borderRadius: 1,
              }}
            >
              <RemoveIcon />
            </IconButton>

            <TextField
              type="number"
              value={quantity}
              onChange={(e) => {
                const newQty = parseInt(e.target.value) || 1;
                if (newQty >= 1 && newQty <= item.product_variant.stock) {
                  handleQuantityChange(newQty);
                }
              }}
              disabled={loading || isProductDeleted}
              inputProps={{
                min: 1,
                max: item.product_variant.stock,
              }}
              sx={{ width: 70 }}
              size="small"
            />

            <IconButton
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={loading || quantity >= item.product_variant.stock || isProductDeleted}
              size="small"
              sx={{
                border: `1px solid ${theme.palette.grey[300]}`,
                borderRadius: 1,
              }}
            >
              <AddIcon />
            </IconButton>
          </Box>

          {/* Remove Button */}
          <IconButton
            onClick={handleRemove}
            disabled={loading}
            color="error"
            sx={{
              border: `1px solid ${theme.palette.error.light}`,
              '&:hover': {
                backgroundColor: theme.palette.error.light + '20',
              },
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Stack>
      </CardContent>
    </Card>
  );
}
