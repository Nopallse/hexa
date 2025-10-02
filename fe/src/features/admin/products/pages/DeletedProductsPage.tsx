import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Alert,
  Breadcrumbs,
  Link,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  TablePagination,
  Avatar,
} from '@mui/material';
import {
  Home as HomeIcon,
  Inventory as ProductIcon,
  Restore as RestoreIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { productApi } from '@/features/admin/products/services/productApi';
import Loading from '@/components/ui/Loading';
import { useUiStore } from '@/store/uiStore';
import { ProductQueryParams } from '@/features/products/types';

interface DeletedProduct {
  id: string;
  category_id: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  category?: {
    id: string;
    name: string;
  };
}

export default function DeletedProductsPage() {
  const navigate = useNavigate();
  const { showNotification } = useUiStore();
  
  const [deletedProducts, setDeletedProducts] = useState<DeletedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchDeletedProducts = async (params?: ProductQueryParams) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await productApi.getDeletedProducts({
        page: (page || 0) + 1,
        limit: rowsPerPage,
        ...params,
      });
      
      if (response.success) {
        setDeletedProducts(response.data as unknown as DeletedProduct[]);
        setTotal(response.pagination?.total || 0);
      } else {
        throw new Error('Failed to fetch deleted products');
      }
    } catch (error: any) {
      setError(error.message || 'Gagal memuat data produk yang dihapus');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedProducts();
  }, [page, rowsPerPage]);

  const handleRestore = async (productId: string, productName: string) => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin memulihkan produk "${productName}"?`
    );

    if (!confirmed) return;

    try {
      const response = await productApi.restoreProduct(productId);
      
      if (response.success) {
        showNotification({
          type: 'success',
          message: 'Produk berhasil dipulihkan',
        });
        
        // Refresh data
        await fetchDeletedProducts();
      } else {
        throw new Error(response.message || 'Failed to restore product');
      }
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Gagal memulihkan produk',
      });
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRefresh = () => {
    fetchDeletedProducts();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading && deletedProducts.length === 0) {
    return <Loading message="Memuat data produk yang dihapus..." />;
  }

  return (
    <Container maxWidth={false}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate('/admin')}
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <HomeIcon fontSize="small" />
          Dashboard
        </Link>
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate('/admin/products')}
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <ProductIcon fontSize="small" />
          Produk
        </Link>
        <Typography variant="body2" color="textPrimary">
          Produk Dihapus
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Produk yang Dihapus
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Kelola produk yang telah dihapus (soft delete)
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/admin/products')}
          >
            Kembali ke Produk
          </Button>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Deleted Products Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Gambar</TableCell>
              <TableCell>Nama Produk</TableCell>
              <TableCell>Kategori</TableCell>
              <TableCell align="right">Harga</TableCell>
              <TableCell align="center">Stok</TableCell>
              <TableCell>Dibuat</TableCell>
              <TableCell>Dihapus</TableCell>
              <TableCell align="center">Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {deletedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    Tidak ada produk yang dihapus
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              deletedProducts.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>
                    <Avatar
                      variant="rounded"
                      sx={{ width: 40, height: 40 }}
                    >
                      {product.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {product.description || '-'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={product.category?.name || 'Tidak ada kategori'}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body1" fontWeight="medium">
                      {formatPrice(product.price)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip 
                      label={product.stock}
                      size="small"
                      color={product.stock > 0 ? 'success' : 'error'}
                      variant={product.stock > 0 ? 'filled' : 'outlined'}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(product.created_at).toLocaleDateString('id-ID')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="error">
                      {new Date(product.deleted_at).toLocaleDateString('id-ID')}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Pulihkan Produk">
                      <IconButton
                        color="primary"
                        onClick={() => handleRestore(product.id, product.name)}
                        disabled={isLoading}
                      >
                        <RestoreIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

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
