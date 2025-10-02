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
  TextField,
  InputAdornment,
  Avatar,
} from '@mui/material';
import {
  Home as HomeIcon,
  Category as CategoryIcon,
  Restore as RestoreIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { categoryApi } from '@/features/categories/services/categoryApi';
import Loading from '@/components/ui/Loading';
import { useUiStore } from '@/store/uiStore';
import { CategoryQueryParams } from '@/features/categories/types';
import { getCategoryImageUrl } from '@/utils/image';

interface DeletedCategory {
  id: string;
  name: string;
  description?: string | null;
  image?: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export default function DeletedCategoriesPage() {
  const navigate = useNavigate();
  const { showNotification } = useUiStore();
  
  const [deletedCategories, setDeletedCategories] = useState<DeletedCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchDeletedCategories = async (params?: CategoryQueryParams) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await categoryApi.getDeletedCategories({
        page: (page || 0) + 1,
        limit: rowsPerPage,
        search: searchTerm || undefined,
        ...params,
      });
      
      if (response.success) {
        setDeletedCategories(response.data);
        setTotal(response.pagination?.total || 0);
      } else {
        throw new Error('Failed to fetch deleted categories');
      }
    } catch (error: any) {
      setError(error.message || 'Gagal memuat data kategori yang dihapus');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedCategories();
  }, [page, rowsPerPage, searchTerm]);

  const handleRestore = async (categoryId: string, categoryName: string) => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin memulihkan kategori "${categoryName}"?`
    );

    if (!confirmed) return;

    try {
      const response = await categoryApi.restoreCategory(categoryId);
      
      if (response.success) {
        showNotification({
          type: 'success',
          message: 'Kategori berhasil dipulihkan',
        });
        
        // Refresh data
        await fetchDeletedCategories();
      } else {
        throw new Error(response.message || 'Failed to restore category');
      }
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Gagal memulihkan kategori',
      });
    }
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleRefresh = () => {
    fetchDeletedCategories();
  };

  if (isLoading && deletedCategories.length === 0) {
    return <Loading message="Memuat data kategori yang dihapus..." />;
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
          onClick={() => navigate('/admin/categories')}
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <CategoryIcon fontSize="small" />
          Kategori
        </Link>
        <Typography variant="body2" color="textPrimary">
          Kategori Dihapus
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Kategori yang Dihapus
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Kelola kategori yang telah dihapus (soft delete)
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
            onClick={() => navigate('/admin/categories')}
          >
            Kembali ke Kategori
          </Button>
        </Box>
      </Box>

      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Cari kategori yang dihapus..."
          value={searchTerm}
          onChange={handleSearch}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ maxWidth: 400 }}
        />
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Deleted Categories Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell width="80">Gambar</TableCell>
              <TableCell>Nama Kategori</TableCell>
              <TableCell>Deskripsi</TableCell>
              <TableCell>Dibuat</TableCell>
              <TableCell>Dihapus</TableCell>
              <TableCell align="center">Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {deletedCategories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    {searchTerm ? 'Tidak ada kategori yang dihapus sesuai pencarian' : 'Tidak ada kategori yang dihapus'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              deletedCategories.map((category) => (
                <TableRow key={category.id} hover>
                  <TableCell>
                    <Avatar
                      src={getCategoryImageUrl(category.image)}
                      alt={category.name}
                      variant="rounded"
                      sx={{ width: 56, height: 56 }}
                    >
                      <CategoryIcon />
                    </Avatar>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight="medium">
                      {category.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {category.description || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(category.created_at).toLocaleDateString('id-ID')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="error">
                      {new Date(category.deleted_at).toLocaleDateString('id-ID')}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Pulihkan Kategori">
                      <IconButton
                        color="primary"
                        onClick={() => handleRestore(category.id, category.name)}
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
