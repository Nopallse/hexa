import { 
  Card, 
  CardContent, 
  CardActionArea, 
  Box, 
  Typography, 
  Chip, 
  useTheme,
  Skeleton,
} from '@mui/material';
import { 
  Inventory,
} from '@mui/icons-material';
import { useState } from 'react';
import { Product } from '../types';
import { getProductImageUrl } from '@/utils/image';

// Simple price formatter for IDR
const formatPrice = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

interface ProductCardProps {
  product: Product;
  onView: (product: Product) => void;
  loading?: boolean;
}

export default function ProductCard({ 
  product, 
  onView, 
  loading = false 
}: ProductCardProps) {
  const theme = useTheme();
  const [imageLoading, setImageLoading] = useState(true);

  const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0];
  
  // Calculate price range for products with variants
  const hasVariants = product.product_variants && product.product_variants.length > 0;
  const priceRange = hasVariants ? {
    min: Math.min(...product.product_variants.map(v => parseFloat(v.price))),
    max: Math.max(...product.product_variants.map(v => parseFloat(v.price)))
  } : null;

  // Calculate total stock for products with variants
  const totalStock = hasVariants 
    ? product.product_variants.reduce((sum, variant) => sum + variant.stock, 0)
    : product.stock;


  const handleCardClick = () => {
    onView(product);
  };


  if (loading) {
    return (
      <Card sx={{ height: '100%', borderRadius: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Skeleton variant="rectangular" height={200} />
          <Box sx={{ p: 3 }}>
            <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" height={20} sx={{ mb: 2 }} />
            <Skeleton variant="text" height={32} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={36} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 1.5,
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        background: '#ffffff',
        border: `1px solid ${theme.palette.grey[200]}`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        },
      }}
      onClick={handleCardClick}
    >
      <CardActionArea sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Product Image */}
        <Box
          sx={{
            position: 'relative',
            height: 200,
            overflow: 'hidden',
            background: `linear-gradient(135deg, ${theme.palette.primary.light}10, ${theme.palette.secondary.light}10)`,
          }}
        >
          {imageLoading && (
            <Skeleton variant="rectangular" width="100%" height="100%" />
          )}
          {primaryImage ? (
            <img
              src={getProductImageUrl(primaryImage.image_name)}
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: imageLoading ? 'none' : 'block',
              }}
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
          ) : (
            <img
              src={`https://placehold.co/400x200/9682DB/FFFFFF/png?text=${encodeURIComponent(product.name)}`}
              alt={product.name}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: imageLoading ? 'none' : 'block',
              }}
              onLoad={() => setImageLoading(false)}
              onError={() => setImageLoading(false)}
            />
          )}

        </Box>

        <CardContent sx={{ p: 3, textAlign: 'center', display: 'flex', flexDirection: 'column'}}>
          {/* Product Name */}
          <Typography
            variant="h6"
            fontWeight={600}
            sx={{
              mb: 0,
              textAlign: 'start',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              fontFamily: '"Playfair Display", "Georgia", serif',
              letterSpacing: '-0.01em',
              lineHeight: 1.3,
            }}
          >
            {product.name}
          </Typography>

          {/* Price & Sales Info */}
          <Box sx={{ mt: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            <Typography
              variant="h6"
              fontWeight={700}
              color="primary.main"
              sx={{
                fontFamily: '"Playfair Display", "Georgia", serif',
                mb: 0,
              }}
            >
              {hasVariants ? formatPrice(priceRange!.min) : formatPrice(parseFloat(product.price || '0'))}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                fontSize: '0.75rem',
                fontWeight: 500,
                ml: 1,
              }}
            >
            100 Terjual
            </Typography>
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
