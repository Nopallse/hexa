import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Person as PersonIcon,
  ShoppingBag as OrdersIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

const menuItems: MenuItem[] = [
  {
    label: 'Akun Saya',
    icon: <PersonIcon />,
    path: '/profile',
  },
  {
    label: 'Pesanan Saya',
    icon: <OrdersIcon />,
    path: '/orders',
  },
];

interface AccountSidebarProps {
  onNavigate?: (path: string) => void;
}

export default function AccountSidebar({ onNavigate }: AccountSidebarProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      navigate(path);
    }
  };

  const isActive = (path: string) => {
    if (path === '/profile') {
      return location.pathname.startsWith('/profile');
    }
    if (path === '/orders') {
      return location.pathname.startsWith('/orders');
    }
    return location.pathname === path;
  };

  if (isMobile) {
    return null; // Hide sidebar on mobile, can be replaced with drawer if needed
  }

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 2,
        border: `1px solid ${theme.palette.grey[200]}`,
        overflow: 'hidden',
        height: 'fit-content',
        position: 'sticky',
        top: 20,
      }}
    >
      <List sx={{ p: 0 }}>
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                onClick={() => handleNavigate(item.path)}
                selected={active}
                sx={{
                  py: 2,
                  px: 3,
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.light + '15',
                    borderLeft: `3px solid ${theme.palette.primary.main}`,
                    '&:hover': {
                      backgroundColor: theme.palette.primary.light + '20',
                    },
                  },
                  '&:hover': {
                    backgroundColor: theme.palette.grey[50],
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: active ? theme.palette.primary.main : 'text.secondary',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: active ? 600 : 500,
                    color: active ? 'primary.main' : 'text.primary',
                    fontSize: '0.95rem',
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
}

