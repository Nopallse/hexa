import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Link,
  Alert,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  Home as HomeIcon,
  Inventory as ProductIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Palette as VariantIcon,
  Image as ImageIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { productApi } from '@/features/admin/products/services/productApi';
import ProductVariantManager from '@/features/admin/products/components/ProductVariantManager';
import ProductImageManager from '@/features/admin/products/components/ProductImageManager';
import Loading from '@/components/ui/Loading';
import { useUiStore } from '@/store/uiStore';
import { ProductResponse } from '@/features/products/types';
import { getProductImageUrl } from '@/utils/image';

type Product = ProductResponse['data'];

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { showNotification } = useUiStore();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});

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

  useEffect(() => {
    fetchProduct();
  }, [id]);

  // Reset selected image and variant when product changes
  useEffect(() => {
    if (product) {
      const primaryImage = getPrimaryImage(product);
      setSelectedImage(primaryImage ? primaryImage.image_name : null);
      
      // Set first variant as default if exists
      if (product.product_variants && product.product_variants.length > 0) {
        setSelectedVariant(product.product_variants[0]);
        
        // Extract default selected options from first variant
        const defaultOptions: Record<string, string> = {};
        if (product.product_variants[0].variant_options) {
          product.product_variants[0].variant_options.forEach(opt => {
            defaultOptions[opt.option_name] = opt.option_value;
          });
        }
        setSelectedOptions(defaultOptions);
      }
    }
  }, [product]);

  // Group variant options by attribute name
  const getVariantGroups = () => {
    if (!product?.product_variants || product.product_variants.length === 0) {
      return {};
    }

    const groups: Record<string, Set<string>> = {};
    
    product.product_variants.forEach(variant => {
      variant.variant_options?.forEach(option => {
        if (!groups[option.option_name]) {
          groups[option.option_name] = new Set();
        }
        groups[option.option_name].add(option.option_value);
      });
    });

    // Convert Set to Array
    const result: Record<string, string[]> = {};
    Object.keys(groups).forEach(key => {
      result[key] = Array.from(groups[key]);
    });

    return result;
  };

  // Handle variant option selection
  const handleSelectOption = (optionName: string, optionValue: string) => {
    const newSelectedOptions = { ...selectedOptions, [optionName]: optionValue };
    setSelectedOptions(newSelectedOptions);

    // Find matching variant
    const matchingVariant = product?.product_variants?.find(variant => {
      return variant.variant_options?.every(opt => 
        newSelectedOptions[opt.option_name] === opt.option_value
      );
    });

    if (matchingVariant) {
      setSelectedVariant(matchingVariant);
      
      // Update image: prioritas variant image, fallback ke primary product image
      if (matchingVariant.image) {
        setSelectedImage(matchingVariant.image);
      } else if (matchingVariant.display_image) {
        setSelectedImage(matchingVariant.display_image);
      } else if (product) {
        // Fallback ke gambar produk utama
        const primaryImage = getPrimaryImage(product);
        setSelectedImage(primaryImage ? primaryImage.image_name : null);
      }
    }
  };

  const handleEdit = () => {
    if (product) {
      navigate(`/admin/products/${product.id}/edit`);
    }
  };

  const handleDelete = async () => {
    if (!product) return;

    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus produk "${product.name}"? Tindakan ini tidak dapat dibatalkan.`
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      
      const response = await productApi.deleteProduct(product.id);
      
      if (response.success) {
        showNotification({
          type: 'success',
          message: 'Produk berhasil dihapus',
        });
        
        navigate('/admin/products');
      } else {
        throw new Error(response.message || 'Failed to delete product');
      }
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Gagal menghapus produk',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBackToList = () => {
    navigate('/admin/products');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getPrimaryImage = (product: Product) => {
    if (product.product_images && product.product_images.length > 0) {
      const primaryImage = product.product_images.find(img => img.is_primary);
      return primaryImage || product.product_images[0];
    }
    return null;
  };

  if (isLoading) {
    return <Loading message="Memuat data produk..." />;
  }

  if (error || !product) {
    return (
      <Container maxWidth={false}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Produk tidak ditemukan'}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBackToList}
        >
          Kembali ke Daftar Produk
        </Button>
      </Container>
    );
  }

  const primaryImage = getPrimaryImage(product);
  const displayImage = selectedImage || (primaryImage ? primaryImage.image_name : null);
  const variantGroups = getVariantGroups();

  return (
    <Container maxWidth={false}>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Detail Produk
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Informasi lengkap produk "{product.name}"
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

      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
        {/* Product Images */}
        <Box sx={{ flex: '1 1 300px', minWidth: 300 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Galeri Gambar
              </Typography>
              
              {/* Main Image Display */}
              {displayImage ? (
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Avatar
                    src={getProductImageUrl(displayImage)}
                    variant="rounded"
                    sx={{ 
                      width: '100%', 
                      height: 300, 
                      transition: 'all 0.3s ease',
                      boxShadow: 2
                    }}
                  />
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Avatar
                    variant="rounded"
                    sx={{ width: '100%', height: 300 }}
                  >
                    {product.name.charAt(0).toUpperCase()}
                  </Avatar>
                </Box>
              )}
              
              {/* Thumbnails - All Images */}
              {product.product_images && product.product_images.length > 0 ? (
                <Box>
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    Semua Gambar ({product.product_images.length})
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: 1, 
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                  }}>
                    {product.product_images
                      .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
                      .map((image) => (
                        <Box
                          key={image.id}
                          sx={{ position: 'relative' }}
                          onMouseEnter={() => setSelectedImage(image.image_name)}
                          onMouseLeave={() => setSelectedImage(primaryImage ? primaryImage.image_name : null)}
                        >
                          <Avatar
                            src={getProductImageUrl(image.image_name)}
                            variant="rounded"
                            sx={{ 
                              width: 70, 
                              height: 70,
                              cursor: 'pointer',
                              border: selectedImage === image.image_name ? 3 : 2,
                              borderColor: selectedImage === image.image_name ? 'primary.main' : 'divider',
                              transition: 'all 0.2s ease',
                              opacity: selectedImage === image.image_name ? 1 : 0.7,
                              '&:hover': {
                                opacity: 1,
                                transform: 'scale(1.05)',
                                borderColor: 'primary.main'
                              }
                            }}
                          />
                          {image.is_primary && (
                            <Chip
                              label="Utama"
                              size="small"
                              color="primary"
                              sx={{
                                position: 'absolute',
                                bottom: -8,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                fontSize: '0.65rem',
                                height: 16,
                                '& .MuiChip-label': {
                                  px: 0.5
                                }
                              }}
                            />
                          )}
                        </Box>
                      ))}
                  </Box>
                </Box>
              ) : (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Belum ada gambar produk
                </Alert>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Product Details */}
        <Box sx={{ flex: '2 1 500px', minWidth: 500 }}>
          <Card>
            <CardContent>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {product.name}
                </Typography>
                
                {product.product_variants && product.product_variants.length > 0 ? (
                  <Box>
                    <Typography variant="h4" color="primary" fontWeight="bold">
                      {product.price_range?.display || 'Harga bervariasi'}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Stok: {product.total_stock || 0} unit
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="h4" color="primary" fontWeight="bold">
                    {formatPrice(parseFloat(product.price || '0'))}
                  </Typography>
                )}
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Deskripsi
                </Typography>
                <Typography variant="body1" color="textSecondary">
                  {product.description || 'Tidak ada deskripsi'}
                </Typography>
              </Box>

              <Divider sx={{ mb: 3 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  Kategori
                </Typography>
                {product.category ? (
                  <Box>
                    <Chip
                      label={product.category.name}
                      color="primary"
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                    {product.category.description && (
                      <Typography variant="body2" color="textSecondary">
                        {product.category.description}
                      </Typography>
                    )}
                  </Box>
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    Tidak ada kategori
                  </Typography>
                )}
              </Box>

              {/* Variant Selector - E-commerce Style */}
              {product.product_variants && product.product_variants.length > 0 && Object.keys(variantGroups).length > 0 && (
                <>
                  <Divider sx={{ mb: 3 }} />
                  
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}><Typography variant="h6" fontWeight="bold" gutterBottom>Pilih Varian</Typography>{product.product_variants && product.product_variants.length > 0 ? (<Chip label={`${product.product_variants.length} Varian`} color="primary" size="small" variant="filled" sx={{ fontWeight: 'bold', bgcolor: 'primary.main', color: 'white', border: '1px solid', borderColor: 'primary.dark', letterSpacing: 0.5 }} />) : (<Chip label={`Stok: ${product.stock || 0}`} color={(product.stock || 0) > 0 ? 'success' : 'error'} size="small" variant={(product.stock || 0) > 0 ? 'filled' : 'outlined'} />)}</Box>
                    
                    {Object.entries(variantGroups).map(([optionName, values]) => (
                      <Box key={optionName} sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                          {optionName}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {values.map((value) => {
                            const isSelected = selectedOptions[optionName] === value;
                            
                            return (
                              <Button
                                key={value}
                                variant={isSelected ? "contained" : "outlined"}
                                onClick={() => handleSelectOption(optionName, value)}
                                size="large"
                                sx={{
                                  minWidth: 80,
                                  borderWidth: 2,
                                  borderColor: isSelected ? 'primary.main' : 'divider',
                                  position: 'relative',
                                  textTransform: 'none',
                                  '&:hover': {
                                    borderWidth: 2,
                                    borderColor: 'primary.main'
                                  }
                                }}
                              >
                                <Typography variant="body2" fontWeight={isSelected ? 'bold' : 'medium'}>
                                  {value}
                                </Typography>
                                
                                {/* Selected indicator */}
                                {isSelected && (
                                  <CheckIcon 
                                    sx={{ 
                                      position: 'absolute', 
                                      top: 4, 
                                      right: 4, 
                                      fontSize: 16,
                                      bgcolor: 'white',
                                      color: 'primary.main',
                                      borderRadius: '50%',
                                      p: 0.25
                                    }} 
                                  />
                                )}
                              </Button>
                            );
                          })}
                        </Box>
                      </Box>
                    ))}
                  </Box>

                  {/* Selected Variant - Harga & Stok */}
                  {selectedVariant && (
                    <Card variant="outlined" sx={{ mb: 3, bgcolor: 'primary.50', borderColor: 'primary.main' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Varian Terpilih
                            </Typography>
                            <Typography variant="h6" fontWeight="bold">
                              {selectedVariant.variant_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              SKU: {selectedVariant.sku}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h4" color="primary.main" fontWeight="bold">
                              {formatPrice(parseFloat(selectedVariant.price))}
                            </Typography>
                            <Chip
                              label={`Stok: ${selectedVariant.stock} unit`}
                              size="small"
                              color={selectedVariant.stock > 0 ? 'success' : 'error'}
                              sx={{ mt: 0.5 }}
                            />
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  )}

                  <Divider sx={{ mb: 3 }} />
                </>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Tabel Semua Varian - Di bawah, terpisah */}
      {product.product_variants && product.product_variants.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Semua Varian ({product.product_variants.length})
                </Typography>
              </Box>
              
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>SKU</TableCell>
                      <TableCell align="right">Harga</TableCell>
                      <TableCell align="center">Stok</TableCell>
                      <TableCell align="center">Gambar</TableCell>
                      <TableCell>Opsi Varian</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {product.product_variants.map((variant) => {
                      const isCurrentSelected = selectedVariant?.id === variant.id;
                      
                      return (
                        <TableRow 
                          key={variant.id}
                          hover
                          sx={{ 
                            bgcolor: isCurrentSelected ? 'primary.50' : 'transparent',
                            '&:hover': { bgcolor: isCurrentSelected ? 'primary.100' : 'action.hover' }
                          }}
                        >
                          <TableCell>
                            <Typography variant="body2" fontFamily="monospace" fontWeight="medium">
                              {variant.sku}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight="medium" color="primary">
                              {formatPrice(parseFloat(variant.price))}
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
                                  sx={{ width: 60, height: 60 }}
                                />
                              </Box>
                            ) : (
                              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                <Avatar
                                  variant="rounded"
                                  sx={{ width: 60, height: 60, bgcolor: 'grey.200' }}
                                >
                                  <ImageIcon color="disabled" />
                                </Avatar>
                                <Chip
                                  label="Tidak Ada"
                                  size="small"
                                  color="default"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem', height: 18 }}
                                />
                                {isCurrentSelected && (
                                  <Chip 
                                    label="Selected" 
                                    size="small" 
                                    color="primary" 
                                    sx={{ height: 18, fontSize: '0.65rem' }} 
                                  />
                                )}
                              </Box>
                            )}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              {variant.variant_options && variant.variant_options.length > 0 ? (
                                variant.variant_options.map((option) => (
                                  <Chip
                                    key={option.id}
                                    label={`${option.option_name}: ${option.option_value}`}
                                    size="small"
                                    variant="outlined"
                                  />
                                ))
                              ) : (
                                <Typography variant="caption" color="textSecondary" fontStyle="italic">
                                  Belum ada opsi
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      )}
    </Container>
  );
}
