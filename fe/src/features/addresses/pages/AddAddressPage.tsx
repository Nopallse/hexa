import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Address } from '../types';
import { useAddressStore } from '../store/addressStore';
import AddressForm from '../components/AddressForm';

export default function AddAddressPage() {
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
          Tambah Alamat Baru
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
        >
          Tambahkan alamat pengiriman baru untuk memudahkan proses checkout
        </Typography>
      </Box>

      {/* Address Form */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <AddressForm
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </Container>
  );
}
