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
  Tooltip,
} from '@mui/material';
import {
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { Payment } from '../services/paymentApi';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';

interface PaymentTableProps {
  payments: Payment[];
  isLoading: boolean;
  onView: (payment: Payment) => void;
}

const getPaymentStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'paid':
      return 'success';
    case 'pending':
      return 'warning';
    case 'failed':
    case 'cancelled':
      return 'error';
    case 'refunded':
      return 'info';
    default:
      return 'default';
  }
};

const getPaymentStatusText = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'paid':
      return 'Lunas';
    case 'pending':
      return 'Pending';
    case 'failed':
      return 'Gagal';
    case 'refunded':
      return 'Dikembalikan';
    case 'cancelled':
      return 'Dibatalkan';
    default:
      return status || 'Unknown';
  }
};

const getPaymentMethodText = (method: string) => {
  switch (method?.toLowerCase()) {
    case 'midtrans':
      return 'Midtrans';
    case 'paypal':
      return 'PayPal';
    case 'transfer':
      return 'Transfer';
    case 'e-wallet':
      return 'E-Wallet';
    case 'cod':
      return 'COD';
    default:
      return method || 'Unknown';
  }
};

export default function PaymentTable({
  payments,
  isLoading,
  onView,
}: PaymentTableProps) {
  const { formatPrice } = useCurrencyConversion();

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID Pembayaran</TableCell>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Metode</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Jumlah</TableCell>
              <TableCell>Tanggal</TableCell>
              <TableCell>Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell colSpan={8}>
                  <Typography variant="body2" color="text.secondary">
                    Memuat...
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  if (payments.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          Tidak ada data pembayaran
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: 'rgba(150, 130, 219, 0.05)' }}>
            <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>ID Pembayaran</TableCell>
            <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Order ID</TableCell>
            <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Customer</TableCell>
            <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Metode</TableCell>
            <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Status</TableCell>
            <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Jumlah</TableCell>
            <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Tanggal</TableCell>
            <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Aksi</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id} hover>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                {payment.id.slice(0, 8)}...
              </TableCell>
              <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                {payment.orderId.slice(0, 8)}...
              </TableCell>
              <TableCell>
                <Box>
                  <Typography variant="body2" fontWeight={500}>
                    {payment.customer?.full_name || 'N/A'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {payment.customer?.email || 'N/A'}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Typography variant="body2">
                  {getPaymentMethodText(payment.paymentMethod)}
                </Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={getPaymentStatusText(payment.paymentStatus)}
                  color={getPaymentStatusColor(payment.paymentStatus) as any}
                  size="small"
                  sx={{ fontWeight: 500 }}
                />
              </TableCell>
              <TableCell>
                <Typography variant="body2" fontWeight={500}>
                  {formatPrice(parseFloat(String(payment.amount)))}
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body2" color="text.secondary">
                  {formatDate(payment.paymentDate)}
                </Typography>
              </TableCell>
              <TableCell>
                <Tooltip title="Lihat Detail">
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => onView(payment)}
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
  );
}

