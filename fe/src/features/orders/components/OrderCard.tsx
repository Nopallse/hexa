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

interface OrderCardProps {
  order: Order;
  onView: (order: Order) => void;
}

export default function OrderCard({ order, onView }: OrderCardProps) {
  const theme = useTheme();
  const [cancelling, setCancelling] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

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
      case 'confirmed':
        return 'info';
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
      case 'confirmed':
        return 'Dikonfirmasi';
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
        border: `1px solid ${theme.palette.grey[200]}`,
        borderRadius: 3,
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="flex-start">
          {/* Order Info */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                  Order #{order.id.slice(-8).toUpperCase()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(order.created_at)}
                </Typography>
              </Box>
              
              <Stack direction="row" spacing={1}>
                <Chip
                  label={getStatusLabel(order.status)}
                  color={getStatusColor(order.status) as any}
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={getPaymentStatusLabel(order.payment_status)}
                  color={getPaymentStatusColor(order.payment_status) as any}
                  size="small"
                  variant="outlined"
                />
              </Stack>
            </Stack>

            {/* Items Preview */}
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <Avatar
                src={primaryImage || `https://placehold.co/50x50/9682DB/FFFFFF/png?text=${encodeURIComponent(order.order_items[0]?.product_variant?.product?.name || 'Order')}`}
                alt="Order items"
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: 2,
                  flexShrink: 0,
                }}
                variant="rounded"
              >
                <ShoppingCartIcon />
              </Avatar>
              
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
                  {order.order_items.length} item
                  {order.order_items.length > 1 && 's'}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {order.order_items[0]?.product_variant?.product?.name}
                  {order.order_items.length > 1 && ` dan ${order.order_items.length - 1} item lainnya`}
                </Typography>
              </Box>
            </Stack>

            {/* Address */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              <strong>Alamat:</strong> {order.address.address_line}, {order.address.city}, {order.address.province}
            </Typography>

            {/* Tracking Info */}
            {order.shipping?.tracking_number && (
              <Typography variant="body2" color="primary.main" sx={{ mb: 1 }}>
                <strong>No. Resi:</strong> {order.shipping.tracking_number}
              </Typography>
            )}
          </Box>

          {/* Price & Actions */}
          <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, minWidth: { xs: 'auto', sm: '200px' } }}>
            <Typography variant="h6" color="primary.main" fontWeight={700} sx={{ mb: 1 }}>
              {formatPrice(order.total_amount + order.shipping_cost)}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Total: {formatPrice(order.total_amount)} + 
              <br />
              Ongkir: {formatPrice(order.shipping_cost)}
            </Typography>

            <Stack direction={{ xs: 'row', sm: 'column' }} spacing={1}>
              <Button
                variant="contained"
                size="small"
                startIcon={<VisibilityIcon />}
                onClick={() => onView(order)}
                sx={{
                  borderRadius: 2,
                  fontWeight: 600,
                  flex: { xs: 1, sm: 'none' },
                }}
              >
                Lihat Detail
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
                    flex: { xs: 1, sm: 'none' },
                  }}
                >
                  {cancelling ? 'Membatalkan...' : 'Batalkan'}
                </Button>
              )}
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
