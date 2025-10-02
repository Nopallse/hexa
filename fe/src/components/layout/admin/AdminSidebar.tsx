import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Collapse,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as ProductsIcon,
  Category as CategoryIcon,
  ShoppingCart as OrdersIcon,
  Payment as PaymentIcon,
  People as UsersIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useUiStore } from '@/store/uiStore';

const SIDEBAR_WIDTH = 260;
const SIDEBAR_COLLAPSED_WIDTH = 64;

interface MenuItem {
  title: string;
  icon: React.ReactElement;
  path?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/admin',
  },
  {
    title: 'Produk',
    icon: <ProductsIcon />,
    path: '/admin/products',
  },
  {
    title: 'Kategori',
    icon: <CategoryIcon />,
    path: '/admin/categories',
  },
  {
    title: 'Pesanan',
    icon: <OrdersIcon />,
    path: '/admin/orders',
  },
  {
    title: 'Pembayaran',
    icon: <PaymentIcon />,
    path: '/admin/payments',
  },
  {
    title: 'Pengguna',
    icon: <UsersIcon />,
    path: '/admin/users',
  },
];

export default function AdminSidebar() {
  const theme = useTheme();
  const location = useLocation();
  const sidebarOpen = useUiStore((state) => state.sidebarOpen);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleExpand = (title: string) => {
    setExpandedItems(prev =>
      prev.includes(title)
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path || 
           (path !== '/admin' && location.pathname.startsWith(path));
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.title);
    const active = isActive(item.path);

    return (
      <Box key={item.title}>
        <ListItem disablePadding sx={{ display: 'block', mb: 0.5 }}>
          <ListItemButton
            component={item.path ? Link : 'div'}
            to={item.path}
            onClick={hasChildren ? () => handleExpand(item.title) : undefined}
            sx={{
              minHeight: 44,
              justifyContent: sidebarOpen ? 'initial' : 'center',
              px: sidebarOpen ? 2 : 1.5,
              pl: level > 0 ? (sidebarOpen ? 4 : 1.5) : (sidebarOpen ? 2 : 1.5),
              mx: 1,
              borderRadius: 1,
              backgroundColor: active ? theme.palette.primary.main : 'transparent',
              color: active ? theme.palette.primary.contrastText : theme.palette.text.primary,
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: active 
                  ? theme.palette.primary.dark 
                  : theme.palette.action.hover,
                transform: 'translateX(2px)',
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: sidebarOpen ? 2 : 'auto',
                justifyContent: 'center',
                color: active ? theme.palette.primary.contrastText : theme.palette.text.secondary,
                fontSize: '1.25rem',
              }}
            >
              {item.icon}
            </ListItemIcon>
            
            {sidebarOpen && (
              <>
                <ListItemText 
                  primary={item.title}
                  primaryTypographyProps={{
                    fontSize: '0.875rem',
                    fontWeight: active ? 600 : 500,
                  }}
                  sx={{ opacity: sidebarOpen ? 1 : 0 }}
                />
                {hasChildren && (
                  <Box sx={{ ml: 1 }}>
                    {isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />}
                  </Box>
                )}
              </>
            )}
          </ListItemButton>
        </ListItem>

        {hasChildren && sidebarOpen && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ ml: 1 }}>
              {item.children!.map(child => renderMenuItem(child, level + 1))}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarOpen ? 'flex-start' : 'center',
          px: sidebarOpen ? 2.5 : 1.5,
          py: 2,
          minHeight: 64,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography
          variant="h6"
          noWrap
          sx={{
            fontWeight: 'bold',
            color: theme.palette.primary.main,
            opacity: sidebarOpen ? 1 : 0,
            transition: 'opacity 0.3s ease',
            fontSize: '1.125rem',
          }}
        >
          Hexa Admin
        </Typography>
      </Box>

      {/* Menu Items */}
      <List sx={{ flexGrow: 1, py: 2, px: 1 }}>
        {menuItems.map(item => renderMenuItem(item))}
      </List>
    </Box>
  );
}
