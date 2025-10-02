import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Container,
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  Home as HomeIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import SearchComponent from './SearchComponent';

export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  const { user, isAuthenticated, logout } = useAuthStore();
  const { totalItems } = useCartStore();

  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [mobileMenuAnchor, setMobileMenuAnchor] = useState<null | HTMLElement>(null);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserMenuAnchor(null);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMenuAnchor(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMenuAnchor(null);
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        bgcolor: 'primary.main',
        borderBottom: `1px solid ${theme.palette.primary.light}`,
        backdropFilter: 'blur(10px)',
      }}
    >
      <Container maxWidth="xl">
        <Toolbar sx={{ px: { xs: 0, sm: 2 }, py: 1 }}>
          {/* Logo - Left */}
          <Box sx={{ display: 'flex', alignItems: 'center', mr: { xs: 2, md: 4 } }}>
            <Typography
              variant="h5"
              component={Link}
              to="/"
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                fontWeight: 700,
                fontSize: { xs: '1.25rem', md: '1.5rem' },
                background: `linear-gradient(45deg, ${theme.palette.primary.contrastText}, ${theme.palette.secondary.contrastText})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                '&:hover': {
                  transform: 'scale(1.05)',
                  transition: 'transform 0.2s ease-in-out',
                },
              }}
            >
              Hexa Crochet
            </Typography>
          </Box>

          {/* Search Component - Center */}
          {!isMobile && (
            <Box sx={{ flexGrow: 1, maxWidth: 600, mx: 'auto' }}>
              <SearchComponent />
            </Box>
          )}

          {/* Right side actions */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1 }, ml: 'auto' }}>
            {/* Cart Icon */}
            <IconButton 
              color="inherit" 
              onClick={() => navigate('/cart')}
              sx={{
                borderRadius: 2,
                p: 1.5,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <Badge 
                badgeContent={totalItems} 
                color="secondary"
                sx={{
                  '& .MuiBadge-badge': {
                    fontSize: '0.75rem',
                    fontWeight: 600,
                  },
                }}
              >
                <CartIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }} />
              </Badge>
            </IconButton>

            {/* User Actions */}
            {isAuthenticated ? (
              <>
                {/* Desktop User Menu */}
                {!isMobile && (
                  <Button
                    color="inherit"
                    onClick={handleUserMenuOpen}
                    startIcon={
                      <Avatar
                        sx={{ 
                          width: 28, 
                          height: 28, 
                          fontSize: '0.875rem',
                          bgcolor: 'secondary.main',
                          fontWeight: 600,
                        }}
                      >
                        {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                      </Avatar>
                    }
                    sx={{
                      textTransform: 'none',
                      ml: 1,
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      fontWeight: 600,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        transform: 'translateY(-1px)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    {user?.full_name || 'User'}
                  </Button>
                )}

                {/* Mobile User Icon */}
                {isMobile && (
                  <IconButton
                    color="inherit"
                    onClick={handleUserMenuOpen}
                    sx={{
                      ml: 1,
                      borderRadius: 2,
                      p: 1.5,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        transform: 'scale(1.05)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <PersonIcon sx={{ fontSize: '1.25rem' }} />
                  </IconButton>
                )}

                {/* User Menu */}
                <Menu
                  anchorEl={userMenuAnchor}
                  open={Boolean(userMenuAnchor)}
                  onClose={handleUserMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 220,
                      borderRadius: 2,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                      border: `1px solid ${theme.palette.primary.light}`,
                    },
                  }}
                >
                  <MenuItem 
                    onClick={() => { navigate('/profile'); handleUserMenuClose(); }}
                    sx={{ py: 1.5, px: 2 }}
                  >
                    <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="body2" fontWeight={500}>Profil</Typography>
                  </MenuItem>
                  <MenuItem 
                    onClick={() => { navigate('/orders'); handleUserMenuClose(); }}
                    sx={{ py: 1.5, px: 2 }}
                  >
                    <CartIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="body2" fontWeight={500}>Pesanan Saya</Typography>
                  </MenuItem>
                  <MenuItem 
                    onClick={() => { navigate('/addresses'); handleUserMenuClose(); }}
                    sx={{ py: 1.5, px: 2 }}
                  >
                    <LocationIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="body2" fontWeight={500}>Alamat Saya</Typography>
                  </MenuItem>
                  <Divider sx={{ my: 1 }} />
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{ py: 1.5, px: 2 }}
                  >
                    <LoginIcon sx={{ mr: 2, color: 'error.main' }} />
                    <Typography variant="body2" fontWeight={500} color="error.main">Keluar</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <>
                {/* Login Button */}
                <Button
                  color="inherit"
                  component={Link}
                  to="/login"
                  startIcon={<LoginIcon />}
                  sx={{
                    textTransform: 'none',
                    ml: 1,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    fontWeight: 600,
                    display: { xs: 'none', sm: 'flex' },
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  Masuk
                </Button>

                {/* Register Button */}
                <Button
                  variant="outlined"
                  color="inherit"
                  component={Link}
                  to="/register"
                  startIcon={<RegisterIcon />}
                  sx={{
                    textTransform: 'none',
                    ml: 1,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    fontWeight: 600,
                    display: { xs: 'none', sm: 'flex' },
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  Daftar
                </Button>
              </>
            )}

            {/* Mobile Menu */}
            {isMobile && (
              <>
                <IconButton
                  color="inherit"
                  onClick={handleMobileMenuOpen}
                  sx={{
                    ml: 1,
                    borderRadius: 2,
                    p: 1.5,
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.15)',
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <MenuIcon sx={{ fontSize: '1.25rem' }} />
                </IconButton>

                {/* Mobile Menu */}
                <Menu
                  anchorEl={mobileMenuAnchor}
                  open={Boolean(mobileMenuAnchor)}
                  onClose={handleMobileMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  PaperProps={{
                    sx: {
                      mt: 1,
                      minWidth: 220,
                      borderRadius: 2,
                      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                      border: `1px solid ${theme.palette.primary.light}`,
                    },
                  }}
                >
                  <MenuItem 
                    onClick={() => { navigate('/'); handleMobileMenuClose(); }}
                    sx={{ py: 1.5, px: 2 }}
                  >
                    <HomeIcon sx={{ mr: 2, color: 'primary.main' }} />
                    <Typography variant="body2" fontWeight={500}>Beranda</Typography>
                  </MenuItem>
                  <MenuItem 
                    onClick={() => { navigate('/products'); handleMobileMenuClose(); }}
                    sx={{ py: 1.5, px: 2 }}
                  >
                    <Typography variant="body2" fontWeight={500}>Produk</Typography>
                  </MenuItem>
                  <MenuItem 
                    onClick={() => { navigate('/categories'); handleMobileMenuClose(); }}
                    sx={{ py: 1.5, px: 2 }}
                  >
                    <Typography variant="body2" fontWeight={500}>Kategori</Typography>
                  </MenuItem>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ p: 2 }}>
                    <SearchComponent placeholder="Cari produk..." />
                  </Box>
                  <Divider sx={{ my: 1 }} />
                </Menu>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
