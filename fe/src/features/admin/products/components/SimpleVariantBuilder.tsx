import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  AutoAwesome as AutoIcon,
  Edit as EditIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  CloudUpload as UploadIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { productApi } from '@/features/admin/products/services/productApi';
import { useUiStore } from '@/store/uiStore';
import { CreateProductVariantRequest } from '@/features/products/types';

interface VariantAttribute {
  name: string;
  values: string[]; // Back to simple string array
  affects_image: boolean;
}

interface ImageCombination {
  label: string; // "Merah + Katun"
  attributes: Record<string, string>; // { Warna: "Merah", Bahan: "Katun" }
  imageFile?: File;
  imagePreview?: string;
}

interface GeneratedVariant {
  sku: string;
  variant_name: string;
  price: number;
  stock: number;
  attributes: Record<string, string>;
  affects_image: boolean;
  _imageFile?: File;
  _imagePreview?: string;
}

const attributeSchema = z.object({
  name: z.string().min(1, 'Nama atribut wajib diisi'),
  values: z.string().min(1, 'Nilai atribut wajib diisi'),
});

type AttributeFormData = z.infer<typeof attributeSchema>;

interface SimpleVariantBuilderProps {
  productId: string;
  productName: string;
  onVariantsCreated: () => void;
}

export default function SimpleVariantBuilder({ productId, productName, onVariantsCreated }: SimpleVariantBuilderProps) {
  const { showNotification } = useUiStore();
  const [attributes, setAttributes] = useState<VariantAttribute[]>([]);
  const [imageCombinations, setImageCombinations] = useState<ImageCombination[]>([]); // New: kombinasi foto
  const [generatedVariants, setGeneratedVariants] = useState<GeneratedVariant[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState<number[]>([]);
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    variant: GeneratedVariant | null;
    index: number;
  }>({ open: false, variant: null, index: -1 });

  const {
    register: registerAttribute,
    handleSubmit: handleSubmitAttribute,
    formState: { errors: attributeErrors },
    reset: resetAttribute,
  } = useForm<AttributeFormData>({
    resolver: zodResolver(attributeSchema),
  });

  // Auto-sync: Update variants whenever imageCombinations change
  useEffect(() => {
    if (generatedVariants.length === 0 || imageCombinations.length === 0) return;

    // Sync images dari imageCombinations ke generatedVariants
    const updatedVariants = generatedVariants.map(variant => {
      if (!variant.affects_image) {
        return variant; // No change for variants that don't need images
      }

      // Find matching image combination
      const matchingCombo = imageCombinations.find(imgCombo => {
        return Object.entries(imgCombo.attributes).every(([key, value]) => {
          return variant.attributes[key] === value;
        });
      });

      if (matchingCombo) {
        // Check if image actually changed (prevent unnecessary updates)
        if (variant._imageFile !== matchingCombo.imageFile || 
            variant._imagePreview !== matchingCombo.imagePreview) {
          return {
            ...variant,
            _imageFile: matchingCombo.imageFile,
            _imagePreview: matchingCombo.imagePreview
          };
        }
        return variant;
      }

      // No match found, clear image if exists
      if (variant._imageFile || variant._imagePreview) {
        return {
          ...variant,
          _imageFile: undefined,
          _imagePreview: undefined
        };
      }
      
      return variant;
    });

    // Only update if there are actual changes
    const hasChanges = updatedVariants.some((v, i) => 
      v._imageFile !== generatedVariants[i]._imageFile || 
      v._imagePreview !== generatedVariants[i]._imagePreview
    );

    if (hasChanges) {
      setGeneratedVariants(updatedVariants);
      console.log('🔄 Synced images to variants');
      console.log('📸 Variants with images after sync:', updatedVariants.filter(v => v._imageFile).length);
    }
  }, [imageCombinations]);

  const handleAddAttribute = (data: AttributeFormData) => {
    const valueStrings = data.values.split(',').map(v => v.trim()).filter(v => v.length > 0);
    
    if (valueStrings.length === 0) {
      showNotification({
        type: 'error',
        message: 'Minimal satu nilai atribut',
      });
      return;
    }

    // Check for duplicate attribute names
    if (attributes.some(attr => attr.name.toLowerCase() === data.name.toLowerCase())) {
      showNotification({
        type: 'error',
        message: 'Nama atribut sudah ada',
      });
      return;
    }

    // Default: warna/bahan affects image, ukuran tidak
    const affectsImage = data.name.toLowerCase().includes('warna') || 
                         data.name.toLowerCase().includes('color') ||
                         data.name.toLowerCase().includes('bahan') ||
                         data.name.toLowerCase().includes('material');
    
    const newAttributes = [...attributes, { name: data.name, values: valueStrings, affects_image: affectsImage }];
    setAttributes(newAttributes);
    resetAttribute();
    
    // Auto-generate image combinations & variants
    generateImageCombinations(newAttributes);
    autoGenerateVariants(newAttributes);
  };

  const handleRemoveAttribute = (index: number) => {
    const newAttributes = attributes.filter((_, i) => i !== index);
    setAttributes(newAttributes);
    
    // Auto-generate ulang
    if (newAttributes.length > 0) {
      generateImageCombinations(newAttributes);
      autoGenerateVariants(newAttributes);
    } else {
      setImageCombinations([]);
      setGeneratedVariants([]);
    }
  };

  const handleRemoveValue = (attributeIndex: number, valueIndex: number) => {
    const newAttributes = attributes.map((attr, i) => {
      if (i === attributeIndex) {
        return {
          ...attr,
          values: attr.values.filter((_, j) => j !== valueIndex)
        };
      }
      return attr;
    });
    
    // Remove attribute if no values left
    const validAttributes = newAttributes.filter(attr => attr.values.length > 0);
    setAttributes(validAttributes);
    
    // Auto-generate ulang
    generateImageCombinations(validAttributes);
    autoGenerateVariants(validAttributes);
  };

  // Generate kombinasi foto dari atribut yang affects_image
  const generateImageCombinations = (attrs: VariantAttribute[]) => {
    const imageAttrs = attrs.filter(attr => attr.affects_image);
    
    if (imageAttrs.length === 0) {
      setImageCombinations([]);
      return;
    }

    // Generate all combinations dari atribut yang affects_image
    const combinations: Record<string, string>[] = [];
    
    const generateCombos = (current: Record<string, string>, remaining: VariantAttribute[]) => {
      if (remaining.length === 0) {
        combinations.push({ ...current });
        return;
      }

      const [currentAttr, ...rest] = remaining;
      currentAttr.values.forEach(value => {
        generateCombos(
          { ...current, [currentAttr.name]: value },
          rest
        );
      });
    };

    generateCombos({}, imageAttrs);

    // Convert to ImageCombination objects
    const imageCombos: ImageCombination[] = combinations.map(combo => {
      const label = Object.entries(combo)
        .map(([key, value]) => `${value}`)
        .join(' + ');
      
      // Create unique key for matching
      const uniqueKey = Object.entries(combo)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}:${v}`)
        .join('|');
      
      // Check if existing combination has image (match by attributes, not label)
      const existing = imageCombinations.find(ic => {
        const existingKey = Object.entries(ic.attributes)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([k, v]) => `${k}:${v}`)
          .join('|');
        return existingKey === uniqueKey;
      });
      
      return {
        label,
        attributes: combo,
        imageFile: existing?.imageFile,
        imagePreview: existing?.imagePreview
      };
    });

    setImageCombinations(imageCombos);
  };

  const handleUploadImageCombination = (index: number, file: File) => {
    if (!file.type.startsWith('image/')) {
      showNotification({
        type: 'error',
        message: 'File harus berupa gambar',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showNotification({
        type: 'error',
        message: 'Ukuran file maksimal 5MB',
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const updatedCombinations = imageCombinations.map((combo, i) => 
        i === index ? { ...combo, imageFile: file, imagePreview: reader.result as string } : combo
      );
      setImageCombinations(updatedCombinations);
      
      console.log('📸 Image uploaded for:', updatedCombinations[index].label);
      
      // Variants akan auto-sync via useEffect
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImageCombination = (index: number) => {
    const updatedCombinations = imageCombinations.map((combo, i) => 
      i === index ? { ...combo, imageFile: undefined, imagePreview: undefined } : combo
    );
    setImageCombinations(updatedCombinations);
    
    console.log('🗑️ Image removed from:', imageCombinations[index].label);
    
    // Variants akan auto-sync via useEffect
  };

  const autoGenerateVariants = (attrs: VariantAttribute[]) => {
    if (attrs.length === 0) {
      setGeneratedVariants([]);
      return;
    }

    // Generate all combinations
    const combinations: Record<string, string>[] = [];
    
    const generateCombinations = (current: Record<string, string>, remainingAttributes: VariantAttribute[]) => {
      if (remainingAttributes.length === 0) {
        combinations.push({ ...current });
        return;
      }

      const [currentAttr, ...rest] = remainingAttributes;
      currentAttr.values.forEach(value => {
        generateCombinations(
          { ...current, [currentAttr.name]: value },
          rest
        );
      });
    };

    generateCombinations({}, attrs);

    // Determine if any attribute affects image
    const hasImageAffectingAttribute = attrs.some(attr => attr.affects_image);

    // Create variant objects
    const variants: GeneratedVariant[] = combinations.map((combo) => {
      const variantName = Object.entries(combo)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      
      const sku = `${productName.toUpperCase().replace(/\s+/g, '-')}-${Object.values(combo)
        .map(v => v.toUpperCase().replace(/\s+/g, ''))
        .join('-')}`;

      // Find matching image combination
      let imageFile: File | undefined;
      let imagePreview: string | undefined;
      
      if (hasImageAffectingAttribute && imageCombinations.length > 0) {
        // Match variant's image-affecting attributes dengan image combination
        const matchingCombo = imageCombinations.find(imgCombo => {
          // Check if all image-affecting attributes match
          const allMatch = Object.entries(imgCombo.attributes).every(([key, value]) => {
            return combo[key] === value;
          });
          
          return allMatch;
        });
        
        if (matchingCombo) {
          imageFile = matchingCombo.imageFile;
          imagePreview = matchingCombo.imagePreview;
          
          // Debug log
          console.log('✅ Matched variant:', variantName, '→ Image:', matchingCombo.label);
        } else {
          console.warn('❌ No image match for variant:', variantName, 'Combo:', combo);
        }
      }

      return {
        sku,
        variant_name: variantName,
        price: 0,
        stock: 0,
        attributes: combo,
        affects_image: hasImageAffectingAttribute,
        _imageFile: imageFile,
        _imagePreview: imagePreview
      };
    });

    console.log('📊 Generated variants:', variants.length);
    console.log('📸 Variants with images:', variants.filter(v => v._imageFile).length);

    setGeneratedVariants(variants);
    setSelectedVariants([]);
  };

  const handleEditVariant = (variant: GeneratedVariant, index: number) => {
    setEditDialog({ open: true, variant, index });
  };

  const handleSaveVariant = (updatedVariant: GeneratedVariant) => {
    setGeneratedVariants(prev => prev.map((variant, i) => 
      i === editDialog.index ? updatedVariant : variant
    ));
    setEditDialog({ open: false, variant: null, index: -1 });
  };


  const handleSelectVariant = (index: number) => {
    setSelectedVariants(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const handleSelectAll = () => {
    if (selectedVariants.length === generatedVariants.length) {
      setSelectedVariants([]);
    } else {
      setSelectedVariants(generatedVariants.map((_, index) => index));
    }
  };

  const handleBulkDelete = () => {
    if (selectedVariants.length === 0) return;
    
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus ${selectedVariants.length} varian yang dipilih?`
    );
    
    if (confirmed) {
      setGeneratedVariants(prev => prev.filter((_, index) => !selectedVariants.includes(index)));
      setSelectedVariants([]);
      showNotification({
        type: 'success',
        message: `${selectedVariants.length} varian draft telah dihapus`,
      });
    }
  };

  const handleCreateVariants = async () => {
    if (generatedVariants.length === 0) return;

    // Validasi: Cek apakah semua varian dengan affects_image sudah punya foto
    const variantsNeedingImages = generatedVariants.filter(v => v.affects_image);
    const variantsWithoutImages = variantsNeedingImages.filter(v => !v._imageFile);
    
    if (variantsWithoutImages.length > 0) {
      showNotification({
        type: 'error',
        message: `${variantsWithoutImages.length} varian masih belum punya foto! Upload semua foto kombinasi terlebih dahulu.`,
      });
      return;
    }

    // Validasi: Cek apakah ada varian dengan harga 0
    const variantsWithZeroPrice = generatedVariants.filter(v => v.price === 0);
    if (variantsWithZeroPrice.length > 0) {
      const confirmed = window.confirm(
        `Ada ${variantsWithZeroPrice.length} varian dengan harga Rp0. Apakah Anda yakin ingin melanjutkan?`
      );
      if (!confirmed) return;
    }

    try {
      setIsCreating(true);
      
      // Use bulk create API
      const response = await productApi.createProductVariantsBulk(productId, generatedVariants);

      showNotification({
        type: 'success',
        message: response.message || `${generatedVariants.length} varian berhasil dibuat`,
      });

      onVariantsCreated();
      setAttributes([]);
      setImageCombinations([]);
      setGeneratedVariants([]);
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Gagal membuat varian',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const getTotalCombinations = () => {
    if (attributes.length === 0) return 0;
    return attributes.reduce((total, attr) => total * attr.values.length, 1);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <AutoIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Buat Varian Otomatis
          </Typography>
        </Box>

        <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
          Tentukan atribut varian dan sistem akan otomatis membuat semua kombinasi dengan SKU dan nama yang konsisten.
        </Typography>

        {/* Example */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2" fontWeight="medium" gutterBottom>
            💡 Cara Kerja Baru:
          </Typography>
          <Typography variant="body2" component="div">
            <strong>Contoh 1: Warna + Ukuran</strong>
            <br />1. Tambah atribut "Warna": Merah, Biru (affects_image ✅)
            <br />2. Tambah atribut "Ukuran": S, M, L (affects_image ❌)
            <br />3. Sistem generate 2 kombinasi foto: Merah, Biru
            <br />4. Upload foto di section "📸 Upload Foto untuk Kombinasi Varian"
            <br />5. Generate 6 varian (2 warna × 3 ukuran)
            <br />6. Merah-S/M/L pakai foto Merah, Biru-S/M/L pakai foto Biru ✨
            <br /><br />
            <strong>Contoh 2: Warna + Bahan + Ukuran</strong>
            <br />1. Warna: Merah, Biru (affects_image ✅)
            <br />2. Bahan: Katun, Polyester (affects_image ✅)
            <br />3. Ukuran: S, M (affects_image ❌)
            <br />4. Generate 4 kombinasi foto: Merah+Katun, Merah+Polyester, Biru+Katun, Biru+Polyester
            <br />5. Upload 4 foto untuk setiap kombinasi
            <br />6. Generate 8 varian (2×2×2), setiap kombinasi punya 2 ukuran
          </Typography>
        </Alert>

        {/* Add Attribute Form */}
        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Tambah Atribut Varian
            </Typography>
            <Box component="form" onSubmit={handleSubmitAttribute(handleAddAttribute)}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-end', flexWrap: 'wrap' }}>
                <Box sx={{ flex: '1 1 200px', minWidth: 200 }}>
                  <TextField
                    {...registerAttribute('name')}
                    label="Nama Atribut"
                    fullWidth
                    error={!!attributeErrors.name}
                    helperText={attributeErrors.name?.message}
                    placeholder="Contoh: Warna"
                  />
                </Box>
                <Box sx={{ flex: '2 1 300px', minWidth: 300 }}>
                  <TextField
                    {...registerAttribute('values')}
                    label="Nilai Atribut (pisahkan dengan koma)"
                    fullWidth
                    error={!!attributeErrors.values}
                    helperText={attributeErrors.values?.message}
                    placeholder="Contoh: Merah, Biru, Hijau"
                  />
                </Box>
                <Box sx={{ flex: '0 0 auto' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<AddIcon />}
                  >
                    Tambah
                  </Button>
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Attributes List */}
        {attributes.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Atribut yang Telah Didefinisikan
            </Typography>
            {attributes.map((attribute, index) => (
              <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="subtitle1" fontWeight="medium">
                      {attribute.name}
                    </Typography>
                      <Chip
                        size="small"
                        icon={attribute.affects_image ? <CheckBoxIcon /> : <CheckBoxOutlineBlankIcon />}
                        label={attribute.affects_image ? "Mempengaruhi Foto" : "Tidak Mempengaruhi Foto"}
                        color={attribute.affects_image ? "secondary" : "default"}
                        variant="outlined"
                        onClick={() => {
                          const newAttributes = attributes.map((attr, i) => 
                            i === index ? { ...attr, affects_image: !attr.affects_image } : attr
                          );
                          setAttributes(newAttributes);
                          
                          // Re-generate image combinations & variants
                          generateImageCombinations(newAttributes);
                          autoGenerateVariants(newAttributes);
                        }}
                        sx={{ 
                          cursor: 'pointer',
                          '&:hover': {
                            bgcolor: 'action.hover'
                          }
                        }}
                      />
                    </Box>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveAttribute(index)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {attribute.values.map((value, valueIndex) => (
                      <Chip
                        key={valueIndex}
                        label={value}
                        onDelete={() => handleRemoveValue(index, valueIndex)}
                        deleteIcon={<DeleteIcon />}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        )}

        {/* Image Combinations Upload Section */}
        {imageCombinations.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="h6" fontWeight="bold">
                  📸 Upload Foto untuk Kombinasi Varian
              </Typography>
                {imageCombinations.every(c => c.imageFile) && (
                  <Chip
                    label="✓ Lengkap"
                    size="small"
                    color="success"
                    icon={<CheckBoxIcon />}
                  />
                )}
                </Box>
              <Chip
                label={`${imageCombinations.filter(c => c.imageFile).length} / ${imageCombinations.length}`}
                color={imageCombinations.every(c => c.imageFile) ? "success" : "warning"}
                variant="filled"
                sx={{ fontWeight: 'bold' }}
                  />
                </Box>
            
            <Alert severity={imageCombinations.every(c => c.imageFile) ? "success" : "warning"} sx={{ mb: 2 }}>
              <Typography variant="body2">
                {imageCombinations.every(c => c.imageFile) 
                  ? '✅ Semua kombinasi sudah punya foto! Silakan isi harga & stok di tabel varian, lalu klik "Buat Semua Varian".'
                  : `⚠️ Upload foto untuk ${imageCombinations.filter(c => !c.imageFile).length} kombinasi yang belum lengkap. Semua varian dengan kombinasi yang sama akan menggunakan foto ini.`
                }
              </Typography>
            </Alert>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
              {imageCombinations.map((combo, index) => (
                <Card key={index} variant="outlined">
                  <CardContent sx={{ p: 2 }}>
                    {/* Image Preview or Upload Button */}
                    {combo.imagePreview ? (
                      <Box sx={{ position: 'relative', mb: 1 }}>
                        <Box
                          component="img"
                          src={combo.imagePreview}
                          alt={combo.label}
                          sx={{ 
                            width: '100%', 
                            height: 150, 
                            objectFit: 'cover', 
                            borderRadius: 1,
                            border: '2px solid',
                            borderColor: 'secondary.main'
                          }}
                        />
                        <Tooltip title="Hapus Gambar">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveImageCombination(index)}
                            sx={{
                              position: 'absolute',
                              top: -8,
                              right: -8,
                              bgcolor: 'background.paper',
                              boxShadow: 2,
                              '&:hover': { bgcolor: 'error.light', color: 'white' }
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ) : (
              <Button
                        component="label"
                variant="outlined"
                        fullWidth
                        sx={{ 
                          height: 150, 
                          mb: 1,
                          borderStyle: 'dashed',
                          '&:hover': {
                            borderStyle: 'dashed',
                            bgcolor: 'action.hover'
                          }
                        }}
                      >
                        <Box sx={{ textAlign: 'center' }}>
                          <UploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                          <Typography variant="caption" display="block" color="text.secondary">
                            Klik untuk Upload
                          </Typography>
                        </Box>
                        <input
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleUploadImageCombination(index, file);
                            }
                          }}
                        />
              </Button>
                    )}
                    
                    {/* Label */}
                    <Typography variant="body2" fontWeight="medium" textAlign="center" sx={{ mb: 0.5 }}>
                      {combo.label}
                    </Typography>
                    
                    {/* Attributes Detail */}
                    <Typography variant="caption" color="text.secondary" textAlign="center" display="block" sx={{ mb: 1 }}>
                      {Object.entries(combo.attributes).map(([k, v]) => `${k}: ${v}`).join(', ')}
                    </Typography>
                    
                    {/* Status */}
                    <Box sx={{ textAlign: 'center' }}>
                      {combo.imageFile ? (
                        <Chip
                          label="✓ Siap"
                          size="small"
                          color="success"
                          icon={<CheckBoxIcon />}
                          sx={{ fontWeight: 'bold' }}
                        />
                      ) : (
                        <Chip
                          label="⚠ Perlu Upload"
                          size="small"
                          color="warning"
                          icon={<UploadIcon />}
                          sx={{ fontWeight: 'bold' }}
                        />
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        )}

        {/* Summary Card */}
        {attributes.length > 0 && (
          <Card variant="outlined" sx={{ mb: 3, bgcolor: 'primary.50', borderColor: 'primary.main' }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                📊 Ringkasan Varian
              </Typography>
              
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                {/* Total Atribut */}
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Atribut
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {attributes.length}
                  </Typography>
                </Box>
                
                {/* Atribut dengan Foto */}
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Atribut Mempengaruhi Foto
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="secondary.main">
                    {attributes.filter(a => a.affects_image).length}
                  </Typography>
                </Box>
                
                {/* Total Kombinasi Foto */}
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Kombinasi Foto
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color={imageCombinations.every(c => c.imageFile) ? 'success.main' : 'warning.main'}>
                    {imageCombinations.filter(c => c.imageFile).length} / {imageCombinations.length}
                  </Typography>
                </Box>
                
                {/* Total Varian */}
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Varian
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="primary.main">
                    {getTotalCombinations()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Generated Variants */}
        {generatedVariants.length > 0 && (
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Varian yang Akan Dibuat ({generatedVariants.length})
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {selectedVariants.length > 0 && (
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleBulkDelete}
                  >
                    Hapus Terpilih ({selectedVariants.length})
                  </Button>
                )}
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => {
                    const confirmed = window.confirm(
                      `Apakah Anda yakin ingin menghapus semua ${generatedVariants.length} draft varian?`
                    );
                    if (confirmed) {
                      setGeneratedVariants([]);
                      setSelectedVariants([]);
                      showNotification({
                        type: 'success',
                        message: 'Semua draft varian telah dihapus',
                      });
                    }
                  }}
                >
                  Hapus Semua Draft
                </Button>
              </Box>
            </Box>
            {/* Progress Indicator */}
            {imageCombinations.length > 0 ? (
              imageCombinations.every(c => c.imageFile) ? (
                <Alert severity="success" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>✅ Semua foto sudah lengkap!</strong>
                    <br />• Klik tombol ✏️ Edit untuk mengisi harga dan stok
                    <br />• Setelah harga & stok terisi, klik "Buat Semua Varian"
            </Typography>
                </Alert>
              ) : (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>⚠️ Masih ada {imageCombinations.filter(c => !c.imageFile).length} foto yang belum diupload!</strong>
                    <br />• Scroll ke atas ke section "📸 Upload Foto untuk Kombinasi Varian"
                    <br />• Upload semua foto terlebih dahulu
                  </Typography>
                </Alert>
              )
            ) : (
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>ℹ️ Info:</strong>
                  <br />• Klik tombol ✏️ Edit untuk mengisi harga dan stok setiap varian
                  <br />• Varian akan menggunakan gambar produk utama
                </Typography>
              </Alert>
            )}

            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <IconButton
                        size="small"
                        onClick={handleSelectAll}
                        color="primary"
                      >
                        {selectedVariants.length === generatedVariants.length ? 
                          <CheckBoxIcon /> : 
                          <CheckBoxOutlineBlankIcon />
                        }
                      </IconButton>
                    </TableCell>
                    <TableCell>SKU</TableCell>
                    <TableCell>Nama Varian</TableCell>
                    <TableCell align="right">Harga</TableCell>
                    <TableCell align="center">Stok</TableCell>
                    <TableCell align="center">Gambar</TableCell>
                    <TableCell align="center">Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {generatedVariants.map((variant, index) => (
                    <TableRow key={index}>
                      <TableCell padding="checkbox">
                        <IconButton
                          size="small"
                          onClick={() => handleSelectVariant(index)}
                          color="primary"
                        >
                          {selectedVariants.includes(index) ? 
                            <CheckBoxIcon /> : 
                            <CheckBoxOutlineBlankIcon />
                          }
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace">
                          {variant.sku}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {variant.variant_name}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium" color={variant.price === 0 ? 'error' : 'primary'}>
                          {formatPrice(variant.price)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={variant.stock}
                          size="small"
                          color={variant.stock === 0 ? 'default' : 'success'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell align="center">
                        {variant._imagePreview ? (
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                            <Tooltip 
                              title={
                                <Box>
                                  <Typography variant="caption" display="block">Foto dari kombinasi:</Typography>
                                  <Typography variant="caption" fontWeight="bold">
                                    {Object.entries(variant.attributes)
                                      .filter(([key]) => attributes.find(a => a.name === key && a.affects_image))
                                      .map(([k, v]) => `${k}: ${v}`)
                                      .join(', ')}
                        </Typography>
                                </Box>
                              }
                            >
                              <Box
                                component="img"
                                src={variant._imagePreview}
                                alt="Preview"
                                sx={{ 
                                  width: 60, 
                                  height: 60, 
                                  objectFit: 'cover', 
                                  borderRadius: 1, 
                                  border: '2px solid', 
                                  borderColor: 'success.main',
                                  boxShadow: 2,
                                  cursor: 'help'
                                }}
                              />
                            </Tooltip>
                            <Chip
                              label="✓ Ada Foto"
                              size="small"
                              color="success"
                              sx={{ fontSize: '0.7rem', height: 20 }}
                            />
                          </Box>
                        ) : variant.affects_image ? (
                          <Tooltip 
                            title={
                              <Box>
                                <Typography variant="caption" display="block">Upload foto untuk kombinasi:</Typography>
                                <Typography variant="caption" fontWeight="bold">
                                  {Object.entries(variant.attributes)
                                    .filter(([key]) => attributes.find(a => a.name === key && a.affects_image))
                                    .map(([k, v]) => `${k}: ${v}`)
                                    .join(', ')}
                                </Typography>
                                <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                  Scroll ke atas ke section "📸 Upload Foto untuk Kombinasi Varian"
                                </Typography>
                              </Box>
                            }
                          >
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                              <Box
                                sx={{
                                  width: 60,
                                  height: 60,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '2px dashed',
                                  borderColor: 'error.main',
                                  borderRadius: 1,
                                  bgcolor: 'error.50',
                                  cursor: 'help'
                                }}
                              >
                                <UploadIcon color="error" />
                              </Box>
                              <Chip
                                label="⚠ Perlu Upload"
                                size="small"
                                color="error"
                                sx={{ fontSize: '0.7rem', height: 20 }}
                              />
                            </Box>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Varian ini akan menggunakan gambar produk utama">
                            <Chip
                              label="Pakai Foto Produk"
                              size="small"
                              variant="outlined"
                              icon={<ImageIcon />}
                              sx={{ cursor: 'help' }}
                            />
                          </Tooltip>
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title="Edit Harga & Stok">
                            <IconButton
                              size="small"
                              onClick={() => handleEditVariant(variant, index)}
                              color="primary"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Hapus Varian">
                            <IconButton
                              size="small"
                              onClick={() => {
                                const confirmed = window.confirm(
                                  `Apakah Anda yakin ingin menghapus varian "${variant.variant_name}"?`
                                );
                                if (confirmed) {
                                  setGeneratedVariants(prev => prev.filter((_, i) => i !== index));
                                  showNotification({
                                    type: 'success',
                                    message: 'Varian draft telah dihapus',
                                  });
                                }
                              }}
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

            <Box sx={{ textAlign: 'center', mt: 3 }}>
              {/* Warning if images missing */}
              {imageCombinations.length > 0 && !imageCombinations.every(c => c.imageFile) && (
                <Alert severity="error" sx={{ mb: 2, maxWidth: 600, mx: 'auto' }}>
                  <Typography variant="body2">
                    ⚠️ Belum bisa membuat varian! Upload semua {imageCombinations.filter(c => !c.imageFile).length} foto kombinasi yang kurang.
                  </Typography>
                </Alert>
              )}
              
              <Button
                variant="contained"
                size="large"
                onClick={handleCreateVariants}
                disabled={isCreating || (imageCombinations.length > 0 && !imageCombinations.every(c => c.imageFile))}
                startIcon={isCreating ? <CircularProgress size={20} color="inherit" /> : <CheckBoxIcon />}
              >
                {isCreating ? 'Membuat Varian...' : `Buat Semua ${generatedVariants.length} Varian`}
              </Button>
            </Box>
          </Box>
        )}

        {/* Edit Variant Dialog - Only Price & Stock */}
        <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, variant: null, index: -1 })} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Harga & Stok</DialogTitle>
          <DialogContent>
            {editDialog.variant && (
              <Box sx={{ mt: 2 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight="medium">
                    {editDialog.variant.variant_name}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                  SKU: {editDialog.variant.sku}
                </Typography>
                </Alert>

                {/* Show image preview if exists */}
                {editDialog.variant._imagePreview && (
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Box
                      component="img"
                      src={editDialog.variant._imagePreview}
                      alt="Preview"
                      sx={{ 
                        width: 120, 
                        height: 120, 
                        objectFit: 'cover', 
                        borderRadius: 2,
                        border: '2px solid',
                        borderColor: 'secondary.main'
                      }}
                    />
                    <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1 }}>
                      Gambar dari atribut
                </Typography>
                  </Box>
                )}
                
                <TextField
                  label="Harga (Rp)"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={editDialog.variant.price}
                  onChange={(e) => {
                    const updatedVariant = { ...editDialog.variant!, price: parseFloat(e.target.value) || 0 };
                    setEditDialog(prev => ({ ...prev, variant: updatedVariant }));
                  }}
                  InputProps={{ inputProps: { min: 0, step: "0.01" } }}
                  placeholder="Masukkan harga"
                />
                
                <TextField
                  label="Stok"
                  type="number"
                  fullWidth
                  margin="normal"
                  value={editDialog.variant.stock}
                  onChange={(e) => {
                    const updatedVariant = { ...editDialog.variant!, stock: parseInt(e.target.value) || 0 };
                    setEditDialog(prev => ({ ...prev, variant: updatedVariant }));
                  }}
                  InputProps={{ inputProps: { min: 0 } }}
                  placeholder="Masukkan stok"
                />
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialog({ open: false, variant: null, index: -1 })}>
              Batal
            </Button>
            <Button 
              onClick={() => editDialog.variant && handleSaveVariant(editDialog.variant)} 
              variant="contained"
            >
              Simpan
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}
