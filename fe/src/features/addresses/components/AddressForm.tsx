import {
  Box,
  TextField,
  Button,
  Stack,
  FormControlLabel,
  Switch,
  useTheme,
  Alert,
} from '@mui/material';
import { useState } from 'react';
import { Address, CreateAddressRequest, UpdateAddressRequest } from '../types';
import { addressApi } from '../services/addressApi';

interface AddressFormProps {
  address?: Address;
  onSuccess: (address: Address) => void;
  onCancel: () => void;
}

export default function AddressForm({ address, onSuccess, onCancel }: AddressFormProps) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    address_line: address?.address_line || '',
    city: address?.city || '',
    province: address?.province || '',
    postal_code: address?.postal_code || '',
    is_primary: address?.is_primary || false,
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.address_line.trim() || !formData.city.trim() || 
        !formData.province.trim() || !formData.postal_code.trim()) {
      setError('Semua field harus diisi');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let response;
      if (address) {
        // Update existing address
        const updateData: UpdateAddressRequest = {
          address_line: formData.address_line,
          city: formData.city,
          province: formData.province,
          postal_code: formData.postal_code,
          is_primary: formData.is_primary,
        };
        response = await addressApi.updateAddress(address.id, updateData);
      } else {
        // Create new address
        const createData: CreateAddressRequest = {
          address_line: formData.address_line,
          city: formData.city,
          province: formData.province,
          postal_code: formData.postal_code,
          is_primary: formData.is_primary,
        };
        response = await addressApi.addAddress(createData);
      }

      if (response.success) {
        onSuccess(response.data);
      }
    } catch (err: any) {
      console.error('Error saving address:', err);
      setError(err.response?.data?.error || 'Gagal menyimpan alamat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: 3,
        border: `1px solid ${theme.palette.grey[300]}`,
        borderRadius: 2,
        backgroundColor: '#f8f9fa',
      }}
    >
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Stack spacing={3}>
        <TextField
          label="Alamat Lengkap"
          value={formData.address_line}
          onChange={(e) => handleInputChange('address_line', e.target.value)}
          fullWidth
          required
          multiline
          rows={3}
          placeholder="Jl. Contoh No. 123, RT 01/RW 02"
        />

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            label="Kota"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            fullWidth
            required
            placeholder="Jakarta Pusat"
          />
          
          <TextField
            label="Provinsi"
            value={formData.province}
            onChange={(e) => handleInputChange('province', e.target.value)}
            fullWidth
            required
            placeholder="DKI Jakarta"
          />
        </Stack>

        <TextField
          label="Kode Pos"
          value={formData.postal_code}
          onChange={(e) => handleInputChange('postal_code', e.target.value)}
          fullWidth
          required
          placeholder="10270"
        />

        <FormControlLabel
          control={
            <Switch
              checked={formData.is_primary}
              onChange={(e) => handleInputChange('is_primary', e.target.checked)}
              color="primary"
            />
          }
          label="Set sebagai alamat utama"
        />

        <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            sx={{
              flex: 1,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            {loading ? 'Menyimpan...' : (address ? 'Update Alamat' : 'Tambah Alamat')}
          </Button>
          
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={loading}
            sx={{
              flex: 1,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            Batal
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
