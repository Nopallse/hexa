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
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';

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
  const { formatPrice } = useCurrencyConversion();

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
        border: isProductDeleted ? `1px solid ${theme.palette.error.main}` : 'none',
        opacity: isProductDeleted ? 0.6 : 1,
        borderRadius: 2,
        boxShadow: isProductDeleted ? `0 2px 8px ${theme.palette.error.main}20` : '0 1px 3px rgba(0,0,0,0.1)',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: isProductDeleted ? `0 4px 12px ${theme.palette.error.main}30` : '0 2px 8px rgba(0,0,0,0.15)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {isProductDeleted && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 3,
              '& .MuiAlert-message': {
                fontWeight: 600,
              }
            }}
          >
            Produk ini sudah tidak tersedia
          </Alert>
        )}

        {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 3,
              '& .MuiAlert-message': {
                fontWeight: 600,
              }
            }} 
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}

        {/* Modern Layout */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {/* Product Image */}
          <Box sx={{ flexShrink: 0 }}>
            <Avatar
              src={primaryImage ? `/uploads/${primaryImage}` : `https://placehold.co/80x80/9682DB/FFFFFF/png?text=${encodeURIComponent(item.product_variant.product.name.substring(0, 10))}`}
              alt={item.product_variant.product.name}
              sx={{
                width: 80,
                height: 80,
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              }}
              variant="rounded"
            >
              <ShoppingCartIcon sx={{ fontSize: 32 }} />
            </Avatar>
          </Box>

          {/* Product Info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="h6" 
              fontWeight={600} 
              sx={{ 
                mb: 1, 
                color: 'text.primary',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                lineHeight: 1.3,
                fontSize: '1rem',
              }}
              title={item.product_variant.product.name}
            >
              {item.product_variant.product.name}
            </Typography>
            
            {/* Variant Options */}
            {item.product_variant.variant_options && item.product_variant.variant_options.length > 0 && (
              <Stack direction="row" spacing={0.5} sx={{ mb: 1, flexWrap: 'wrap' }}>
                {item.product_variant.variant_options.map((option, index) => (
                  <Chip
                    key={index}
                    label={`${option.option_value}`}
                    size="small"
                    variant="outlined"
                    sx={{ 
                      fontSize: '0.7rem',
                      height: 20,
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      '& .MuiChip-label': {
                        px: 1,
                      }
                    }}
                  />
                ))}
              </Stack>
            )}

            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              Stok: {isProductDeleted ? 'Tidak tersedia' : `${item.product_variant.stock} unit`}
            </Typography>
          </Box>

          {/* Price & Controls */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 2,
            flexShrink: 0,
          }}>
            {/* Price */}
            <Box sx={{ textAlign: 'right', minWidth: 100 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                {formatItemPrice(parseFloat(item.product_variant.price))}
              </Typography>
              <Typography variant="h6" color="primary.main" fontWeight={700} sx={{ fontSize: '1rem' }}>
                {formatItemPrice(parseFloat(item.product_variant.price) * quantity)}
              </Typography>
            </Box>

            {/* Quantity Controls */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center',
              backgroundColor: 'grey.50',
              borderRadius: 2,
              p: 0.5,
              gap: 0.5,
            }}>
              <IconButton
                onClick={quantity === 1 ? handleRemove : () => handleQuantityChange(quantity - 1)}
                disabled={loading || isProductDeleted}
                size="small"
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: 1,
                  backgroundColor: quantity === 1 ? 'error.main' : 'white',
                  color: quantity === 1 ? 'white' : 'text.primary',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  '&:hover': {
                    backgroundColor: quantity === 1 ? 'error.dark' : 'primary.light',
                    color: quantity === 1 ? 'white' : 'primary.main',
                  },
                  '&:disabled': {
                    opacity: 0.5,
                    backgroundColor: 'grey.200',
                  },
                }}
              >
                {quantity === 1 ? (
                  <DeleteIcon sx={{ fontSize: 14 }} />
                ) : (
                  <RemoveIcon sx={{ fontSize: 14 }} />
                )}
              </IconButton>

              <Typography variant="body2" fontWeight={600} sx={{ minWidth: 24, textAlign: 'center', fontSize: '0.9rem' }}>
                {quantity}
              </Typography>

              <IconButton
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={loading || quantity >= item.product_variant.stock || isProductDeleted}
                size="small"
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: 1,
                  backgroundColor: 'white',
                  color: 'text.primary',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    color: 'primary.main',
                  },
                  '&:disabled': {
                    opacity: 0.5,
                    backgroundColor: 'grey.200',
                  },
                }}
              >
                <AddIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
