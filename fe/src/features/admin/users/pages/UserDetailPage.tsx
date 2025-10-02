import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  AdminPanelSettings as AdminIcon,
  Person as UserIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  Home as AddressIcon,
  ShoppingCart as CartIcon,
  Receipt as OrderIcon,
  AccountBalanceWallet as TransactionIcon,
} from '@mui/icons-material';
import { userApi } from '../services/userApi';
import Loading from '@/components/ui/Loading';
import { User } from '../types';

export default function UserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchUserDetail(id);
    }
  }, [id]);

  const fetchUserDetail = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await userApi.getUserById(userId);
      
      if (response.success) {
        setUser(response.data);
      } else {
        throw new Error('Failed to fetch user detail');
      }
    } catch (error: any) {
      setError(error.message || 'Gagal memuat detail pengguna');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'error' : 'default';
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? <AdminIcon /> : <UserIcon />;
  };

  if (isLoading) {
    return <Loading message="Memuat detail pengguna..." />;
  }

  if (error) {
    return (
      <Container maxWidth={false}>
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/admin/users')}
            sx={{ mb: 2 }}
          >
            Kembali ke Daftar Pengguna
          </Button>
        </Box>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth={false}>
        <Box sx={{ mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/admin/users')}
            sx={{ mb: 2 }}
          >
            Kembali ke Daftar Pengguna
          </Button>
        </Box>
        <Alert severity="warning">Pengguna tidak ditemukan</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth={false}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/users')}
          sx={{ mb: 2 }}
        >
          Kembali ke Daftar Pengguna
        </Button>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
          <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main', fontSize: '2rem' }}>
            {user.full_name.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              {user.full_name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <Chip
                icon={getRoleIcon(user.role)}
                label={user.role === 'admin' ? 'Admin' : 'User'}
                color={getRoleColor(user.role)}
                size="medium"
              />
              <Typography variant="body2" color="textSecondary">
                Bergabung: {formatDate(user.created_at)}
              </Typography>
            </Box>
            <Typography variant="body2" color="textSecondary">
              Terakhir diupdate: {formatDate(user.updated_at)}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* User Information */}
        <Grid xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Informasi Pengguna
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <EmailIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Email"
                    secondary={user.email}
                  />
                </ListItem>
                
                {user.phone && (
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Telepon"
                      secondary={user.phone}
                    />
                  </ListItem>
                )}
                
                <ListItem>
                  <ListItemIcon>
                    <CalendarIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Tanggal Dibuat"
                    secondary={formatDate(user.created_at)}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* User Statistics */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Statistik Pengguna
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <AddressIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold">
                      {user._count?.addresses || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Alamat
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <CartIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold">
                      {user._count?.cart_items || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Item Keranjang
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <OrderIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold">
                      {user._count?.orders || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Pesanan
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <TransactionIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="h4" fontWeight="bold">
                      {user._count?.transactions || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Transaksi
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* User Addresses */}
        {user.addresses && user.addresses.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Alamat Pengguna
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Grid container spacing={2}>
                  {user.addresses.map((address) => (
                    <Grid item xs={12} md={6} key={address.id}>
                      <Paper sx={{ p: 2, bgcolor: address.is_primary ? 'primary.light' : 'grey.50' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="subtitle2" fontWeight="medium">
                            {address.is_primary ? 'Alamat Utama' : 'Alamat Tambahan'}
                          </Typography>
                          {address.is_primary && (
                            <Chip label="Utama" size="small" color="primary" />
                          )}
                        </Box>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          {address.address_line}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {address.city}, {address.province} {address.postal_code}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                          Dibuat: {formatDate(address.created_at)}
                        </Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Container>
  );
}
