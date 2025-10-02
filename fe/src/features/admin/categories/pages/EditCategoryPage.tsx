import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Breadcrumbs,
  Link,
  Alert,
} from '@mui/material';
import { Home as HomeIcon, Category as CategoryIcon } from '@mui/icons-material';
import { categoryApi } from '@/features/categories/services/categoryApi';
import CategoryForm from '@/features/categories/components/CategoryForm';
import Loading from '@/components/ui/Loading';
import { UpdateCategoryRequest } from '@/features/categories/types';
import { Category } from '@/types/global';
import { useUiStore } from '@/store/uiStore';

export default function EditCategoryPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showNotification } = useUiStore();
  
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategory = async () => {
    if (!id) {
      setError('ID kategori tidak valid');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await categoryApi.getCategoryById(id);
      
      if (response.success) {
        setCategory(response.data);
      } else {
        throw new Error('Failed to fetch category');
      }
    } catch (error: any) {
      setError(error.message || 'Gagal memuat data kategori');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const handleSubmit = async (data: UpdateCategoryRequest) => {
    if (!id) return;

    try {
      setIsSubmitting(true);
      setError(null);
      
      const response = await categoryApi.updateCategory(id, data);
      
      if (response.success) {
        showNotification({
          type: 'success',
          message: 'Kategori berhasil diperbarui',
        });
        
        navigate('/admin/categories');
      } else {
        throw new Error(response.message || 'Failed to update category');
      }
    } catch (error: any) {
      setError(error.message || 'Gagal memperbarui kategori');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/categories');
  };

  if (isLoading) {
    return <Loading message="Memuat data kategori..." />;
  }

  if (error && !category) {
    return (
      <Container maxWidth="lg">
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Link component="button" onClick={() => navigate('/admin/categories')}>
            Kembali ke Daftar Kategori
          </Link>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
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
          Edit {category?.name}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Edit Kategori
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Perbarui informasi kategori {category?.name}
        </Typography>
      </Box>

      {/* Form */}
      {category && (
        <CategoryForm
          mode="edit"
          category={category}
          isLoading={isSubmitting}
          error={error}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </Container>
  );
}
