import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Stack,
  useTheme,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
} from '@mui/material';
import { 
  ArrowForward, 
  Visibility,
  Star,
  ShoppingBag,
  Favorite,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

export default function HeroSection() {
  const theme = useTheme();

  return (
    <Box
      sx={{
        background: `
          linear-gradient(135deg, 
            rgba(174, 149, 224, 0.95) 0%, 
            rgba(196, 181, 232, 0.9) 50%, 
            rgba(232, 180, 184, 0.85) 100%
          )
        `,
        color: 'white',
        py: { xs: 6, md: 12 },
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
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.08) 0%, transparent 50%)
          `,
          animation: 'craftFloat 25s ease-in-out infinite',
        },
        '@keyframes craftFloat': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
          '33%': { transform: 'translateY(-10px) rotate(1deg)' },
          '66%': { transform: 'translateY(5px) rotate(-1deg)' },
        },
      }}
    >
      <Container maxWidth="xl" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={4} alignItems="center">
          {/* Left Side - Text Content */}
          <Grid item xs={12} md={6}>
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              {/* Handmade Badge */}
              <Chip
                label="Handmade"
                sx={{
                  mb: 3,
                  px: 3,
                  py: 1,
                  fontSize: '1rem',
                  fontWeight: 600,
                  borderRadius: 3,
                  background: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(20px)',
                  fontFamily: '"Playfair Display", "Georgia", serif',
                  letterSpacing: '0.5px',
                }}
              />

              <Typography 
                variant="h1" 
                component="h1" 
                gutterBottom 
                fontWeight={700}
                sx={{
                  fontSize: { xs: '2.5rem', md: '4rem', lg: '5rem' },
                  mb: 3,
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f4ff 50%, #e8e0ff 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  letterSpacing: '-0.02em',
                  fontFamily: '"Playfair Display", "Georgia", serif',
                  lineHeight: 1.1,
                }}
              >
                Koleksi Rajutan
                <br />
                <Box component="span" sx={{ 
                  background: 'linear-gradient(135deg, #E8B4B8 0%, #B8E6B8 50%, #B8D4E8 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  Handmade Premium
                </Box>
              </Typography>

              <Typography 
                variant="h5" 
                paragraph 
                sx={{ 
                  opacity: 0.95,
                  fontSize: { xs: '1.1rem', md: '1.4rem' },
                  maxWidth: '500px',
                  mb: 4,
                  fontWeight: 300,
                  lineHeight: 1.6,
                  fontStyle: 'italic',
                  textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                }}
              >
                Temukan keindahan rajutan handmade berkualitas tinggi dengan desain unik dan menarik yang dibuat dengan cinta dan ketelitian
              </Typography>
              
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2} 
                justifyContent={{ xs: 'center', md: 'flex-start' }}
                sx={{ mb: 4 }}
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
                    px: 4,
                    py: 2,
                    fontSize: '1.1rem',
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
                    px: 4,
                    py: 2,
                    fontSize: '1.1rem',
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

              {/* Stats */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
                  gap: 2,
                  maxWidth: '600px',
                  mx: { xs: 'auto', md: 0 },
                }}
              >
                {[
                  { label: 'Produk', value: '500+', icon: <ShoppingBag /> },
                  { label: 'Pelanggan', value: '1000+', icon: <Favorite /> },
                  { label: 'Rating', value: '4.9', icon: <Star /> },
                  { label: 'Tahun', value: '5+', icon: <Star /> },
                ].map((stat, index) => (
                  <Box
                    key={index}
                    sx={{
                      textAlign: 'center',
                      p: 2,
                      borderRadius: 3,
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                      },
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  >
                    <Box sx={{ color: 'white', mb: 1, fontSize: '1.2rem' }}>
                      {stat.icon}
                    </Box>
                    <Typography 
                      variant="h4" 
                      fontWeight={700} 
                      color="white"
                      sx={{ 
                        textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                        fontSize: { xs: '1.5rem', sm: '1.8rem' },
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="rgba(255, 255, 255, 0.9)"
                      sx={{ 
                        fontWeight: 500,
                        letterSpacing: '0.5px',
                        fontSize: '0.8rem',
                      }}
                    >
                      {stat.label}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Grid>

          {/* Right Side - Product Images */}
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'relative' }}>
              {/* Main Product Image */}
              <Card
                sx={{
                  borderRadius: 4,
                  overflow: 'hidden',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: '0 35px 70px rgba(0,0,0,0.2)',
                  },
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <CardMedia
                  component="img"
                  height="500"
                  image="https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=600&h=500&fit=crop&crop=face"
                  alt="Model wearing handmade crochet cardigan"
                  sx={{
                    objectFit: 'cover',
                    background: 'linear-gradient(135deg, #f0f4ff 0%, #f8f4ff 100%)',
                  }}
                />
                <CardContent
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.7))',
                    color: 'white',
                    p: 3,
                  }}
                >
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    Kardigan Rajutan Premium
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Dibuat dengan teknik crochet tradisional
                  </Typography>
                </CardContent>
              </Card>

              {/* Floating Product Cards */}
              <Card
                sx={{
                  position: 'absolute',
                  top: '20%',
                  left: '-10%',
                  width: '120px',
                  height: '120px',
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
                  animation: 'float 6s ease-in-out infinite',
                  '@keyframes float': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-10px)' },
                  },
                }}
              >
                <CardMedia
                  component="img"
                  height="120"
                  image="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=120&h=120&fit=crop"
                  alt="Crochet accessories"
                  sx={{ objectFit: 'cover' }}
                />
              </Card>

              <Card
                sx={{
                  position: 'absolute',
                  bottom: '10%',
                  right: '-5%',
                  width: '100px',
                  height: '100px',
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: '0 15px 30px rgba(0,0,0,0.1)',
                  animation: 'float 8s ease-in-out infinite reverse',
                }}
              >
                <CardMedia
                  component="img"
                  height="100"
                  image="https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=100&h=100&fit=crop"
                  alt="Crochet bag"
                  sx={{ objectFit: 'cover' }}
                />
              </Card>

              {/* Decorative Elements */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '10%',
                  right: '10%',
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'pulse 3s ease-in-out infinite',
                  '@keyframes pulse': {
                    '0%, 100%': { transform: 'scale(1)', opacity: 0.7 },
                    '50%': { transform: 'scale(1.1)', opacity: 1 },
                  },
                }}
              >
                <Star sx={{ color: 'white', fontSize: '1.5rem' }} />
              </Box>

              {/* Handmade Badge */}
              <Box
                sx={{
                  position: 'absolute',
                  top: '5%',
                  left: '5%',
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  background: 'rgba(232, 180, 184, 0.9)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  animation: 'slideIn 2s ease-out',
                  '@keyframes slideIn': {
                    '0%': { transform: 'translateX(-100px)', opacity: 0 },
                    '100%': { transform: 'translateX(0)', opacity: 1 },
                  },
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    fontFamily: '"Playfair Display", "Georgia", serif',
                    letterSpacing: '0.5px',
                  }}
                >
                  ✨ Handmade
                </Typography>
              </Box>

              {/* Floating Yarn Balls */}
              <Box
                sx={{
                  position: 'absolute',
                  bottom: '20%',
                  left: '-8%',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #E8B4B8, #B8E6B8)',
                  animation: 'bounce 4s ease-in-out infinite',
                  '@keyframes bounce': {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-15px)' },
                  },
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: '30%',
                  right: '-8%',
                  width: '35px',
                  height: '35px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #B8D4E8, #F4E4C1)',
                  animation: 'bounce 5s ease-in-out infinite reverse',
                }}
              />
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
