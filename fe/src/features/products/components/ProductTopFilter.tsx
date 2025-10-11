import { 
  Box, 
  TextField, 
  useTheme,
  IconButton,
} from '@mui/material';
import { 
  Search, 
  Clear,
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
      {/* Search Only */}
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
    </Box>
  );
}
