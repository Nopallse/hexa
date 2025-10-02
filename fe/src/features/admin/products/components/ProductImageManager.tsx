import { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Avatar,
  Badge,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  CloudUpload as UploadIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import { productApi } from '@/features/admin/products/services/productApi';
import { useUiStore } from '@/store/uiStore';
import { CreateProductImageRequest, ProductImage } from '@/features/products/types';
import { getProductImageUrl } from '@/utils/image';

interface ProductImageManagerProps {
  productId: string;
  productName: string;
}

export default function ProductImageManager({ productId, productName }: ProductImageManagerProps) {
  const { showNotification } = useUiStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [images, setImages] = useState<ProductImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  const fetchImages = async () => {
    try {
      setIsLoading(true);
      const response = await productApi.getProductImages(productId);
      if (response.success) {
        setImages(response.data);
      }
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Gagal memuat gambar produk',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [productId]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showNotification({
        type: 'error',
        message: 'File harus berupa gambar',
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showNotification({
        type: 'error',
        message: 'Ukuran file maksimal 5MB',
      });
      return;
    }

    try {
      setIsUploading(true);
      
      // Create product image with file upload
      const isPrimary = images.length === 0; // First image is primary by default
      await productApi.createProductImage(productId, {
        image_name: '', // Will be set by backend
        is_primary: isPrimary,
        _imageFile: file
      } as any);

      showNotification({
        type: 'success',
        message: 'Gambar berhasil ditambahkan',
      });
      
      fetchImages();
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Gagal mengunggah gambar',
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleReplaceImage = async (imageId: string, file: File) => {
    try {
      setIsUploading(true);
      
      // Update product image with new file
      await productApi.updateProductImage(imageId, {
        image_name: '', // Will be set by backend
        _imageFile: file
      } as any);

      showNotification({
        type: 'success',
        message: 'Gambar berhasil diganti',
      });
      
      fetchImages();
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Gagal mengganti gambar',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      await productApi.updateProductImage(imageId, { is_primary: true });
      showNotification({
        type: 'success',
        message: 'Gambar utama berhasil diperbarui',
      });
      fetchImages();
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Gagal mengatur gambar utama',
      });
    }
  };

  const handleDeleteImage = async (image: ProductImage) => {
    const confirmed = window.confirm('Apakah Anda yakin ingin menghapus gambar ini?');
    if (!confirmed) return;

    try {
      await productApi.deleteProductImage(image.id);
      showNotification({
        type: 'success',
        message: 'Gambar berhasil dihapus',
      });
      fetchImages();
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Gagal menghapus gambar',
      });
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6" fontWeight="bold">
            Gambar Produk
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? <CircularProgress size={20} /> : 'Upload'}
            </Button>
          
          </Box>
        </Box>

        {isLoading ? (
          <Alert severity="info">
            Memuat gambar produk...
          </Alert>
        ) : images.length === 0 ? (
          <Alert severity="info">
            Belum ada gambar produk. Tambahkan gambar untuk menarik perhatian pelanggan.
          </Alert>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
            {images.map((image) => (
              <Box key={image.id}>
                <Card variant="outlined">
                  <Box sx={{ position: 'relative' }}>
                    <Avatar
                      src={getProductImageUrl(image.image_name)}
                      variant="rounded"
                      sx={{ width: '100%', height: 200 }}
                    />
                    
                    {/* Primary Badge */}
                    {image.is_primary && (
                      <Badge
                        badgeContent={<StarIcon sx={{ fontSize: 16 }} />}
                        color="primary"
                        sx={{
                          position: 'absolute',
                          top: 8,
                          left: 8,
                          '& .MuiBadge-badge': {
                            backgroundColor: 'primary.main',
                            color: 'white',
                          },
                        }}
                      />
                    )}

                    {/* Action Buttons */}
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 0.5,
                      }}
                    >
                      {!image.is_primary && (
                        <Tooltip title="Jadikan Gambar Utama">
                          <IconButton
                            size="small"
                            onClick={() => handleSetPrimary(image.id)}
                            sx={{
                              backgroundColor: 'rgba(255,255,255,0.9)',
                              '&:hover': { backgroundColor: 'rgba(255,255,255,1)' },
                            }}
                          >
                            <StarBorderIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {/* Replace Image Button */}
                      <Tooltip title="Ganti Gambar">
                        <IconButton
                          size="small"
                          component="label"
                          sx={{
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            '&:hover': { backgroundColor: 'rgba(255,255,255,1)' },
                          }}
                        >
                          <EditIcon fontSize="small" />
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleReplaceImage(image.id, file);
                              }
                            }}
                          />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Hapus Gambar">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteImage(image)}
                          color="error"
                          sx={{
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            '&:hover': { backgroundColor: 'rgba(255,255,255,1)' },
                          }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Card>
              </Box>
            ))}
          </Box>
        )}

        {/* Upload by URL Dialog */}
        <Dialog open={uploadDialog} onClose={() => setUploadDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Tambah Gambar dari URL</DialogTitle>
          <DialogContent>
            <TextField
              label="URL Gambar"
              fullWidth
              margin="normal"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              helperText="Pastikan URL mengarah langsung ke file gambar"
            />
          </DialogContent>
         
        </Dialog>
      </CardContent>
    </Card>
  );
}
