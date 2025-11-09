import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Box,
  Typography,
  Menu,
  MenuItem,
  Select,
  FormControl,
  Skeleton,
  Tooltip,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { OrderWithUser } from '../services/orderApi';
import { Order } from '@/features/orders/types';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';

interface OrderTableProps {
  orders: OrderWithUser[];
  isLoading: boolean;
  onView: (order: Order) => void;
  onStatusUpdate: (orderId: string, newStatus: string) => void;
}

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

export default function OrderTable({
  orders,
  isLoading,
  onView,
  onStatusUpdate,
}: OrderTableProps) {
  const { formatPrice } = useCurrencyConversion();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderWithUser | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, order: OrderWithUser) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrder(order);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedOrder(null);
  };

  const handleView = () => {
    if (selectedOrder) {
      onView(selectedOrder);
    }
    handleMenuClose();
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    onStatusUpdate(orderId, newStatus);
    handleMenuClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading && orders.length === 0) {
    return (
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID Pesanan</TableCell>
              <TableCell>Pelanggan</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Pembayaran</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Tanggal</TableCell>
              <TableCell align="right">Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell><Skeleton /></TableCell>
                <TableCell><Skeleton /></TableCell>
                <TableCell><Skeleton /></TableCell>
                <TableCell><Skeleton /></TableCell>
                <TableCell><Skeleton /></TableCell>
                <TableCell><Skeleton /></TableCell>
                <TableCell align="right"><Skeleton /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (orders.length === 0) {
    return (
      <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Typography variant="body1" color="textSecondary">
          Tidak ada pesanan ditemukan
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID Pesanan</TableCell>
              <TableCell>Pelanggan</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Pembayaran</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Tanggal</TableCell>
              <TableCell align="right">Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight={500}>
                    #{order.id.slice(-8).toUpperCase()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {order.user?.full_name || 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {order.user?.email || 'N/A'}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      sx={{
                        height: 28,
                        fontSize: '0.75rem',
                        '& .MuiSelect-select': {
                          py: 0.5,
                        },
                      }}
                    >
                      {/* Only show valid transitions based on current status */}
                      {order.status === 'belum_bayar' && [
                        <MenuItem key="belum_bayar" value="belum_bayar" disabled>Belum Bayar (Current)</MenuItem>,
                        <MenuItem key="dikemas" value="dikemas">Dikemas</MenuItem>,
                        <MenuItem key="dibatalkan" value="dibatalkan">Dibatalkan</MenuItem>
                      ]}
                      {order.status === 'dikemas' && [
                        <MenuItem key="dikemas" value="dikemas" disabled>Dikemas (Current)</MenuItem>,
                        <MenuItem key="dikirim" value="dikirim">Dikirim</MenuItem>,
                        <MenuItem key="dibatalkan" value="dibatalkan">Dibatalkan</MenuItem>
                      ]}
                      {order.status === 'dikirim' && [
                        <MenuItem key="dikirim" value="dikirim" disabled>Dikirim (Current)</MenuItem>,
                        <MenuItem key="diterima" value="diterima">Diterima</MenuItem>
                      ]}
                      {order.status === 'diterima' && (
                        <MenuItem value="diterima" disabled>Diterima (Final)</MenuItem>
                      )}
                      {order.status === 'dibatalkan' && (
                        <MenuItem value="dibatalkan" disabled>Dibatalkan (Final)</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <Chip
                    label={getPaymentStatusLabel(order.payment_status)}
                    size="small"
                    color={getPaymentStatusColor(order.payment_status) as any}
                    variant="outlined"
                    sx={{ fontSize: '0.7rem', height: 24 }}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {formatPrice((Number(order.total_amount) || 0) + (Number(order.shipping_cost) || 0))}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="textSecondary">
                    {formatDate(order.created_at)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Lihat Detail">
                    <IconButton
                      size="small"
                      onClick={() => onView(order)}
                      sx={{ color: 'primary.main' }}
                    >
                      <ViewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>
          <ViewIcon sx={{ mr: 1, fontSize: 20 }} />
          Lihat Detail
        </MenuItem>
      </Menu>
    </>
  );
}

