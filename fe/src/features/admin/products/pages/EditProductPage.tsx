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
import { Home as HomeIcon, Inventory as ProductIcon } from '@mui/icons-material';
import { productApi } from '@/features/admin/products/services/productApi';
import { categoryApi } from '@/features/categories/services/categoryApi';
import ProductForm from '@/features/admin/products/components/ProductForm';
import Loading from '@/components/ui/Loading';
import { UpdateProductRequest } from '@/features/products/types';
import { useUiStore } from '@/store/uiStore';

interface Product {
  id: string;
  category_id: string;
  name: string;
  description?: string | null;
  price: string | null;
  stock: number | null;
  pre_order: number;
  // Physical dimensions for shipping calculation
  length?: number | null;
  width?: number | null;
  height?: number | null;
  weight?: number | null;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  category?: {
    id: string;
    name: string;
  };
  product_images?: any[];
  product_variants?: any[];
}

interface Category {
  id: string;
  name: string;
}

export default function EditProductPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showNotification } = useUiStore();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProduct = async () => {
    if (!id) {
      setError('ID produk tidak valid');
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
        throw new Error('Failed to fetch product');
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
    fetchProduct();
    fetchCategories();
  }, [id]);

  const handleSubmit = async (data: UpdateProductRequest) => {
    if (!id) return;

    try {
      setIsSubmitting(true);
      setError(null);
      
      const response = await productApi.updateProduct(id, data);
      
      if (response.success) {
        showNotification({
          type: 'success',
          message: 'Produk berhasil diperbarui',
        });
        
        navigate('/admin/products');
      } else {
        throw new Error('Failed to update product');
      }
    } catch (error: any) {
      setError(error.message || 'Gagal memperbarui produk');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/products');
  };

  if (isLoading) {
    return <Loading message="Memuat data produk..." />;
  }

  if (error && !product) {
    return (
      <Container maxWidth={false}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Typography variant="body1">
          <Link component="button" onClick={() => navigate('/admin/products')}>
            Kembali ke daftar produk
          </Link>
        </Typography>
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
          onClick={() => navigate('/admin/products')}
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <ProductIcon fontSize="small" />
          Produk
        </Link>
        <Typography variant="body2" color="textPrimary">
          Edit {product?.name}
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Edit Produk
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Perbarui informasi produk {product?.name}
        </Typography>
      </Box>

      {/* Form */}
      {product && (
        <ProductForm
          mode="edit"
          product={product}
          categories={categories}
          isLoading={isSubmitting}
          error={error}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      )}
    </Container>
  );
}
