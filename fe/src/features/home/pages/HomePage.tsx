import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  Card, 
  CardContent, 
  useTheme,
  Chip,
  Stack,
  IconButton,
  CardActionArea,
  Avatar,
  Skeleton,
  Alert,
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
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { categoryApi } from '@/features/categories/services/categoryApi';
import { Category } from '@/types/global';

export default function HomePage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await categoryApi.getCategories({ limit: 6 });
        setCategories(response.data);
      } catch (err) {
        setError('Gagal memuat kategori');
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (category: Category) => {
    navigate(`/products?category=${category.id}`);
  };

  return (
    <Box>
      {/* Hero Section - Modern Craft Aesthetic */}
      <Box
        sx={{
          background: `
            linear-gradient(135deg, 
              rgba(150, 130, 219, 0.95) 0%, 
              rgba(166, 130, 219, 0.9) 50%, 
              rgba(196, 181, 232, 0.85) 100%
            ),
            url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M50 0L60 40L100 50L60 60L50 100L40 60L0 50L40 40Z'/%3E%3C/g%3E%3C/svg%3E")
          `,
          color: 'white',
          py: { xs: 8, md: 16 },
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
              linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.05) 50%, transparent 70%)
            `,
            animation: 'craftFloat 25s ease-in-out infinite',
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 2px,
                rgba(255, 255, 255, 0.02) 2px,
                rgba(255, 255, 255, 0.02) 4px
              )
            `,
            animation: 'textureMove 30s linear infinite',
          },
          '@keyframes craftFloat': {
            '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
            '33%': { transform: 'translateY(-10px) rotate(1deg)' },
            '66%': { transform: 'translateY(5px) rotate(-1deg)' },
          },
          '@keyframes textureMove': {
            '0%': { transform: 'translateX(0px) translateY(0px)' },
            '100%': { transform: 'translateX(20px) translateY(20px)' },
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h1" 
            component="h1" 
            gutterBottom 
            fontWeight={700}
            sx={{
              fontSize: { xs: '2.8rem', md: '4.5rem' },
              mb: 4,
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f4ff 50%, #e8e0ff 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
              letterSpacing: '-0.02em',
              fontFamily: '"Playfair Display", "Georgia", serif',
            }}
          >
            Selamat Datang di Hexa Crochet
          </Typography>
          <Typography 
            variant="h5" 
            paragraph 
            sx={{ 
              opacity: 0.95,
              fontSize: { xs: '1.2rem', md: '1.6rem' },
              maxWidth: '700px',
              mx: 'auto',
              mb: 6,
              fontWeight: 300,
              lineHeight: 1.6,
              fontStyle: 'italic',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)',
            }}
          >
            Temukan koleksi rajutan handmade berkualitas tinggi dengan desain unik dan menarik
          </Typography>
          
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            justifyContent="center"
            sx={{ mb: 6 }}
          >
            <Button
              variant="contained"
              size="large"
              component={Link}
              to="/products"
              endIcon={<ArrowForward />}
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.95)',
                color: 'primary.main',
                px: 5,
                py: 2,
                fontSize: '1.2rem',
                fontWeight: 600,
                borderRadius: 4,
                boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                textTransform: 'none',
                letterSpacing: '0.5px',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 1)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 16px 50px rgba(0,0,0,0.2)',
                },
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              Jelajahi Produk
            </Button>
            <Button
              variant="outlined"
              size="large"
              endIcon={<Visibility />}
              onClick={() => {
                const categoriesSection = document.getElementById('categories-section');
                categoriesSection?.scrollIntoView({ behavior: 'smooth' });
              }}
              sx={{
                borderColor: 'rgba(255, 255, 255, 0.6)',
                color: 'white',
                px: 5,
                py: 2,
                fontSize: '1.2rem',
                fontWeight: 600,
                borderRadius: 4,
                backdropFilter: 'blur(20px)',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 2,
                textTransform: 'none',
                letterSpacing: '0.5px',
                '&:hover': {
                  borderColor: 'rgba(255, 255, 255, 0.9)',
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 16px 50px rgba(255, 255, 255, 0.1)',
                },
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              Lihat Kategori
            </Button>
          </Stack>

          {/* Stats - Craft Aesthetic */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              gap: 3,
              maxWidth: '800px',
              mx: 'auto',
            }}
          >
            {[
              { label: 'Produk', value: '500+', icon: <ShoppingBag />, color: '#E8B4B8' },
              { label: 'Kategori', value: '20+', icon: <CategoryIcon />, color: '#B8E6B8' },
              { label: 'Pelanggan', value: '1000+', icon: <Favorite />, color: '#B8D4E8' },
              { label: 'Rating', value: '4.9', icon: <Star />, color: '#F4E4C1' },
            ].map((stat, index) => (
              <Box
                key={index}
                sx={{
                  textAlign: 'center',
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  position: 'relative',
                  overflow: 'hidden',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(135deg, ${stat.color}20, transparent)`,
                    opacity: 0.6,
                  },
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <Box sx={{ color: 'white', mb: 2, position: 'relative', zIndex: 1 }}>
                  {stat.icon}
                </Box>
                <Typography 
                  variant="h3" 
                  fontWeight={700} 
                  color="white"
                  sx={{ 
                    position: 'relative', 
                    zIndex: 1,
                    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                  }}
                >
                  {stat.value}
                </Typography>
                <Typography 
                  variant="body2" 
                  color="rgba(255, 255, 255, 0.9)"
                  sx={{ 
                    position: 'relative', 
                    zIndex: 1,
                    fontWeight: 500,
                    letterSpacing: '0.5px',
                  }}
                >
                  {stat.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Categories Section - Modern Craft Aesthetic */}
      <Container maxWidth="xl" sx={{ py: 12 }} id="categories-section">
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
            Kategori Produk
        </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary" 
            sx={{ 
              maxWidth: '700px', 
              mx: 'auto',
              fontSize: { xs: '1.1rem', md: '1.3rem' },
              fontWeight: 300,
              lineHeight: 1.6,
              fontStyle: 'italic',
            }}
          >
            Jelajahi berbagai kategori produk rajutan berkualitas tinggi yang kami sediakan
                </Typography>
          </Box>

        {loading ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 3,
            }}
          >
            {[...Array(6)].map((_, index) => (
              <Card key={index} sx={{ height: '100%' }}>
                <CardContent sx={{ p: 3 }}>
                  <Skeleton variant="circular" width={60} height={60} sx={{ mx: 'auto', mb: 2 }} />
                  <Skeleton variant="text" height={32} sx={{ mb: 1 }} />
                  <Skeleton variant="text" height={20} sx={{ mb: 2 }} />
                  <Skeleton variant="rectangular" height={24} width={100} sx={{ mx: 'auto' }} />
                </CardContent>
              </Card>
            ))}
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto' }}>
            {error}
          </Alert>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
              gap: 3,
            }}
          >
            {categories.map((category) => (
              <Card
                key={category.id}
                sx={{
                    height: '100%',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    borderRadius: 4,
                    overflow: 'hidden',
                    position: 'relative',
                    background: 'linear-gradient(135deg, #ffffff 0%, #faf8ff 100%)',
                    border: `1px solid ${theme.palette.primary.light}20`,
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `
                        radial-gradient(circle at 20% 20%, ${theme.palette.primary.light}15 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, ${theme.palette.secondary.light}15 0%, transparent 50%)
                      `,
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                    },
                    '&:hover': {
                      transform: 'translateY(-12px)',
                      boxShadow: `0 25px 50px ${theme.palette.primary.main}25`,
                      '&::before': {
                        opacity: 1,
                      },
                    },
                  }}
                  onClick={() => handleCategoryClick(category)}
                >
                  <CardActionArea sx={{ height: '100%' }}>
                    <CardContent sx={{ p: 5, textAlign: 'center', height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <Box
                        sx={{
                          width: 100,
                          height: 100,
                          mx: 'auto',
                          mb: 4,
                          borderRadius: '50%',
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 50%, ${theme.palette.primary.light} 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: -2,
                            left: -2,
                            right: -2,
                            bottom: -2,
                            borderRadius: '50%',
                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.light})`,
                            zIndex: -1,
                            opacity: 0.3,
                          },
                        }}
                      >
                        <CategoryIcon 
                          sx={{ 
                            fontSize: '2.5rem', 
                            color: 'white',
                            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                          }} 
                        />
          </Box>

                      <Typography
                        variant="h5"
                        fontWeight={600}
                        gutterBottom
                        sx={{
                          mb: 3,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          color: 'text.primary',
                          fontFamily: '"Playfair Display", "Georgia", serif',
                          letterSpacing: '-0.01em',
                        }}
                      >
                        {category.name}
                </Typography>

                      {category.description && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            flex: 1,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            mb: 4,
                            lineHeight: 1.6,
                            fontStyle: 'italic',
                          }}
                        >
                          {category.description}
                </Typography>
                      )}

                      <Chip
                        label="Jelajahi Produk"
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          px: 2,
                          py: 1,
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                          color: 'white',
                          border: 'none',
                          '&:hover': {
                            background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                            transform: 'scale(1.05)',
                          },
                          transition: 'all 0.3s ease',
                        }}
                      />
              </CardContent>
                  </CardActionArea>
            </Card>
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
            Lihat Semua Produk
          </Button>
        </Box>
      </Container>

      {/* Features Section - Modern Craft Aesthetic */}
      <Box 
        sx={{ 
          background: `
            linear-gradient(135deg, #faf8ff 0%, #f0f4ff 50%, #f8f4ff 100%),
            url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23E8B4B8' fill-opacity='0.03'%3E%3Cpath d='M30 0L35 20L55 30L35 40L30 60L25 40L5 30L25 20Z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")
          `,
          py: 12,
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 10% 20%, rgba(232, 180, 184, 0.05) 0%, transparent 50%),
              radial-gradient(circle at 90% 80%, rgba(184, 212, 232, 0.05) 0%, transparent 50%)
            `,
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Typography
          variant="h3"
          component="h2"
          textAlign="center"
          gutterBottom
            fontWeight={700}
            sx={{ 
              mb: 8,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 50%, ${theme.palette.craft.blush} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              fontSize: { xs: '2.2rem', md: '3.5rem' },
              fontFamily: '"Playfair Display", "Georgia", serif',
              letterSpacing: '-0.02em',
            }}
        >
          Mengapa Memilih Kami?
        </Typography>
        
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
              gap: 4,
            }}
          >
            {[
              {
                icon: <Star sx={{ fontSize: 48, color: 'primary.main' }} />,
                title: 'Kualitas Premium',
                description: 'Semua produk dibuat dengan bahan berkualitas tinggi dan dikerjakan dengan teliti oleh pengrajin berpengalaman.',
                color: 'primary.main',
              },
              {
                icon: <ShoppingBag sx={{ fontSize: 48, color: 'secondary.main' }} />,
                title: 'Mudah Berbelanja',
                description: 'Platform yang user-friendly dengan proses pemesanan yang mudah dan sistem pembayaran yang aman.',
                color: 'secondary.main',
              },
              {
                icon: <LocalShipping sx={{ fontSize: 48, color: 'success.main' }} />,
                title: 'Pengiriman Cepat',
                description: 'Pengiriman cepat dan aman ke seluruh Indonesia dengan tracking real-time untuk setiap pesanan.',
                color: 'success.main',
              },
              {
                icon: <Security sx={{ fontSize: 48, color: 'info.main' }} />,
                title: 'Garansi Kualitas',
                description: 'Semua produk dilengkapi dengan garansi kualitas dan jaminan kepuasan pelanggan 100%.',
                color: 'info.main',
              },
              {
                icon: <Support sx={{ fontSize: 48, color: 'warning.main' }} />,
                title: 'Customer Service 24/7',
                description: 'Tim customer service yang siap membantu Anda 24/7 untuk menjawab pertanyaan dan menangani keluhan.',
                color: 'warning.main',
              },
              {
                icon: <TrendingUp sx={{ fontSize: 48, color: 'error.main' }} />,
                title: 'Inovasi Terus Menerus',
                description: 'Kami terus berinovasi dengan desain dan produk terbaru untuk memenuhi kebutuhan pelanggan.',
                color: 'error.main',
              },
            ].map((feature, index) => (
              <Card
                key={index}
                sx={{
                    height: '100%',
                    textAlign: 'center',
                    p: 4,
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #ffffff 0%, #faf8ff 100%)',
                    border: `1px solid ${theme.palette.primary.light}20`,
                    position: 'relative',
                    overflow: 'hidden',
                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: `linear-gradient(135deg, ${feature.color}10, transparent)`,
                      opacity: 0,
                      transition: 'opacity 0.3s ease',
                    },
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 20px 40px ${feature.color}20`,
                      '&::before': {
                        opacity: 1,
                      },
                    },
                  }}
                >
                  <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                    <Box 
                      sx={{ 
                        mb: 4,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: 80,
                        height: 80,
                        mx: 'auto',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${feature.color}20, ${feature.color}10)`,
                        border: `2px solid ${feature.color}30`,
                      }}
                    >
                      {feature.icon}
          </Box>
                    <Typography 
                      variant="h5" 
                      gutterBottom 
                      fontWeight={600}
                      sx={{
                        mb: 3,
                        fontFamily: '"Playfair Display", "Georgia", serif',
                        letterSpacing: '-0.01em',
                        color: 'text.primary',
                      }}
                    >
                      {feature.title}
                </Typography>
                    <Typography 
                      variant="body1" 
                      color="text.secondary" 
                      sx={{ 
                        lineHeight: 1.7,
                        fontStyle: 'italic',
                        fontWeight: 300,
                      }}
                    >
                      {feature.description}
                </Typography>
              </CardContent>
            </Card>
            ))}
        </Box>
      </Container>
      </Box>

      {/* CTA Section - Modern Craft Aesthetic */}
      <Box
        sx={{
          background: `
            linear-gradient(135deg, 
              rgba(150, 130, 219, 0.95) 0%, 
              rgba(166, 130, 219, 0.9) 50%, 
              rgba(196, 181, 232, 0.85) 100%
            ),
            url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M40 0L50 30L80 40L50 50L40 80L30 50L0 40L30 30Z'/%3E%3C/g%3E%3C/svg%3E")
          `,
          color: 'white',
          py: 12,
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `
              radial-gradient(circle at 30% 70%, rgba(232, 180, 184, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 70% 30%, rgba(184, 212, 232, 0.1) 0%, transparent 50%)
            `,
            animation: 'craftFloat 20s ease-in-out infinite',
          },
        }}
      >
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography 
            variant="h3" 
            gutterBottom 
            fontWeight={700} 
            sx={{ 
              mb: 4,
              fontSize: { xs: '2.2rem', md: '3.5rem' },
              fontFamily: '"Playfair Display", "Georgia", serif',
              letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #ffffff 0%, #f8f4ff 50%, #e8e0ff 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            Siap Mulai Berbelanja?
          </Typography>
          <Typography 
            variant="h6" 
            paragraph 
            sx={{ 
              opacity: 0.95, 
              mb: 6,
              fontSize: { xs: '1.2rem', md: '1.4rem' },
              fontWeight: 300,
              lineHeight: 1.6,
              fontStyle: 'italic',
              textShadow: '0 1px 2px rgba(0,0,0,0.1)',
            }}
          >
            Jelajahi koleksi lengkap kami dan temukan produk rajutan favorit Anda
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
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
          >
            Mulai Belanja Sekarang
          </Button>
            <Button
              variant="outlined"
              size="large"
              endIcon={<Support />}
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
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              Hubungi Kami
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}

