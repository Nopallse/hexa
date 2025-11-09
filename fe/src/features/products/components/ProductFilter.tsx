import { 
  Box, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button, 
  Stack, 
  useTheme,
  Chip,
  Collapse,
  IconButton,
} from '@mui/material';
import { 
  Search, 
  FilterList, 
  Clear, 
  ExpandMore, 
  ExpandLess 
} from '@mui/icons-material';
import { useState } from 'react';
import { ProductQueryParams } from '../types';

interface ProductFilterProps {
  filters: ProductQueryParams;
  onFilterChange: (filters: ProductQueryParams) => void;
  categories: Array<{ id: string; name: string }>;
  loading?: boolean;
}

export default function ProductFilter({ 
  filters, 
  onFilterChange, 
  categories, 
  loading = false 
}: ProductFilterProps) {
  const theme = useTheme();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: event.target.value, page: 1 });
  };

  const handleCategoryChange = (event: any) => {
    onFilterChange({ 
      ...filters, 
      category: event.target.value || undefined, 
      page: 1 
    });
  };

  const handleSortChange = (event: any) => {
    onFilterChange({ ...filters, sort: event.target.value, page: 1 });
  };

  const handleMinPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value ? parseFloat(event.target.value) : undefined;
    onFilterChange({ ...filters, min_price: value, page: 1 });
  };

  const handleMaxPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value ? parseFloat(event.target.value) : undefined;
    onFilterChange({ ...filters, max_price: value, page: 1 });
  };

  const handleClearFilters = () => {
    onFilterChange({ page: 1, limit: 12 });
  };

  const hasActiveFilters = filters.search || filters.category || filters.min_price || filters.max_price;

  return (
    <Box
      sx={{
        p: 4,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #ffffff 0%, #faf8ff 100%)',
        border: `1px solid ${theme.palette.primary.light}20`,
        mb: 4,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }}
    >
      {/* Main Filters */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
        {/* Search */}
        <TextField
          fullWidth
          placeholder="Cari produk..."
          value={filters.search || ''}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
            endAdornment: filters.search && (
              <IconButton
                size="small"
                onClick={() => onFilterChange({ ...filters, search: undefined, page: 1 })}
                sx={{ color: 'text.secondary' }}
              >
                <Clear fontSize="small" />
              </IconButton>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
            },
          }}
        />

        {/* Category Filter */}
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Kategori</InputLabel>
          <Select
            value={filters.category || ''}
            onChange={handleCategoryChange}
            label="Kategori"
            disabled={loading}
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="">
              <em>Semua Kategori</em>
            </MenuItem>
            {categories.map((category) => (
              <MenuItem key={category.id} value={category.id}>
                {category.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Sort */}
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Urutkan</InputLabel>
          <Select
            value={filters.sort || 'created_at'}
            onChange={handleSortChange}
            label="Urutkan"
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="created_at">Terbaru</MenuItem>
            <MenuItem value="name">Nama A-Z</MenuItem>
            <MenuItem value="price">Harga Terendah</MenuItem>
            <MenuItem value="stock">Stok Terbanyak</MenuItem>
          </Select>
        </FormControl>

        {/* Advanced Filters Toggle */}
        <Button
          variant="outlined"
          startIcon={<FilterList />}
          endIcon={showAdvanced ? <ExpandLess /> : <ExpandMore />}
          onClick={() => setShowAdvanced(!showAdvanced)}
          sx={{
            borderRadius: 2,
            borderColor: theme.palette.primary.light,
            color: theme.palette.primary.main,
            '&:hover': {
              borderColor: theme.palette.primary.main,
              backgroundColor: theme.palette.primary.light + '10',
            },
          }}
        >
          Filter Lanjutan
        </Button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button
            variant="outlined"
            startIcon={<Clear />}
            onClick={handleClearFilters}
            sx={{
              borderRadius: 2,
              borderColor: theme.palette.error.light,
              color: theme.palette.error.main,
              '&:hover': {
                borderColor: theme.palette.error.main,
                backgroundColor: theme.palette.error.light + '10',
              },
            }}
          >
            Reset
          </Button>
        )}
      </Stack>

      {/* Advanced Filters */}
      <Collapse in={showAdvanced}>
        <Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Harga Minimum"
              type="number"
              value={filters.min_price || ''}
              onChange={handleMinPriceChange}
              InputProps={{
                startAdornment: 'Rp ',
              }}
              sx={{ minWidth: 150 }}
            />
            <TextField
              label="Harga Maksimum"
              type="number"
              value={filters.max_price || ''}
              onChange={handleMaxPriceChange}
              InputProps={{
                startAdornment: 'Rp ',
              }}
              sx={{ minWidth: 150 }}
            />
          </Stack>
        </Box>
      </Collapse>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <Box sx={{ mt: 2 }}>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {filters.search && (
              <Chip
                label={`Pencarian: "${filters.search}"`}
                onDelete={() => onFilterChange({ ...filters, search: undefined, page: 1 })}
                color="primary"
                variant="outlined"
                size="small"
              />
            )}
            {filters.category && (
              <Chip
                label={`Kategori: ${categories.find(c => c.id === filters.category)?.name}`}
                onDelete={() => onFilterChange({ ...filters, category: undefined, page: 1 })}
                color="secondary"
                variant="outlined"
                size="small"
              />
            )}
            {filters.min_price && (
              <Chip
                label={`Min: Rp ${filters.min_price.toLocaleString()}`}
                onDelete={() => onFilterChange({ ...filters, min_price: undefined, page: 1 })}
                color="info"
                variant="outlined"
                size="small"
              />
            )}
            {filters.max_price && (
              <Chip
                label={`Max: Rp ${filters.max_price.toLocaleString()}`}
                onDelete={() => onFilterChange({ ...filters, max_price: undefined, page: 1 })}
                color="info"
                variant="outlined"
                size="small"
              />
            )}
          </Stack>
        </Box>
      )}
    </Box>
  );
}
