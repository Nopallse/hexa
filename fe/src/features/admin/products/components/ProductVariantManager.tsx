import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Alert,
  Avatar,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AutoAwesome as AutoIcon,
  CloudUpload as UploadIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { productApi } from '@/features/admin/products/services/productApi';
import { useUiStore } from '@/store/uiStore';
import SimpleVariantBuilder from './SimpleVariantBuilder';
import { getProductImageUrl } from '@/utils/image';
import {
  CreateProductVariantRequest,
  UpdateProductVariantRequest,
  CreateVariantOptionRequest,
  ProductVariant,
} from '@/features/products/types';

const variantSchema = z.object({
  sku: z.string().min(1, 'SKU wajib diisi').min(3, 'SKU minimal 3 karakter'),
  variant_name: z.string().min(1, 'Nama varian wajib diisi'),
  price: z.number().min(0, 'Harga tidak boleh negatif'),
  stock: z.number().int().min(0, 'Stok tidak boleh negatif'),
});

const optionSchema = z.object({
  option_name: z.string().min(1, 'Nama opsi wajib diisi'),
  option_value: z.string().min(1, 'Nilai opsi wajib diisi'),
});

type VariantFormData = z.infer<typeof variantSchema>;
type OptionFormData = z.infer<typeof optionSchema>;

interface ProductVariantManagerProps {
  productId: string;
  productName: string;
}

export default function ProductVariantManager({ productId, productName }: ProductVariantManagerProps) {
  const { showNotification } = useUiStore();
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [variantDialog, setVariantDialog] = useState<{
    open: boolean;
    mode: 'create' | 'edit';
    variant?: ProductVariant;
  }>({ open: false, mode: 'create' });
  const [optionDialog, setOptionDialog] = useState<{
    open: boolean;
    variantId?: string;
    variantName?: string;
  }>({ open: false });
  const [imageDialog, setImageDialog] = useState<{
    open: boolean;
    variant?: ProductVariant;
  }>({ open: false });

  const {
    register: registerVariant,
    handleSubmit: handleSubmitVariant,
    formState: { errors: variantErrors },
    reset: resetVariant,
  } = useForm<VariantFormData>({
    resolver: zodResolver(variantSchema),
  });

  const {
    register: registerOption,
    handleSubmit: handleSubmitOption,
    formState: { errors: optionErrors },
    reset: resetOption,
  } = useForm<OptionFormData>({
    resolver: zodResolver(optionSchema),
  });

  const fetchVariants = async () => {
    try {
      setIsLoading(true);
      const response = await productApi.getProductVariants(productId);
      if (response.success) {
        setVariants(response.data);
      }
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Gagal memuat varian produk',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVariants();
  }, [productId]);

  const handleEditVariant = (variant: ProductVariant) => {
    resetVariant({
      sku: variant.sku,
      variant_name: variant.variant_name,
      price: parseFloat(variant.price),
      stock: variant.stock,
    });
    setVariantDialog({ open: true, mode: 'edit', variant });
  };

  const handleDeleteVariant = async (variant: ProductVariant) => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus varian "${variant.variant_name}"?`
    );
    if (!confirmed) return;

    try {
      await productApi.deleteProductVariant(variant.id);
      showNotification({
        type: 'success',
        message: 'Varian berhasil dihapus',
      });
      fetchVariants();
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Gagal menghapus varian',
      });
    }
  };

  const onSubmitVariant = async (data: VariantFormData) => {
    try {
      if (variantDialog.variant) {
        await productApi.updateProductVariant(variantDialog.variant.id, data);
        showNotification({
          type: 'success',
          message: 'Varian berhasil diperbarui',
        });
      }
      setVariantDialog({ open: false, mode: 'create' });
      fetchVariants();
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Gagal menyimpan varian',
      });
    }
  };

  const handleAddOption = (variantId: string, variantName: string) => {
    resetOption();
    setOptionDialog({ open: true, variantId, variantName });
  };

  const onSubmitOption = async (data: OptionFormData) => {
    if (!optionDialog.variantId) return;

    try {
      await productApi.createVariantOption(optionDialog.variantId, data);
      showNotification({
        type: 'success',
        message: 'Opsi varian berhasil ditambahkan',
      });
      setOptionDialog({ open: false });
      fetchVariants();
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Gagal menambahkan opsi varian',
      });
    }
  };

  const handleDeleteOption = async (optionId: string) => {
    const confirmed = window.confirm('Apakah Anda yakin ingin menghapus opsi ini?');
    if (!confirmed) return;

    try {
      await productApi.deleteVariantOption(optionId);
      showNotification({
        type: 'success',
        message: 'Opsi varian berhasil dihapus',
      });
      fetchVariants();
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Gagal menghapus opsi varian',
      });
    }
  };

  const handleEditImage = (variant: ProductVariant) => {
    setImageDialog({ open: true, variant });
  };

  const handleImageUpload = async (file: File) => {
    if (!imageDialog.variant) return;

    try {
      // Update variant image using new endpoint
      await productApi.updateVariantImage(imageDialog.variant.id, file);
      
      showNotification({
        type: 'success',
        message: 'Gambar varian berhasil diperbarui',
      });
      
      setImageDialog({ open: false, variant: undefined });
      fetchVariants();
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Gagal mengupdate gambar varian',
      });
    }
  };

  const formatPrice = (price: string | number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(typeof price === 'string' ? parseFloat(price) : price);
  };

  return (
    <Card>
      <CardContent>
        {/* Variant Builder - Selalu tampil */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Buat Varian Baru
          </Typography>
          <SimpleVariantBuilder
            productId={productId}
            productName={productName}
            onVariantsCreated={() => {
              fetchVariants();
            }}
          />
        </Box>

        {/* Current Variants */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Varian Saat Ini ({variants.length})
          </Typography>
          
          {isLoading ? (
            <Alert severity="info">
              Memuat varian produk...
            </Alert>
          ) : variants.length === 0 ? (
            <Alert severity="info">
              Belum ada varian produk. Gunakan form di atas untuk membuat varian baru.
            </Alert>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>SKU</TableCell>
                    <TableCell align="right">Harga</TableCell>
                    <TableCell align="center">Stok</TableCell>
                    <TableCell align="center">Gambar</TableCell>
                    <TableCell>Opsi Varian</TableCell>
                    <TableCell align="center">Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {variants.map((variant) => (
                    <TableRow key={variant.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace" fontWeight="medium">
                          {variant.sku}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium" color="primary">
                          {formatPrice(variant.price)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={variant.stock}
                          size="small"
                          color={variant.stock > 0 ? 'success' : 'error'}
                          variant={variant.stock > 0 ? 'filled' : 'outlined'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {variant.image ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                            <Avatar
                              src={getProductImageUrl(variant.image)}
                              variant="rounded"
                              sx={{ width: 40, height: 40 }}
                            />
                            <Chip
                              label="Ada Gambar"
                              size="small"
                              color="success"
                              sx={{ fontSize: '0.7rem', height: 18 }}
                            />
                          </Box>
                        ) : (
                          <Chip
                            label="Tidak Ada"
                            size="small"
                            color="default"
                            variant="outlined"
                            sx={{ fontSize: '0.7rem', height: 18 }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                          {variant.variant_options && variant.variant_options.length > 0 ? (
                            variant.variant_options.map((option) => (
                              <Chip
                                key={option.id}
                                label={`${option.option_name}: ${option.option_value}`}
                                size="small"
                                variant="outlined"
                                onDelete={() => handleDeleteOption(option.id)}
                                deleteIcon={<DeleteIcon fontSize="small" />}
                              />
                            ))
                          ) : (
                            <Typography variant="caption" color="textSecondary" fontStyle="italic">
                              Belum ada opsi
                            </Typography>
                          )}
                        </Box>
                        <Button
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => handleAddOption(variant.id, variant.variant_name)}
                          variant="outlined"
                          sx={{ fontSize: '0.75rem', py: 0.5 }}
                        >
                          Tambah Opsi
                        </Button>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title="Edit Varian">
                            <IconButton
                              size="small"
                              onClick={() => handleEditVariant(variant)}
                              color="primary"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit Gambar">
                            <IconButton
                              size="small"
                              onClick={() => handleEditImage(variant)}
                              color="secondary"
                            >
                              <ImageIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Hapus Varian">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteVariant(variant)}
                              color="error"
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>

        {/* Edit Variant Dialog */}
        <Dialog open={variantDialog.open} onClose={() => setVariantDialog({ open: false, mode: 'create' })} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Varian</DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ mt: 2 }}>
              <TextField
                {...registerVariant('sku')}
                label="SKU"
                fullWidth
                margin="normal"
                error={!!variantErrors.sku}
                helperText={variantErrors.sku?.message}
                placeholder="Contoh: PRD-001-RED"
              />
              <TextField
                {...registerVariant('variant_name')}
                label="Nama Varian"
                fullWidth
                margin="normal"
                error={!!variantErrors.variant_name}
                helperText={variantErrors.variant_name?.message}
                placeholder="Contoh: Warna Merah"
              />
              <TextField
                {...registerVariant('price', { valueAsNumber: true })}
                label="Harga"
                type="number"
                fullWidth
                margin="normal"
                error={!!variantErrors.price}
                helperText={variantErrors.price?.message}
                InputProps={{ inputProps: { min: 0, step: "0.01" } }}
              />
              <TextField
                {...registerVariant('stock', { valueAsNumber: true })}
                label="Stok"
                type="number"
                fullWidth
                margin="normal"
                error={!!variantErrors.stock}
                helperText={variantErrors.stock?.message}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setVariantDialog({ open: false, mode: 'create' })}>
              Batal
            </Button>
            <Button onClick={handleSubmitVariant(onSubmitVariant)} variant="contained">
              Simpan
            </Button>
          </DialogActions>
        </Dialog>

        {/* Option Dialog */}
        <Dialog open={optionDialog.open} onClose={() => setOptionDialog({ open: false })} maxWidth="sm" fullWidth>
          <DialogTitle>
            Tambah Opsi untuk {optionDialog.variantName}
          </DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ mt: 2 }}>
              <TextField
                {...registerOption('option_name')}
                label="Nama Opsi"
                fullWidth
                margin="normal"
                error={!!optionErrors.option_name}
                helperText={optionErrors.option_name?.message}
                placeholder="Contoh: Warna, Ukuran, Bahan"
              />
              <TextField
                {...registerOption('option_value')}
                label="Nilai Opsi"
                fullWidth
                margin="normal"
                error={!!optionErrors.option_value}
                helperText={optionErrors.option_value?.message}
                placeholder="Contoh: Merah, Large, Katun"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOptionDialog({ open: false })}>
              Batal
            </Button>
            <Button onClick={handleSubmitOption(onSubmitOption)} variant="contained">
              Tambah Opsi
            </Button>
          </DialogActions>
        </Dialog>

        {/* Image Edit Dialog */}
        <Dialog open={imageDialog.open} onClose={() => setImageDialog({ open: false, variant: undefined })} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Gambar Varian</DialogTitle>
          <DialogContent>
            {imageDialog.variant && (
              <Box sx={{ mt: 2 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight="medium">
                    {imageDialog.variant.variant_name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    SKU: {imageDialog.variant.sku}
                  </Typography>
                </Alert>

                {/* Current Image Preview */}
                {imageDialog.variant.image && (
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Gambar Saat Ini:
                    </Typography>
                    <Avatar
                      src={getProductImageUrl(imageDialog.variant.image)}
                      variant="rounded"
                      sx={{ 
                        width: 200, 
                        height: 200, 
                        mx: 'auto',
                        border: '2px solid',
                        borderColor: 'primary.main'
                      }}
                    />
                  </Box>
                )}

                {/* Upload New Image */}
                <Box sx={{ textAlign: 'center' }}>
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<UploadIcon />}
                    sx={{ mb: 2 }}
                  >
                    {imageDialog.variant.image ? 'Ganti Gambar' : 'Upload Gambar'}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file);
                        }
                      }}
                    />
                  </Button>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Format: JPG, PNG, WebP (Max 5MB)
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setImageDialog({ open: false, variant: undefined })}>
              Tutup
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}
