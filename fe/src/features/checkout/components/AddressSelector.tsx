import {
  Card,
  CardContent,
  Typography,
  Stack,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Button,
  useTheme,
  Box,
  Skeleton,
} from '@mui/material';
import {
  Add as AddIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Address } from '@/features/addresses/types';
import { addressApi } from '@/features/addresses/services/addressApi';

interface AddressSelectorProps {
  selectedAddress: string | null;
  onAddressSelect: (addressId: string) => void;
  onAddressesLoaded?: (addresses: Address[]) => void;
}

export default function AddressSelector({ selectedAddress, onAddressSelect, onAddressesLoaded }: AddressSelectorProps) {
  const theme = useTheme();
  const navigate = useNavigate();
  
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use refs to store callback functions to prevent re-renders
  const onAddressSelectRef = useRef(onAddressSelect);
  const onAddressesLoadedRef = useRef(onAddressesLoaded);

  // Update refs when props change
  useEffect(() => {
    onAddressSelectRef.current = onAddressSelect;
    onAddressesLoadedRef.current = onAddressesLoaded;
  }, [onAddressSelect, onAddressesLoaded]);

  // Fetch addresses from API
  useEffect(() => {
    const fetchAddresses = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await addressApi.getAddresses();

        if (response.success) {
          setAddresses(response.data);
          onAddressesLoadedRef.current?.(response.data);
          
          // Auto-select primary address
          const primaryAddress = response.data.find(addr => addr.is_primary);
          if (primaryAddress && !selectedAddress) {
            onAddressSelectRef.current(primaryAddress.id);
          }
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

    fetchAddresses();
  }, []); // Empty dependency array - only run once

  const handleAddAddress = () => {
    navigate('/addresses/add', { state: { returnTo: '/checkout' } });
  };

  if (loading) {
    return (
      <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'text.primary' }}>
            Alamat Pengiriman
          </Typography>
          <Stack spacing={2}>
            {[...Array(2)].map((_, index) => (
              <Skeleton key={index} variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
            ))}
          </Stack>
        </CardContent>
      </Card>
    );
  }

  if (addresses.length === 0) {
    return (
      <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2, color: 'text.primary' }}>
            Alamat Pengiriman
          </Typography>
          <Alert severity="info" sx={{ mb: 2, borderRadius: 2 }}>
            Anda belum memiliki alamat pengiriman. Silakan tambahkan alamat terlebih dahulu.
          </Alert>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddAddress}
            fullWidth
            sx={{
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              backgroundColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            }}
          >
            Tambah Alamat
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600} sx={{ color: 'text.primary' }}>
            Alamat Pengiriman
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleAddAddress}
            sx={{
              borderRadius: 2,
              fontWeight: 500,
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.light',
                borderColor: 'primary.dark',
              },
            }}
          >
            Tambah Alamat
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <FormControl component="fieldset" fullWidth>
          <RadioGroup
            value={selectedAddress || ''}
            onChange={(e) => onAddressSelect(e.target.value)}
          >
            {addresses.map((address) => (
              <FormControlLabel
                key={address.id}
                value={address.id}
                control={<Radio />}
                label={
                  <Box
                    sx={{
                      p: 2,
                      border: selectedAddress === address.id 
                        ? `2px solid ${theme.palette.primary.main}` 
                        : `1px solid ${theme.palette.grey[200]}`,
                      borderRadius: 2,
                      backgroundColor: selectedAddress === address.id 
                        ? theme.palette.primary.light + '10' 
                        : 'grey.50',
                      transition: 'all 0.2s ease',
                      width: '100%',
                      '&:hover': {
                        backgroundColor: selectedAddress === address.id 
                          ? theme.palette.primary.light + '15' 
                          : 'grey.100',
                      },
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="flex-start">
                      <LocationIcon 
                        color="primary" 
                        sx={{ mt: 0.5, flexShrink: 0 }} 
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {address.address_line}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {address.city}, {address.province} {address.postal_code}
                        </Typography>
                        {address.is_primary && (
                          <Box
                            sx={{
                              display: 'inline-block',
                              backgroundColor: theme.palette.primary.main,
                              color: 'white',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              mt: 1,
                            }}
                          >
                            Utama
                          </Box>
                        )}
                      </Box>
                    </Stack>
                  </Box>
                }
                sx={{
                  width: '100%',
                  margin: 0,
                  '& .MuiFormControlLabel-label': {
                    width: '100%',
                  },
                }}
              />
            ))}
          </RadioGroup>
        </FormControl>
      </CardContent>
    </Card>
  );
}
