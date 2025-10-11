import { 
  Card, 
  CardContent, 
  CardActionArea, 
  Box, 
  Typography, 
  useTheme,
  Skeleton,
} from '@mui/material';
import { useState } from 'react';
import { Product } from '../types';
import { getProductImageUrl } from '@/utils/image';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';

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
  const { formatPrice, formatPriceRange } = useCurrencyConversion();

  const primaryImage = product.product_images?.find(img => img.is_primary) || product.product_images?.[0];
  
  // Calculate price range for products with variants
  const hasVariants = product.product_variants && product.product_variants.length > 0;
  const priceRange = hasVariants ? {
    min: Math.min(...product.product_variants.map(v => parseFloat(v.price))),
    max: Math.max(...product.product_variants.map(v => parseFloat(v.price)))
  } : null;



  const handleCardClick = () => {
    onView(product);
  };


  if (loading) {
    return (
      <Card sx={{ height: '100%', borderRadius: 1.5 }}>
        <CardContent sx={{ p: 0 }}>
          <Skeleton variant="rectangular" height={200} />
          <Box sx={{ p: 2 }}>
            <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="text" height={24} />
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

        <CardContent sx={{ p: 2 }}>
          {/* Product Name */}
          <Typography
            variant="subtitle1"
            fontWeight={600}
            sx={{
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.3,
            }}
          >
            {product.name}
          </Typography>

          {/* Price */}
          <Typography
            variant="h6"
            fontWeight={700}
            color="primary.main"
            sx={{
              fontSize: '1.1rem',
            }}
          >
            {hasVariants ? formatPriceRange(product.product_variants) : formatPrice(parseFloat(product.price || '0'))}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
