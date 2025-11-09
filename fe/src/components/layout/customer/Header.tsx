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
  Chip,
  Stack,
  CircularProgress,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Menu as MenuIcon,
  Person as PersonIcon,
  Login as LoginIcon,
  PersonAdd as RegisterIcon,
  Home as HomeIcon,
  LocationOn as LocationIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  Info as AboutIcon,
  Category as CategoryIcon,
  ContactMail as ContactIcon,
  LocalShipping as ShippingIcon,
  Support as SupportIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Language as LanguageIcon,
  AttachMoney as CurrencyIcon,
  Inventory as ProductsIcon,
} from '@mui/icons-material';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { useSettingsStore, getLanguageDisplay, getCurrencyDisplay, getShippingDisplay } from '@/store/settingsStore';
import { useTranslation } from '@/hooks/useTranslation';
import { categoryApi } from '@/features/categories/services/categoryApi';
import { CategoriesListResponse } from '@/features/categories/types';
import SearchComponent from './SearchComponent';

export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  
  const { user, isAuthenticated, logout } = useAuthStore();
  const { totalItems, refreshCartCount } = useCartStore();
  const { 
    language, 
    currency, 
    shipping, 
    setLanguage, 
    setCurrency, 
    setShipping 
  } = useSettingsStore();
  const { t } = useTranslation();

  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [categoryMenuAnchor, setCategoryMenuAnchor] = useState<null | HTMLElement>(null);
  const [categories, setCategories] = useState<CategoriesListResponse['data']>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [categoriesExpanded, setCategoriesExpanded] = useState(false);
  const [settingsMenuAnchor, setSettingsMenuAnchor] = useState<null | HTMLElement>(null);
  const [languageSubmenuOpen, setLanguageSubmenuOpen] = useState(false);
  const [currencySubmenuOpen, setCurrencySubmenuOpen] = useState(false);
  const [shippingSubmenuOpen, setShippingSubmenuOpen] = useState(false);

  // Refresh cart count when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshCartCount();
    }
  }, [isAuthenticated, refreshCartCount]);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await categoryApi.getCategories({ 
          limit: 10, // Limit to 10 categories for header
          sortBy: 'name',
          sortOrder: 'asc'
        });
        if (response.success) {
        setCategories(response.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

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

  const handleMobileDrawerOpen = () => {
    setMobileDrawerOpen(true);
  };

  const handleMobileDrawerClose = () => {
    setMobileDrawerOpen(false);
  };

  const handleCategoryMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setCategoryMenuAnchor(event.currentTarget);
  };

  const handleCategoryMenuClose = () => {
    setCategoryMenuAnchor(null);
  };

  const handleSettingsMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsMenuAnchor(event.currentTarget);
  };

  const handleSettingsMenuClose = () => {
    setSettingsMenuAnchor(null);
    setLanguageSubmenuOpen(false);
    setCurrencySubmenuOpen(false);
    setShippingSubmenuOpen(false);
  };

  const handleLanguageChange = (language: string) => {
    setLanguage(language);
    setLanguageSubmenuOpen(false);
  };

  const handleCurrencyChange = (currency: string) => {
    setCurrency(currency);
    setCurrencySubmenuOpen(false);
  };

  const handleShippingChange = (shipping: string) => {
    setShipping(shipping);
    setShippingSubmenuOpen(false);
  };

  const handleLanguageSubmenuToggle = () => {
    setLanguageSubmenuOpen(!languageSubmenuOpen);
    setCurrencySubmenuOpen(false);
    setShippingSubmenuOpen(false);
  };

  const handleCurrencySubmenuToggle = () => {
    setCurrencySubmenuOpen(!currencySubmenuOpen);
    setLanguageSubmenuOpen(false);
    setShippingSubmenuOpen(false);
  };

  const handleShippingSubmenuToggle = () => {
    setShippingSubmenuOpen(!shippingSubmenuOpen);
    setLanguageSubmenuOpen(false);
    setCurrencySubmenuOpen(false);
  };

  return (
    <Box sx={{ position: 'sticky', top: 0, zIndex: 1000 }}>
      {/* Top Contact Bar */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          py: 0.5,
        }}
      >
        <Container maxWidth="xl">
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            fontSize: '0.8rem',
            flexDirection: 'row',
            gap: 0,
            py: { xs: 0.5, sm: 0 },
          }}>
            {/* Contact Info */}
            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 0.5, sm: 2 }, 
              alignItems: 'center',
              flexWrap: 'nowrap',
              justifyContent: 'flex-start',
            }}>
              {/* Desktop: Icon + Text */}
              {!isMobile && (
                <>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <PhoneIcon sx={{ fontSize: '0.9rem' }} />
                    <Typography variant="caption">
                      +62 812-3456-7890
                    </Typography>
              </Box>
                  
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <EmailIcon sx={{ fontSize: '0.9rem' }} />
                    <Typography variant="caption">
                      info@hexacrochet.com
                    </Typography>
              </Box>
                </>
              )}
              
              {/* Mobile: Icon Only */}
              {isMobile && (
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                  <PhoneIcon sx={{ fontSize: '0.7rem' }} />
                  <EmailIcon sx={{ fontSize: '0.7rem' }} />
              </Box>
              )}
            </Box>

            {/* Social Media */}
            <Box sx={{ 
              display: 'flex', 
              gap: { xs: 0.3, sm: 2 }, 
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}>
              {/* Desktop: Icon + Value */}
              {!isMobile && (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <img 
                      src="/images/instagram.svg" 
                      alt="Instagram" 
                      style={{ 
                        width: '0.9rem', 
                        height: '0.9rem', 
                        filter: 'brightness(0) invert(1)' 
                      }}
                    />
                    <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                      @hexa.crochet
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <img 
                      src="/images/tiktok_white.svg" 
                      alt="TikTok" 
                      style={{ 
                        width: '0.9rem', 
                        height: '0.9rem', 
                        filter: 'brightness(0) invert(1)' 
                      }}
                    />
                    <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                      @hexacrochet
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <img 
                      src="/images/youtube_white.svg" 
                      alt="YouTube" 
                      style={{ 
                        width: '1rem', 
                        height: '1rem'
                      }}
                    />
                    <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                      @hexacrochet
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <img 
                      src="/images/logo-shopee.svg" 
                      alt="Shopee" 
                      style={{ 
                        width: '1rem', 
                        height: '1rem'
                      }}
                    />
                    <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                      hexacrochet
                    </Typography>
                  </Box>
                </>
              )}
              
              {/* Mobile: Only Icons */}
              {isMobile && (
                <Box sx={{ display: 'flex', gap: 0.3, alignItems: 'center' }}>
                  <IconButton
                size="small" 
                    onClick={() => window.open('https://www.instagram.com/hexacrochet', '_blank')}
                sx={{ 
                      color: 'inherit',
                      p: 0.3,
                      '&:hover': {
                        transform: 'scale(1.1)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <img 
                      src="/images/instagram.svg" 
                      alt="Instagram" 
                      style={{ 
                        width: '0.7rem', 
                        height: '0.7rem', 
                        filter: 'brightness(0) invert(1)' 
                      }}
                    />
                  </IconButton>
                  
                  <IconButton
                    size="small"
                    onClick={() => window.open('https://www.tiktok.com/@hexacrochet', '_blank')}
                    sx={{
                      color: 'inherit',
                      p: 0.3,
                      '&:hover': {
                        transform: 'scale(1.1)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <img 
                      src="/images/tiktok_white.svg" 
                      alt="TikTok" 
                      style={{ 
                        width: '0.7rem', 
                        height: '0.7rem', 
                        filter: 'brightness(0) invert(1)' 
                      }}
                    />
                  </IconButton>
                  
                  <IconButton
                    size="small"
                    onClick={() => window.open('https://www.youtube.com/@hexacrochet', '_blank')}
                    sx={{
                      color: 'inherit',
                      p: 0.3,
                      '&:hover': {
                        transform: 'scale(1.1)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <img 
                      src="/images/youtube_white.svg" 
                      alt="YouTube" 
                      style={{ 
                        width: '0.8rem', 
                        height: '0.8rem'
                      }}
                    />
                  </IconButton>
                  
                  <IconButton
                size="small" 
                    onClick={() => window.open('https://shopee.co.id/hexacrochet', '_blank')}
                sx={{ 
                      color: 'inherit',
                      p: 0.3,
                      '&:hover': {
                        transform: 'scale(1.1)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <img 
                      src="/images/logo-shopee.svg" 
                      alt="Shopee" 
                      style={{ 
                        width: '0.8rem', 
                        height: '0.8rem'
                      }}
                    />
                  </IconButton>
                </Box>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Navigation */}
      <AppBar 
        position="static" 
        elevation={0}
        sx={{ 
          bgcolor: 'white',
          color: 'text.primary',
          borderBottom: `1px solid ${theme.palette.grey[200]}`,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar sx={{ py: 1.5 }}>
            {/* Mobile Layout */}
            {isMobile ? (
              <>
                {/* Mobile Hamburger Menu */}
                <IconButton
                  color="primary"
                  onClick={handleMobileDrawerOpen}
                  sx={{
                    borderRadius: 2,
                    p: 1,
                    mr: 2,
                    '&:hover': {
                      backgroundColor: 'primary.light',
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  <MenuIcon sx={{ fontSize: '1.3rem' }} />
                </IconButton>

                {/* Mobile Logo */}
                <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
                  <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
                    <img
                      src="/images/logo_ungu.png"
                      alt="Hexa Crochet Logo"
                      style={{ height: 40, width: 'auto', display: 'block' }}
                    />
                  </Link>
                </Box>

                {/* Mobile Right Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {/* Settings (Language & Currency) */}
                  <IconButton
                    color="primary"
                    onClick={handleSettingsMenuOpen}
                    sx={{
                      borderRadius: 2,
                      p: 0.8,
                      minWidth: 50,
                      '&:hover': {
                        backgroundColor: 'primary.light',
                        transform: 'scale(1.05)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="body2" sx={{ fontSize: '1rem' }}>
                        {getLanguageDisplay(language).flag}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.8rem', fontWeight: 600 }}>
                        {currency}
                      </Typography>
                    </Box>
                  </IconButton>
             
                  {/* Cart */}
                  <IconButton 
                    color="primary"
                    onClick={() => navigate('/cart')}
                    sx={{
                      borderRadius: 2,
                      p: 0.8,
                      '&:hover': {
                        backgroundColor: 'primary.light',
                        transform: 'scale(1.05)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <Badge 
                      badgeContent={totalItems > 0 ? totalItems : null} 
                      color="secondary"
                      sx={{
                        '& .MuiBadge-badge': {
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          minWidth: '16px',
                          height: '16px',
                        },
                      }}
                    >
                      <CartIcon sx={{ fontSize: '1.2rem' }} />
                    </Badge>
                  </IconButton>

                  {/* Profile */}
                  <IconButton
                    color="primary"
                    onClick={isAuthenticated ? handleUserMenuOpen : () => navigate('/login')}
                    sx={{
                      borderRadius: 2,
                      p: 0.8,
                      '&:hover': {
                        backgroundColor: 'primary.light',
                        transform: 'scale(1.05)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    <PersonIcon sx={{ fontSize: '1.2rem' }} />
                  </IconButton>
                </Box>
              </>
            ) : (
              <>
                {/* Desktop Layout */}
            {/* Logo */}
            <Box sx={{ mr: 4 }}>
              <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
                <img
                  src="/images/logo_ungu.png"
                  alt="Hexa Crochet Logo"
                  style={{ height: 50, width: 'auto', display: 'block' }}
                />
              </Link>
            </Box>

            {/* Search Bar */}
              <Box sx={{ flexGrow: 1, maxWidth: 500, mx: 2 }}>
                <SearchComponent />
              </Box>

            {/* Navigation Menu */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 3 }}>
                <Button
                  component={Link}
                  to="/"
                  variant="text"
                  sx={{
                    color: location.pathname === '/' ? 'primary.main' : 'text.primary',
                    textTransform: 'none',
                    fontWeight: location.pathname === '/' ? 600 : 500,
                    px: 2,
                    py: 1,
                    '&:hover': {
                      color: 'primary.main',
                    },
                    backgroundColor: 'transparent !important',
                    boxShadow: 'none !important',
                  }}
                >
                  {t('header.home')}
                </Button>
                
                <Button
                  component={Link}
                  to="/products"
                  variant="text"
                  sx={{
                    color: location.pathname.startsWith('/products') ? 'primary.main' : 'text.primary',
                    textTransform: 'none',
                    fontWeight: location.pathname.startsWith('/products') ? 600 : 500,
                    px: 2,
                    py: 1,
                    '&:hover': {
                      color: 'primary.main',
                    },
                    backgroundColor: 'transparent !important',
                    boxShadow: 'none !important',
                  }}
                >
                  Produk
                </Button>
                
                <Button
                  variant="text"
                  onClick={handleCategoryMenuOpen}
                  sx={{
                    color: location.pathname.startsWith('/categories') ? 'primary.main' : 'text.primary',
                    textTransform: 'none',
                    fontWeight: location.pathname.startsWith('/categories') ? 600 : 500,
                    px: 2,
                    py: 1,
                    '&:hover': {
                      color: 'primary.main',
                    },
                    backgroundColor: 'transparent !important',
                    boxShadow: 'none !important',
                  }}
                >
                  {t('header.categories')}
                  <ExpandMoreIcon sx={{ ml: 0.5, fontSize: '1rem' }} />
                </Button>

                <Button
                  component={Link}
                  to="/contact"
                  variant="text"
                  sx={{
                    color: location.pathname === '/contact' ? 'primary.main' : 'text.primary',
                    textTransform: 'none',
                    fontWeight: location.pathname === '/contact' ? 600 : 500,
                    px: 2,
                    py: 1,
                    '&:hover': {
                      color: 'primary.main',
                    },
                    backgroundColor: 'transparent !important',
                    boxShadow: 'none !important', 
                  }}
                >
                  {t('header.contact')}
                </Button>

                <Button
                  component={Link}
                  to="/about"
                  variant="text"
                  sx={{
                    color: location.pathname === '/about' ? 'primary.main' : 'text.primary',
                    textTransform: 'none',
                    fontWeight: location.pathname === '/about' ? 600 : 500,
                    px: 2,
                    py: 1,
                    backgroundColor: 'transparent !important',
                    boxShadow: 'none !important',
                    '&:hover': {
                      color: 'primary.main',
                      backgroundColor: 'transparent',
                      boxShadow: 'none',
                    },
                  }}
                >
                  {t('header.about')}
                </Button>
              </Box>

                {/* Desktop Right Actions */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Settings (Language & Currency) */}
              <IconButton 
                color="primary"
                onClick={handleSettingsMenuOpen}
                sx={{
                  borderRadius: 2,
                  p: 1,
                  minWidth: 60,
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Typography variant="body2" sx={{ fontSize: '1.2rem' }}>
                    {getLanguageDisplay(language).flag}
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.9rem', fontWeight: 600 }}>
                    {currency}
                  </Typography>
                </Box>
              </IconButton>

              {/* Cart */}
              <IconButton 
                color="primary"
                onClick={() => navigate('/cart')}
                sx={{
                  borderRadius: 2,
                  p: 1,
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <Badge 
                  badgeContent={totalItems > 0 ? totalItems : null} 
                  color="secondary"
                  sx={{
                    '& .MuiBadge-badge': {
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      minWidth: '18px',
                      height: '18px',
                    },
                  }}
                >
                  <CartIcon sx={{ fontSize: '1.3rem' }} />
                </Badge>
              </IconButton>

              {/* Profile */}
              <IconButton
                color="primary"
                onClick={isAuthenticated ? handleUserMenuOpen : () => navigate('/login')}
                sx={{
                  borderRadius: 2,
                  p: 1,
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <PersonIcon sx={{ fontSize: '1.3rem' }} />
              </IconButton>
            </Box>
              </>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Category Dropdown Menu */}
      <Menu
        anchorEl={categoryMenuAnchor}
        open={Boolean(categoryMenuAnchor)}
        onClose={handleCategoryMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 300,
            borderRadius: 2,
            border: `1px solid ${theme.palette.grey[200]}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          },
        }}
      >
        {categoriesLoading ? (
          <MenuItem sx={{ py: 1.5, px: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <CircularProgress size={16} />
            <Typography variant="body2" color="text.secondary">Memuat kategori...</Typography>
        </MenuItem>
        ) : categories.length > 0 ? (
          categories.map((category) => (
          <MenuItem 
            key={category.id}
            onClick={() => { navigate(`/products?category=${category.id}`); handleCategoryMenuClose(); }}
            sx={{ py: 1.5, px: 2 }}
          >
            <Typography variant="body2">{category.name}</Typography>
          </MenuItem>
          ))
        ) : (
          <MenuItem sx={{ py: 1.5, px: 2 }}>
            <Typography variant="body2" color="text.secondary">Tidak ada kategori tersedia</Typography>
          </MenuItem>
        )}
      </Menu>

      {/* User Menu */}
      {isAuthenticated && (
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
              border: `1px solid ${theme.palette.grey[200]}`,
            },
          }}
        >
          <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.grey[200]}` }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {user?.full_name || 'User'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email}
            </Typography>
          </Box>
          <MenuItem 
            onClick={() => { navigate('/profile'); handleUserMenuClose(); }}
            sx={{ py: 1.5, px: 2 }}
          >
            <PersonIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="body2" fontWeight={500}>Akun Saya</Typography>
          </MenuItem>
          <MenuItem 
            onClick={() => { navigate('/orders'); handleUserMenuClose(); }}
            sx={{ py: 1.5, px: 2 }}
          >
            <CartIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="body2" fontWeight={500}>Pesanan Saya</Typography>
          </MenuItem>
          <Divider sx={{ my: 1 }} />
          <MenuItem 
            onClick={handleLogout}
            sx={{ py: 1.5, px: 2 }}
          >
            <LoginIcon sx={{ mr: 2, color: 'error.main' }} />
            <Typography variant="body2" fontWeight={500} color="error.main">{t('header.logout')}</Typography>
          </MenuItem>
        </Menu>
      )}

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={handleMobileDrawerClose}
        sx={{
          '& .MuiDrawer-paper': {
            width: 280,
            boxSizing: 'border-box',
          },
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <img
              src="/images/logo_ungu.png"
              alt="Hexa Crochet Logo"
              style={{ height: 35, width: 'auto' }}
            />
            <IconButton onClick={handleMobileDrawerClose}>
              <MenuIcon />
            </IconButton>
          </Box>
          <SearchComponent placeholder={t('header.searchPlaceholder')} />
        </Box>
        
        {/* Menu Items */}
        <List sx={{ p: 0 }}>
          {/* Home */}
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => { navigate('/'); handleMobileDrawerClose(); }}
              selected={location.pathname === '/'}
            >
              <ListItemText primary={t('header.home')} />
            </ListItemButton>
          </ListItem>
          
          {/* Products */}
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => { navigate('/products'); handleMobileDrawerClose(); }}
              selected={location.pathname.startsWith('/products')}
            >
              <ListItemIcon>
                <ProductsIcon />
              </ListItemIcon>
              <ListItemText primary="Produk" />
            </ListItemButton>
          </ListItem>
          
          {/* Categories with Submenu */}
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => setCategoriesExpanded(!categoriesExpanded)}
            >
              <ListItemIcon>
                <CategoryIcon />
              </ListItemIcon>
              <ListItemText primary={t('header.categories')} />
              {categoriesExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItemButton>
          </ListItem>
          
          {/* Categories Submenu */}
          <Collapse in={categoriesExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {categoriesLoading ? (
                <ListItem>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 4 }}>
                    <CircularProgress size={16} />
                    <Typography variant="body2" color="text.secondary">
                      {t('mobileMenu.loadingCategories')}
                    </Typography>
                  </Box>
                </ListItem>
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <ListItem key={category.id} disablePadding>
                    <ListItemButton 
                      sx={{ pl: 4 }}
                      onClick={() => { 
                        navigate(`/products?category=${category.id}`); 
                        handleMobileDrawerClose(); 
                      }}
                    >
                      <ListItemText 
                        primary={category.name}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItemButton>
                  </ListItem>
                ))
              ) : (
                <ListItem sx={{ pl: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    {t('mobileMenu.noCategories')}
                  </Typography>
                </ListItem>
              )}
            </List>
          </Collapse>
          
          {/* Contact */}
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => { navigate('/contact'); handleMobileDrawerClose(); }}
              selected={location.pathname === '/contact'}
            >
              <ListItemText primary={t('header.contact')} />
            </ListItemButton>
          </ListItem>
          
          {/* About */}
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => { navigate('/about'); handleMobileDrawerClose(); }}
              selected={location.pathname === '/about'}
            >
              <ListItemText primary={t('header.about')} />
            </ListItemButton>
          </ListItem>
          
          <Divider sx={{ my: 1 }} />
          
          {/* Cart */}
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => { navigate('/cart'); handleMobileDrawerClose(); }}
            >
              <ListItemText primary={t('header.cart')} />
              {totalItems > 0 && (
                <Chip 
                  label={totalItems} 
                  size="small" 
                  color="secondary"
                  sx={{ ml: 1 }}
                />
              )}
            </ListItemButton>
          </ListItem>
          
          {/* Wishlist */}
          <ListItem disablePadding>
            <ListItemButton 
              onClick={() => { navigate('/wishlist'); handleMobileDrawerClose(); }}
            >
              <ListItemText primary={t('header.wishlist')} />
            </ListItemButton>
          </ListItem>
          
          <Divider sx={{ my: 1 }} />
          
          {/* User Section */}
          {isAuthenticated ? (
            <>
              <ListItem disablePadding>
                <ListItemButton 
                  onClick={() => { navigate('/profile'); handleMobileDrawerClose(); }}
                >
                  <ListItemText primary="Akun Saya" />
                </ListItemButton>
              </ListItem>
              
              <ListItem disablePadding>
                <ListItemButton 
                  onClick={() => { navigate('/orders'); handleMobileDrawerClose(); }}
                >
                  <ListItemText primary="Pesanan Saya" />
                </ListItemButton>
              </ListItem>
              
              <ListItem disablePadding>
                <ListItemButton 
                  onClick={() => { handleLogout(); handleMobileDrawerClose(); }}
                  sx={{ color: 'error.main' }}
                >
                  <ListItemText primary={t('header.logout')} />
                </ListItemButton>
              </ListItem>
            </>
          ) : (
            <>
              <ListItem disablePadding>
                <ListItemButton 
                  onClick={() => { navigate('/login'); handleMobileDrawerClose(); }}
                >
                  <ListItemText primary={t('header.login')} />
                </ListItemButton>
              </ListItem>
              
              <ListItem disablePadding>
                <ListItemButton 
                  onClick={() => { navigate('/register'); handleMobileDrawerClose(); }}
                >
                  <ListItemText primary={t('header.register')} />
                </ListItemButton>
              </ListItem>
            </>
          )}
        </List>
      </Drawer>

      {/* Settings Dropdown Menu */}
        <Menu
        anchorEl={settingsMenuAnchor}
        open={Boolean(settingsMenuAnchor)}
        onClose={handleSettingsMenuClose}
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
            minWidth: 200,
              borderRadius: 2,
              border: `1px solid ${theme.palette.grey[200]}`,
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            },
          }}
        >
        {/* Language Section Header */}
        <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${theme.palette.grey[200]}` }}>
          <Typography variant="caption" sx={{ 
            color: 'text.secondary', 
            fontWeight: 600, 
            textTransform: 'uppercase',
            letterSpacing: 1,
            fontSize: '0.75rem'
          }}>
            {t('settings.language')}
          </Typography>
          </Box>
        
        {/* Current Language */}
          <MenuItem 
          onClick={handleLanguageSubmenuToggle}
          sx={{ py: 1.5, px: 2 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <Typography variant="body2">
              {getLanguageDisplay(language).flag}
            </Typography>
            <Typography variant="body2" sx={{ flexGrow: 1 }}>
              {getLanguageDisplay(language).name}
            </Typography>
            {languageSubmenuOpen ? <ExpandLessIcon sx={{ fontSize: '1rem' }} /> : <ExpandMoreIcon sx={{ fontSize: '1rem' }} />}
          </Box>
          </MenuItem>
        
        {/* Language Submenu */}
        <Collapse in={languageSubmenuOpen} timeout="auto" unmountOnExit>
          <Box sx={{ pl: 2 }}>
          <MenuItem 
              onClick={() => handleLanguageChange('ID')}
              sx={{ py: 1, px: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">🇮🇩</Typography>
                <Typography variant="body2">{t('settings.indonesian')}</Typography>
              </Box>
          </MenuItem>
            
          <MenuItem 
              onClick={() => handleLanguageChange('EN')}
              sx={{ py: 1, px: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">🇺🇸</Typography>
                <Typography variant="body2">{t('settings.english')}</Typography>
              </Box>
          </MenuItem>
          </Box>
        </Collapse>
        
        <Divider sx={{ my: 1 }} />
        
        {/* Shipping Section Header */}
        <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${theme.palette.grey[200]}` }}>
          <Typography variant="caption" sx={{ 
            color: 'text.secondary', 
            fontWeight: 600, 
            textTransform: 'uppercase',
            letterSpacing: 1,
            fontSize: '0.75rem'
          }}>
            {t('settings.shipping')}
          </Typography>
        </Box>
        
        {/* Current Shipping Destination */}
          <MenuItem 
          onClick={handleShippingSubmenuToggle}
          sx={{ py: 1.5, px: 2 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <Typography variant="body2">
              {getShippingDisplay(shipping).flag}
            </Typography>
            <Typography variant="body2" sx={{ flexGrow: 1 }}>
              {getShippingDisplay(shipping).name}
            </Typography>
            {shippingSubmenuOpen ? <ExpandLessIcon sx={{ fontSize: '1rem' }} /> : <ExpandMoreIcon sx={{ fontSize: '1rem' }} />}
          </Box>
          </MenuItem>
        
        {/* Shipping Submenu */}
        <Collapse in={shippingSubmenuOpen} timeout="auto" unmountOnExit>
          <Box sx={{ pl: 2 }}>
            <MenuItem 
              onClick={() => handleShippingChange('ID')}
              sx={{ py: 1, px: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">🇮🇩</Typography>
                <Typography variant="body2">{t('settings.indonesia')}</Typography>
              </Box>
            </MenuItem>
            
            <MenuItem 
              onClick={() => handleShippingChange('SG')}
              sx={{ py: 1, px: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">🇸🇬</Typography>
                <Typography variant="body2">{t('settings.singapore')}</Typography>
              </Box>
            </MenuItem>
            
            <MenuItem 
              onClick={() => handleShippingChange('MY')}
              sx={{ py: 1, px: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">🇲🇾</Typography>
                <Typography variant="body2">{t('settings.malaysia')}</Typography>
              </Box>
            </MenuItem>
            
            <MenuItem 
              onClick={() => handleShippingChange('TH')}
              sx={{ py: 1, px: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">🇹🇭</Typography>
                <Typography variant="body2">{t('settings.thailand')}</Typography>
              </Box>
            </MenuItem>
          </Box>
        </Collapse>
        
          <Divider sx={{ my: 1 }} />
        
        {/* Currency Section Header */}
        <Box sx={{ px: 2, py: 1, borderBottom: `1px solid ${theme.palette.grey[200]}` }}>
          <Typography variant="caption" sx={{ 
            color: 'text.secondary', 
            fontWeight: 600, 
            textTransform: 'uppercase',
            letterSpacing: 1,
            fontSize: '0.75rem'
          }}>
            {t('settings.currency')}
          </Typography>
        </Box>
        
        {/* Current Currency */}
          <MenuItem 
          onClick={handleCurrencySubmenuToggle}
            sx={{ py: 1.5, px: 2 }}
          >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            <Typography variant="body2">
              {getCurrencyDisplay(currency).flag}
            </Typography>
            <Typography variant="body2" sx={{ flexGrow: 1 }}>
              {getCurrencyDisplay(currency).name}
            </Typography>
            {currencySubmenuOpen ? <ExpandLessIcon sx={{ fontSize: '1rem' }} /> : <ExpandMoreIcon sx={{ fontSize: '1rem' }} />}
          </Box>
          </MenuItem>
        
        {/* Currency Submenu */}
        <Collapse in={currencySubmenuOpen} timeout="auto" unmountOnExit>
          <Box sx={{ pl: 2 }}>
            <MenuItem 
              onClick={() => handleCurrencyChange('IDR')}
              sx={{ py: 1, px: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">🇮🇩</Typography>
                <Typography variant="body2">{t('settings.rupiah')}</Typography>
              </Box>
            </MenuItem>
            
            <MenuItem 
              onClick={() => handleCurrencyChange('USD')}
              sx={{ py: 1, px: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">🇺🇸</Typography>
                <Typography variant="body2">{t('settings.dollar')}</Typography>
              </Box>
            </MenuItem>
            
            <MenuItem 
              onClick={() => handleCurrencyChange('EUR')}
              sx={{ py: 1, px: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">🇪🇺</Typography>
                <Typography variant="body2">{t('settings.euro')}</Typography>
              </Box>
            </MenuItem>
            
            <MenuItem 
              onClick={() => handleCurrencyChange('MYR')}
              sx={{ py: 1, px: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">🇲🇾</Typography>
                <Typography variant="body2">Malaysian Ringgit</Typography>
              </Box>
            </MenuItem>
            
            <MenuItem 
              onClick={() => handleCurrencyChange('SGD')}
              sx={{ py: 1, px: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">🇸🇬</Typography>
                <Typography variant="body2">Singapore Dollar</Typography>
              </Box>
            </MenuItem>
            
            <MenuItem 
              onClick={() => handleCurrencyChange('HKD')}
              sx={{ py: 1, px: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">🇭🇰</Typography>
                <Typography variant="body2">Hong Kong Dollar</Typography>
              </Box>
            </MenuItem>
            
            <MenuItem 
              onClick={() => handleCurrencyChange('AED')}
              sx={{ py: 1, px: 2 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2">🇦🇪</Typography>
                <Typography variant="body2">UAE Dirham</Typography>
              </Box>
            </MenuItem>
          </Box>
        </Collapse>
        </Menu>
    </Box>
  );
}