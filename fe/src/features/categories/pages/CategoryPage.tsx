import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { categoryApi } from '../services/categoryApi';
import CategoryCard from '../components/CategoryCard';
import Loading from '@/components/ui/Loading';
import { Category } from '@/types/global';

export default function CategoryPage() {
  const navigate = useNavigate();
  
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

  const handleCategoryClick = (category: Category) => {
    // Navigate to products filtered by category
    navigate(`/categories/${category.id}`);
  };

  if (isLoading) {
    return <Loading message="Memuat kategori..." />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Jelajahi Kategori
        </Typography>
        <Typography variant="h6" color="textSecondary">
          Temukan produk rajutan sesuai dengan kategori yang Anda inginkan
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Categories Grid */}
      {categories.length === 0 && !isLoading ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Belum ada kategori tersedia
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Kategori akan segera tersedia. Silakan kembali lagi nanti.
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 3,
            justifyContent: 'center',
          }}
        >
          {categories.map((category) => (
            <Box
              key={category.id}
              sx={{
                flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 30%', lg: '1 1 22%' },
                minWidth: 250,
                maxWidth: 300,
              }}
            >
              <CategoryCard
                category={category}
                onClick={handleCategoryClick}
              />
            </Box>
          ))}
        </Box>
      )}

      {/* Bottom CTA */}
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h6" gutterBottom>
          Tidak menemukan kategori yang Anda cari?
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Hubungi kami untuk permintaan khusus atau saran kategori baru
        </Typography>
      </Box>
    </Container>
  );
}
