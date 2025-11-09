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
  Skeleton,
  Tooltip,
} from '@mui/material';
import {
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { OrderWithUser } from '../services/orderApi';
import { Order } from '@/features/orders/types';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';

interface OrderTableProps {
  orders: OrderWithUser[];
  isLoading: boolean;
  onView: (order: Order) => void;
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


export default function OrderTable({
  orders,
  isLoading,
  onView,
}: OrderTableProps) {
  const { formatPrice } = useCurrencyConversion();


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
                  <Chip
                    label={getStatusLabel(order.status)}
                    size="small"
                    color={getStatusColor(order.status) as any}
                    variant="outlined"
                    sx={{ fontSize: '0.75rem', height: 24, fontWeight: 500 }}
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
    </>
  );
}

