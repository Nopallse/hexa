import {
  Container,
  Typography,
  Box,
  Stack,
  useTheme,
  Breadcrumbs,
  Link,
  Alert,
  Skeleton,
} from '@mui/material';
import {
  Home,
  Person as PersonIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Address } from '../types';
import { addressApi } from '../services/addressApi';
import { useAddressStore } from '../store/addressStore';
import AddressForm from '../components/AddressForm';

export default function EditAddressPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [address, setAddress] = useState<Address | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { updateAddress } = useAddressStore();

  const fetchAddress = async () => {
    if (!id) {
      setError('ID alamat tidak ditemukan');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get addresses to find the specific one
      const response = await addressApi.getAddresses();

      if (response.success) {
        const foundAddress = response.data.find(addr => addr.id === id);
        if (foundAddress) {
          setAddress(foundAddress);
        } else {
          setError('Alamat tidak ditemukan');
        }
      } else {
        setError('Gagal memuat alamat');
      }
    } catch (err: any) {
      console.error('Error fetching address:', err);
      setError(err.response?.data?.error || 'Gagal memuat alamat');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = (updatedAddress: Address) => {
    updateAddress(updatedAddress.id, updatedAddress);
    navigate('/addresses');
  };

  const handleCancel = () => {
    navigate('/addresses');
  };

  useEffect(() => {
    fetchAddress();
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="md">
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
        </Container>
      </Box>
    );
  }

  if (error || !address) {
    return (
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="md">
          <Alert severity="error" sx={{ maxWidth: 600, mx: 'auto' }}>
            {error || 'Alamat tidak ditemukan'}
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
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
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/profile')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' },
            }}
          >
            <PersonIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
            Profil
          </Link>
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/addresses')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' },
            }}
          >
            <LocationIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
            Alamat
          </Link>
          <Typography variant="body2" color="text.primary">
            Edit Alamat
          </Typography>
        </Breadcrumbs>

        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
            Edit Alamat
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Ubah informasi alamat pengiriman Anda
          </Typography>
        </Box>

        {/* Address Form */}
        <AddressForm
          address={address}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </Container>
    </Box>
  );
}
