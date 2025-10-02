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
  Avatar,
  IconButton,
} from '@mui/material';
import { Delete as DeleteIcon, CloudUpload as UploadIcon } from '@mui/icons-material';
import { Category } from '@/types/global';
import { CreateCategoryRequest, UpdateCategoryRequest } from '../types';
import { getCategoryImageUrl } from '@/utils/image';

const categorySchema = z.object({
  name: z
    .string()
    .min(1, 'Nama kategori wajib diisi')
    .min(2, 'Nama kategori minimal 2 karakter')
    .max(100, 'Nama kategori maksimal 100 karakter'),
  description: z
    .string()
    .max(500, 'Deskripsi maksimal 500 karakter')
    .optional()
    .or(z.literal('')),
  image: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: Category;
  isLoading?: boolean;
  error?: string | null;
  onSubmit: (data: CreateCategoryRequest | UpdateCategoryRequest) => Promise<void>;
  onCancel?: () => void;
  mode: 'create' | 'edit';
}

export default function CategoryForm({
  category,
  isLoading = false,
  error,
  onSubmit,
  onCancel,
  mode,
}: CategoryFormProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      image: '',
    },
  });

  useEffect(() => {
    if (category && mode === 'edit') {
      reset({
        name: category.name,
        description: category.description || '',
        image: (category as any).image || '',
      });
      setCurrentImage((category as any).image || null);
    }
  }, [category, mode, reset]);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('File harus berupa gambar');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB');
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setCurrentImage(null);
    setValue('image', '');
  };

  const handleFormSubmit = async (data: CategoryFormData) => {
    // Prepare data - FormData will be created in the API call
    const submitData: any = {
      name: data.name,
      description: data.description || undefined,
    };

    // Add image file for upload
    if (imageFile) {
      submitData._imageFile = imageFile;
    } else if (!currentImage && mode === 'edit') {
      // Mark for image removal
      submitData._removeImage = true;
    }

    await onSubmit(submitData);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          {mode === 'create' ? 'Tambah Kategori Baru' : 'Edit Kategori'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} sx={{ mt: 3 }}>
          {/* Image Upload */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Gambar Kategori
            </Typography>
            
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={imagePreview || (currentImage ? getCategoryImageUrl(currentImage) : undefined)}
                sx={{ width: 100, height: 100 }}
                variant="rounded"
              />
              
              <Box>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  disabled={isLoading || uploadingImage}
                >
                  {uploadingImage ? 'Uploading...' : 'Pilih Gambar'}
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
                
                {(imageFile || currentImage) && (
                  <IconButton
                    onClick={handleRemoveImage}
                    disabled={isLoading || uploadingImage}
                    color="error"
                    size="small"
                    sx={{ ml: 1 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
                
                <Typography variant="caption" display="block" sx={{ mt: 1, color: 'text.secondary' }}>
                  Format: JPG, PNG, WebP (Max 5MB)
                </Typography>
              </Box>
            </Box>
          </Box>

          <TextField
            {...register('name')}
            label="Nama Kategori"
            fullWidth
            margin="normal"
            error={!!errors.name}
            helperText={errors.name?.message}
            disabled={isLoading}
            placeholder="Contoh: Boneka Rajutan"
          />

          <TextField
            {...register('description')}
            label="Deskripsi"
            fullWidth
            margin="normal"
            multiline
            rows={4}
            error={!!errors.description}
            helperText={errors.description?.message}
            disabled={isLoading}
            placeholder="Deskripsi kategori (opsional)"
          />

          <Box sx={{ display: 'flex', gap: 2, mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={isLoading || uploadingImage}
              sx={{ minWidth: 120 }}
            >
              {uploadingImage 
                ? 'Uploading...'
                : isLoading 
                  ? (mode === 'create' ? 'Menyimpan...' : 'Mengupdate...') 
                  : (mode === 'create' ? 'Simpan' : 'Update')
              }
            </Button>

            {onCancel && (
              <Button
                variant="outlined"
                size="large"
                onClick={onCancel}
                disabled={isLoading || uploadingImage}
              >
                Batal
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
