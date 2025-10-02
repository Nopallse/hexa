import {
  Container,
  Typography,
  Box,
  Stack,
  Alert,
  Skeleton,
  useTheme,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
  Chip,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Home,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  Badge as RoleIcon,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileApi } from '../services/profileApi';
import { useProfileStore } from '../store/profileStore';

export default function ProfilePage() {
  const theme = useTheme();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { profile, setProfile, setError: setStoreError } = useProfileStore();

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await profileApi.getProfile();

      if (response.success) {
        setProfile(response.user);
      } else {
        setError('Gagal memuat profil');
      }
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      const errorMessage = err.response?.data?.error || 'Gagal memuat profil';
      setError(errorMessage);
      setStoreError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

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
    switch (role) {
      case 'admin':
        return 'error';
      case 'customer':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'customer':
        return 'Customer';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
        </Container>
      </Box>
    );
  }

  if (error || !profile) {
    return (
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto' }}>
            {error || 'Profil tidak ditemukan'}
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 4 }}>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' },
            }}
          >
            <Home sx={{ mr: 0.5, fontSize: '1rem' }} />
            Beranda
          </Link>
          <Typography variant="body2" color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <PersonIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
            Profil
          </Typography>
        </Breadcrumbs>

        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
            Profil Pengguna
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Informasi akun dan pengaturan profil Anda
          </Typography>
        </Box>

        {/* Profile Card */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
              {/* Avatar */}
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  backgroundColor: theme.palette.primary.main,
                  fontSize: '3rem',
                  fontWeight: 600,
                }}
              >
                {profile.full_name.charAt(0).toUpperCase()}
              </Avatar>

              {/* Profile Info */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <Typography variant="h4" fontWeight={700}>
                    {profile.full_name}
                  </Typography>
                  <Chip
                    label={getRoleLabel(profile.role)}
                    color={getRoleColor(profile.role) as any}
                    variant="outlined"
                  />
                </Stack>

                <Stack spacing={2}>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <EmailIcon color="action" />
                    <Typography variant="body1" color="text.secondary">
                      {profile.email}
                    </Typography>
                  </Stack>

                  <Stack direction="row" alignItems="center" spacing={2}>
                    <PhoneIcon color="action" />
                    <Typography variant="body1" color="text.secondary">
                      {profile.phone || 'Tidak ada nomor telepon'}
                    </Typography>
                  </Stack>

                  <Stack direction="row" alignItems="center" spacing={2}>
                    <CalendarIcon color="action" />
                    <Typography variant="body2" color="text.secondary">
                      Bergabung pada {formatDate(profile.created_at)}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
              Informasi Akun
            </Typography>

            <Stack spacing={3}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  ID Pengguna
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {profile.id}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Email
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {profile.email}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Nama Lengkap
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {profile.full_name}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Nomor Telepon
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {profile.phone || 'Tidak ada nomor telepon'}
                </Typography>
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Role
                </Typography>
                <Chip
                  label={getRoleLabel(profile.role)}
                  color={getRoleColor(profile.role) as any}
                  variant="outlined"
                />
              </Box>

              <Divider />

              <Box>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Terakhir Diupdate
                </Typography>
                <Typography variant="body1" fontWeight={500}>
                  {formatDate(profile.updated_at)}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}
