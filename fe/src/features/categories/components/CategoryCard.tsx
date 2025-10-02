import {
  Card,
  CardContent,
  CardActionArea,
  CardMedia,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import { Category as CategoryIcon } from '@mui/icons-material';
import { Category } from '@/types/global';
import { getCategoryImageUrl } from '@/utils/image';

interface CategoryCardProps {
  category: Category;
  onClick: (category: Category) => void;
}

export default function CategoryCard({ category, onClick }: CategoryCardProps) {
  const handleClick = () => {
    onClick(category);
  };

  return (
    <Card
      sx={{
        height: '100%',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.shadows[8],
        },
      }}
    >
      <CardActionArea onClick={handleClick} sx={{ height: '100%' }}>
        {/* Category Image */}
        <CardMedia
          component="img"
          height="180"
          image={getCategoryImageUrl(category.image)}
          alt={category.name}
          sx={{
            objectFit: 'cover',
            bgcolor: 'grey.100',
          }}
        />
        
        <CardContent sx={{ p: 3 }}>

          {/* Category Name */}
          <Typography
            variant="h6"
            fontWeight="bold"
            gutterBottom
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 1,
              WebkitBoxOrient: 'vertical',
            }}
          >
            {category.name}
          </Typography>

          {/* Description */}
          {category.description && (
            <Typography
              variant="body2"
              color="textSecondary"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                mb: 2,
                minHeight: 40,
              }}
            >
              {category.description}
            </Typography>
          )}

          {/* Product Count */}
          <Box sx={{ mt: 2 }}>
            <Chip
              label={`${category.products?.length || 0} produk`}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
