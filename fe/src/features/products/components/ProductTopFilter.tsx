import { 
  Box, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Stack, 
  useTheme,
  IconButton,
  Button,
  Chip,
} from '@mui/material';
import { 
  Search, 
  Clear,
  TrendingUp,
  AccessTime,
} from '@mui/icons-material';
import { ProductQueryParams } from '../types';

interface ProductTopFilterProps {
  filters: ProductQueryParams;
  onFilterChange: (filters: ProductQueryParams) => void;
  loading?: boolean;
}

export default function ProductTopFilter({ 
  filters, 
  onFilterChange, 
  loading = false 
}: ProductTopFilterProps) {
  const theme = useTheme();

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, search: event.target.value, page: 1 });
  };

  const handleSortChange = (event: any) => {
    onFilterChange({ ...filters, sort: event.target.value, page: 1 });
  };

  const handleTerbaruClick = () => {
    onFilterChange({ ...filters, sort: 'created_at', page: 1 });
  };

  const handleTerlarisClick = () => {
    onFilterChange({ ...filters, sort: 'sold_count', page: 1 });
  };

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #ffffff 0%, #faf8ff 100%)',
        border: `1px solid ${theme.palette.primary.light}20`,
        mb: 4,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      }}
    >
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

        {/* Filter Buttons */}
        <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
          {/* Terbaru Button */}
          <Button
            variant={filters.sort === 'created_at' ? 'contained' : 'outlined'}
            startIcon={<AccessTime />}
            onClick={handleTerbaruClick}
            disabled={loading}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 2,
            }}
          >
            Terbaru
          </Button>

          {/* Terlaris Button */}
          <Button
            variant={filters.sort === 'sold_count' ? 'contained' : 'outlined'}
            startIcon={<TrendingUp />}
            onClick={handleTerlarisClick}
            disabled={loading}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 600,
              px: 2,
            }}
          >
            Terlaris
          </Button>

          {/* Harga Dropdown */}
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>Harga</InputLabel>
            <Select
              value={filters.sort === 'price' ? 'price' : ''}
              onChange={handleSortChange}
              label="Harga"
              disabled={loading}
              sx={{ borderRadius: 2 }}
            >
              <MenuItem value="price">Rendah ke Tinggi</MenuItem>
              <MenuItem value="price_desc">Tinggi ke Rendah</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Stack>
    </Box>
  );
}
