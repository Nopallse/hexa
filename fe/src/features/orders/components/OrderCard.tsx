import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  Chip,
  Button,
  useTheme,
  Avatar,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  ShoppingCart as ShoppingCartIcon,
  Visibility as VisibilityIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { Order } from '../types';
import { orderApi } from '../services/orderApi';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';

interface OrderCardProps {
  order: Order;
  onView: (order: Order) => void;
}

export default function OrderCard({ order, onView }: OrderCardProps) {
  const theme = useTheme();
  const [cancelling, setCancelling] = useState(false);
  const { formatPrice } = useCurrencyConversion();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'processing':
        return 'primary';
      case 'shipped':
        return 'primary';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Menunggu Konfirmasi';
      case 'processing':
        return 'Sedang Diproses';
      case 'shipped':
        return 'Dikirim';
      case 'delivered':
        return 'Selesai';
      case 'cancelled':
        return 'Dibatalkan';
      default:
        return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'unpaid':
        return 'error';
      case 'paid':
        return 'success';
      case 'failed':
        return 'error';
      case 'refunded':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'unpaid':
        return 'Belum Dibayar';
      case 'paid':
        return 'Sudah Dibayar';
      case 'failed':
        return 'Gagal Bayar';
      case 'refunded':
        return 'Dikembalikan';
      default:
        return status;
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan pesanan ini?')) {
      return;
    }

    try {
      setCancelling(true);
      const response = await orderApi.cancelOrder(order.id);

      if (response.success) {
        // Refresh the page or update the order in the parent component
        window.location.reload();
      }
    } catch (err: any) {
      console.error('Error cancelling order:', err);
      alert(err.response?.data?.error || 'Gagal membatalkan pesanan');
    } finally {
      setCancelling(false);
    }
  };

  const canCancel = order.status === 'pending';
  const primaryImage = order.order_items[0]?.product_variant?.product?.product_images?.[0]?.image_name;

  return (
    <Card
      sx={{
        mb: 2,
        borderRadius: 2,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: 'none',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        {/* Modern Layout */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          {/* Order Image */}
          <Box sx={{ flexShrink: 0 }}>
            <Avatar
              src={primaryImage ? `/uploads/${primaryImage}` : `https://placehold.co/80x80/9682DB/FFFFFF/png?text=${encodeURIComponent(order.order_items[0]?.product_variant?.product?.name?.substring(0, 10) || 'Order')}`}
              alt="Order items"
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

          {/* Order Info */}
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
              title={`Order #${order.id.slice(-8).toUpperCase()}`}
            >
              Order #{order.id.slice(-8).toUpperCase()}
            </Typography>
            
            {/* Status Chips */}
            <Stack direction="row" spacing={0.5} sx={{ mb: 1, flexWrap: 'wrap' }}>
              <Chip
                label={getStatusLabel(order.status)}
                size="small"
                variant="outlined"
                sx={{ 
                  fontSize: '0.7rem',
                  height: 20,
                  borderColor: getStatusColor(order.status) === 'warning' ? 'warning.main' : 
                              getStatusColor(order.status) === 'success' ? 'success.main' :
                              getStatusColor(order.status) === 'error' ? 'error.main' : 'primary.main',
                  color: getStatusColor(order.status) === 'warning' ? 'warning.main' : 
                         getStatusColor(order.status) === 'success' ? 'success.main' :
                         getStatusColor(order.status) === 'error' ? 'error.main' : 'primary.main',
                  '& .MuiChip-label': {
                    px: 1,
                  }
                }}
              />
              <Chip
                label={getPaymentStatusLabel(order.payment_status)}
                size="small"
                variant="outlined"
                sx={{ 
                  fontSize: '0.7rem',
                  height: 20,
                  borderColor: getPaymentStatusColor(order.payment_status) === 'warning' ? 'warning.main' : 
                              getPaymentStatusColor(order.payment_status) === 'success' ? 'success.main' :
                              getPaymentStatusColor(order.payment_status) === 'error' ? 'error.main' : 'primary.main',
                  color: getPaymentStatusColor(order.payment_status) === 'warning' ? 'warning.main' : 
                         getPaymentStatusColor(order.payment_status) === 'success' ? 'success.main' :
                         getPaymentStatusColor(order.payment_status) === 'error' ? 'error.main' : 'primary.main',
                  '& .MuiChip-label': {
                    px: 1,
                  }
                }}
              />
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
              Dibuat: {formatDate(order.created_at)}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
              {order.order_items.length} item{order.order_items.length > 1 ? 's' : ''}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {order.address.city}, {order.address.province}
            </Typography>
          </Box>

          {/* Price & Actions */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: 2,
            flexShrink: 0,
          }}>
            {/* Price */}
            <Box sx={{ textAlign: 'right', minWidth: 100 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 0.5 }}>
                Total
              </Typography>
              <Typography variant="h6" color="primary.main" fontWeight={700} sx={{ fontSize: '1rem' }}>
                {formatPrice(Number(order.total_amount) + Number(order.shipping_cost))}
              </Typography>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              gap: 1,
            }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<VisibilityIcon />}
                onClick={() => onView(order)}
                sx={{
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  py: 0.5,
                  px: 1.5,
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                }}
              >
                Detail
              </Button>
              
              {canCancel && (
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<CancelIcon />}
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  color="error"
                  sx={{
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    py: 0.5,
                    px: 1.5,
                    borderColor: 'error.main',
                    color: 'error.main',
                    '&:hover': {
                      backgroundColor: 'error.light',
                      borderColor: 'error.dark',
                    },
                  }}
                >
                  {cancelling ? 'Batal...' : 'Batal'}
                </Button>
              )}
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
