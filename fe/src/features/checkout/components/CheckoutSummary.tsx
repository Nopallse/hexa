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
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { CartItem } from '@/features/cart/types';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';

interface CheckoutSummaryProps {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  onCreateOrder: () => void;
  creatingOrder: boolean;
  disabled: boolean;
  selectedPaymentMethod?: string | null;
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
}: CheckoutSummaryProps) {
  const theme = useTheme();
  const { formatPrice } = useCurrencyConversion();

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
          Ringkasan Pesanan
        </Typography>

        {/* Items List */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
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
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: 'grey.50',
                  }}
                >
                  <Avatar
                    src={primaryImage || `https://placehold.co/50x50/9682DB/FFFFFF/png?text=${encodeURIComponent(item.product_variant.product.name.substring(0, 10))}`}
                    alt={item.product_variant.product.name}
                    sx={{
                      width: 50,
                      height: 50,
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
                      }}
                      title={item.product_variant.product.name}
                    >
                      {item.product_variant.product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      {item.product_variant.variant_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                      Qty: {item.quantity}
                    </Typography>
                  </Box>
                  
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="primary.main"
                    sx={{ fontSize: '0.9rem' }}
                  >
                    {formatPrice(parseFloat(item.product_variant.price) * item.quantity)}
                  </Typography>
                </Box>
              );
            })}
          </Stack>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Price Breakdown */}
        <Stack spacing={2}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            py: 2,
            px: 2,
            backgroundColor: 'grey.50',
            borderRadius: 2,
          }}>
            <Typography variant="body1" fontWeight={500}>
              Subtotal
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {formatPrice(subtotal)}
            </Typography>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            py: 2,
            px: 2,
            backgroundColor: 'grey.50',
            borderRadius: 2,
          }}>
            <Typography variant="body1" fontWeight={500}>
              Biaya Pengiriman
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {formatPrice(shippingCost)}
            </Typography>
          </Box>

          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            py: 2,
            px: 2,
            backgroundColor: 'primary.main',
            borderRadius: 2,
            color: 'white',
          }}>
            <Typography variant="h6" fontWeight={600}>
              Total
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {formatPrice(total)}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* Create Order & Payment Button */}
        <Button
          variant="contained"
          size="large"
          startIcon={<PaymentIcon />}
          onClick={onCreateOrder}
          disabled={disabled || creatingOrder}
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
          {creatingOrder ? 'Membuat Order...' : 'Buat Order & Bayar'}
        </Button>


        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          Dengan melanjutkan, Anda menyetujui syarat dan ketentuan kami
        </Typography>
      </CardContent>
    </Card>
  );
}
