import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Alert,
  TablePagination,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { productApi } from '@/features/admin/products/services/productApi';
import { categoryApi } from '@/features/categories/services/categoryApi';
import ProductTable from '@/features/admin/products/components/ProductTable';
import ProductFilter from '@/features/admin/products/components/ProductFilter';
import Loading from '@/components/ui/Loading';
import { useUiStore } from '@/store/uiStore';
import { ProductQueryParams, Product } from '@/features/products/types';

interface Category {
  id: string;
  name: string;
}

export default function ProductListPage() {
  const navigate = useNavigate();
  const { showNotification } = useUiStore();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<ProductQueryParams>({});

  // Memoize the filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => filters, [filters]);

  const fetchProducts = async (params?: ProductQueryParams) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await productApi.getProducts({
        page: (page || 0) + 1,
        limit: rowsPerPage,
        ...params,
      });
      
      if (response.success) {
        setProducts(response.data);
        setTotal(response.pagination?.total || 0);
      } else {
        throw new Error('Failed to fetch products');
      }
    } catch (error: any) {
      setError(error.message || 'Gagal memuat data produk');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  useEffect(() => {
    fetchProducts(memoizedFilters);
  }, [page, rowsPerPage, memoizedFilters]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (product: Product) => {
    navigate(`/admin/products/${product.id}/edit`);
  };

  const handleView = (product: Product) => {
    navigate(`/admin/products/${product.id}`);
  };

  const handleDelete = async (productId: string) => {
    try {
      const response = await productApi.deleteProduct(productId);
      
      if (response.success) {
        showNotification({
          type: 'success',
          message: 'Produk berhasil dihapus',
        });
        
        // Refresh data
        await fetchProducts(memoizedFilters);
      } else {
        throw new Error(response.message || 'Failed to delete product');
      }
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Gagal menghapus produk',
      });
      throw error;
    }
  };

  const handleCreateNew = () => {
    navigate('/admin/products/create');
  };

  const handleViewDeleted = () => {
    navigate('/admin/products/deleted');
  };

  const handleFilterChange = useCallback((newFilters: ProductQueryParams) => {
    setFilters(newFilters);
    setPage(0); // Reset to first page when filtering
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (isLoading && products.length === 0) {
    return <Loading message="Memuat data produk..." />;
  }

  return (
    <Container maxWidth={false}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Kelola Produk
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Kelola produk dan inventori toko Anda
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
          size="large"
        >
          Tambah Produk
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filter */}
      <ProductFilter
        onFilterChange={handleFilterChange}
        categories={categories}
        loading={isLoading}
        initialFilters={memoizedFilters}
      />

      {/* Products Table */}
      <ProductTable
        products={products}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onViewDeleted={handleViewDeleted}
      />

      {/* Pagination */}
      {total > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Baris per halaman:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} dari ${count !== -1 ? count : `lebih dari ${to}`}`
          }
        />
      )}
    </Container>
  );
}
