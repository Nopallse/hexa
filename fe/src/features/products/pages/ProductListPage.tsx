import { 
  Container, 
  Typography, 
  Box, 
  useTheme,
  Pagination,
  Stack,
  Alert,
  Skeleton,
  Breadcrumbs,
  Link,
  Grid,
  useMediaQuery,
  Drawer,
  IconButton,
  Fab,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import { 
  Home, 
  ShoppingBag,
  FilterList,
  Close,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productApi } from '../services/productApi';
import { categoryApi } from '@/features/categories/services/categoryApi';
import { Product, ProductQueryParams } from '../types';
import ProductTopFilter from '../components/ProductTopFilter';
import ProductSidebarFilter from '../components/ProductSidebarFilter';
import ProductCard from '../components/ProductCard';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';

export default function ProductListPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { loading: currencyLoading, error: currencyError } = useCurrencyConversion();
  
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  // Filters
  const [filters, setFilters] = useState<ProductQueryParams>({
    page: 1,
    limit: 12,
    search: searchParams.get('search') || undefined,
    category: searchParams.get('category') || undefined,
    min_price: searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : undefined,
    max_price: searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : undefined,
    sort: (searchParams.get('sort') as any) || 'created_at',
  });

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await productApi.getProducts(filters);
      
      if (response.success) {
        setProducts(response.data);
        setPagination(response.pagination);
      } else {
        setError('Gagal memuat produk');
      }
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getCategories({ limit: 100 });
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Handle filter change
  const handleFilterChange = (newFilters: ProductQueryParams) => {
    setFilters(newFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.min_price) params.set('min_price', newFilters.min_price.toString());
    if (newFilters.max_price) params.set('max_price', newFilters.max_price.toString());
    if (newFilters.sort) params.set('sort', newFilters.sort);
    if (newFilters.page && newFilters.page > 1) params.set('page', newFilters.page.toString());
    
    setSearchParams(params);
  };

  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    const newFilters = { ...filters, page };
    handleFilterChange(newFilters);
  };

  // Handle product view
  const handleProductView = (product: Product) => {
    navigate(`/products/${product.id}`);
  };


  // Effects
  useEffect(() => {
    fetchProducts();
  }, [filters]);

  useEffect(() => {
    fetchCategories();
  }, []);

  // Loading skeleton
  const renderSkeleton = () => (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)', xl: 'repeat(5, 1fr)' },
        gap: 3,
      }}
    >
      {[...Array(12)].map((_, index) => (
        <ProductCard key={index} product={{} as Product} onView={() => {}} loading />
      ))}
    </Box>
  );

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 2, md: 4 } }}>
      <Container maxWidth="xl">
        {/* Currency Loading State */}
        {currencyLoading && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Loading exchange rates...
          </Alert>
        )}
        
        {/* Currency Error State */}
        {currencyError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Failed to load exchange rates. Prices will be displayed in default currency.
          </Alert>
        )}

        {/* Main Content with Sidebar */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          gap: 4, 
          alignItems: 'flex-start' 
        }}>
          {/* Desktop Sidebar Filter */}
          {!isMobile && (
            <Box sx={{ 
              width: '300px', 
              flexShrink: 0,
            }}>
              <ProductSidebarFilter
                filters={filters}
                onFilterChange={handleFilterChange}
                categories={categories}
                loading={loading}
              />
            </Box>
          )}

          {/* Main Content Area */}
          <Box sx={{ 
            flex: 1, 
            minWidth: 0,
          }}>
            {/* Top Filter with Mobile Filter Button */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              mb: 3,
              flexWrap: 'wrap'
            }}>
              <Box sx={{ flex: 1, minWidth: 200 }}>
                <ProductTopFilter
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  loading={loading}
                />
              </Box>
              
              {/* Mobile Filter Button */}
              {isMobile && (
                <Fab
                  size="medium"
                  color="primary"
                  onClick={() => setMobileFilterOpen(true)}
                  sx={{
                    position: 'fixed',
                    bottom: 20,
                    right: 20,
                    zIndex: 1000,
                    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  }}
                >
                  <FilterList />
                </Fab>
              )}
            </Box>

            {/* Results Header */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 3,
              flexWrap: 'wrap',
              gap: 2
            }}>
              <Typography variant="h6" color="text.primary" fontWeight={600}>
                {loading ? (
                  <Skeleton width={200} />
                ) : (
                  `Menampilkan ${products.length} dari ${pagination.total} produk`
                )}
              </Typography>
              
              {/* Sort Options */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Urutkan:
                </Typography>
                <Box sx={{ minWidth: 150 }}>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={filters.sort || 'created_at'}
                      onChange={(e) => handleFilterChange({ ...filters, sort: e.target.value as any, page: 1 })}
                      sx={{ borderRadius: 2 }}
                    >
                      <MenuItem value="created_at">Terbaru</MenuItem>
                      <MenuItem value="name">Nama A-Z</MenuItem>
                      <MenuItem value="price">Harga Terendah</MenuItem>
                      <MenuItem value="price_desc">Harga Tertinggi</MenuItem>
                      <MenuItem value="sold_count">Terlaris</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Box>

            {/* Products Grid */}
            {loading ? (
              renderSkeleton()
            ) : error ? (
              <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto' }}>
                {error}
              </Alert>
            ) : products.length === 0 ? (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 8,
                  px: 4,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #faf8ff 0%, #f0f4ff 100%)',
                  border: `1px solid ${theme.palette.primary.light}20`,
                }}
              >
                <ShoppingBag sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" fontWeight={600} sx={{ mb: 1 }}>
                  Tidak ada produk ditemukan
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Coba ubah filter pencarian atau lihat kategori lainnya
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)', xl: 'repeat(5, 1fr)' },
                  gap: 3,
                }}
              >
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onView={handleProductView}
                  />
                ))}
              </Box>
            )}
          </Box>
        </Box>

        {/* Mobile Filter Drawer */}
        <Drawer
          anchor="right"
          open={mobileFilterOpen}
          onClose={() => setMobileFilterOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: { xs: '100%', sm: 400 },
              maxWidth: '90vw',
            },
          }}
        >
          <Box sx={{ p: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              mb: 3 
            }}>
              <Typography variant="h6" fontWeight={700}>
                Filter Produk
              </Typography>
              <IconButton onClick={() => setMobileFilterOpen(false)}>
                <Close />
              </IconButton>
            </Box>
            
            <ProductSidebarFilter
              filters={filters}
              onFilterChange={(newFilters) => {
                handleFilterChange(newFilters);
                setMobileFilterOpen(false);
              }}
              categories={categories}
              loading={loading}
              variant="mobile"
            />
          </Box>
        </Drawer>

        {/* Pagination */}
        {!loading && !error && products.length > 0 && pagination.pages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
            <Pagination
              count={pagination.pages}
              page={pagination.page}
              onChange={handlePageChange}
              color="primary"
              size="large"
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: 2,
                  fontWeight: 600,
                },
              }}
            />
          </Box>
        )}
      </Container>
    </Box>
  );
}