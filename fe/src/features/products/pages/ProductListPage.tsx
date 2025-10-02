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
} from '@mui/material';
import { 
  Home, 
  ShoppingBag,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productApi } from '../services/productApi';
import { categoryApi } from '@/features/categories/services/categoryApi';
import { Product, ProductQueryParams } from '../types';
import ProductTopFilter from '../components/ProductTopFilter';
import ProductSidebarFilter from '../components/ProductSidebarFilter';
import ProductCard from '../components/ProductCard';

export default function ProductListPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">


        {/* Main Content with Sidebar */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          gap: 4, 
          alignItems: 'flex-start' 
        }}>
          {/* Sidebar Filter */}
          <Box sx={{ 
            width: { xs: '100%', md: '300px' }, 
            flexShrink: 0,
            order: { xs: 1, md: 1 }
          }}>
            <ProductSidebarFilter
              filters={filters}
              onFilterChange={handleFilterChange}
              categories={categories}
              loading={loading}
            />
          </Box>

          {/* Main Content Area */}
          <Box sx={{ 
            flex: 1, 
            minWidth: 0,
            order: { xs: 2, md: 2 }
          }}>
            {/* Top Filter */}
            <ProductTopFilter
              filters={filters}
              onFilterChange={handleFilterChange}
              loading={loading}
            />

            {/* Results Header */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" color="text.primary" fontWeight={600}>
                {loading ? (
                  <Skeleton width={200} />
                ) : (
                  `Menampilkan ${products.length} dari ${pagination.total} produk`
                )}
              </Typography>
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