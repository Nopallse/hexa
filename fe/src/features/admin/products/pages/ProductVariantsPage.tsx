import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Breadcrumbs,
  Link,
  Button,
  Card,
  CardContent,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Home as HomeIcon,
  Inventory as ProductIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { productApi } from '@/features/admin/products/services/productApi';
import ProductVariantManager from '@/features/admin/products/components/ProductVariantManager';
import Loading from '@/components/ui/Loading';
import { useUiStore } from '@/store/uiStore';

interface Product {
  id: string;
  name: string;
  category?: {
    id: string;
    name: string;
  };
}

export default function ProductVariantsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useUiStore();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = async () => {
    if (!id) {
      setError('ID produk tidak ditemukan');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const response = await productApi.getProductById(id);
      if (response.success) {
        setProduct(response.data);
      } else {
        throw new Error(response.message || 'Produk tidak ditemukan');
      }
    } catch (error: any) {
      setError(error.message || 'Gagal memuat data produk');
      showNotification({
        type: 'error',
        message: error.message || 'Gagal memuat data produk',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleBack = () => {
    navigate('/admin/products');
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error || !product) {
    return (
      <Container maxWidth={false}>
        <Box sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            {error || 'Produk tidak ditemukan'}
          </Alert>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
          >
            Kembali ke Daftar Produk
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth={false}>
      <Box sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link
            component="button"
            variant="body1"
            color="inherit"
            onClick={() => navigate('/admin')}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <HomeIcon fontSize="small" />
            Dashboard
          </Link>
          <Link
            component="button"
            variant="body1"
            color="inherit"
            onClick={() => navigate('/admin/products')}
            sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
          >
            <ProductIcon fontSize="small" />
            Produk
          </Link>
          <Typography color="textPrimary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <ProductIcon fontSize="small" />
            Varian Produk
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBack}
            sx={{ minWidth: 'auto' }}
          >
            Kembali
          </Button>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Kelola Varian Produk
            </Typography>
            <Typography variant="h6" color="textSecondary">
              {product.name}
            </Typography>
            {product.category && (
              <Typography variant="body2" color="textSecondary">
                Kategori: {product.category.name}
              </Typography>
            )}
          </Box>
        </Box>

        {/* Variant Manager */}
        <ProductVariantManager 
          productId={product.id} 
          productName={product.name} 
        />
      </Box>
    </Container>
  );
}
