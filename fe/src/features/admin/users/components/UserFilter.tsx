import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Typography,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { UserQueryParams } from '../types';

interface UserFilterProps {
  onFilterChange: (filters: UserQueryParams) => void;
  loading?: boolean;
  initialFilters?: UserQueryParams;
}

export default function UserFilter({
  onFilterChange,
  loading = false,
  initialFilters,
}: UserFilterProps) {
  const [filters, setFilters] = useState<UserQueryParams>({
    search: '',
    role: '',
    sort: 'created_at',
    sortOrder: 'desc',
    ...initialFilters,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<number | null>(null);

  // Memoize onFilterChange untuk mencegah infinite loop
  const memoizedOnFilterChange = useCallback(onFilterChange, []);

  // Debounce search input
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      memoizedOnFilterChange(filters);
    }, filters.search ? 500 : 0); // Debounce hanya untuk search, filter lain langsung

    setSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [filters, memoizedOnFilterChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) clearTimeout(searchTimeout);
    };
  }, [searchTimeout]);

  const handleFilterChange = (field: keyof UserQueryParams, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      search: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      role: '',
      sort: 'created_at',
      sortOrder: 'desc',
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.role) count++;
    if (filters.sort !== 'created_at') count++;
    if (filters.sortOrder !== 'desc') count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Box sx={{ mb: 3 }}>
      {/* Basic Filters */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Box sx={{ flex: '1 1 300px', minWidth: 200 }}>
          <TextField
            fullWidth
            placeholder="Cari pengguna..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            disabled={loading}
          />
        </Box>

        <Box sx={{ flex: '1 1 200px', minWidth: 150 }}>
          <FormControl fullWidth disabled={loading}>
            <InputLabel>Role</InputLabel>
            <Select
              value={filters.role || ''}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              label="Role"
            >
              <MenuItem value="">Semua Role</MenuItem>
              <MenuItem value="user">User</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ flex: '1 1 150px', minWidth: 120 }}>
          <FormControl fullWidth disabled={loading}>
            <InputLabel>Urutkan</InputLabel>
            <Select
              value={filters.sort || 'created_at'}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              label="Urutkan"
            >
              <MenuItem value="name">Nama</MenuItem>
              <MenuItem value="email">Email</MenuItem>
              <MenuItem value="role">Role</MenuItem>
              <MenuItem value="created_at">Tanggal Dibuat</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ flex: '1 1 150px', minWidth: 120 }}>
          <FormControl fullWidth disabled={loading}>
            <InputLabel>Urutan</InputLabel>
            <Select
              value={filters.sortOrder || 'desc'}
              onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
              label="Urutan"
            >
              <MenuItem value="asc">A-Z / Terendah</MenuItem>
              <MenuItem value="desc">Z-A / Tertinggi</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setShowAdvanced(!showAdvanced)}
            disabled={loading}
          >
            Filter
            {activeFiltersCount > 0 && (
              <Chip
                label={activeFiltersCount}
                size="small"
                color="primary"
                sx={{ ml: 1, minWidth: 20, height: 20 }}
              />
            )}
          </Button>
          {activeFiltersCount > 0 && (
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={handleClearFilters}
              disabled={loading}
              color="error"
            >
              Clear
            </Button>
          )}
        </Box>
      </Box>

      {/* Advanced Filters */}
      {showAdvanced && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="subtitle2" gutterBottom>
            Filter Lanjutan
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="body2" color="textSecondary">
              Filter lanjutan akan ditambahkan sesuai kebutuhan.
            </Typography>
          </Box>
        </Box>
      )}
    </Box>
  );
}
