import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  Alert,
  Link,
} from '@mui/material';
import { Add as AddIcon, Home as HomeIcon } from '@mui/icons-material';
import { categoryApi } from '@/features/categories/services/categoryApi';
import CategoryTable from '@/features/categories/components/CategoryTable';
import Loading from '@/components/ui/Loading';
import { Category } from '@/types/global';
import { useUiStore } from '@/store/uiStore';

export default function CategoryListPage() {
  const navigate = useNavigate();
  const { showNotification } = useUiStore();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await categoryApi.getCategories();
      
      if (response.success) {
        setCategories(response.data);
      } else {
        throw new Error('Failed to fetch categories');
      }
    } catch (error: any) {
      setError(error.message || 'Gagal memuat data kategori');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (category: Category) => {
    navigate(`/admin/categories/${category.id}/edit`);
  };

  const handleView = (category: Category) => {
    navigate(`/admin/categories/${category.id}`);
  };

  const handleDelete = async (categoryId: string) => {
    try {
      const response = await categoryApi.deleteCategory(categoryId);
      
      if (response.success) {
        showNotification({
          type: 'success',
          message: 'Kategori berhasil dihapus',
        });
        
        // Refresh data
        await fetchCategories();
      } else {
        throw new Error(response.message || 'Failed to delete category');
      }
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Gagal menghapus kategori',
      });
      throw error;
    }
  };

  const handleCreateNew = () => {
    navigate('/admin/categories/create');
  };

  const handleViewDeleted = () => {
    navigate('/admin/categories/deleted');
  };

  if (isLoading) {
    return <Loading message="Memuat data kategori..." />;
  }

  return (
    <Container maxWidth={false}>
 
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Kelola Kategori
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Kelola kategori produk untuk mengorganisir toko Anda
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateNew}
          size="large"
        >
          Tambah Kategori
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Categories Table */}
      <CategoryTable
        categories={categories}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        onViewDeleted={handleViewDeleted}
      />
    </Container>
  );
}
