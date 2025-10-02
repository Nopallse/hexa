import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountCircle as AccountIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Notifications as NotificationIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useUiStore } from '@/store/uiStore';

const HEADER_HEIGHT = 60;

export default function AdminHeader() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { toggleSidebar } = useUiStore();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: 'white',
        color: 'text.primary',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        height: HEADER_HEIGHT,
        borderBottom: '1px solid',
        borderBottomColor: 'divider',
      }}
    >
      <Toolbar sx={{ 
        minHeight: `${HEADER_HEIGHT}px !important`,
        px: { xs: 2, sm: 3 },
      }}>
        {/* Menu Toggle */}
        <IconButton
          edge="start"
          color="inherit"
          onClick={toggleSidebar}
          sx={{ 
            mr: 2,
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          <MenuIcon />
        </IconButton>

        {/* Page Title */}
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            fontWeight: 600,
            fontSize: '1.125rem',
            color: 'text.primary',
          }}
        >
          Admin Panel
        </Typography>

        {/* Right side actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          {/* Notifications */}
          <IconButton 
            color="inherit"
            sx={{
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <NotificationIcon />
          </IconButton>

          {/* User Menu */}
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleMenuOpen}
            sx={{ 
              p: 0.5,
              ml: 1,
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: 'primary.main',
                fontSize: '0.875rem',
                fontWeight: 600,
              }}
            >
              {user?.full_name?.charAt(0).toUpperCase() || 'A'}
            </Avatar>
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            sx={{ 
              mt: 1,
              '& .MuiPaper-root': {
                minWidth: 200,
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              },
            }}
          >
            {/* User Info */}
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {user?.full_name || 'Administrator'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {user?.email || 'admin@hexacrochet.com'}
              </Typography>
            </Box>

            <Divider />

            {/* Menu Items */}
            <MenuItem 
              onClick={handleMenuClose}
              sx={{
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon>
                <AccountIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Profil</ListItemText>
            </MenuItem>

            <MenuItem 
              onClick={handleMenuClose}
              sx={{
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Pengaturan</ListItemText>
            </MenuItem>

            <Divider />

            <MenuItem 
              onClick={handleLogout}
              sx={{
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Keluar</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
