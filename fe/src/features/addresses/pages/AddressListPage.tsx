import {
  Container,
  Typography,
  Box,
  Grid,
  Alert,
  CircularProgress,
  useTheme,
  Button,
  Card,
  CardContent,
} from '@mui/material';
import {
  Add as AddIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Address } from '../types';
import { addressApi } from '../services/addressApi';
import { useAddressStore } from '../store/addressStore';
import AddressCard from '../components/AddressCard';

export default function AddressListPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    navigate('/addresses/add');
  };

  const handleEditAddress = (address: Address) => {
    navigate(`/addresses/${address.id}/edit`);
  };

  const handleDeleteAddress = (address: Address) => {
    // Address is already deleted in the component, just refresh the list
    fetchAddresses();
  };


  useEffect(() => {
    fetchAddresses();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
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
          Alamat Saya
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
        >
          Kelola alamat pengiriman Anda
        </Typography>
      </Box>

      {/* Address Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 600,
            color: 'text.primary'
          }}
        >
          Daftar Alamat
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddAddress}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500,
            backgroundColor: 'primary.main',
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
          }}
        >
          Tambah Alamat
        </Button>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Addresses List */}
      {addresses.length === 0 ? (
        /* Empty State */
        <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <LocationIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600, 
                color: 'text.primary',
                mb: 1
              }}
            >
              Belum Ada Alamat
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              Tambahkan alamat untuk memudahkan proses checkout
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddAddress}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              Tambah Alamat Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        /* Address List */
        <Grid container spacing={3}>
          {addresses.map((address) => (
            <Grid item xs={12} md={6} key={address.id}>
              <AddressCard
                address={address}
                onEdit={handleEditAddress}
                onDelete={handleDeleteAddress}
                onUpdate={fetchAddresses}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
