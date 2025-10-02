import { 
  Box, 
  Typography, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Button, 
  Stack, 
  useTheme,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Checkbox,
} from '@mui/material';
import { 
  ExpandMore,
  Clear,
  Category as CategoryIcon,
  AttachMoney,
} from '@mui/icons-material';
import { useState } from 'react';
import { ProductQueryParams } from '../types';

interface ProductSidebarFilterProps {
  filters: ProductQueryParams;
  onFilterChange: (filters: ProductQueryParams) => void;
  categories: Array<{ id: string; name: string }>;
  loading?: boolean;
}

export default function ProductSidebarFilter({ 
  filters, 
  onFilterChange, 
  categories, 
  loading = false 
}: ProductSidebarFilterProps) {
  const theme = useTheme();
  const [expandedCategories, setExpandedCategories] = useState(true);
  const [expandedPrice, setExpandedPrice] = useState(true);

  const handleCategoryChange = (categoryId: string | null) => {
    onFilterChange({ 
      ...filters, 
      category: categoryId || undefined, 
      page: 1 
    });
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

  const hasActiveFilters = filters.category || filters.min_price || filters.max_price;

  return (
    <Box
      sx={{
        p: 3,
        borderRadius: 3,
        background: 'linear-gradient(135deg, #ffffff 0%, #faf8ff 100%)',
        border: `1px solid ${theme.palette.primary.light}20`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        position: 'sticky',
        top: 20,
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{
            color: theme.palette.primary.main,
            fontFamily: '"Playfair Display", "Georgia", serif',
            letterSpacing: '-0.01em',
          }}
        >
          Filter Produk
        </Typography>
        {hasActiveFilters && (
          <Button
            size="small"
            startIcon={<Clear />}
            onClick={handleClearFilters}
            sx={{
              mt: 1,
              color: theme.palette.error.main,
              fontSize: '0.875rem',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: theme.palette.error.light + '10',
              },
            }}
          >
            Hapus Semua Filter
          </Button>
        )}
      </Box>

      {/* Categories Filter */}
      <Accordion 
        expanded={expandedCategories} 
        onChange={() => setExpandedCategories(!expandedCategories)}
        sx={{
          boxShadow: 'none',
          border: `1px solid ${theme.palette.primary.light}20`,
          borderRadius: 2,
          mb: 2,
          '&:before': { display: 'none' },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMore />}
          sx={{
            backgroundColor: theme.palette.primary.light + '10',
            borderRadius: expandedCategories ? '8px 8px 0 0' : '8px',
            '& .MuiAccordionSummary-content': {
              alignItems: 'center',
            },
          }}
        >
          <CategoryIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="subtitle1" fontWeight={600}>
            Kategori
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <List dense>
            <ListItem disablePadding>
              <ListItemButton
                selected={!filters.category}
                onClick={() => handleCategoryChange(null)}
                sx={{
                  borderRadius: 1,
                  mx: 1,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.light + '20',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.light + '30',
                    },
                  },
                }}
              >
                <ListItemText 
                  primary="Semua Kategori" 
                  primaryTypographyProps={{
                    fontWeight: !filters.category ? 600 : 400,
                    color: !filters.category ? theme.palette.primary.main : 'text.primary',
                  }}
                />
              </ListItemButton>
            </ListItem>
            {categories.map((category) => (
              <ListItem key={category.id} disablePadding>
                <ListItemButton
                  selected={filters.category === category.id}
                  onClick={() => handleCategoryChange(category.id)}
                  sx={{
                    borderRadius: 1,
                    mx: 1,
                    mb: 0.5,
                    '&.Mui-selected': {
                      backgroundColor: theme.palette.primary.light + '20',
                      '&:hover': {
                        backgroundColor: theme.palette.primary.light + '30',
                      },
                    },
                  }}
                >
                  <ListItemText 
                    primary={category.name}
                    primaryTypographyProps={{
                      fontWeight: filters.category === category.id ? 600 : 400,
                      color: filters.category === category.id ? theme.palette.primary.main : 'text.primary',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

      {/* Price Range Filter */}
      <Accordion 
        expanded={expandedPrice} 
        onChange={() => setExpandedPrice(!expandedPrice)}
        sx={{
          boxShadow: 'none',
          border: `1px solid ${theme.palette.primary.light}20`,
          borderRadius: 2,
          mb: 2,
          '&:before': { display: 'none' },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMore />}
          sx={{
            backgroundColor: theme.palette.primary.light + '10',
            borderRadius: expandedPrice ? '8px 8px 0 0' : '8px',
            '& .MuiAccordionSummary-content': {
              alignItems: 'center',
            },
          }}
        >
          <AttachMoney sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="subtitle1" fontWeight={600}>
            Rentang Harga
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <TextField
              label="Harga Minimum"
              type="number"
              value={filters.min_price || ''}
              onChange={handleMinPriceChange}
              InputProps={{
                startAdornment: 'Rp ',
              }}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
            <TextField
              label="Harga Maksimum"
              type="number"
              value={filters.max_price || ''}
              onChange={handleMaxPriceChange}
              InputProps={{
                startAdornment: 'Rp ',
              }}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
            />
          </Stack>
        </AccordionDetails>
      </Accordion>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
            Filter Aktif:
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {filters.category && (
              <Chip
                label={`Kategori: ${categories.find(c => c.id === filters.category)?.name}`}
                onDelete={() => onFilterChange({ ...filters, category: undefined, page: 1 })}
                color="primary"
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
