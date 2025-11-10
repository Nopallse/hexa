import { 
  Container, 
  Typography, 
  Box, 
  useTheme,
  useMediaQuery,
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
  Share,
  Star,
  Inventory,
  Category as CategoryIcon,
  Visibility,
  Image as ImageIcon,
  Add,
  Remove,
} from '@mui/icons-material';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
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
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
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

  // Handle quantity increment
  const handleIncrement = () => {
    if (!product) return;
    
    const hasVariants = product.product_variants && product.product_variants.length > 0;
    const totalStock = hasVariants 
      ? product.product_variants.reduce((sum, variant) => sum + variant.stock, 0)
      : product.stock;
    
    let maxQty = 1;
    if (hasVariants && product.product_variants) {
      if (product.product_variants.length === 1) {
        maxQty = product.product_variants[0].stock || 1;
      } else if (selectedVariant) {
        maxQty = selectedVariant.stock || 1;
      }
    } else {
      maxQty = totalStock || 1;
    }
    
    if (quantity < maxQty) {
      setQuantity(quantity + 1);
    } else {
      toast.error(`Maksimal ${maxQty} unit`, {
        duration: 2000,
        position: 'bottom-right',
      });
    }
  };

  // Handle quantity decrement
  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  // Get max quantity based on selected variant
  const getMaxQuantity = () => {
    if (!product) return 1;
    
    const hasVariants = product.product_variants && product.product_variants.length > 0;
    const totalStock = hasVariants 
      ? product.product_variants.reduce((sum, variant) => sum + variant.stock, 0)
      : product.stock;
    
    if (hasVariants && product.product_variants) {
      if (product.product_variants.length === 1) {
        return product.product_variants[0].stock || 1;
      } else if (selectedVariant) {
        return selectedVariant.stock || 1;
      }
      return 1;
    }
    return totalStock || 1;
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

  // Handle share
  const handleShare = async () => {
    if (!product || !id) return;

    const productUrl = `${window.location.origin}/products/${id}`;
    
    // Get product price
    let productPrice = '';
    if (product.product_variants && product.product_variants.length > 0) {
      if (product.product_variants.length === 1) {
        productPrice = formatPrice(Number(product.product_variants[0].price));
      } else {
        const prices = product.product_variants.map(v => Number(v.price));
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        if (minPrice === maxPrice) {
          productPrice = formatPrice(minPrice);
        } else {
          productPrice = `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`;
        }
      }
    } else {
      productPrice = formatPrice(Number(product.price));
    }

    // Get variant info for share text
    let variantInfo = '';
    if (product.product_variants && product.product_variants.length > 1) {
      variantInfo = `${product.product_variants.length} VARIAN`;
    }

    // Get category info
    const categoryInfo = product.category ? product.category.name.toUpperCase() : '';

    // Create attractive share text like Shopee
    // Format: "Temukan [nama produk] [info variant] [kategori] seharga [harga]. Dapatkan sekarang juga di Hexa Crochet! [link]"
    let shareText = `Temukan ${product.name.toUpperCase()}`;
    
    if (variantInfo) {
      shareText += ` ${variantInfo}`;
    }
    
    if (categoryInfo) {
      shareText += ` ${categoryInfo}`;
    }
    
    shareText += ` seharga ${productPrice}. Dapatkan sekarang juga di Hexa Crochet! ${productUrl}`;
    
    const shareTitle = `${product.name} - Hexa Crochet`;

    // Check if Web Share API is available (mobile browsers)
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: productUrl,
        });
        toast.success('Berhasil membagikan produk!', {
          duration: 2000,
          position: 'bottom-right',
        });
      } catch (err: any) {
        // User cancelled or error occurred
        if (err.name !== 'AbortError') {
          // Fallback to copy link if share fails
          await copyToClipboard(shareText);
        }
      }
    } else {
      // Fallback: Copy share text to clipboard
      await copyToClipboard(shareText);
    }
  };

  // Copy to clipboard helper
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Link produk berhasil disalin ke clipboard!', {
        duration: 3000,
        position: 'bottom-right',
        icon: '📋',
      });
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        document.execCommand('copy');
        toast.success('Link produk berhasil disalin ke clipboard!', {
          duration: 3000,
          position: 'bottom-right',
          icon: '📋',
        });
      } catch (err) {
        toast.error('Gagal menyalin link. Silakan salin manual.', {
          duration: 3000,
          position: 'bottom-right',
        });
      } finally {
        document.body.removeChild(textArea);
      }
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
      <Box sx={{ minHeight: '100vh', py: { xs: 2, sm: 4 } }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
          <Skeleton 
            variant="rectangular" 
            height={{ xs: 280, sm: 350, md: 400 }} 
            sx={{ mb: { xs: 2, sm: 4 }, borderRadius: 2 }} 
          />
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            gap: { xs: 2, sm: 3, md: 4 } 
          }}>
            <Box sx={{ flex: { xs: '1 1 100%', md: 1 }, width: { xs: '100%', md: 'auto' } }}>
              <Skeleton 
                variant="text" 
                height={{ xs: 32, sm: 40, md: 48 }} 
                sx={{ mb: 2 }} 
              />
              <Skeleton 
                variant="text" 
                height={{ xs: 24, sm: 28 }} 
                sx={{ mb: 2, width: '60%' }} 
              />
              <Skeleton 
                variant="text" 
                height={{ xs: 20, sm: 24 }} 
                sx={{ mb: { xs: 2, sm: 4 }, width: '80%' }} 
              />
              <Skeleton 
                variant="rectangular" 
                height={{ xs: 150, sm: 200 }} 
                sx={{ borderRadius: 2 }} 
              />
            </Box>
            <Box sx={{ 
              width: { xs: '100%', md: 300 },
              display: { xs: 'none', md: 'block' }
            }}>
              <Skeleton 
                variant="rectangular" 
                height={300} 
                sx={{ borderRadius: 2 }} 
              />
            </Box>
          </Box>
        </Container>
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Box sx={{ minHeight: '100vh', py: { xs: 2, sm: 4 } }}>
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
          <Alert 
            severity="error" 
            sx={{ 
              maxWidth: { xs: '100%', sm: 600 }, 
              mx: { xs: 0, sm: 'auto' },
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
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

  // Get product image for meta tags (must be absolute URL for Open Graph)
  const metaImage = product ? (
    selectedImage 
      ? getProductImageUrl(selectedImage)
      : (product.product_images && product.product_images.length > 0
          ? getProductImageUrl(product.product_images.find(img => img.is_primary)?.image_name || product.product_images[0].image_name)
          : `${window.location.origin}/images/product-placeholder.png`)
  ) : '';
  
  // Ensure meta image is absolute URL
  const metaImageAbsolute = metaImage && !metaImage.startsWith('http') 
    ? `${window.location.origin}${metaImage.startsWith('/') ? '' : '/'}${metaImage}`
    : metaImage;

  // Get product price for meta tags
  const metaPrice = product ? (
    product.product_variants && product.product_variants.length > 0
      ? (product.product_variants.length === 1
          ? formatPrice(Number(product.product_variants[0].price))
          : formatPriceRange(product.product_variants))
      : formatPrice(Number(product.price))
  ) : '';

  return (
    <Box sx={{ minHeight: '100vh', py: { xs: 2, sm: 4 } }}>
      {/* Open Graph Meta Tags for Link Preview */}
      {product && (
        <Helmet>
          <title>{product.name} - Hexa Crochet</title>
          <meta name="description" content={product.description || `${product.name} - Produk berkualitas tinggi dari Hexa Crochet`} />
          
          {/* Open Graph / Facebook */}
          <meta property="og:type" content="product" />
          <meta property="og:url" content={`${window.location.origin}/products/${id}`} />
          <meta property="og:title" content={`${product.name} - Hexa Crochet`} />
          <meta property="og:description" content={product.description || `${product.name} - Produk berkualitas tinggi dari Hexa Crochet. Harga: ${metaPrice}`} />
          <meta property="og:image" content={metaImageAbsolute} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />
          <meta property="og:site_name" content="Hexa Crochet" />
          
          {/* Twitter */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:url" content={`${window.location.origin}/products/${id}`} />
          <meta name="twitter:title" content={`${product.name} - Hexa Crochet`} />
          <meta name="twitter:description" content={product.description || `${product.name} - Produk berkualitas tinggi dari Hexa Crochet. Harga: ${metaPrice}`} />
          <meta name="twitter:image" content={metaImageAbsolute} />
          
          {/* Product specific */}
          <meta property="product:price:amount" content={product.product_variants && product.product_variants.length > 0
            ? String(product.product_variants[0].price)
            : String(product.price)} />
          <meta property="product:price:currency" content="IDR" />
          <meta property="product:availability" content="in stock" />
          <meta property="product:condition" content="new" />
        </Helmet>
      )}

      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>

        {/* Product Details */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 2, sm: 3 },
          alignItems: { xs: 'stretch', md: 'flex-start' }
        }}>
          {/* Product Images */}
          <Box sx={{ 
            flex: { xs: '1 1 100%', md: '1 1 300px' },
            width: { xs: '100%', md: 'auto' },
            minWidth: { xs: 0, md: 300 }
          }}>
            <Card sx={{ boxShadow: { xs: 1, sm: 3 } }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Typography 
                  variant="h6" 
                  fontWeight="bold" 
                  gutterBottom
                  sx={{ fontSize: { xs: '1rem', sm: '1.25rem' }, display: { xs: 'none', sm: 'block' } }}
                >
                  Galeri Gambar
                </Typography>
                
                {/* Main Image Display */}
                {displayImage ? (
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Box
                      component="img"
                      src={getProductImageUrl(displayImage)}
                      alt={product.name}
                      sx={{ 
                        width: '100%', 
                        height: { xs: 280, sm: 350, md: 400 },
                        maxHeight: { xs: '70vh', md: 'none' },
                        objectFit: 'contain',
                        borderRadius: 2,
                        transition: 'all 0.3s ease',
                        boxShadow: 2,
                        bgcolor: 'grey.50'
                      }}
                    />
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Avatar
                      variant="rounded"
                      sx={{ 
                        width: '100%', 
                        height: { xs: 280, sm: 350, md: 400 },
                        fontSize: { xs: '3rem', sm: '4rem' }
                      }}
                    >
                      {product.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </Box>
                )}
                
                {/* Thumbnails - All Images */}
                {product.product_images && product.product_images.length > 0 ? (
                  <Box>
                    <Typography 
                      variant="body2" 
                      color="textSecondary" 
                      gutterBottom
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      Semua Gambar ({product.product_images.length})
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      gap: { xs: 0.75, sm: 1 }, 
                      flexWrap: 'wrap',
                      justifyContent: { xs: 'flex-start', sm: 'center' },
                      overflowX: { xs: 'auto', sm: 'visible' },
                      pb: { xs: 1, sm: 0 },
                      '&::-webkit-scrollbar': {
                        height: 4,
                      },
                      '&::-webkit-scrollbar-thumb': {
                        bgcolor: 'grey.300',
                        borderRadius: 2,
                      }
                    }}>
                      {product.product_images
                        .sort((a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0))
                        .map((image) => (
                          <Box
                            key={image.id}
                            sx={{ position: 'relative' }}
                            onClick={() => setSelectedImage(image.image_name)}
                            onMouseEnter={() => setSelectedImage(image.image_name)}
                            onMouseLeave={() => {
                              // Only reset on desktop
                              if (!isTablet) {
                                setSelectedImage(primaryImage ? primaryImage.image_name : null);
                              }
                            }}
                          >
                            <Box
                              component="img"
                              src={getProductImageUrl(image.image_name)}
                              alt={`${product.name} - ${image.id}`}
                              sx={{ 
                                width: { xs: 60, sm: 70 }, 
                                height: { xs: 60, sm: 70 },
                                borderRadius: 1,
                                cursor: 'pointer',
                                border: selectedImage === image.image_name ? 3 : 2,
                                borderColor: selectedImage === image.image_name ? 'primary.main' : 'divider',
                                transition: 'all 0.2s ease',
                                opacity: selectedImage === image.image_name ? 1 : 0.7,
                                objectFit: 'cover',
                                '&:hover': {
                                  opacity: 1,
                                  transform: 'scale(1.05)',
                                  borderColor: 'primary.main'
                                },
                                '&:active': {
                                  transform: 'scale(0.95)',
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
                                  bottom: { xs: -6, sm: -8 },
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  fontSize: { xs: '0.6rem', sm: '0.65rem' },
                                  height: { xs: 14, sm: 16 },
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
                  <Alert severity="info" sx={{ mt: 2, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                    Belum ada gambar produk
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Product Details */}
          <Box sx={{ 
            flex: { xs: '1 1 100%', md: '2 1 500px' },
            width: { xs: '100%', md: 'auto' },
            minWidth: { xs: 0, md: 500 }
          }}>
            <Card sx={{ boxShadow: { xs: 1, sm: 3 } }}>
              <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                <Box sx={{ 
                  mb: { xs: 2, sm: 3 },
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 2
                }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      variant="h5" 
                      fontWeight="bold" 
                      gutterBottom
                      sx={{ 
                        fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
                        lineHeight: { xs: 1.3, sm: 1.4 }
                      }}
                    >
                      {product.name}
                    </Typography>
                  </Box>
                  
                  {/* Share Button in product info card */}
                  <IconButton
                    onClick={handleShare}
                    sx={{
                      border: `1px solid ${theme.palette.grey[300]}`,
                      color: theme.palette.primary.main,
                      width: { xs: 40, sm: 44 },
                      height: { xs: 40, sm: 44 },
                      flexShrink: 0,
                      '&:hover': {
                        backgroundColor: theme.palette.primary.light + '20',
                        borderColor: theme.palette.primary.main,
                      },
                      '&:active': {
                        transform: 'scale(0.95)',
                      }
                    }}
                  >
                    <Share sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' } }} />
                  </IconButton>
                </Box>
                
                <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                  {product.product_variants && product.product_variants.length > 0 ? (
                    <Box>
                      <Typography 
                        variant="h4" 
                        color="primary" 
                        fontWeight="bold"
                        sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
                      >
                        {formatPriceRange(product.product_variants)}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="textSecondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, mt: 0.5 }}
                      >
                        Total Stok: {product.total_stock || 0} unit
                      </Typography>
                    </Box>
                  ) : (
                    <Typography 
                      variant="h4" 
                      color="primary" 
                      fontWeight="bold"
                      sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
                    >
                      {formatPrice(Number(product.price))}
                    </Typography>
                  )}
                </Box>

                <Divider sx={{ mb: { xs: 2, sm: 3 } }} />

                <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                  <Typography 
                    variant="h6" 
                    fontWeight="bold" 
                    gutterBottom
                    sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                  >
                    Deskripsi
                  </Typography>
                  <Typography 
                    variant="body1" 
                    color="textSecondary"
                    sx={{ 
                      fontSize: { xs: '0.875rem', sm: '1rem' },
                      lineHeight: { xs: 1.6, sm: 1.75 },
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}
                  >
                    {product.description || 'Tidak ada deskripsi'}
                  </Typography>
                </Box>

                <Divider sx={{ mb: { xs: 2, sm: 3 } }} />

                <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                  <Typography 
                    variant="h6" 
                    fontWeight="bold" 
                    gutterBottom
                    sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                  >
                    Kategori
                  </Typography>
                  {product.category ? (
                    <Box>
                      <Chip
                        label={product.category.name}
                        color="primary"
                        variant="outlined"
                        sx={{ 
                          mb: 1,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          height: { xs: 28, sm: 32 }
                        }}
                      />
                      {product.category.description && (
                        <Typography 
                          variant="body2" 
                          color="textSecondary"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                        >
                          {product.category.description}
                        </Typography>
                      )}
                    </Box>
                  ) : (
                    <Typography 
                      variant="body2" 
                      color="textSecondary"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                      Tidak ada kategori
                    </Typography>
                  )}
                </Box>

                <Divider sx={{ mb: { xs: 2, sm: 3 } }} />

                <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                  <Typography 
                    variant="h6" 
                    fontWeight="bold" 
                    gutterBottom
                    sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                  >
                    Informasi Produksi
                  </Typography>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: { xs: 1, sm: 2 }, 
                    flexWrap: 'wrap', 
                    alignItems: 'center' 
                  }}>
                    {product.pre_order && product.pre_order > 0 ? (
                      <Chip 
                        label={`Pre-order ${product.pre_order} hari`}
                        color="warning"
                        variant="filled"
                        sx={{ 
                          fontWeight: 'bold',
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          height: { xs: 28, sm: 32 }
                        }}
                      />
                    ) : (
                      <Chip 
                        label="Tersedia Langsung"
                        color="success"
                        variant="filled"
                        sx={{ 
                          fontWeight: 'bold',
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          height: { xs: 28, sm: 32 }
                        }}
                      />
                    )}
                    {product.product_variants && product.product_variants.length > 0 ? (
                      <Chip 
                        label={`Total Stok: ${product.total_stock || 0} unit`}
                        color={(product.total_stock || 0) > 0 ? 'success' : 'error'}
                        variant={(product.total_stock || 0) > 0 ? 'filled' : 'outlined'}
                        sx={{ 
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          height: { xs: 28, sm: 32 }
                        }}
                      />
                    ) : (
                      <Chip 
                        label={`Stok: ${product.stock || 0} unit`}
                        color={(product.stock || 0) > 0 ? 'success' : 'error'}
                        variant={(product.stock || 0) > 0 ? 'filled' : 'outlined'}
                        sx={{ 
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          height: { xs: 28, sm: 32 }
                        }}
                      />
                    )}
                  </Box>
                  <Typography 
                    variant="body2" 
                    color="textSecondary" 
                    sx={{ 
                      mt: 1,
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      lineHeight: { xs: 1.5, sm: 1.6 }
                    }}
                  >
                    {product.pre_order && product.pre_order > 0 
                      ? `Produk ini membutuhkan ${product.pre_order} hari untuk dibuat setelah order`
                      : 'Produk tersedia langsung dan siap dikirim'
                    }
                  </Typography>
                </Box>

                {/* Variant Selection - E-commerce Style - Hanya tampil jika > 1 variant */}
                {hasMultipleVariants && Object.keys(variantGroups).length > 0 && (
                  <React.Fragment>
                    <Divider sx={{ mb: { xs: 2, sm: 3 } }} />
                    
                    <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        flexDirection: { xs: 'column', sm: 'row' },
                        gap: { xs: 1, sm: 0 },
                        mb: 2 
                      }}>
                        <Typography 
                          variant="h6" 
                          fontWeight="bold" 
                          gutterBottom={false}
                          sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                        >
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
                              letterSpacing: 0.5,
                              fontSize: { xs: '0.7rem', sm: '0.75rem' },
                              height: { xs: 24, sm: 28 }
                            }} 
                          />
                        ) : (
                          <Chip 
                            label={`Stok: ${product.stock || 0}`} 
                            color={(product.stock || 0) > 0 ? 'success' : 'error'} 
                            size="small" 
                            variant={(product.stock || 0) > 0 ? 'filled' : 'outlined'}
                            sx={{ 
                              fontSize: { xs: '0.7rem', sm: '0.75rem' },
                              height: { xs: 24, sm: 28 }
                            }}
                          />
                        )}
                      </Box>
                      
                      {Object.entries(variantGroups).map(([optionName, values]) => (
                        <Box key={optionName} sx={{ mb: { xs: 1.5, sm: 2 } }}>
                          <Typography 
                            variant="subtitle2" 
                            fontWeight="bold" 
                            gutterBottom
                            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, mb: 1 }}
                          >
                            {optionName}
                          </Typography>
                          <Box sx={{ 
                            display: 'flex', 
                            gap: { xs: 0.75, sm: 1 }, 
                            flexWrap: 'wrap' 
                          }}>
                            {values.map((value) => {
                              const isSelected = selectedOptions[optionName] === value;
                              
                              return (
                                <Button
                                  key={value}
                                  variant={isSelected ? "contained" : "outlined"}
                                  onClick={() => handleSelectOption(optionName, value)}
                                  size={isMobile ? "medium" : "large"}
                                  sx={{
                                    minWidth: { xs: 70, sm: 80 },
                                    minHeight: { xs: 40, sm: 48 },
                                    borderWidth: 2,
                                    borderColor: isSelected ? 'primary.main' : 'divider',
                                    position: 'relative',
                                    textTransform: 'none',
                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                    px: { xs: 1.5, sm: 2 },
                                    '&:hover': {
                                      borderWidth: 2,
                                      borderColor: 'primary.main'
                                    },
                                    '&:active': {
                                      transform: 'scale(0.95)',
                                    }
                                  }}
                                >
                                  <Typography 
                                    variant="body2" 
                                    fontWeight={isSelected ? 'bold' : 'medium'}
                                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                  >
                                    {value}
                                  </Typography>
                                  
                                  {/* Selected indicator */}
                                  {isSelected && (
                                    <Box
                                      sx={{ 
                                        position: 'absolute', 
                                        top: { xs: 2, sm: 4 }, 
                                        right: { xs: 2, sm: 4 }, 
                                        width: { xs: 14, sm: 16 },
                                        height: { xs: 14, sm: 16 },
                                        bgcolor: 'white',
                                        color: 'primary.main',
                                        borderRadius: '50%',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: { xs: '10px', sm: '12px' },
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
                        <Card 
                          variant="outlined" 
                          sx={{ 
                            mb: { xs: 2, sm: 3 }, 
                            bgcolor: 'primary.50', 
                            borderColor: 'primary.main' 
                          }}
                        >
                          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                            <Box sx={{ 
                              display: 'flex', 
                              flexDirection: { xs: 'column', sm: 'row' },
                              justifyContent: 'space-between', 
                              alignItems: { xs: 'flex-start', sm: 'center' }, 
                              gap: { xs: 1.5, sm: 2 } 
                            }}>
                              <Box sx={{ flex: 1 }}>
                                <Typography 
                                  variant="caption" 
                                  color="text.secondary" 
                                  display="block"
                                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                >
                                  Varian Terpilih
                                </Typography>
                                <Typography 
                                  variant="h6" 
                                  fontWeight="bold"
                                  sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                                >
                                  {selectedVariant.variant_name}
                                </Typography>
                                <Typography 
                                  variant="caption" 
                                  color="text.secondary"
                                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                                >
                                  SKU: {selectedVariant.sku}
                                </Typography>
                              </Box>
                              
                              <Box sx={{ 
                                textAlign: { xs: 'left', sm: 'right' },
                                width: { xs: '100%', sm: 'auto' }
                              }}>
                                <Typography 
                                  variant="h4" 
                                  color="primary.main" 
                                  fontWeight="bold"
                                  sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
                                >
                                  {formatPrice(Number(selectedVariant.price))}
                                </Typography>
                                <Chip
                                  label={`Stok: ${selectedVariant.stock} unit`}
                                  size="small"
                                  color={selectedVariant.stock > 0 ? 'success' : 'error'}
                                  sx={{ 
                                    mt: 0.5,
                                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                    height: { xs: 24, sm: 28 }
                                  }}
                                />
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      )}

                      <Divider sx={{ mb: { xs: 2, sm: 3 } }} />
                    </Box>
                  </React.Fragment>
                )}

                {/* ✅ Tampilkan info variant untuk produk dengan 1 variant */}
                {hasVariants && product.product_variants && product.product_variants.length === 1 && selectedVariant && (
                  <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                    <Card variant="outlined" sx={{ bgcolor: 'primary.50', borderColor: 'primary.main' }}>
                      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                        <Box sx={{ 
                          display: 'flex', 
                          flexDirection: { xs: 'column', sm: 'row' },
                          justifyContent: 'space-between', 
                          alignItems: { xs: 'flex-start', sm: 'center' }, 
                          gap: { xs: 1.5, sm: 2 } 
                        }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography 
                              variant="caption" 
                              color="text.secondary" 
                              display="block"
                              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                            >
                              Varian Tersedia
                            </Typography>
                            <Typography 
                              variant="h6" 
                              fontWeight="bold"
                              sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                            >
                              {selectedVariant.variant_name}
                            </Typography>
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                            >
                              SKU: {selectedVariant.sku}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ 
                            textAlign: { xs: 'left', sm: 'right' },
                            width: { xs: '100%', sm: 'auto' }
                          }}>
                            <Typography 
                              variant="h4" 
                              color="primary.main" 
                              fontWeight="bold"
                              sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }}
                            >
                              {formatPrice(Number(selectedVariant.price))}
                            </Typography>
                            <Chip
                              label={`Stok: ${selectedVariant.stock} unit`}
                              size="small"
                              color={selectedVariant.stock > 0 ? 'success' : 'error'}
                              sx={{ 
                                mt: 0.5,
                                fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                height: { xs: 24, sm: 28 }
                              }}
                            />
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  </Box>
                )}

                {/* Quantity Selector */}
                <Box sx={{ mb: { xs: 3, sm: 4 } }}>
                  <FormLabel 
                    component="legend" 
                    sx={{ 
                      mb: 1, 
                      fontWeight: 600,
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    Jumlah:
                  </FormLabel>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: { xs: 1, sm: 1.5 },
                    width: { xs: '100%', sm: 'fit-content' }
                  }}>
                    <Button
                      variant="outlined"
                      onClick={handleDecrement}
                      disabled={quantity <= 1}
                      sx={{
                        minWidth: { xs: 40, sm: 44 },
                        width: { xs: 40, sm: 44 },
                        height: { xs: 40, sm: 44 },
                        p: 0,
                        borderColor: 'divider',
                        color: 'text.primary',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'primary.light',
                          color: 'primary.main',
                        },
                        '&:disabled': {
                          borderColor: 'divider',
                          opacity: 0.5,
                        },
                        '&:active': {
                          transform: 'scale(0.95)',
                        }
                      }}
                    >
                      <Remove sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                    </Button>
                    
                    <TextField
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        const maxQty = getMaxQuantity();
                        setQuantity(Math.max(1, Math.min(value, maxQty)));
                      }}
                      inputProps={{ 
                        min: 1, 
                        max: getMaxQuantity(),
                        style: { textAlign: 'center' }
                      }}
                      sx={{ 
                        width: { xs: 80, sm: 100 },
                        '& .MuiOutlinedInput-root': {
                          '& input': {
                            fontSize: { xs: '0.875rem', sm: '1rem' },
                            py: { xs: 1.25, sm: 1 },
                            textAlign: 'center',
                            fontWeight: 600,
                          }
                        }
                      }}
                      size="small"
                    />
                    
                    <Button
                      variant="outlined"
                      onClick={handleIncrement}
                      disabled={quantity >= getMaxQuantity()}
                      sx={{
                        minWidth: { xs: 40, sm: 44 },
                        width: { xs: 40, sm: 44 },
                        height: { xs: 40, sm: 44 },
                        p: 0,
                        borderColor: 'divider',
                        color: 'text.primary',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'primary.light',
                          color: 'primary.main',
                        },
                        '&:disabled': {
                          borderColor: 'divider',
                          opacity: 0.5,
                        },
                        '&:active': {
                          transform: 'scale(0.95)',
                        }
                      }}
                    >
                      <Add sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
                    </Button>
                  </Box>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ 
                      display: 'block',
                      mt: 0.5,
                      fontSize: { xs: '0.7rem', sm: '0.75rem' }
                    }}
                  >
                    Maksimal {getMaxQuantity()} unit
                  </Typography>
                </Box>


                {/* Action Buttons */}
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
                  fullWidth
                  sx={{
                    px: { xs: 3, sm: 4 },
                    py: { xs: 1.25, sm: 1.5 },
                    borderRadius: 2,
                    fontWeight: 600,
                    fontSize: { xs: '0.875rem', sm: '1rem' },
                    minHeight: { xs: 44, sm: 48 },
                    mb: { xs: 2, sm: 4 },
                    '&:active': {
                      transform: 'scale(0.98)',
                    }
                  }}
                >
                  {addingToCart ? 'Menambahkan...' : 
                   (totalStock || 0) === 0 ? 'Stok Habis' : 
                   (hasMultipleVariants && !selectedVariant) ? 'Pilih Varian' :
                   (hasVariants && selectedVariant && selectedVariant.stock === 0) ? 'Stok Habis' :
                   (hasVariants && product.product_variants && product.product_variants.length === 1 && product.product_variants[0].stock === 0) ? 'Stok Habis' :
                   'Tambah ke Keranjang'}
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}