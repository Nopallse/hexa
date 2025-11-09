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
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { AdminOrderQueryParams } from '../services/orderApi';

interface OrderFilterProps {
  onFilterChange: (filters: AdminOrderQueryParams) => void;
  loading?: boolean;
  initialFilters?: AdminOrderQueryParams;
}

export default function OrderFilter({
  onFilterChange,
  loading = false,
  initialFilters,
}: OrderFilterProps) {
  const theme = useTheme();
  const [filters, setFilters] = useState<AdminOrderQueryParams>({
    search: '',
    payment_status: '',
    ...initialFilters,
  });

  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (initialFilters) {
      setFilters(prev => ({ ...prev, ...initialFilters }));
    }
  }, [initialFilters]);

  const handleFilterChange = (field: keyof AdminOrderQueryParams, value: any) => {
    const newFilters = {
      ...filters,
      [field]: value,
    };
    setFilters(newFilters);
    
    // Apply filters immediately for non-search fields
    if (field !== 'search') {
      onFilterChange(newFilters);
    }
  };

  const handleSearchChange = (value: string) => {
    const newFilters = {
      ...filters,
      search: value,
    };
    setFilters(newFilters);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Debounce search
    const timeout = setTimeout(() => {
      onFilterChange(newFilters);
    }, 500);
    
    setSearchTimeout(timeout);
  };

  const handleClearFilters = () => {
    const clearedFilters: AdminOrderQueryParams = {
      search: '',
      payment_status: '',
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  const hasActiveFilters = filters.search || filters.payment_status;

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
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            placeholder="Cari ID pesanan, nama, atau email..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            disabled={loading}
          />
        </Grid>
        
        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Status Pembayaran</InputLabel>
            <Select
              value={filters.payment_status || ''}
              onChange={(e) => handleFilterChange('payment_status', e.target.value)}
              label="Status Pembayaran"
              disabled={loading}
            >
              <MenuItem value="">Semua</MenuItem>
              <MenuItem value="unpaid">Belum Dibayar</MenuItem>
              <MenuItem value="paid">Sudah Dibayar</MenuItem>
              <MenuItem value="failed">Gagal Bayar</MenuItem>
              <MenuItem value="refunded">Dikembalikan</MenuItem>
            </Select>
          </FormControl>
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

