import {
  Box,
  Container,
  Typography,
  Link,
  Divider,
  IconButton,
  Stack,
  useTheme,
  Chip,
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Instagram as InstagramIcon,
  WhatsApp as WhatsAppIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  AccessTime as TimeIcon,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

export default function Footer() {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
        color: 'white',
        py: 8,
        mt: 'auto',
        position: 'relative',
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${theme.palette.primary.light}, transparent)`,
        },
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: '2fr 1fr 1.5fr 1.5fr',
            },
            gap: 6,
          }}
        >
          {/* Company Info */}
          <Box>
            <Box sx={{ mb: 4 }}>
              <Typography 
                variant="h4" 
                gutterBottom 
                fontWeight={700} 
                sx={{
                  background: `linear-gradient(45deg, ${theme.palette.primary.light}, ${theme.palette.secondary.light})`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  mb: 3,
                }}
              >
                Hexa Crochet
              </Typography>
              <Typography 
                variant="body1" 
                color="rgba(255, 255, 255, 0.8)" 
                paragraph
                sx={{ 
                  lineHeight: 1.7,
                  mb: 3,
                }}
              >
                Toko rajutan terpercaya dengan produk berkualitas tinggi. 
                Kami menyediakan berbagai macam produk rajutan handmade yang unik dan berkualitas untuk kebutuhan Anda.
              </Typography>
              
              {/* Social Media */}
              <Stack direction="row" spacing={2}>
                <IconButton
                  size="medium"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    '&:hover': {
                      color: 'white',
                      backgroundColor: theme.palette.primary.main,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${theme.palette.primary.main}40`,
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <FacebookIcon />
                </IconButton>
                <IconButton
                  size="medium"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    '&:hover': {
                      color: 'white',
                      backgroundColor: theme.palette.secondary.main,
                      transform: 'translateY(-2px)',
                      boxShadow: `0 8px 25px ${theme.palette.secondary.main}40`,
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <InstagramIcon />
                </IconButton>
                <IconButton
                  size="medium"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.7)',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    '&:hover': {
                      color: 'white',
                      backgroundColor: '#25D366',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 25px #25D36640',
                    },
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                >
                  <WhatsAppIcon />
                </IconButton>
              </Stack>
            </Box>
          </Box>

          {/* Quick Links */}
          <Box>
            <Typography 
              variant="h6" 
              gutterBottom 
              fontWeight={600} 
              color="white"
              sx={{ mb: 3 }}
            >
              Menu Utama
            </Typography>
            <Stack spacing={2}>
              {[
                { label: 'Beranda', to: '/' },
                { label: 'Produk', to: '/products' },
                { label: 'Kategori', to: '/categories' },
                { label: 'Tentang Kami', to: '/about' },
              ].map((item) => (
                <Link 
                  key={item.label}
                  component={RouterLink} 
                  to={item.to} 
                  color="rgba(255, 255, 255, 0.7)" 
                  underline="none"
                  sx={{ 
                    fontWeight: 500,
                    '&:hover': { 
                      color: theme.palette.primary.light,
                      transform: 'translateX(4px)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </Stack>
          </Box>

          {/* Customer Service */}
          <Box>
            <Typography 
              variant="h6" 
              gutterBottom 
              fontWeight={600} 
              color="white"
              sx={{ mb: 3 }}
            >
              Layanan Pelanggan
            </Typography>
            <Stack spacing={2}>
              {[
                { label: 'Bantuan & FAQ', href: '#' },
                { label: 'Cara Pemesanan', href: '#' },
                { label: 'Info Pengiriman', href: '#' },
                { label: 'Kebijakan Pengembalian', href: '#' },
                { label: 'Hubungi Kami', href: '#' },
              ].map((item) => (
                <Link 
                  key={item.label}
                  href={item.href} 
                  color="rgba(255, 255, 255, 0.7)" 
                  underline="none"
                  sx={{ 
                    fontWeight: 500,
                    '&:hover': { 
                      color: theme.palette.primary.light,
                      transform: 'translateX(4px)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </Stack>
          </Box>

          {/* Contact Info */}
          <Box>
            <Typography 
              variant="h6" 
              gutterBottom 
              fontWeight={600} 
              color="white"
              sx={{ mb: 3 }}
            >
              Informasi Kontak
            </Typography>
            <Stack spacing={2.5}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <EmailIcon 
                  sx={{ 
                    color: theme.palette.primary.light, 
                    fontSize: '1.25rem',
                    mt: 0.5,
                  }} 
                />
                <Box>
                  <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" fontWeight={500}>
                    Email
                  </Typography>
                  <Typography variant="body2" color="white" fontWeight={600}>
                    info@hexacrochet.com
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <PhoneIcon 
                  sx={{ 
                    color: theme.palette.primary.light, 
                    fontSize: '1.25rem',
                    mt: 0.5,
                  }} 
                />
                <Box>
                  <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" fontWeight={500}>
                    WhatsApp
                  </Typography>
                  <Typography variant="body2" color="white" fontWeight={600}>
                    +62 812-3456-7890
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <LocationIcon 
                  sx={{ 
                    color: theme.palette.primary.light, 
                    fontSize: '1.25rem',
                    mt: 0.5,
                  }} 
                />
                <Box>
                  <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" fontWeight={500}>
                    Alamat
                  </Typography>
                  <Typography variant="body2" color="white" fontWeight={600}>
                    Jakarta, Indonesia
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <TimeIcon 
                  sx={{ 
                    color: theme.palette.primary.light, 
                    fontSize: '1.25rem',
                    mt: 0.5,
                  }} 
                />
                <Box>
                  <Typography variant="body2" color="rgba(255, 255, 255, 0.7)" fontWeight={500}>
                    Jam Operasional
                  </Typography>
                  <Typography variant="body2" color="white" fontWeight={600}>
                    Senin - Jumat: 09:00 - 18:00
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Box>
        </Box>

        <Divider 
          sx={{ 
            my: 6, 
            borderColor: 'rgba(255, 255, 255, 0.2)',
            borderWidth: 1,
          }} 
        />

        {/* Copyright */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: { xs: 'center', md: 'space-between' },
            alignItems: 'center',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
          }}
        >
          <Typography 
            variant="body2" 
            color="rgba(255, 255, 255, 0.7)"
            fontWeight={500}
          >
            © {currentYear} Hexa Crochet. Semua hak dilindungi undang-undang.
          </Typography>
          
          <Stack direction="row" spacing={3}>
            <Link 
              href="#" 
              color="rgba(255, 255, 255, 0.7)" 
              underline="none" 
              variant="body2"
              fontWeight={500}
              sx={{ 
                '&:hover': { 
                  color: theme.palette.primary.light,
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              Syarat & Ketentuan
            </Link>
            <Link 
              href="#" 
              color="rgba(255, 255, 255, 0.7)" 
              underline="none" 
              variant="body2"
              fontWeight={500}
              sx={{ 
                '&:hover': { 
                  color: theme.palette.primary.light,
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              Kebijakan Privasi
            </Link>
            <Chip
              label="Made with ❤️ in Indonesia"
              size="small"
              sx={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.8)',
                fontWeight: 500,
                border: '1px solid rgba(255, 255, 255, 0.2)',
              }}
            />
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
