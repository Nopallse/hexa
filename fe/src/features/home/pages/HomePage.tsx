import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Card, 
  CardContent, 
  CardMedia,
  useTheme,
  Chip,
  Stack,
  IconButton,
  CardActionArea,
  Avatar,
  Skeleton,
  Alert,
  Grid,
  Paper,
  Rating,
} from '@mui/material';
import { 
  ShoppingBag, 
  Category as CategoryIcon, 
  Star, 
  ArrowForward,
  TrendingUp,
  LocalShipping,
  Security,
  Support,
  Favorite,
  Visibility,
  AccessTime,
  People,
  ThumbUp,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  WhatsApp as WhatsAppIcon,
  Instagram as InstagramIcon,
} from '@mui/icons-material';

import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { categoryApi } from '@/features/categories/services/categoryApi';
import { Category } from '@/types/global';
import { getCategoryImageUrl } from '@/utils/image';
import { productApi } from '@/features/products/services/productApi';
import { Product } from '@/features/products/types';
import ProductCard from '@/features/products/components/ProductCard';
import { useTranslation } from '@/hooks/useTranslation';

export default function HomePage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [featuredError, setFeaturedError] = useState<string | null>(null);
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [latestLoading, setLatestLoading] = useState(true);
  const [latestError, setLatestError] = useState<string | null>(null);

  // Banner images data
  const bannerImages = [
    {
      id: 1,
      image: '/images/handmade-banner.jpg',
      titleKey: 'home.banner.title1',
      subtitleKey: 'home.banner.subtitle1',
      alt: 'Handmade Craft Collection - Three women showcasing colorful crochet products'
    },
    {
      id: 2,
      image: '/images/handmade-banner2.png',
      titleKey: 'home.banner.title2',
      subtitleKey: 'home.banner.subtitle2',
      alt: 'Crafting process showing hands creating beautiful handmade items'
    },
    {
      id: 3,
      image: '/images/handmade-banner3.png',
      titleKey: 'home.banner.title3',
      subtitleKey: 'home.banner.subtitle3',
      alt: 'Custom handmade products showcase'
    }
  ];

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryApi.getCategories({ limit: 6 });
        setCategories(response.data);
      } catch (err) {
        setError(t('common.error'));
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch featured products
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setFeaturedLoading(true);
        setFeaturedError(null);
        const response = await productApi.getProducts({ 
          limit: 8,
          sort: 'created_at',
          sortOrder: 'desc'
        });
        
        if (response.success) {
          setFeaturedProducts(response.data);
        } else {
          setFeaturedError(t('home.errors.failedToLoadProducts'));
        }
      } catch (err) {
        console.error('Error fetching featured products:', err);
        setFeaturedError(t('home.errors.failedToLoadProducts'));
      } finally {
        setFeaturedLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Fetch latest products
  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        setLatestLoading(true);
        setLatestError(null);
        const response = await productApi.getProducts({ 
          limit: 6,
          sort: 'created_at',
          sortOrder: 'desc'
        });
        
        if (response.success) {
          setLatestProducts(response.data);
        } else {
          setLatestError(t('home.errors.failedToLoadProducts'));
        }
      } catch (err) {
        console.error('Error fetching latest products:', err);
        setLatestError(t('home.errors.failedToLoadProducts'));
      } finally {
        setLatestLoading(false);
      }
    };

    fetchLatestProducts();
  }, []);

  // Handle product view
  const handleProductView = (product: Product) => {
    navigate(`/products/${product.id}`);
  };

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [bannerImages.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % bannerImages.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + bannerImages.length) % bannerImages.length);
  };

  const handleCategoryClick = (category: Category) => {
    navigate(`/products?category=${category.id}`);
  };

  return (
    <Box>
      {/* Banner Slider Section */}
      <Box sx={{ 
          position: 'relative',
        width: '100%', 
        height: { xs: '60vh', sm: '70vh', md: '80vh' },
          overflow: 'hidden',
        borderRadius: 0,
      }}>
        {/* Slider Images */}
        {bannerImages.map((banner, index) => (
          <Box
            key={banner.id}
            sx={{
            position: 'absolute',
            top: 0,
            left: 0,
              width: '100%',
              height: '100%',
              opacity: currentSlide === index ? 1 : 0,
              transition: 'opacity 1s ease-in-out',
              zIndex: 1,
            }}
          >
            <CardMedia
              component="img"
              image={banner.image}
              alt={banner.alt}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center',
              }}
            />
            
            {/* Overlay with Content */}
            <Box
              sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
                background: 'linear-gradient(45deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
              }}
            >
              <Container maxWidth="lg">
                <Box sx={{ textAlign: 'center', color: 'white' }}>
          <Typography 
                    variant="h2"
            component="h1" 
            gutterBottom 
            sx={{
                      fontWeight: 700,
                      fontSize: { xs: '2rem', sm: '3rem', md: '4rem' },
              fontFamily: '"Playfair Display", "Georgia", serif',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                      mb: 2,
            }}
          >
                    {t(banner.titleKey)}
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: 300,
                      fontSize: { xs: '1rem', sm: '1.2rem', md: '1.5rem' },
                      textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                      mb: 4,
                      maxWidth: '600px',
                      mx: 'auto',
                    }}
                  >
                    {t(banner.subtitleKey)}
          </Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
           
          </Stack>
                </Box>
              </Container>
            </Box>
          </Box>
        ))}

        {/* Navigation Arrows */}
        <IconButton
          onClick={prevSlide}
            sx={{
            position: 'absolute',
            left: { xs: 10, sm: 20 },
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 3,
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.3)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <PrevIcon sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }} />
        </IconButton>

        <IconButton
          onClick={nextSlide}
                sx={{
                    position: 'absolute',
            right: { xs: 10, sm: 20 },
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 3,
            backgroundColor: 'rgba(255,255,255,0.2)',
            color: 'white',
                  '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.3)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          <NextIcon sx={{ fontSize: { xs: '1.5rem', sm: '2rem' } }} />
        </IconButton>

        {/* Dots Indicator */}
        <Box
                  sx={{ 
            position: 'absolute',
            bottom: { xs: 20, sm: 30 },
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 3,
            display: 'flex',
            gap: 1,
          }}
        >
          {bannerImages.map((_, index) => (
            <Box
              key={index}
              onClick={() => setCurrentSlide(index)}
                  sx={{ 
                width: { xs: 8, sm: 12 },
                height: { xs: 8, sm: 12 },
                borderRadius: '50%',
                backgroundColor: currentSlide === index ? 'white' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: 'white',
                  transform: 'scale(1.2)',
                },
              }}
            />
            ))}
          </Box>
      </Box>

      {/* Categories Section - Dynamic & Natural */}
      <Container maxWidth="xl" sx={{ py: { xs: 8, md: 12 } }} id="categories-section">
        <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
        <Typography
          variant="h3"
          component="h2"
          gutterBottom
            fontWeight={700}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 50%, ${theme.palette.craft.blush} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 3,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
              fontFamily: '"Playfair Display", "Georgia", serif',
              letterSpacing: '-0.02em',
            }}
            >
            {t('home.sections.handmadeCollection')}
        </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              maxWidth: '500px', 
              mx: 'auto',
              fontSize: { xs: '0.9rem', md: '1.1rem' },
              fontWeight: 300,
              lineHeight: 1.6,
              fontStyle: 'italic',
            }}
          >
                </Typography>
          </Box>

        {loading ? (
          <Grid container spacing={4}>
            {[...Array(6)].map((_, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card sx={{ borderRadius: 4, overflow: 'hidden', height: '100%' }}>
                  <Skeleton variant="rectangular" width="100%" height={200} />
                  <CardContent>
                    <Skeleton variant="text" width="80%" height={30} />
                </CardContent>
              </Card>
              </Grid>
            ))}
          </Grid>
        ) : error ? (
          <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto' }}>
            {error}
          </Alert>
        ) : (
          <Grid container spacing={4}>
            {categories.map((category, index) => (
              <Grid item xs={6} sm={6} md={3} key={category.id}>
                <Box
                  sx={{
                    position: 'relative',
                    transform: `rotate(${index % 2 === 0 ? '-2deg' : '1deg'})`,
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      transform: `rotate(0deg) translateY(-8px)`,
                      zIndex: 2,
                    },
                  }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      cursor: 'pointer',
                      borderRadius: { xs: 3, md: 4 },
                      overflow: 'hidden',
                      position: 'relative',
                      background: 'white',
                      border: `2px solid ${theme.palette.primary.light}30`,
                      boxShadow: `0 8px 32px ${theme.palette.primary.main}10`,
                      '&:hover': {
                        boxShadow: `0 20px 60px ${theme.palette.primary.main}20`,
                        '& .category-image': {
                          transform: 'scale(1.05) rotate(2deg)',
                        },
                        '& .category-overlay': {
                          opacity: 1,
                        },
                        '& .category-name': {
                          transform: 'scale(1.05)',
                        },
                      },
                    }}
                    onClick={() => handleCategoryClick(category)}
                  >
                    <CardActionArea sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      {/* Category Image with Name Overlay */}
                      <Box
                        sx={{
                          aspectRatio: '1/1',
                          position: 'relative',
                          overflow: 'hidden',
                          background: `linear-gradient(45deg, ${theme.palette.primary.light}15, ${theme.palette.secondary.light}15)`,
                        }}
                      >
                        <CardMedia
                          component="img"
                          image={getCategoryImageUrl(category.image)}
                          alt={category.name}
                          className="category-image"
                          sx={{
                            objectFit: 'cover',
                            transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            width: '100%',
                            height: '100%',
                          }}
                        />
                        {/* Name Overlay */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.7) 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0,
                            transition: 'opacity 0.3s ease',
                          }}
                          className="category-overlay"
                        >
                          <Typography
                            variant="h4"
                            fontWeight={700}
                            className="category-name"
                            sx={{
                              color: 'white',
                              textAlign: 'center',
                              fontFamily: '"Playfair Display", "Georgia", serif',
                              letterSpacing: '-0.01em',
                              textShadow: '0 2px 8px rgba(0,0,0,0.7)',
                              px: 2,
                              fontSize: { xs: '1.3rem', sm: '1.6rem', md: '1.8rem' },
                              transform: 'scale(0.95)',
                              transition: 'transform 0.3s ease',
                            }}
                          >
                            {category.name}
                          </Typography>
                        </Box>

                        {/* Decorative Elements */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 12,
                            right: 12,
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                            opacity: 0.7,
                            animation: 'pulse 2s infinite',
                            '@keyframes pulse': {
                              '0%': { transform: 'scale(1)', opacity: 0.7 },
                              '50%': { transform: 'scale(1.2)', opacity: 0.4 },
                              '100%': { transform: 'scale(1)', opacity: 0.7 },
                            },
                          }}
                        />
                      </Box>
                    </CardActionArea>
                  </Card>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}

        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/products"
            endIcon={<ArrowForward />}
            sx={{
              px: 5,
              py: 2,
              fontSize: '1.1rem',
              fontWeight: 700,
              borderRadius: '50px',
              background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              boxShadow: `0 8px 24px ${theme.palette.primary.main}30`,
              transform: 'rotate(-1deg)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'rotate(0deg) translateY(-3px)',
                boxShadow: `0 12px 32px ${theme.palette.primary.main}40`,
                background: `linear-gradient(45deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
              },
            }}
            >
            {t('home.buttons.exploreAllProducts')}
          </Button>
        </Box>
      </Container>

      {/* Featured Products Section - Playful & Dynamic */}
      <Box sx={{ 
        background: `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.primary.light}05 100%)`,
        py: { xs: 8, md: 12 },
                          position: 'relative',
        overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239688d9' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          zIndex: 0,
        },
      }}>
        <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              fontWeight={700}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 50%, ${theme.palette.craft.blush} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 3,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                fontFamily: '"Playfair Display", "Georgia", serif',
                letterSpacing: '-0.02em',
              }}
            >
              {t('home.sections.featuredHandmade')}
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
                          sx={{ 
                maxWidth: '500px', 
                mx: 'auto',
                fontSize: { xs: '0.9rem', md: '1.1rem' },
                fontWeight: 300,
                lineHeight: 1.6,
                fontStyle: 'italic',
              }}
            >
            </Typography>
          </Box>

          {featuredLoading ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
                gap: 3,
              }}
            >
              {[...Array(8)].map((_, index) => (
                <ProductCard key={index} product={{} as Product} onView={() => {}} loading />
              ))}
            </Box>
          ) : featuredError ? (
            <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto' }}>
              {featuredError}
            </Alert>
          ) : featuredProducts.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                px: 4,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #faf8ff 0%, #f0f4ff 100%)',
                border: `1px solid ${theme.palette.primary.light}20`,
              }}
            >
              <ShoppingBag sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" fontWeight={600} sx={{ mb: 1 }}>
                {t('home.errors.noProductsAvailable')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('home.errors.productsWillAppear')}
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(5, 1fr)' },
                gap: 3,
              }}
            >
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onView={handleProductView}
                />
              ))}
            </Box>
          )}

          <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Button
              variant="outlined"
            size="large"
            component={Link}
            to="/products"
              endIcon={<ArrowForward />}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 3,
              }}
            >
              {t('home.buttons.viewAllProducts')}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Latest Products Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 12 }}>
        <Container maxWidth="xl">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h3"
              component="h2"
                        gutterBottom
              fontWeight={700}
                        sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 50%, ${theme.palette.craft.blush} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                          mb: 3,
                fontSize: { xs: '2.2rem', md: '3.5rem' },
                          fontFamily: '"Playfair Display", "Georgia", serif',
                letterSpacing: '-0.02em',
                        }}
                      >
              {t('home.sections.latestHandmade')}
                </Typography>
                        <Typography
              variant="h6" 
                          color="text.secondary"
                          sx={{
                maxWidth: '600px', 
                mx: 'auto',
                fontSize: { xs: '1rem', md: '1.2rem' },
                fontWeight: 300,
                            lineHeight: 1.6,
                          }}
                        >
                </Typography>
          </Box>

          {latestLoading ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                gap: 3,
              }}
            >
              {[...Array(6)].map((_, index) => (
                <ProductCard key={index} product={{} as Product} onView={() => {}} loading />
              ))}
            </Box>
          ) : latestError ? (
            <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto' }}>
              {latestError}
            </Alert>
          ) : latestProducts.length === 0 ? (
            <Box
              sx={{
                textAlign: 'center',
                py: 8,
                px: 4,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #faf8ff 0%, #f0f4ff 100%)',
                border: `1px solid ${theme.palette.primary.light}20`,
              }}
            >
              <ShoppingBag sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" fontWeight={600} sx={{ mb: 1 }}>
                {t('home.errors.noProductsAvailable')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('home.errors.productsWillAppear')}
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(5, 1fr)' },
                gap: 3,
              }}
            >
              {latestProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onView={handleProductView}
                />
              ))}
            </Box>
          )}

        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Button
              variant="contained"
            size="large"
            component={Link}
              to="/products?sort=newest"
            endIcon={<ArrowForward />}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              borderRadius: 3,
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                '&:hover': {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                  transform: 'translateY(-2px)',
                },
            }}
          >
              {t('home.buttons.viewAllLatestProducts')}
          </Button>
        </Box>
      </Container>
      </Box>

      {/* Video Section */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            fontWeight={700}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 50%, ${theme.palette.craft.blush} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 3,
              fontSize: { xs: '2.2rem', md: '3.5rem' },
              fontFamily: '"Playfair Display", "Georgia", serif',
              letterSpacing: '-0.02em',
            }}
            >
            {t('home.sections.watchOurCraft')}
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              maxWidth: '600px', 
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.2rem' },
              fontWeight: 300,
              lineHeight: 1.6,
            }}
          >
            {t('home.sections.watchDescription')}
          </Typography>
        </Box>

        <Grid container spacing={6} alignItems="center">
          <Grid item xs={12} md={6}>
            <Box 
              sx={{ 
                position: 'relative',
                borderRadius: 4,
                overflow: 'hidden',
                boxShadow: `0 20px 40px ${theme.palette.primary.main}20`,
                '&:hover': {
                  transform: 'scale(1.02)',
                  transition: 'transform 0.3s ease',
                },
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: 0,
                  paddingBottom: '56.25%', // 16:9 aspect ratio
                }}
              >
                <iframe
                  width="100%"
                  height="100%"
                  src="https://www.youtube.com/embed/Nj1jsTcoIrE?si=CohxlWRnehBAHLOf"
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                />
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography
                variant="h4"
                fontWeight={600}
                sx={{
                  mb: 3,
                  fontFamily: '"Playfair Display", "Georgia", serif',
                  color: 'text.primary',
                }}
              >
                {t('home.sections.theArtOfHandmade')}
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{
                  mb: 4,
                  lineHeight: 1.7,
                  fontSize: '1.1rem',
                }}
              >
                {t('home.sections.theArtDescription')}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      {/* Stats Section */}
      <Box sx={{ bgcolor: 'primary.light', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center">
            {[
              { icon: <ShoppingBag sx={{ fontSize: 40 }} />, value: '500+', label: t('home.stats.handmadeProducts') },
              { icon: <CategoryIcon sx={{ fontSize: 40 }} />, value: '20+', label: t('home.stats.categories') },
              { icon: <People sx={{ fontSize: 40 }} />, value: '10K+', label: t('home.stats.happyCustomers') },
              { icon: <ThumbUp sx={{ fontSize: 40 }} />, value: '99%', label: t('home.stats.satisfactionRate') },
            ].map((stat, index) => (
              <Grid item xs={6} sm={3} md={3} key={index} textAlign="center">
                <Box
                  sx={{
                    color: 'primary.dark',
                    mb: 2,
                    display: 'inline-flex',
                    p: 2,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.7)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                >
                  {stat.icon}
                </Box>
                <Typography variant="h4" fontWeight={700} color="primary.dark">
                  {stat.value}
                </Typography>
                <Typography variant="body1" color="primary.dark" sx={{ opacity: 0.9 }}>
                  {stat.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      {/* Process Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 12 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              fontWeight={700}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 50%, ${theme.palette.craft.blush} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 3,
                fontSize: { xs: '2.2rem', md: '3.5rem' },
                fontFamily: '"Playfair Display", "Georgia", serif',
                letterSpacing: '-0.02em',
              }}
            >
              {t('home.sections.ourProcess')}
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ 
                maxWidth: '600px', 
                mx: 'auto',
                fontSize: { xs: '1rem', md: '1.2rem' },
                fontWeight: 300,
                lineHeight: 1.6,
              }}
            >
              {t('home.sections.ourProcessDescription')}
            </Typography>
          </Box>

          <Grid  container spacing={4}>
            {[
              {
                step: '01',
                title: t('home.process.design'),
                description: t('home.process.designDescription'),
                icon: <Star sx={{ fontSize: 40 }} />,
              },
              {
                step: '02',
                title: t('home.process.materialSelection'),
                description: t('home.process.materialDescription'),
                icon: <ShoppingBag sx={{ fontSize: 40 }} />,
              },
              {
                step: '03',
                title: t('home.process.crafting'),
                description: t('home.process.craftingDescription'),
                icon: <Favorite sx={{ fontSize: 40 }} />,
              },
              {
                step: '04',
                title: t('home.process.qualityCheck'),
                description: t('home.process.qualityDescription'),
                icon: <Security sx={{ fontSize: 40 }} />,
              },
            ].map((process, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 4,
                    borderRadius: 4,
                    background: 'white',
                    border: `1px solid ${theme.palette.grey[200]}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 20px 40px ${theme.palette.primary.main}15`,
                    },
                  }}
                >
                    <Box 
                      sx={{ 
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                      bgcolor: theme.palette.primary.light + '20',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 3,
                      color: theme.palette.primary.main,
                    }}
                  >
                    {process.icon}
          </Box>
                    <Typography 
                    variant="h6"
                    fontWeight={700}
                    sx={{
                      mb: 2,
                      color: theme.palette.primary.main,
                      fontSize: '2rem',
                      fontFamily: '"Playfair Display", "Georgia", serif',
                    }}
                  >
                    {process.step}
                  </Typography>
                  <Typography
                    variant="h6"
                      fontWeight={600}
                      sx={{
                      mb: 2,
                      fontFamily: '"Playfair Display", "Georgia", serif',
                    }}
                  >
                    {process.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ lineHeight: 1.6 }}
                  >
                    {process.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            fontWeight={700}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 50%, ${theme.palette.craft.blush} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
                        mb: 3,
              fontSize: { xs: '2.2rem', md: '3.5rem' },
                        fontFamily: '"Playfair Display", "Georgia", serif',
              letterSpacing: '-0.02em',
            }}
            >
            {t('home.sections.whatOurCustomersSay')}
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              maxWidth: '600px', 
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.2rem' },
              fontWeight: 300,
              lineHeight: 1.6,
            }}
          >
            {t('home.sections.whatOurCustomersSayDescription')}
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {[
            {
              id: '1',
              name: 'Sarah Putri',
              location: 'Jakarta',
              rating: 5,
              comment: 'Produk rajutan yang sangat berkualitas! Desainnya unik dan bahan yang digunakan sangat nyaman. Pelayanan customer service juga sangat responsif.',
              avatar: '/images/avatar-1.jpg',
              product: 'Crochet Blanket',
              verified: true,
            },
            {
              id: '2',
              name: 'Ahmad Rizki',
              location: 'Bandung',
              rating: 5,
              comment: 'Pengiriman cepat dan produk sesuai dengan yang diharapkan. Kualitas rajutan sangat bagus dan tahan lama. Recommended banget!',
              avatar: '/images/avatar-2.jpg',
              product: 'Macrame Wall Hanging',
              verified: true,
            },
            {
              id: '3',
              name: 'Maya Sari',
              location: 'Surabaya',
              rating: 5,
              comment: 'Hexa Crochet benar-benar memberikan produk berkualitas tinggi. Desainnya modern dan sesuai dengan tren terkini. Akan repeat order lagi!',
              avatar: '/images/avatar-3.jpg',
              product: 'Crochet Sweater',
              verified: true,
            },
          ].map((testimonial, index) => (
            <Grid item xs={12} md={4} key={testimonial.id}>
              <Card
                sx={{
                  height: '100%',
                  p: 4,
                  borderRadius: 4,
                  background: 'white',
                  border: `1px solid ${theme.palette.grey[200]}`,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: `0 20px 40px ${theme.palette.primary.main}15`,
                  },
                }}
              >
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Rating value={testimonial.rating} readOnly size="small" />
                    {testimonial.verified && (
                      <Chip
                        label={t('home.testimonials.verified')}
                        size="small"
                        sx={{
                          ml: 2,
                          bgcolor: 'success.main',
                          color: 'white',
                          fontSize: '0.7rem',
                          height: 20,
                        }}
                      />
                    )}
                  </Box>
                  <Typography 
                    variant="body1" 
                    color="text.primary" 
                    sx={{ 
                      mb: 3,
                      fontStyle: 'italic',
                      lineHeight: 1.6,
                      fontSize: '1rem',
                    }}
                  >
                    "{testimonial.comment}"
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    sx={{
                      display: 'block',
                      fontWeight: 500,
                    }}
                  >
                    {t('home.testimonials.product')}: {testimonial.product}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    src={testimonial.avatar} 
                    alt={testimonial.name}
                    sx={{ 
                      mr: 2,
                      width: 48,
                      height: 48,
                      border: `2px solid ${theme.palette.primary.light}`,
                    }}
                  />
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {testimonial.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {testimonial.location}
                    </Typography>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* FAQ Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 12 }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography
              variant="h3"
              component="h2"
              gutterBottom
              fontWeight={700}
              sx={{
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 50%, ${theme.palette.craft.blush} 100%)`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 3,
                fontSize: { xs: '2.2rem', md: '3.5rem' },
                fontFamily: '"Playfair Display", "Georgia", serif',
                letterSpacing: '-0.02em',
              }}
            >
              {t('home.sections.frequentlyAskedQuestions')}
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ 
                maxWidth: '600px', 
                mx: 'auto',
                fontSize: { xs: '1rem', md: '1.2rem' },
                fontWeight: 300,
                lineHeight: 1.6,
              }}
            >
              {t('home.sections.faqDescription')}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              {
                question: t('home.faq.question1'),
                answer: t('home.faq.answer1'),
              },
              {
                question: t('home.faq.question2'),
                answer: t('home.faq.answer2'),
              },
              {
                question: t('home.faq.question3'),
                answer: t('home.faq.answer3'),
              },
              {
                question: t('home.faq.question4'),
                answer: t('home.faq.answer4'),
              },
              {
                question: t('home.faq.question5'),
                answer: t('home.faq.answer5'),
              },
            ].map((faq, index) => (
              <Paper
                key={index}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  background: 'white',
                  border: `1px solid ${theme.palette.grey[200]}`,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    boxShadow: `0 8px 24px ${theme.palette.primary.main}10`,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Typography
                  variant="h6"
                  fontWeight={600}
                  sx={{
                    mb: 2,
                        color: 'text.primary',
                    fontFamily: '"Playfair Display", "Georgia", serif',
                      }}
                    >
                  {faq.question}
                </Typography>
                    <Typography 
                      variant="body1" 
                      color="text.secondary" 
                  sx={{ lineHeight: 1.6 }}
                >
                  {faq.answer}
                </Typography>
              </Paper>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Social Media Section */}
      <Container maxWidth="lg" sx={{ py: 12 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h3"
            component="h2"
            gutterBottom
            fontWeight={700}
                      sx={{ 
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 50%, ${theme.palette.craft.blush} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 3,
              fontSize: { xs: '2.2rem', md: '3.5rem' },
              fontFamily: '"Playfair Display", "Georgia", serif',
              letterSpacing: '-0.02em',
            }}
            >
            {t('home.sections.followOurJourney')}
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              maxWidth: '600px', 
              mx: 'auto',
              fontSize: { xs: '1rem', md: '1.2rem' },
                        fontWeight: 300,
              lineHeight: 1.6,
                      }}
                    >
            {t('home.sections.followDescription')}
                </Typography>
        </Box>

         <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, flexWrap: 'wrap' }}>
           {[
             {
               platform: 'Instagram',
               handle: '@hexacrochet',
               icon: <InstagramIcon sx={{ fontSize: 28, color: theme.palette.primary.main }} />,
               color: theme.palette.primary.main,
               link: 'https://instagram.com/hexacrochet',
             },
             {
               platform: 'TikTok',
               handle: '@hexacrochet',
               icon: (
                 <img
                   src="/images/tiktok.svg"
                   alt="TikTok"
                   style={{ width: 24, height: 24, display: 'block' }}
                 />
               ),
               color: theme.palette.primary.main,
               link: 'https://tiktok.com/@hexacrochet',
             },
             {
               platform: 'YouTube',
               handle: 'Hexa Crochet',
               icon: (
                 <img
                   src="/images/youtube.svg"
                   alt="YouTube"
                   style={{ width: 28, height: 28, display: 'block' }}
                 />
               ),
               color: theme.palette.primary.main,
               link: 'https://youtube.com/@hexacrochet',
             },
             {
               platform: 'Shopee',
               handle: 'hexacrochet',
               icon: <img src="/images/logo-shopee.svg" alt="Shopee" style={{ width: 24, height: 24, display: 'block' }} />,
               color: '#FF5722',
               link: 'https://shopee.co.id/hexacrochet',
             },
           ].map((social, index) => (
             <Box
               key={index}
               sx={{
                 display: 'flex',
                 alignItems: 'center',
                 gap: 2,
                 p: 2,
                 borderRadius: 3,
                 background: 'white',
                 border: `1px solid ${theme.palette.grey[200]}`,
                 transition: 'all 0.2s ease',
                 cursor: 'pointer',
                 minWidth: 200,
                 '&:hover': {
                   borderColor: theme.palette.primary.light,
                   boxShadow: `0 4px 12px ${theme.palette.primary.main}10`,
                 },
               }}
               onClick={() => window.open(social.link, '_blank')}
             >
               <Box
                 sx={{
                   width: 40,
                   height: 40,
                   borderRadius: '50%',
                   bgcolor: theme.palette.primary.light + '20',
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   fontSize: '1.2rem',
                 }}
               >
                 {social.icon}
               </Box>
               
               <Box sx={{ flex: 1 }}>
                 <Typography
                   variant="body2"
                   fontWeight={600}
                   sx={{
                     color: 'text.primary',
                     fontSize: '0.9rem',
                   }}
                 >
                   {social.platform}
                 </Typography>
                 
                 <Typography
                   variant="caption"
                   color="text.secondary"
                   sx={{
                     fontSize: '0.8rem',
                   }}
                 >
                   {social.handle}
                 </Typography>
               </Box>
               
               <ArrowForward sx={{ fontSize: 16, color: theme.palette.primary.main }} />
             </Box>
           ))}
         </Box>

        <Box sx={{ textAlign: 'center', mt: 6 }}>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            {t('home.social.dontForget')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['#HexaCrochet', '#HandmadeIndonesia', '#CrochetLove', '#MacrameArt'].map((hashtag, index) => (
              <Chip
                key={index}
                label={hashtag}
                sx={{
                  bgcolor: theme.palette.primary.light + '20',
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                  fontSize: '0.9rem',
                }}
              />
            ))}
          </Box>
        </Box>
      </Container>

      {/* Newsletter Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 8 }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography
              variant="h4"
              fontWeight={700}
              gutterBottom
              sx={{
                mb: 2,
                fontFamily: '"Playfair Display", "Georgia", serif',
                letterSpacing: '-0.01em',
              }}
            >
              {t('home.sections.stayUpdated')}
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}
            >
              {t('home.sections.stayUpdatedDescription')}
            </Typography>
            <Box
              component="form"
              sx={{
                display: 'flex',
                gap: 2,
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                justifyContent: 'center',
                maxWidth: 500,
                mx: 'auto',
              }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <input
                  type="email"
                  placeholder={t('home.newsletter.enterEmail')}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: `1px solid ${theme.palette.grey[300]}`,
                    borderRadius: '8px',
                    fontSize: '1rem',
                    outline: 'none',
                  }}
                />
              </Box>
              <Button
                variant="contained"
                sx={{
                  px: 3,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                {t('home.buttons.subscribe')}
              </Button>
            </Box>
        </Box>
      </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          background: `
            linear-gradient(135deg, 
              rgba(150, 130, 219, 0.95) 0%, 
              rgba(166, 130, 219, 0.9) 50%, 
              rgba(196, 181, 232, 0.85) 100%
            )
          `,
          color: 'white',
          py: 12,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="md">
          <Typography 
            variant="h3" 
            gutterBottom 
            fontWeight={700} 
            sx={{ 
              mb: 4,
              fontSize: { xs: '2.2rem', md: '3.5rem' },
              fontFamily: '"Playfair Display", "Georgia", serif',
              letterSpacing: '-0.02em',
            }}
          >
            {t('home.sections.discoverHandmadeBeauty')}
          </Typography>
          <Typography 
            variant="h6" 
            paragraph 
            sx={{ 
              opacity: 0.9,
              mb: 6,
              fontSize: { xs: '1rem', md: '1.2rem' },
              maxWidth: 600,
              mx: 'auto',
              fontWeight: 300,
            }}
          >
            {t('home.sections.discoverDescription')}
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
          <Button
            variant="contained"
            size="large"
            component={Link}
            to="/products"
              endIcon={<ArrowForward />}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 3,
                '&:hover': {
                  bgcolor: 'grey.100',
                  transform: 'translateY(-2px)',
                },
              }}
          >
              {t('home.buttons.exploreCollection')}
          </Button>
            <Button
              variant="outlined"
              size="large"
              component={Link}
              to="/about"
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.5)',
                color: 'white',
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 3,
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              {t('home.buttons.ourStory')}
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}