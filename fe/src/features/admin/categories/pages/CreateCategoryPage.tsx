import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { Home as HomeIcon, Category as CategoryIcon } from '@mui/icons-material';
import { categoryApi } from '@/features/categories/services/categoryApi';
import CategoryForm from '@/features/categories/components/CategoryForm';
import { CreateCategoryRequest, UpdateCategoryRequest } from '@/features/categories/types';
import { useUiStore } from '@/store/uiStore';

export default function CreateCategoryPage() {
  const navigate = useNavigate();
  const { showNotification } = useUiStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateCategoryRequest | UpdateCategoryRequest) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await categoryApi.createCategory(data as CreateCategoryRequest);
      
      if (response.success) {
        showNotification({
          type: 'success',
          message: 'Kategori berhasil ditambahkan',
        });
        
        navigate('/admin/categories');
      } else {
        throw new Error(response.message || 'Failed to create category');
      }
    } catch (error: any) {
      setError(error.message || 'Gagal menambahkan kategori');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/categories');
  };

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
          Tambah Baru
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Tambah Kategori Baru
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Buat kategori baru untuk mengorganisir produk di toko Anda
        </Typography>
      </Box>

      {/* Form */}
      <CategoryForm
        mode="create"
        isLoading={isLoading}
        error={error}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </Container>
  );
}
