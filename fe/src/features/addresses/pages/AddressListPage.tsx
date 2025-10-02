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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  Home,
  Person as PersonIcon,
  Add as AddIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Address } from '../types';
import { addressApi } from '../services/addressApi';
import { useAddressStore } from '../store/addressStore';
import AddressCard from '../components/AddressCard';
import AddressForm from '../components/AddressForm';

export default function AddressListPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const { addresses, setAddresses, addAddress, updateAddress, removeAddress } = useAddressStore();

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await addressApi.getAddresses();

      if (response.success) {
        setAddresses(response.data);
      } else {
        setError('Gagal memuat alamat');
      }
    } catch (err: any) {
      console.error('Error fetching addresses:', err);
      setError(err.response?.data?.error || 'Gagal memuat alamat');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = () => {
    setEditingAddress(null);
    setShowForm(true);
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setShowForm(true);
  };

  const handleDeleteAddress = (address: Address) => {
    // Address is already deleted in the component, just refresh the list
    fetchAddresses();
  };

  const handleFormSuccess = (address: Address) => {
    if (editingAddress) {
      updateAddress(address.id, address);
    } else {
      addAddress(address);
    }
    setShowForm(false);
    setEditingAddress(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingAddress(null);
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="lg">
          <Stack spacing={2}>
            {[...Array(3)].map((_, index) => (
              <Skeleton key={index} variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
            ))}
          </Stack>
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
          <Typography variant="body2" color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <LocationIcon sx={{ mr: 0.5, fontSize: '1rem' }} />
            Alamat
          </Typography>
        </Breadcrumbs>

        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                Daftar Alamat
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Kelola alamat pengiriman Anda
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddAddress}
              sx={{ borderRadius: 2 }}
            >
              Tambah Alamat
            </Button>
          </Stack>
        </Box>

        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Addresses List */}
        {addresses.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              px: 4,
              borderRadius: 3,
              background: 'linear-gradient(135deg, #faf8ff 0%, #f0f4ff 100%)',
              border: `1px solid ${theme.palette.primary.light}20`,
            }}
          >
            <LocationIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" fontWeight={600} sx={{ mb: 1 }}>
              Belum Ada Alamat
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Tambahkan alamat pengiriman untuk memudahkan proses checkout
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddAddress}
              sx={{ borderRadius: 2 }}
            >
              Tambah Alamat Pertama
            </Button>
          </Box>
        ) : (
          <Stack spacing={3}>
            {addresses.map((address) => (
              <AddressCard
                key={address.id}
                address={address}
                onEdit={handleEditAddress}
                onDelete={handleDeleteAddress}
                onUpdate={fetchAddresses}
              />
            ))}
          </Stack>
        )}

        {/* Address Form Dialog */}
        <Dialog
          open={showForm}
          onClose={handleFormCancel}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 3 }
          }}
        >
          <DialogTitle>
            <Typography variant="h6" fontWeight={600}>
              {editingAddress ? 'Edit Alamat' : 'Tambah Alamat Baru'}
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 0 }}>
            <AddressForm
              address={editingAddress || undefined}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </DialogContent>
        </Dialog>
      </Container>
    </Box>
  );
}
