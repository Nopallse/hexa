import { useState, useEffect, useCallback, useRef } from 'react';
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
  Grid,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { ProductQueryParams } from '@/features/products/types';

interface ProductFilterProps {
  onFilterChange: (filters: ProductQueryParams) => void;
  categories?: Array<{ id: string; name: string }>;
  loading?: boolean;
  initialFilters?: ProductQueryParams;
}

export default function ProductFilter({
  onFilterChange,
  categories = [],
  loading = false,
  initialFilters,
}: ProductFilterProps) {
  const [filters, setFilters] = useState<ProductQueryParams>({
    search: '',
    category: '',
    min_price: undefined,
    max_price: undefined,
    sort: 'created_at',
    sortOrder: 'desc',
    ...initialFilters,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  // Handle non-search filter changes immediately
  const handleFilterChange = (field: keyof ProductQueryParams, value: any) => {
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

  // Handle search with debouncing
  const handleSearchChange = (value: string) => {
    const newFilters = {
      ...filters,
      search: value,
    };
    setFilters(newFilters);
    
    // Clear previous timeout
    const timeoutId = setTimeout(() => {
      onFilterChange(newFilters);
    }, 500);
    
    // Store timeout ID for cleanup if needed
    return () => clearTimeout(timeoutId);
  };

  const handleClearFilters = () => {
    const clearedFilters: ProductQueryParams = {
      search: '',
      category: '',
      min_price: undefined,
      max_price: undefined,
      sort: 'created_at',
      sortOrder: 'desc',
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.search) count++;
    if (filters.category) count++;
    if (filters.min_price) count++;
    if (filters.max_price) count++;
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
            placeholder="Cari produk..."
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
            <InputLabel>Kategori</InputLabel>
            <Select
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              label="Kategori"
            >
              <MenuItem value="">Semua Kategori</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
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
              <MenuItem value="price">Harga</MenuItem>
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
            <Box sx={{ flex: '1 1 200px', minWidth: 150 }}>
              <TextField
                fullWidth
                label="Harga Minimum"
                type="number"
                value={filters.min_price || ''}
                onChange={(e) => handleFilterChange('min_price', e.target.value ? Number(e.target.value) : undefined)}
                disabled={loading}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>Rp</Typography>,
                }}
              />
            </Box>
            <Box sx={{ flex: '1 1 200px', minWidth: 150 }}>
              <TextField
                fullWidth
                label="Harga Maksimum"
                type="number"
                value={filters.max_price || ''}
                onChange={(e) => handleFilterChange('max_price', e.target.value ? Number(e.target.value) : undefined)}
                disabled={loading}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>Rp</Typography>,
                }}
              />
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
