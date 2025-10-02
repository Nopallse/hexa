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

// Simple price formatter for IDR
const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

interface CheckoutSummaryProps {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  onCreateOrder: () => void;
  creatingOrder: boolean;
  disabled: boolean;
}

export default function CheckoutSummary({
  items,
  subtotal,
  shippingCost,
  total,
  onCreateOrder,
  creatingOrder,
  disabled,
}: CheckoutSummaryProps) {
  const theme = useTheme();

  return (
    <Card sx={{ position: 'sticky', top: 24 }}>
      <CardContent>
        <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
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
                    backgroundColor: '#f8f9fa',
                    border: `1px solid ${theme.palette.grey[200]}`,
                  }}
                >
                  <Avatar
                    src={primaryImage || `https://placehold.co/50x50/9682DB/FFFFFF/png?text=${encodeURIComponent(item.product_variant.product.name)}`}
                    alt={item.product_variant.product.name}
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: 1.5,
                      flexShrink: 0,
                    }}
                    variant="rounded"
                  >
                    <ShoppingCartIcon />
                  </Avatar>
                  
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
                      {item.product_variant.product.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.product_variant.variant_name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Qty: {item.quantity}
                    </Typography>
                  </Box>
                  
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="primary.main"
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body1">
              Subtotal
            </Typography>
            <Typography
              variant="body1"
              fontWeight={600}
            >
              {formatPrice(subtotal)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="body1">
              Biaya Pengiriman
            </Typography>
            <Typography
              variant="body1"
              fontWeight={600}
            >
              {formatPrice(shippingCost)}
            </Typography>
          </Box>

          <Divider />

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="h6" fontWeight={700}>
              Total
            </Typography>
            <Typography
              variant="h6"
              fontWeight={700}
              color="primary.main"
            >
              {formatPrice(total)}
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* Create Order & PayPal Payment Button */}
        <Button
          variant="contained"
          size="large"
          startIcon={<PaymentIcon />}
          onClick={onCreateOrder}
          disabled={disabled || creatingOrder}
          fullWidth
          sx={{
            py: 2,
            borderRadius: 2,
            fontWeight: 600,
            fontSize: '1.1rem',
            backgroundColor: '#003087',
            '&:hover': {
              backgroundColor: '#002366',
            },
          }}
        >
          {creatingOrder ? 'Membuat Order...' : 'Buat Order & Bayar dengan PayPal'}
        </Button>
        
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Pembayaran aman dengan PayPal Payment Gateway
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 2, textAlign: 'center' }}>
          Dengan melanjutkan, Anda menyetujui syarat dan ketentuan kami
        </Typography>
      </CardContent>
    </Card>
  );
}
