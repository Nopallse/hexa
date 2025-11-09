import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Paper,
  Grid,
  useTheme,
} from '@mui/material';
import {
  Clear as ClearIcon,
} from '@mui/icons-material';
import { PaymentQueryParams } from '../services/paymentApi';

interface PaymentFilterProps {
  onFilterChange: (filters: PaymentQueryParams) => void;
  loading?: boolean;
  initialFilters?: PaymentQueryParams;
}

export default function PaymentFilter({
  onFilterChange,
  loading = false,
  initialFilters,
}: PaymentFilterProps) {
  const theme = useTheme();
  const [filters, setFilters] = useState<PaymentQueryParams>({
    payment_status: '',
    payment_method: '',
    startDate: '',
    endDate: '',
    ...initialFilters,
  });

  useEffect(() => {
    if (initialFilters) {
      setFilters(prev => ({ ...prev, ...initialFilters }));
    }
  }, [initialFilters]);

  const handleFilterChange = (field: keyof PaymentQueryParams, value: any) => {
    const newFilters = {
      ...filters,
      [field]: value,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: PaymentQueryParams = {
      payment_status: '',
      payment_method: '',
      startDate: '',
      endDate: '',
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = filters.payment_status || filters.payment_method || filters.startDate || filters.endDate;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 2,
        border: `1px solid ${theme.palette.grey[200]}`,
      }}
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Status Pembayaran</InputLabel>
            <Select
              value={filters.payment_status || ''}
              onChange={(e) => handleFilterChange('payment_status', e.target.value)}
              label="Status Pembayaran"
              disabled={loading}
            >
              <MenuItem value="">Semua Status</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="paid">Paid</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
              <MenuItem value="refunded">Refunded</MenuItem>
              <MenuItem value="cancelled">Cancelled</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Metode Pembayaran</InputLabel>
            <Select
              value={filters.payment_method || ''}
              onChange={(e) => handleFilterChange('payment_method', e.target.value)}
              label="Metode Pembayaran"
              disabled={loading}
            >
              <MenuItem value="">Semua Metode</MenuItem>
              <MenuItem value="midtrans">Midtrans</MenuItem>
              <MenuItem value="paypal">PayPal</MenuItem>
              <MenuItem value="transfer">Transfer</MenuItem>
              <MenuItem value="e-wallet">E-Wallet</MenuItem>
              <MenuItem value="COD">COD</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Tanggal Mulai"
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
            disabled={loading}
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <TextField
            fullWidth
            size="small"
            label="Tanggal Akhir"
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
            disabled={loading}
          />
        </Grid>

        <Grid item xs={12} md={2}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={handleClearFilters}
            disabled={loading || !hasActiveFilters}
            sx={{ height: 40 }}
          >
            Hapus Filter
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}

