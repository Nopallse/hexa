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
  useMediaQuery,
  Avatar,
  Checkbox,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  ShoppingCart as ShoppingCartIcon,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { CartItem as CartItemType } from '../types';
import { useCartStore } from '@/store/cartStore';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';
import { toast } from 'react-hot-toast';
import { getProductImageUrl } from '@/utils/image';
import ConfirmDialog from '@/components/common/ConfirmDialog';

interface CartItemProps {
  item: CartItemType;
  onUpdate: () => void;
  onRemove: () => void;
  selected?: boolean;
  onSelectChange?: (itemId: string, selected: boolean) => void;
  selectable?: boolean;
}

export default function CartItem({ item, onUpdate, onRemove, selected = false, onSelectChange, selectable = false }: CartItemProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [quantity, setQuantity] = useState(item.quantity);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { formatPrice } = useCurrencyConversion();

  const { updateQuantity, removeItem } = useCartStore();

  // Update quantity state saat item berubah
  useEffect(() => {
    setQuantity(item.quantity);
  }, [item.quantity]);

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
      setError(null);

      // Gunakan updateQuantity dari store global
      await updateQuantity(item.id, newQuantity);
      
      // Update quantity state
      setQuantity(newQuantity);
      
      // Sync dengan server untuk mendapatkan data terbaru
      await onUpdate();
      
      toast.success('Jumlah item berhasil diupdate', {
        duration: 2000,
        position: 'bottom-right',
      });
    } catch (err: any) {
      console.error('Error updating cart item:', err);
      const errorMessage = err.response?.data?.error || 'Gagal mengupdate quantity';
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 3000,
        position: 'bottom-right',
      });
    }
  };

  const handleRemoveClick = () => {
    setShowDeleteDialog(true);
  };

  const handleRemoveConfirm = async () => {
    try {
      setError(null);
      setShowDeleteDialog(false);

      // Gunakan removeItem dari store global
      await removeItem(item.id);
      
      // Sync dengan server untuk mendapatkan data terbaru
      await onRemove();
      
      toast.success('Item berhasil dihapus dari keranjang', {
        duration: 2000,
        position: 'bottom-right',
      });
    } catch (err: any) {
      console.error('Error removing cart item:', err);
      const errorMessage = err.response?.data?.error || 'Gagal menghapus item';
      setError(errorMessage);
      toast.error(errorMessage, {
        duration: 3000,
        position: 'bottom-right',
      });
    }
  };

  // Get display image from product images
  const displayImage = item.product_variant.product.product_images?.[0]?.image_name || null;

  return (
    <Card
      sx={{
        mb: { xs: 1.5, sm: 2 },
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
      <CardContent sx={{ p: { xs: 1, sm: 3 } }}>
        {isProductDeleted && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: { xs: 2, sm: 3 },
              borderRadius: 3,
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
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
              mb: { xs: 2, sm: 3 },
              borderRadius: 3,
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
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
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          gap: { xs: 1, sm: 3 } 
        }}>
          {/* Checkbox & Product Image & Info Container */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', // Always center vertically
            gap: { xs: 1, sm: 3 },
            flex: 1,
            minWidth: 0,
            width: { xs: '100%', sm: 'auto' }
          }}>
            {/* Checkbox for selection */}
            {selectable && (
              <Box sx={{ 
                flexShrink: 0, 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Checkbox
                  checked={selected}
                  onChange={(e) => onSelectChange?.(item.id, e.target.checked)}
                  disabled={isProductDeleted}
                  sx={{
                    color: 'primary.main',
                    '&.Mui-checked': {
                      color: 'primary.main',
                    },
                    padding: { xs: 0.5, sm: 1 },
                  }}
                />
              </Box>
            )}

            {/* Product Image & Price Container */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              flexShrink: 0
            }}>
              {/* Product Image */}
              <Avatar
                src={displayImage ? getProductImageUrl(displayImage) : undefined}
                alt={item.product_variant.product.name}
                sx={{
                  width: { xs: 70, sm: 80 },
                  height: { xs: 70, sm: 80 },
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                }}
                variant="rounded"
              >
                <ShoppingCartIcon sx={{ fontSize: { xs: 28, sm: 32 } }} />
              </Avatar>
              
             
            </Box>

            {/* Product Info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 1, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: { xs: '0.875rem', sm: '1rem' } }} title={item.product_variant.product.name}>{item.product_variant.product.name}</Typography>
              
              {/* Variant Options */}
              {item.product_variant.variant_options && item.product_variant.variant_options.length > 0 && (
                <Stack 
                  direction="row" 
                  spacing={0.5} 
                  sx={{ 
                    mb: 1, 
                    flexWrap: 'wrap',
                    gap: { xs: 0.5, sm: 0.5 }
                  }}
                >
                  {item.product_variant.variant_options.map((option, index) => (
                    <Chip
                      key={index}
                      label={`${option.option_value}`}
                      size="small"
                      variant="outlined"
                      sx={{ 
                        fontSize: { xs: '0.65rem', sm: '0.7rem' },
                        height: { xs: 18, sm: 20 },
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        '& .MuiChip-label': {
                          px: { xs: 0.75, sm: 1 },
                        }
                      }}
                    />
                  ))}
                </Stack>
              )}

              {/* Stock and Price - split left (stock text & price) and right (button/qty controls) */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mt: { xs: 1, sm: 1 }
                }}
              >
                {/* Left: Stock info and Price stacked vertical */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ 
                      fontSize: { xs: '0.7rem', sm: '0.75rem' } 
                    }}
                  >
                    Stok: {isProductDeleted ? 'Tidak tersedia' : `${item.product_variant.stock} unit`}
                  </Typography>
                  <Typography 
                    variant="h6" 
                    color="primary.main" 
                    fontWeight={700} 
                    sx={{ 
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      lineHeight: 1.2
                    }}
                  >
                    {formatItemPrice(parseFloat(item.product_variant.price))}
                  </Typography>
                </Box>

                {/* Right: Tombol/qty controls */}
                <Box sx={{ ml: { xs: 1, sm: 2 }, minWidth: 100 }}>
                  {/* Quantity Controls */}
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    gap: { xs: 1, sm: 1.5 }
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      backgroundColor: 'grey.50',
                      borderRadius: 2,
                      p: { xs: 0.5, sm: 0.5 },
                      gap: { xs: 0.5, sm: 0.5 },
                    }}>
                      <IconButton
                        onClick={quantity === 1 ? handleRemoveClick : () => handleQuantityChange(quantity - 1)}
                        disabled={isProductDeleted}
                        size="small"
                        sx={{
                          width: { xs: 24, sm: 28 },
                          height: { xs: 24, sm: 28 },
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
                          '&:active': {
                            transform: 'scale(0.95)',
                          }
                        }}
                      >
                        {quantity === 1 ? (
                          <DeleteIcon sx={{ fontSize: { xs: 14, sm: 14 } }} />
                        ) : (
                          <RemoveIcon sx={{ fontSize: { xs: 14, sm: 14 } }} />
                        )}
                      </IconButton>

                      <Typography 
                        variant="body2" 
                        fontWeight={600} 
                        sx={{ 
                          minWidth: { xs: 24, sm: 24 }, 
                          textAlign: 'center', 
                          fontSize: { xs: '0.75rem', sm: '0.9rem' } 
                        }}
                      >
                        {quantity}
                      </Typography>

                      <IconButton
                        onClick={() => handleQuantityChange(quantity + 1)}
                        disabled={quantity >= item.product_variant.stock || isProductDeleted}
                        size="small"
                        sx={{
                          width: { xs: 24, sm: 28 },
                          height: { xs: 24, sm: 28 },
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
                          '&:active': {
                            transform: 'scale(0.95)',
                          }
                        }}
                      >
                        <AddIcon sx={{ fontSize: { xs: 14, sm: 14 } }} />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              </Box>

            </Box>
            
          </Box>

         
        </Box>
      </CardContent>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleRemoveConfirm}
        title="Hapus dari Keranjang"
        message={`Apakah Anda yakin ingin menghapus "${item.product_variant.product.name}" dari keranjang?`}
        confirmText="Hapus"
        cancelText="Batal"
        variant="warning"
        confirmColor="error"
      />
    </Card>
  );
}
