import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Breadcrumbs,
  Link,
} from '@mui/material';
import { Home as HomeIcon, Inventory as ProductIcon } from '@mui/icons-material';
import { productApi } from '@/features/admin/products/services/productApi';
import { categoryApi } from '@/features/categories/services/categoryApi';
import ProductForm from '@/features/admin/products/components/ProductForm';
import { CreateProductRequest } from '@/features/products/types';
import { useUiStore } from '@/store/uiStore';

interface Category {
  id: string;
  name: string;
}

export default function CreateProductPage() {
  const navigate = useNavigate();
  const { showNotification } = useUiStore();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    try {
      const response = await categoryApi.getCategories();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setError('Gagal memuat data kategori');
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (data: CreateProductRequest & { _imageFiles?: File[] }) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Extract image files and remove from product data
      const imageFiles = data._imageFiles || [];
      const productData = {
        category_id: data.category_id,
        name: data.name,
        description: data.description,
        price: data.price,
        stock: data.stock
      };
      
      // 1. Create product first (without images)
      const response = await productApi.createProduct(productData);
      
      if (!response.success) {
        throw new Error('Failed to create product');
      }

      const productId = response.data.id;

      // 2. Upload images if any
      if (imageFiles.length > 0) {
        try {
          for (let i = 0; i < imageFiles.length; i++) {
            await productApi.createProductImage(productId, {
              image_name: '', // Will be set by backend
              is_primary: i === 0,
              _imageFile: imageFiles[i]
            } as any);
          }
          
          showNotification({
            type: 'success',
            message: `Produk berhasil ditambahkan dengan ${imageFiles.length} gambar`,
          });
        } catch (imageError) {
          console.error('Failed to upload images:', imageError);
          showNotification({
            type: 'warning',
            message: 'Produk berhasil dibuat, tapi gagal upload beberapa gambar. Silakan upload manual.',
          });
        }
      } else {
        showNotification({
          type: 'success',
          message: 'Produk berhasil ditambahkan',
        });
      }
      
      navigate('/admin/products');
    } catch (error: any) {
      setError(error.message || 'Gagal menambahkan produk');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/products');
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
          onClick={() => navigate('/admin/products')}
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <ProductIcon fontSize="small" />
          Produk
        </Link>
        <Typography variant="body2" color="textPrimary">
          Tambah Baru
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Tambah Produk Baru
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Buat produk baru untuk toko Anda
        </Typography>
      </Box>

      {/* Form */}
      <ProductForm
        mode="create"
        categories={categories}
        isLoading={isLoading}
        error={error}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
      />
    </Container>
  );
}
