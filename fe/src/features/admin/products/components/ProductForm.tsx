import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  FormControlLabel,
  Switch,
  Divider,
  Paper,
  IconButton,
  CardMedia,
  Stack,
} from '@mui/material';
import { Info as InfoIcon, CloudUpload as UploadIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { CreateProductRequest, UpdateProductRequest } from '@/features/products/types';
import ProductVariantManager from './ProductVariantManager';
import ProductImageManager from './ProductImageManager';

// Schema untuk product tanpa variant
const simpleProductSchema = z.object({
  category_id: z
    .string()
    .min(1, 'Kategori wajib dipilih')
    .uuid('ID kategori tidak valid'),
  name: z
    .string()
    .min(1, 'Nama produk wajib diisi')
    .min(2, 'Nama produk minimal 2 karakter')
    .max(200, 'Nama produk maksimal 200 karakter'),
  description: z
    .string()
    .max(1000, 'Deskripsi maksimal 1000 karakter')
    .optional()
    .or(z.literal('')),
  price: z
    .number()
    .min(0, 'Harga tidak boleh negatif')
    .max(999999999, 'Harga terlalu besar'),
  stock: z
    .number()
    .int('Stok harus berupa bilangan bulat')
    .min(0, 'Stok tidak boleh negatif')
    .max(99999, 'Stok maksimal 99999'),
  pre_order: z
    .number()
    .int('Pre-order harus berupa bilangan bulat')
    .min(0, 'Pre-order tidak boleh negatif')
    .max(365, 'Pre-order maksimal 365 hari'),
  // Physical dimensions for shipping calculation
  length: z
    .number()
    .min(0, 'Panjang tidak boleh negatif')
    .max(9999, 'Panjang maksimal 9999 cm')
    .optional(),
  width: z
    .number()
    .min(0, 'Lebar tidak boleh negatif')
    .max(9999, 'Lebar maksimal 9999 cm')
    .optional(),
  height: z
    .number()
    .min(0, 'Tinggi tidak boleh negatif')
    .max(9999, 'Tinggi maksimal 9999 cm')
    .optional(),
  weight: z
    .number()
    .min(0, 'Berat tidak boleh negatif')
    .max(999999, 'Berat maksimal 999999 gram')
    .optional(),
});

// Schema untuk product dengan variant (price & stock tidak required)
const variantProductSchema = z.object({
  category_id: z
    .string()
    .min(1, 'Kategori wajib dipilih')
    .uuid('ID kategori tidak valid'),
  name: z
    .string()
    .min(1, 'Nama produk wajib diisi')
    .min(2, 'Nama produk minimal 2 karakter')
    .max(200, 'Nama produk maksimal 200 karakter'),
  description: z
    .string()
    .max(1000, 'Deskripsi maksimal 1000 karakter')
    .optional()
    .or(z.literal('')),
  price: z
    .number()
    .min(0, 'Harga tidak boleh negatif')
    .max(999999999, 'Harga terlalu besar'),
  pre_order: z
    .number()
    .int('Pre-order harus berupa bilangan bulat')
    .min(0, 'Pre-order tidak boleh negatif')
    .max(365, 'Pre-order maksimal 365 hari'),
  // Physical dimensions for shipping calculation
  length: z
    .number()
    .min(0, 'Panjang tidak boleh negatif')
    .max(9999, 'Panjang maksimal 9999 cm')
    .optional(),
  width: z
    .number()
    .min(0, 'Lebar tidak boleh negatif')
    .max(9999, 'Lebar maksimal 9999 cm')
    .optional(),
  height: z
    .number()
    .min(0, 'Tinggi tidak boleh negatif')
    .max(9999, 'Tinggi maksimal 9999 cm')
    .optional(),
  weight: z
    .number()
    .min(0, 'Berat tidak boleh negatif')
    .max(999999, 'Berat maksimal 999999 gram')
    .optional(),
});

type ProductFormData = z.infer<typeof simpleProductSchema>;

interface Product {
  id: string;
  category_id: string;
  name: string;
  description?: string | null;
  price: number | string | null;
  stock: number | null;
  pre_order: number;
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

interface ProductFormProps {
  product?: Product;
  categories: Category[];
  isLoading?: boolean;
  error?: string | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
  mode: 'create' | 'edit';
}

export default function ProductForm({
  product,
  categories,
  isLoading = false,
  error,
  onSubmit,
  onCancel,
  mode,
}: ProductFormProps) {
  // Check if product already has variants
  const productHasVariants = product?.product_variants && product.product_variants.length > 0;
  
  const [hasVariants, setHasVariants] = useState(productHasVariants || false);
  const [productImages, setProductImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const currentSchema = hasVariants ? variantProductSchema : simpleProductSchema;
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<any>({
    resolver: zodResolver(currentSchema) as any,
    defaultValues: {
      category_id: '',
      name: '',
      description: '',
      price: 0,
      stock: 0,
      pre_order: 0,
      length: undefined,
      width: undefined,
      height: undefined,
      weight: undefined,
    },
  });

  useEffect(() => {
    if (product && mode === 'edit') {
      // Check if product has variants
      const hasProductVariants: boolean = (product.product_variants && product.product_variants.length > 0) ? true : false;
      setHasVariants(hasProductVariants);
      
      reset({
        category_id: product.category_id,
        name: product.name,
        description: product.description || '',
        price: typeof product.price === 'string' ? parseFloat(product.price) : (product.price || 0),
        stock: product.stock || 0,
        pre_order: product.pre_order || 0,
        length: product.length || undefined,
        width: product.width || undefined,
        height: product.height || undefined,
        weight: product.weight || undefined,
      });
    }
  }, [product, mode, reset]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    if (files.length === 0) return;

    // Validate files
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} bukan file gambar`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} terlalu besar (max 5MB)`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    // Limit to 5 images total
    const remainingSlots = 5 - productImages.length;
    const filesToAdd = validFiles.slice(0, remainingSlots);

    setProductImages(prev => [...prev, ...filesToAdd]);

    // Create previews
    filesToAdd.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setProductImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (data: any) => {
    const submitData: any = {
      category_id: data.category_id,
      name: data.name,
      description: data.description || undefined,
      _imageFiles: productImages, // Add images for upload
      // Physical dimensions for shipping calculation
      length: data.length || undefined,
      width: data.width || undefined,
      height: data.height || undefined,
      weight: data.weight || undefined,
    };

    // Jika tidak ada variants, gunakan price & stock dari form
    if (!hasVariants) {
      submitData.price = data.price;
      submitData.stock = data.stock;
      submitData.pre_order = data.pre_order;
    } else {
      // Jika ada variants, gunakan harga default dan stok 0, tapi tetap kirim pre_order
      submitData.price = data.price; // Harga default untuk generate varian baru
      submitData.stock = 0; // Stok akan diatur per variant
      submitData.pre_order = data.pre_order;
    }

    await onSubmit(submitData);
  };

  const formatPrice = (value: string) => {
    // Remove non-numeric characters except decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    return numericValue;
  };

  return (
    <>
      {/* Image Manager - PALING ATAS (hanya untuk edit mode) */}
      {mode === 'edit' && product && (
        <Card sx={{ mb: 3 }}>
          <ProductImageManager 
              productId={product.id} 
              productName={product.name} 
            />
        </Card>
      )}

      {/* Form Edit Produk - TENGAH */}
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            {mode === 'create' ? 'Tambah Produk Baru' : 'Edit Produk'}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} sx={{ mt: 3, maxWidth: 800, mx: 'auto' }}>
          {/* Image Upload Section */}
          {/* Hanya tampilkan upload gambar di mode create */}
          {mode === 'create' && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Gambar Produk
              </Typography>
              
              <Button
                component="label"
                variant="outlined"
                startIcon={<UploadIcon />}
                disabled={isLoading || productImages.length >= 5}
                sx={{ mb: 2 }}
              >
                Pilih Gambar (Max 5)
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </Button>

              <Typography variant="caption" display="block" color="text.secondary" sx={{ mb: 2 }}>
                Format: JPG, PNG, WebP (Max 5MB per file). Gambar pertama akan menjadi gambar utama.
              </Typography>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                  {imagePreviews.map((preview, index) => (
                    <Card key={index} sx={{ position: 'relative' }}>
                      <CardMedia
                        component="img"
                        height="150"
                        image={preview}
                        alt={`Preview ${index + 1}`}
                        sx={{ objectFit: 'cover' }}
                      />
                      <IconButton
                        onClick={() => handleRemoveImage(index)}
                        disabled={isLoading}
                        sx={{
                          position: 'absolute',
                          top: 4,
                          right: 4,
                          bgcolor: 'background.paper',
                          '&:hover': { bgcolor: 'error.light', color: 'white' }
                        }}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                      {index === 0 && (
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            bgcolor: 'primary.main',
                            color: 'white',
                            py: 0.5,
                            px: 1,
                            textAlign: 'center'
                          }}
                        >
                          <Typography variant="caption">Gambar Utama</Typography>
                        </Box>
                      )}
                    </Card>
                  ))}
                </Box>
              )}
              <Divider sx={{ my: 3 }} />
            </Box>
            
          )}

        

          {/* Category Selection */}
          <FormControl fullWidth margin="normal" error={!!errors.category_id}>
            <InputLabel>Kategori *</InputLabel>
            <Select
              {...register('category_id')}
              label="Kategori *"
              disabled={isLoading}
              value={watch('category_id') || ''}
              onChange={(e) => setValue('category_id', e.target.value)}
            >
              <MenuItem value="">
                <em>Pilih Kategori</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
            {errors.category_id && (
              <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.75 }}>
                {String(errors.category_id.message || '')}
              </Typography>
            )}
          </FormControl>

          {/* Product Name */}
          <TextField
            {...register('name')}
            label="Nama Produk"
            fullWidth
            margin="normal"
            error={!!errors.name}
            helperText={errors.name?.message ? String(errors.name.message) : ''}
            disabled={isLoading}
            placeholder="Contoh: Boneka Rajutan Hello Kitty"
            required
          />

          {/* Description */}
          <TextField
            {...register('description')}
            label="Deskripsi Produk"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            error={!!errors.description}
            helperText={errors.description?.message ? String(errors.description.message) : ''}
            disabled={isLoading}
            placeholder="Deskripsi produk (opsional)"
          />

          {/* Variant Toggle (Create Mode OR Edit Mode without variants) */}
          {(mode === 'create' || (mode === 'edit' && !productHasVariants)) && (
            <>
              <Paper sx={{ p: 2, my: 3, bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <InfoIcon color="info" sx={{ mt: 0.5 }} />
                  <Box sx={{ flex: 1 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={hasVariants}
                          onChange={(e) => setHasVariants(e.target.checked)}
                          disabled={isLoading || (mode === 'edit' && productHasVariants)}
                          color="primary"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="subtitle2" fontWeight="bold">
                            Produk ini memiliki varian
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {hasVariants 
                              ? '✓ Harga dan stok akan diatur per varian (contoh: warna, ukuran)' 
                              : 'Produk sederhana dengan 1 harga dan stok'}
                          </Typography>
                          {mode === 'edit' && hasVariants && !productHasVariants && (
                            <Alert severity="warning" sx={{ mt: 1 }}>
                              <Typography variant="caption">
                                Setelah mengaktifkan mode varian, klik "Update" kemudian tambahkan varian di bawah.
                              </Typography>
                            </Alert>
                          )}
                        </Box>
                      }
                      sx={{ m: 0 }}
                    />
                  </Box>
                </Box>
              </Paper>

              <Divider sx={{ my: 3 }} />
            </>
          )}

          {/* Price & Stock Section (Only if NO Variants) */}
          {!hasVariants ? (
            <>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                Harga & Stok
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                {/* Price */}
                <TextField
                  {...register('price', { 
                    valueAsNumber: true,
                    setValueAs: (value) => {
                      const numValue = parseFloat(value);
                      return isNaN(numValue) ? 0 : numValue;
                    }
                  })}
                  label="Harga"
                  fullWidth
                  margin="normal"
                  type="number"
                  error={!!errors.price}
                  helperText={errors.price?.message ? String(errors.price.message) : ''}
                  disabled={isLoading}
                  placeholder="0"
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                    inputProps: { 
                      min: 0, 
                      step: "0.01",
                      style: { textAlign: 'right' }
                    }
                  }}
                />

                {/* Stock */}
                <TextField
                  {...register('stock', { 
                    valueAsNumber: true,
                    setValueAs: (value) => {
                      const numValue = parseInt(value);
                      return isNaN(numValue) ? 0 : numValue;
                    }
                  })}
                  label="Stok"
                  fullWidth
                  margin="normal"
                  type="number"
                  error={!!errors.stock}
                  helperText={errors.stock?.message ? String(errors.stock.message) : ''}
                  disabled={isLoading}
                  placeholder="0"
                  required
                  InputProps={{
                    inputProps: { 
                      min: 0, 
                      step: 1,
                      style: { textAlign: 'right' }
                    }
                  }}
                />

                {/* Pre-order */}
                <TextField
                  {...register('pre_order', { 
                    valueAsNumber: true,
                    setValueAs: (value) => {
                      const numValue = parseInt(value);
                      return isNaN(numValue) ? 0 : numValue;
                    }
                  })}
                  label="Pre-order (Hari)"
                  fullWidth
                  margin="normal"
                  type="number"
                  error={!!errors.pre_order}
                  helperText={errors.pre_order?.message ? String(errors.pre_order.message) : 'Berapa hari produk dibuat setelah order'}
                  disabled={isLoading}
                  placeholder="0"
                  required
                  InputProps={{
                    inputProps: { 
                      min: 0, 
                      step: 1,
                      style: { textAlign: 'right' }
                    }
                  }}
                />
              </Stack>

              {/* Physical Dimensions Section */}
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                Dimensi Fisik (untuk perhitungan shipping)
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                {/* Length */}
                <TextField
                  {...register('length', { 
                    valueAsNumber: true,
                    setValueAs: (value) => {
                      const numValue = parseFloat(value);
                      return isNaN(numValue) ? undefined : numValue;
                    }
                  })}
                  label="Panjang"
                  fullWidth
                  margin="normal"
                  type="number"
                  error={!!errors.length}
                  helperText={errors.length?.message ? String(errors.length.message) : 'Panjang dalam cm'}
                  disabled={isLoading}
                  placeholder="10"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                    inputProps: { 
                      min: 0, 
                      step: 0.1,
                      style: { textAlign: 'right' }
                    }
                  }}
                />

                {/* Width */}
                <TextField
                  {...register('width', { 
                    valueAsNumber: true,
                    setValueAs: (value) => {
                      const numValue = parseFloat(value);
                      return isNaN(numValue) ? undefined : numValue;
                    }
                  })}
                  label="Lebar"
                  fullWidth
                  margin="normal"
                  type="number"
                  error={!!errors.width}
                  helperText={errors.width?.message ? String(errors.width.message) : 'Lebar dalam cm'}
                  disabled={isLoading}
                  placeholder="10"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                    inputProps: { 
                      min: 0, 
                      step: 0.1,
                      style: { textAlign: 'right' }
                    }
                  }}
                />

                {/* Height */}
                <TextField
                  {...register('height', { 
                    valueAsNumber: true,
                    setValueAs: (value) => {
                      const numValue = parseFloat(value);
                      return isNaN(numValue) ? undefined : numValue;
                    }
                  })}
                  label="Tinggi"
                  fullWidth
                  margin="normal"
                  type="number"
                  error={!!errors.height}
                  helperText={errors.height?.message ? String(errors.height.message) : 'Tinggi dalam cm'}
                  disabled={isLoading}
                  placeholder="1"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                    inputProps: { 
                      min: 0, 
                      step: 0.1,
                      style: { textAlign: 'right' }
                    }
                  }}
                />

                {/* Weight */}
                <TextField
                  {...register('weight', { 
                    valueAsNumber: true,
                    setValueAs: (value) => {
                      const numValue = parseFloat(value);
                      return isNaN(numValue) ? undefined : numValue;
                    }
                  })}
                  label="Berat"
                  fullWidth
                  margin="normal"
                  type="number"
                  error={!!errors.weight}
                  helperText={errors.weight?.message ? String(errors.weight.message) : 'Berat dalam gram'}
                  disabled={isLoading}
                  placeholder="1000"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">g</InputAdornment>,
                    inputProps: { 
                      min: 0, 
                      step: 1,
                      style: { textAlign: 'right' }
                    }
                  }}
                />
              </Stack>

              <Divider sx={{ my: 3 }} />
            </>
          ) : (
            /* Mode variant - tampilkan pre_order dan harga default */
            <>
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                Informasi Produk & Harga Default
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                {/* Price Default */}
                <TextField
                  {...register('price', { 
                    valueAsNumber: true,
                    setValueAs: (value) => {
                      const numValue = parseFloat(value);
                      return isNaN(numValue) ? 0 : numValue;
                    }
                  })}
                  label="Harga Default"
                  fullWidth
                  margin="normal"
                  type="number"
                  error={!!errors.price}
                  helperText={errors.price?.message ? String(errors.price.message) : 'Harga default untuk generate varian baru'}
                  disabled={isLoading}
                  placeholder="0"
                  required
                  InputProps={{
                    startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                    inputProps: { 
                      min: 0, 
                      step: "0.01",
                      style: { textAlign: 'right' }
                    }
                  }}
                />

                {/* Stock Display (Read-only) */}
                <TextField
                  label="Total Stok Varian"
                  fullWidth
                  margin="normal"
                  type="number"
                  disabled={true}
                  value={product?.product_variants ? 
                    product.product_variants.reduce((sum, v) => sum + (v.stock || 0), 0) : 0
                  }
                  helperText="Total stok dari semua varian (read-only)"
                  InputProps={{
                    inputProps: { 
                      style: { textAlign: 'right' }
                    }
                  }}
                />

                {/* Pre-order */}
                <TextField
                  {...register('pre_order', { 
                    valueAsNumber: true,
                    setValueAs: (value) => {
                      const numValue = parseInt(value);
                      return isNaN(numValue) ? 0 : numValue;
                    }
                  })}
                  label="Pre-order (Hari)"
                  fullWidth
                  margin="normal"
                  type="number"
                  error={!!errors.pre_order}
                  helperText={errors.pre_order?.message ? String(errors.pre_order.message) : 'Berapa hari produk dibuat setelah order'}
                  disabled={isLoading}
                  placeholder="0"
                  required
                  InputProps={{
                    inputProps: { 
                      min: 0, 
                      step: 1,
                      style: { textAlign: 'right' }
                    }
                  }}
                />
              </Stack>

              {/* Physical Dimensions Section for Variant Mode */}
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 2 }}>
                Dimensi Fisik (untuk perhitungan shipping)
              </Typography>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                {/* Length */}
                <TextField
                  {...register('length', { 
                    valueAsNumber: true,
                    setValueAs: (value) => {
                      const numValue = parseFloat(value);
                      return isNaN(numValue) ? undefined : numValue;
                    }
                  })}
                  label="Panjang"
                  fullWidth
                  margin="normal"
                  type="number"
                  error={!!errors.length}
                  helperText={errors.length?.message ? String(errors.length.message) : 'Panjang dalam cm'}
                  disabled={isLoading}
                  placeholder="10"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                    inputProps: { 
                      min: 0, 
                      step: 0.1,
                      style: { textAlign: 'right' }
                    }
                  }}
                />

                {/* Width */}
                <TextField
                  {...register('width', { 
                    valueAsNumber: true,
                    setValueAs: (value) => {
                      const numValue = parseFloat(value);
                      return isNaN(numValue) ? undefined : numValue;
                    }
                  })}
                  label="Lebar"
                  fullWidth
                  margin="normal"
                  type="number"
                  error={!!errors.width}
                  helperText={errors.width?.message ? String(errors.width.message) : 'Lebar dalam cm'}
                  disabled={isLoading}
                  placeholder="10"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                    inputProps: { 
                      min: 0, 
                      step: 0.1,
                      style: { textAlign: 'right' }
                    }
                  }}
                />

                {/* Height */}
                <TextField
                  {...register('height', { 
                    valueAsNumber: true,
                    setValueAs: (value) => {
                      const numValue = parseFloat(value);
                      return isNaN(numValue) ? undefined : numValue;
                    }
                  })}
                  label="Tinggi"
                  fullWidth
                  margin="normal"
                  type="number"
                  error={!!errors.height}
                  helperText={errors.height?.message ? String(errors.height.message) : 'Tinggi dalam cm'}
                  disabled={isLoading}
                  placeholder="1"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                    inputProps: { 
                      min: 0, 
                      step: 0.1,
                      style: { textAlign: 'right' }
                    }
                  }}
                />

                {/* Weight */}
                <TextField
                  {...register('weight', { 
                    valueAsNumber: true,
                    setValueAs: (value) => {
                      const numValue = parseFloat(value);
                      return isNaN(numValue) ? undefined : numValue;
                    }
                  })}
                  label="Berat"
                  fullWidth
                  margin="normal"
                  type="number"
                  error={!!errors.weight}
                  helperText={errors.weight?.message ? String(errors.weight.message) : 'Berat dalam gram'}
                  disabled={isLoading}
                  placeholder="1000"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">g</InputAdornment>,
                    inputProps: { 
                      min: 0, 
                      step: 1,
                      style: { textAlign: 'right' }
                    }
                  }}
                />
              </Stack>

              <Alert severity="info" sx={{ my: 3 }}>
                <Typography variant="body2">
                  <strong>Mode Varian Aktif!</strong>
                  <br />
                  • Harga default akan digunakan saat membuat varian baru
                  <br />
                  • Stok ditampilkan dari total semua varian
                  <br />
                  • Setelah produk dibuat, tambahkan varian di halaman detail produk
                  <br />
                  • Contoh varian: <em>Merah - S (Rp 100.000, stok: 10), Biru - M (Rp 120.000, stok: 15)</em>
                  <br />
                  • Setiap varian bisa punya gambar sendiri (opsional untuk warna yang berbeda)
                </Typography>
              </Alert>

              <Divider sx={{ my: 3 }} />
            </>
          )}

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading}
              sx={{ minWidth: 120 }}
            >
              {isLoading 
                ? (mode === 'create' ? 'Menyimpan...' : 'Mengupdate...') 
                : (mode === 'create' ? 'Simpan' : 'Update')
              }
            </Button>

            {onCancel && (
              <Button
                variant="outlined"
                size="large"
                onClick={onCancel}
                disabled={isLoading}
              >
                Batal
              </Button>
            )}
          </Box>
        </Box>

        </CardContent>
      </Card>

      {/* Variant Manager - PALING BAWAH (hanya untuk edit mode) */}
      {mode === 'edit' && product && (
        <Card sx={{ mt: 3 }}>
          <ProductVariantManager 
            productId={product.id} 
            productName={product.name} 
          />
        </Card>
      )}
    </>
  );
}
