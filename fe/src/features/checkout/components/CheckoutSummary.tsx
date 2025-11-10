import {
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  Divider,
  Box,
  Avatar,
  useTheme,
  Chip,
  useMediaQuery,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { CartItem } from '@/features/cart/types';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';
import { ShippingMethod } from '../types/shipping';

interface CheckoutSummaryProps {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  onCreateOrder: () => void;
  creatingOrder: boolean;
  disabled: boolean;
  selectedPaymentMethod?: string | null;
  selectedShippingMethod?: ShippingMethod | null;
}

export default function CheckoutSummary({
  items,
  subtotal,
  shippingCost,
  total,
  onCreateOrder,
  creatingOrder,
  disabled,
  selectedPaymentMethod,
  selectedShippingMethod,
}: CheckoutSummaryProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { formatPrice } = useCurrencyConversion();


  return (
    <Card sx={{ 
      position: { xs: 'static', lg: 'sticky' }, 
      top: { lg: 24 },
      borderRadius: 2,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: 'none',
    }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Typography 
          variant="h6" 
          fontWeight={600} 
          sx={{ 
            mb: { xs: 2, sm: 3 }, 
            color: 'text.primary',
            fontSize: { xs: '1rem', sm: '1.25rem' }
          }}
        >
          Rincian Pembayaran
        </Typography>

        {/* Items List - Hide on mobile (shown in main content) */}
        {!isMobile && (
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="subtitle1" 
              fontWeight={600} 
              sx={{ 
                mb: 2,
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              Item ({items.length})
            </Typography>
            <Stack spacing={2}>
              {items.map((item) => {
                const primaryImage = item.product_variant.product.product_images?.[0]?.image_name;
                
                return (
                  <Box
                    key={item.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: 2,
                      backgroundColor: 'grey.50',
                    }}
                  >
                    <Avatar
                      src={primaryImage || `https://placehold.co/50x50/9682DB/FFFFFF/png?text=${encodeURIComponent(item.product_variant.product.name.substring(0, 10))}`}
                      alt={item.product_variant.product.name}
                      sx={{
                        width: { xs: 40, sm: 50 },
                        height: { xs: 40, sm: 50 },
                        borderRadius: 2,
                        flexShrink: 0,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                      }}
                      variant="rounded"
                    >
                      <ShoppingCartIcon />
                    </Avatar>
                    
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant="subtitle2" 
                        fontWeight={600} 
                        sx={{ 
                          mb: 0.5,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontSize: { xs: '0.875rem', sm: '0.9rem' }
                        }}
                        title={item.product_variant.product.name}
                      >
                        {item.product_variant.product.name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                      >
                        {item.product_variant.variant_name}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
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
          </Box>
        )}

        <Divider sx={{ my: { xs: 2, sm: 2 } }} />

        {/* Price Breakdown */}
        <Stack spacing={{ xs: 1.5, sm: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            py: { xs: 1.5, sm: 2 },
            px: { xs: 1.5, sm: 2 },
            backgroundColor: 'grey.50',
            borderRadius: 2,
          }}>
            <Typography 
              variant="body1" 
              fontWeight={500}
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Subtotal
            </Typography>
            <Typography 
              variant="body1" 
              fontWeight={600}
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              {formatPrice(subtotal)}
            </Typography>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            py: { xs: 1.5, sm: 2 },
            px: { xs: 1.5, sm: 2 },
            backgroundColor: 'grey.50',
            borderRadius: 2,
          }}>
            <Box>
              <Typography 
                variant="body1" 
                fontWeight={500}
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                Biaya Pengiriman
              </Typography>
              {selectedShippingMethod && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                  >
                    {selectedShippingMethod.courier_name} - {selectedShippingMethod.courier_service_name}
                  </Typography>
                 
                </Box>
              )}
            </Box>
            <Typography 
              variant="body1" 
              fontWeight={600}
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              {formatPrice(shippingCost)}
            </Typography>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            py: { xs: 1.5, sm: 2 },
            px: { xs: 1.5, sm: 2 },
            backgroundColor: 'primary.main',
            borderRadius: 2,
            color: 'white',
          }}>
            <Typography 
              variant="h6" 
              fontWeight={600}
              sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              Total
            </Typography>
            <Typography 
              variant="h6" 
              fontWeight={700}
              sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              {formatPrice(total)}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: { xs: 2, sm: 3 } }} />

        {/* Create Order & Payment Button */}
        <Button
          variant="contained"
          size="large"
          startIcon={<PaymentIcon />}
          onClick={onCreateOrder}
          disabled={disabled || creatingOrder}
          fullWidth
          sx={{
            py: { xs: 1.25, sm: 1.5 },
            borderRadius: 2,
            fontWeight: 600,
            fontSize: { xs: '0.875rem', sm: '1rem' },
            minHeight: { xs: 44, sm: 48 },
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
          {creatingOrder ? 'Membuat Order...' : 'Buat Order & Bayar'}
        </Button>


        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            mt: 2, 
            textAlign: 'center',
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }}
        >
          Dengan melanjutkan, Anda menyetujui syarat dan ketentuan kami
        </Typography>
      </CardContent>
    </Card>
  );
}
