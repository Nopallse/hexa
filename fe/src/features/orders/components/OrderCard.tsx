import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Button,
  useTheme,
  Avatar,
  useMediaQuery,
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
import { getProductImageUrl } from '@/utils/image';

interface OrderCardProps {
  order: Order;
  onView: (order: Order) => void;
}

export default function OrderCard({ order, onView }: OrderCardProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
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
      case 'belum_bayar':
        return 'warning';
      case 'dikemas':
        return 'primary';
      case 'dikirim':
        return 'info';
      case 'diterima':
        return 'success';
      case 'dibatalkan':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'belum_bayar':
        return 'Belum Bayar';
      case 'dikemas':
        return 'Dikemas';
      case 'dikirim':
        return 'Dikirim';
      case 'diterima':
        return 'Diterima';
      case 'dibatalkan':
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
    if (!order?.id) {
      console.error('Order ID is missing');
      return;
    }

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

  const canCancel = order?.status === 'belum_bayar';
  const firstOrderItem = order?.order_items && order.order_items.length > 0 ? order.order_items[0] : null;
  const productImages = firstOrderItem?.product_variant?.product?.product_images;
  const primaryImage = productImages && productImages.length > 0 ? productImages[0]?.image_name : null;
  const displayImage = primaryImage || null;

  return (
    <Card
      sx={{
        mb: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        border: 'none',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        },
      }}
    >
      <CardContent sx={{ p: { xs: 1, sm: 3 } }}>
        {/* Modern Layout */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          gap: { xs: 1, sm: 3 } 
        }}>
          {/* Order Image & Info Container */}
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            gap: { xs: 1, sm: 3 },
            flex: 1,
            minWidth: 0,
            width: { xs: '100%', sm: 'auto' }
          }}>
            {/* Order Image */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              flexShrink: 0
            }}>
              <Avatar
                src={displayImage ? getProductImageUrl(displayImage) : undefined}
                alt={firstOrderItem?.product_variant?.product?.name || 'Order'}
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
                  whiteSpace: 'nowrap',
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }}
                title={`Order #${order.id ? order.id.slice(-8).toUpperCase() : 'N/A'}`}
              >
                Order #{order.id ? order.id.slice(-8).toUpperCase() : 'N/A'}
              </Typography>
              
              {/* Status Chip - Hanya status utama order */}
              <Box sx={{ mb: 1 }}>
                <Chip
                  label={getStatusLabel(order?.status || '')}
                  size="small"
                  variant="outlined"
                  sx={{ 
                    fontSize: { xs: '0.65rem', sm: '0.7rem' },
                    height: { xs: 18, sm: 20 },
                    borderColor: getStatusColor(order?.status || '') === 'warning' ? 'warning.main' : 
                                getStatusColor(order?.status || '') === 'success' ? 'success.main' :
                                getStatusColor(order?.status || '') === 'error' ? 'error.main' :
                                getStatusColor(order?.status || '') === 'info' ? 'info.main' : 'primary.main',
                    color: getStatusColor(order?.status || '') === 'warning' ? 'warning.main' : 
                           getStatusColor(order?.status || '') === 'success' ? 'success.main' :
                           getStatusColor(order?.status || '') === 'error' ? 'error.main' :
                           getStatusColor(order?.status || '') === 'info' ? 'info.main' : 'primary.main',
                    '& .MuiChip-label': {
                      px: { xs: 0.75, sm: 1 },
                    }
                  }}
                />
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, mb: 0.5 }}>
                Dibuat: {order?.created_at ? formatDate(order.created_at) : 'N/A'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, mb: 0.5 }}>
                {order?.order_items?.length || 0} item{(order?.order_items?.length || 0) > 1 ? 's' : ''}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                {order?.address?.city || ''}, {order?.address?.province || ''}
              </Typography>
            </Box>
          </Box>

          {/* Price & Actions */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'row', sm: 'column' },
            alignItems: { xs: 'center', sm: 'flex-end' },
            justifyContent: { xs: 'space-between', sm: 'flex-end' },
            gap: { xs: 2, sm: 2 },
            flexShrink: 0,
            width: { xs: '100%', sm: 'auto' }
          }}>
            {/* Price */}
            <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, minWidth: { xs: 'auto', sm: 100 } }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' }, mb: 0.5 }}>
                Total
              </Typography>
              <Typography variant="h6" color="primary.main" fontWeight={700} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                {formatPrice((Number(order?.total_amount) || 0) + (Number(order?.shipping_cost) || 0))}
              </Typography>
            </Box>

            {/* Action Buttons */}
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'row', sm: 'column' },
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
                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                  py: { xs: 0.5, sm: 0.5 },
                  px: { xs: 1, sm: 1.5 },
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
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    py: { xs: 0.5, sm: 0.5 },
                    px: { xs: 1, sm: 1.5 },
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
