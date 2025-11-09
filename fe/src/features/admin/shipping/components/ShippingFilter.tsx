import { useState, useEffect } from 'react';
import {
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

export interface ShippingFilterParams {
  status?: string;
  courier?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

interface ShippingFilterProps {
  onFilterChange: (filters: ShippingFilterParams) => void;
  loading?: boolean;
  initialFilters?: ShippingFilterParams;
}

export default function ShippingFilter({
  onFilterChange,
  loading = false,
  initialFilters,
}: ShippingFilterProps) {
  const theme = useTheme();
  const [filters, setFilters] = useState<ShippingFilterParams>({
    status: '',
    courier: '',
    startDate: '',
    endDate: '',
    ...initialFilters,
  });

  useEffect(() => {
    if (initialFilters) {
      setFilters(prev => ({ ...prev, ...initialFilters }));
    }
  }, [initialFilters]);

  const handleFilterChange = (field: keyof ShippingFilterParams, value: any) => {
    const newFilters = {
      ...filters,
      [field]: value,
    };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClearFilters = () => {
    const clearedFilters: ShippingFilterParams = {
      status: '',
      courier: '',
      startDate: '',
      endDate: '',
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = filters.status || filters.courier || filters.startDate || filters.endDate;

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
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              label="Status"
              disabled={loading}
            >
              <MenuItem value="">Semua Status</MenuItem>
              <MenuItem value="pending">Menunggu Pengiriman</MenuItem>
              <MenuItem value="confirmed">Dikonfirmasi</MenuItem>
              <MenuItem value="shipped">Terkirim</MenuItem>
              <MenuItem value="in_transit">Dalam Perjalanan</MenuItem>
              <MenuItem value="delivered">Terkirim</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Kurir</InputLabel>
            <Select
              value={filters.courier || ''}
              onChange={(e) => handleFilterChange('courier', e.target.value)}
              label="Kurir"
              disabled={loading}
            >
              <MenuItem value="">Semua Kurir</MenuItem>
              <MenuItem value="jne">JNE</MenuItem>
              <MenuItem value="jnt">J&T</MenuItem>
              <MenuItem value="sicepat">SiCepat</MenuItem>
              <MenuItem value="pos">POS Indonesia</MenuItem>
              <MenuItem value="anteraja">AnterAja</MenuItem>
              <MenuItem value="tiki">TIKI</MenuItem>
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
            Reset
          </Button>
        </Grid>
      </Grid>
    </Paper>
  );
}

