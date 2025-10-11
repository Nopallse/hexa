import {
  Container,
  Typography,
  Box,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Address } from '../types';
import { addressApi } from '../services/addressApi';
import { useAddressStore } from '../store/addressStore';
import AddressForm from '../components/AddressForm';

export default function EditAddressPage() {
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
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error || !address) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setError(null)}
        >
          {error || 'Alamat tidak ditemukan'}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 600, 
            color: 'text.primary',
            mb: 1
          }}
        >
          Edit Alamat
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
        >
          Ubah informasi alamat pengiriman Anda
        </Typography>
      </Box>

      {/* Address Form */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <AddressForm
            address={address}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </Container>
  );
}
