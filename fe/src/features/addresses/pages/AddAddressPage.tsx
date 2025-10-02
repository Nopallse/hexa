import {
  Container,
  Typography,
  Box,
  Stack,
  useTheme,
  Breadcrumbs,
  Link,
  Card,
  CardContent,
} from '@mui/material';
import {
  Home,
  Person as PersonIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Address } from '../types';
import { useAddressStore } from '../store/addressStore';
import AddressForm from '../components/AddressForm';

export default function AddAddressPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { addAddress } = useAddressStore();

  const handleSuccess = (address: Address) => {
    addAddress(address);
    navigate('/addresses');
  };

  const handleCancel = () => {
    navigate('/addresses');
  };

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
            Tambah Alamat
          </Typography>
        </Breadcrumbs>

        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
            Tambah Alamat Baru
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Tambahkan alamat pengiriman baru untuk memudahkan proses checkout
          </Typography>
        </Box>

        {/* Address Form */}
        <AddressForm
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </Container>
    </Box>
  );
}
