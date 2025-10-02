import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Breadcrumbs,
  Link,
  Alert,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
  Divider,
} from '@mui/material';
import {
  Home as HomeIcon,
  Category as CategoryIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { categoryApi } from '@/features/categories/services/categoryApi';
import Loading from '@/components/ui/Loading';
import { Category } from '@/types/global';
import { useUiStore } from '@/store/uiStore';
import { getCategoryImageUrl } from '@/utils/image';

export default function CategoryDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showNotification } = useUiStore();
  
  const [category, setCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const handleEdit = () => {
    if (category) {
      navigate(`/admin/categories/${category.id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!category) return;

    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus kategori "${category.name}"? Tindakan ini tidak dapat dibatalkan.`
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      
      const response = await categoryApi.deleteCategory(category.id);
      
      if (response.success) {
        showNotification({
          type: 'success',
          message: 'Kategori berhasil dihapus',
        });
        
        navigate('/admin/categories');
      } else {
        throw new Error(response.message || 'Failed to delete category');
      }
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Gagal menghapus kategori',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBackToList = () => {
    navigate('/admin/categories');
  };

  if (isLoading) {
    return <Loading message="Memuat data kategori..." />;
  }

  if (error || !category) {
    return (
      <Container maxWidth={false}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Kategori tidak ditemukan'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToList}
        >
          Kembali ke Daftar Kategori
        </Button>
      </Container>
    );
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
          {category.name}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Detail Kategori
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Informasi lengkap kategori "{category.name}"
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToList}
          >
            Kembali
          </Button>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEdit}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? 'Menghapus...' : 'Hapus'}
          </Button>
        </Box>
      </Box>

      {/* Category Details */}
      <Card>
        {/* Category Image */}
        {(category as any).image && (
          <CardMedia
            component="img"
            height="300"
            image={getCategoryImageUrl((category as any).image)}
            alt={category.name}
            sx={{
              objectFit: 'cover',
              bgcolor: 'grey.100',
            }}
          />
        )}
        
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {category.name}
            </Typography>
            <Chip
              label="Aktif"
              color="success"
              size="small"
              sx={{ mb: 2 }}
            />
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Deskripsi
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {category.description || 'Tidak ada deskripsi'}
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Produk dalam Kategori
            </Typography>
            {category.products && category.products.length > 0 ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 2 }}>
                {category.products.map((product) => (
                  <Card key={product.id} variant="outlined">
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        {product.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Harga: Rp {parseInt(product.price).toLocaleString('id-ID')}
                      </Typography>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Stok: {product.stock}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Dibuat: {new Date(product.created_at).toLocaleDateString('id-ID')}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" color="textSecondary">
                Belum ada produk dalam kategori ini
              </Typography>
            )}
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Informasi Sistem
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  ID Kategori
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {category.id}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Dibuat Pada
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {new Date(category.created_at).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  Diperbarui Pada
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {category.updated_at ? new Date(category.updated_at).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  }) : '-'}
                </Typography>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
