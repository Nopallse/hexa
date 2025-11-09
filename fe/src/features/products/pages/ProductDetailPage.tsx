import { 
  Container, 
  Typography, 
  Box, 
  useTheme,
  Link,
  Stack,
  Chip,
  Button,
  Divider,
  Grid,
  Card,
  CardContent,
  Alert,
  Skeleton,
  Tabs,
  Tab,
  IconButton,
  Badge,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormHelperText,
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
  Home, 
  ShoppingBag,
  ShoppingCart,
  Favorite,
  Share,
  ArrowBack,
  Star,
  Inventory,
  Category as CategoryIcon,
  Visibility,
  Image as ImageIcon,
} from '@mui/icons-material';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { productApi } from '../services/productApi';
import { Product } from '../types';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { getProductImageUrl } from '@/utils/image';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}



export default function ProductDetailPage() {
  const theme = useTheme();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { formatPrice, formatPriceRange } = useCurrencyConversion();
  
  // State
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [addingToCart, setAddingToCart] = useState(false);

  // Store hooks
  const { addItem, isLoading: cartLoading, error: cartError } = useCartStore();
  const { user } = useAuthStore();

  // Fetch product
  const fetchProduct = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await productApi.getProductById(id);
      
      if (response.success) {
        setProduct(response.data);
      } else {
        setError('Produk tidak ditemukan');
      }
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Gagal memuat produk');
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product || !user) {
      // Redirect to login if not authenticated
      navigate('/login');
      return;
    }

    // Hitung hasVariants di dalam fungsi
    const hasVariants = product.product_variants && product.product_variants.length > 0;

    // ✅ Jika hanya 1 variant, gunakan variant tersebut
    // Jika multiple variants, pastikan variant sudah dipilih
    if (hasVariants && product.product_variants && product.product_variants.length > 1 && !selectedVariant) {
      toast.error('Pilih varian terlebih dahulu', {
        duration: 3000,
        position: 'bottom-right',
      });
      return;
    }

    try {
      setAddingToCart(true);

      // ✅ Handle kasus 1 variant atau multiple variants
      let variantId: string;
      if (hasVariants && product.product_variants) {
        if (product.product_variants.length === 1) {
          // Hanya 1 variant, gunakan variant tersebut
          variantId = product.product_variants[0].id;
        } else {
          // Multiple variants, gunakan selected variant
          if (!selectedVariant) {
            setAddingToCart(false);
            toast.error('Pilih varian terlebih dahulu', {
              duration: 3000,
              position: 'bottom-right',
            });
            return;
          }
          variantId = selectedVariant.id;
        }
      } else {
        // Fallback: gunakan product_id (untuk backward compatibility)
        variantId = product.id;
      }
      
      // Gunakan addItem dari store global yang akan otomatis update totalItems
      await addItem({
        product_variant_id: variantId!,
        quantity: quantity
      });

      // Tampilkan notifikasi sukses
      toast.success('Item berhasil ditambahkan ke keranjang!', {
        duration: 3000,
        position: 'bottom-right',
        icon: '🛒',
      });
      
      // Reset quantity
      setQuantity(1);
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      // Tampilkan notifikasi error
      toast.error(err.response?.data?.error || 'Gagal menambahkan item ke keranjang', {
        duration: 4000,
        position: 'bottom-right',
      });
    } finally {
      setAddingToCart(false);
    }
  };

  // Handle add to wishlist
  const handleAddToWishlist = () => {
    if (product) {
      // TODO: Implement add to wishlist functionality
      console.log('Add to wishlist:', product);
    }
  };

  // Handle share
  const handleShare = () => {
    if (product) {
      // TODO: Implement share functionality
      console.log('Share:', product);
    }
  };

  // Reset selected image and variant when product changes
  useEffect(() => {
    if (product) {
      const primaryImage = getPrimaryImage(product);
      setSelectedImage(primaryImage ? primaryImage.image_name : null);
      setSelectedVariant(null);
      setSelectedOptions({});
      
      // ✅ Auto-select variant jika hanya ada 1 variant
      if (product.product_variants && product.product_variants.length === 1) {
        const singleVariant = product.product_variants[0];
        setSelectedVariant(singleVariant);
        
        // Set selected options dari variant tersebut
        const options: Record<string, string> = {};
        singleVariant.variant_options?.forEach(opt => {
          options[opt.option_name] = opt.option_value;
        });
        setSelectedOptions(options);
        
        // Update image jika variant punya image
        if (singleVariant.image) {
          setSelectedImage(singleVariant.image);
        } else if (singleVariant.display_image) {
          setSelectedImage(singleVariant.display_image);
        }
      }
    }
  }, [product]);

  // Get variant groups for option selection
  const getVariantGroups = () => {
    if (!product?.product_variants) return {};

    const result: Record<string, string[]> = {};
    
    product.product_variants.forEach(variant => {
      variant.variant_options?.forEach(option => {
        if (!result[option.option_name]) {
          result[option.option_name] = [];
        }
        if (!result[option.option_name].includes(option.option_value)) {
          result[option.option_name].push(option.option_value);
        }
      });
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

  // Get primary image helper
  const getPrimaryImage = (product: Product) => {
    if (product.product_images && product.product_images.length > 0) {
      const primaryImage = product.product_images.find(img => img.is_primary);
      return primaryImage || product.product_images[0];
    }
    return null;
  };

  // Effects
  useEffect(() => {
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth={false}>
          <Skeleton variant="rectangular" height={400} sx={{ mb: 4, borderRadius: 3 }} />
          <Box sx={{ display: 'flex', gap: 4 }}>
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" height={48} sx={{ mb: 2 }} />
              <Skeleton variant="text" height={24} sx={{ mb: 2 }} />
              <Skeleton variant="text" height={32} sx={{ mb: 4 }} />
              <Skeleton variant="rectangular" height={200} />
            </Box>
            <Box sx={{ width: 300 }}>
              <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 3 }} />
            </Box>
          </Box>
        </Container>
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth={false}>
          <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto' }}>
            {error || 'Produk tidak ditemukan'}
          </Alert>
        </Container>
      </Box>
    );
  }

  const hasVariants = product.product_variants && product.product_variants.length > 0;
  const hasMultipleVariants = hasVariants && product.product_variants && product.product_variants.length > 1;
  const primaryImage = getPrimaryImage(product);
  const displayImage = selectedImage || (primaryImage ? primaryImage.image_name : null);
  const variantGroups = getVariantGroups();
  const totalStock = hasVariants 
    ? product.product_variants.reduce((sum, variant) => sum + variant.stock, 0)
    : product.stock;

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="xl">

        {/* Back Button */}
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate(-1)}
          sx={{ mb: 4 }}
        >
          Kembali
        </Button>

        {/* Product Details */}
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
                        {formatPriceRange(product.product_variants)}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total Stok: {product.total_stock || 0} unit
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="h4" color="primary" fontWeight="bold">
                      {formatPrice(Number(product.price))}
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

                <Divider sx={{ mb: 3 }} />

                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Informasi Produksi
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                    {product.pre_order && product.pre_order > 0 ? (
                      <Chip 
                        label={`Pre-order ${product.pre_order} hari`}
                        color="warning"
                        variant="filled"
                        sx={{ fontWeight: 'bold' }}
                      />
                    ) : (
                      <Chip 
                        label="Tersedia Langsung"
                        color="success"
                        variant="filled"
                        sx={{ fontWeight: 'bold' }}
                      />
                    )}
                    {product.product_variants && product.product_variants.length > 0 ? (
                      <Chip 
                        label={`Total Stok: ${product.total_stock || 0} unit`}
                        color={(product.total_stock || 0) > 0 ? 'success' : 'error'}
                        variant={(product.total_stock || 0) > 0 ? 'filled' : 'outlined'}
                      />
                    ) : (
                      <Chip 
                        label={`Stok: ${product.stock || 0} unit`}
                        color={(product.stock || 0) > 0 ? 'success' : 'error'}
                        variant={(product.stock || 0) > 0 ? 'filled' : 'outlined'}
                      />
                    )}
                  </Box>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {product.pre_order && product.pre_order > 0 
                      ? `Produk ini membutuhkan ${product.pre_order} hari untuk dibuat setelah order`
                      : 'Produk tersedia langsung dan siap dikirim'
                    }
                  </Typography>
                </Box>

                {/* Variant Selection - E-commerce Style - Hanya tampil jika > 1 variant */}
                {hasMultipleVariants && Object.keys(variantGroups).length > 0 && (
                  <React.Fragment>
                    <Divider sx={{ mb: 3 }} />
                    
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                          Pilih Varian
                        </Typography>
                        {product.product_variants && product.product_variants.length > 0 ? (
                          <Chip 
                            label={`${product.product_variants.length} Varian`} 
                            color="primary" 
                            size="small" 
                            variant="filled" 
                            sx={{ 
                              fontWeight: 'bold', 
                              bgcolor: 'primary.main', 
                              color: 'white', 
                              border: '1px solid', 
                              borderColor: 'primary.dark', 
                              letterSpacing: 0.5 
                            }} 
                          />
                        ) : (
                          <Chip 
                            label={`Stok: ${product.stock || 0}`} 
                            color={(product.stock || 0) > 0 ? 'success' : 'error'} 
                            size="small" 
                            variant={(product.stock || 0) > 0 ? 'filled' : 'outlined'} 
                          />
                        )}
                      </Box>
                      
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
                                    <Box
                                      sx={{ 
                                        position: 'absolute', 
                                        top: 4, 
                                        right: 4, 
                                        width: 16,
                                        height: 16,
                                        bgcolor: 'white',
                                        color: 'primary.main',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '12px',
                                        fontWeight: 'bold'
                                      }} 
                                    >
                                      ✓
                                    </Box>
                                  )}
                                </Button>
                              );
                            })}
                          </Box>
                        </Box>
                      ))}

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
                                  {formatPrice(Number(selectedVariant.price))}
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
                    </Box>
                  </React.Fragment>
                )}

                {/* ✅ Tampilkan info variant untuk produk dengan 1 variant */}
                {hasVariants && product.product_variants && product.product_variants.length === 1 && selectedVariant && (
                  <Box sx={{ mb: 3 }}>
                    <Card variant="outlined" sx={{ bgcolor: 'primary.50', borderColor: 'primary.main' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Varian Tersedia
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
                              {formatPrice(Number(selectedVariant.price))}
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
                  </Box>
                )}

                {/* Quantity Selector */}
                <Box sx={{ mb: 4 }}>
                  <FormLabel component="legend" sx={{ mb: 1, fontWeight: 600 }}>
                    Jumlah:
                  </FormLabel>
                  <TextField
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    inputProps={{ 
                      min: 1, 
                      max: hasVariants && product.product_variants ? 
                        (product.product_variants.length === 1 ? 
                          product.product_variants[0].stock || 1 :
                          (selectedVariant ? selectedVariant.stock || 1 : 1)
                        ) :
                        totalStock 
                    }}
                    sx={{ width: 120 }}
                    size="small"
                  />
                </Box>


                {/* Action Buttons */}
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<ShoppingCart />}
                    onClick={handleAddToCart}
                    disabled={
                      (totalStock || 0) === 0 || 
                      addingToCart || 
                      (hasMultipleVariants && !selectedVariant) || 
                      (hasVariants && selectedVariant && selectedVariant.stock === 0) ||
                      (hasVariants && product.product_variants && product.product_variants.length === 1 && product.product_variants[0].stock === 0)
                    }
                    sx={{
                      px: 4,
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      fontSize: '1rem',
                      minHeight: 48,
                      flex: { xs: 1, sm: 'none' },
                    }}
                  >
                    {addingToCart ? 'Menambahkan...' : 
                     (totalStock || 0) === 0 ? 'Stok Habis' : 
                     (hasMultipleVariants && !selectedVariant) ? 'Pilih Varian' :
                     (hasVariants && selectedVariant && selectedVariant.stock === 0) ? 'Stok Habis' :
                     (hasVariants && product.product_variants && product.product_variants.length === 1 && product.product_variants[0].stock === 0) ? 'Stok Habis' :
                     'Tambah ke Keranjang'}
                  </Button>
                  
                  <Stack direction="row" spacing={1} sx={{ justifyContent: { xs: 'center', sm: 'flex-start' } }}>
                    <IconButton
                      onClick={handleAddToWishlist}
                      sx={{
                        border: `1px solid ${theme.palette.grey[300]}`,
                        color: theme.palette.primary.main,
                        width: 48,
                        height: 48,
                        '&:hover': {
                          backgroundColor: theme.palette.primary.light + '20',
                          borderColor: theme.palette.primary.main,
                        },
                      }}
                    >
                      <Favorite />
                    </IconButton>
                    
                    <IconButton
                      onClick={handleShare}
                      sx={{
                        border: `1px solid ${theme.palette.grey[300]}`,
                        color: theme.palette.primary.main,
                        width: 48,
                        height: 48,
                        '&:hover': {
                          backgroundColor: theme.palette.primary.light + '20',
                          borderColor: theme.palette.primary.main,
                        },
                      }}
                    >
                      <Share />
                    </IconButton>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}