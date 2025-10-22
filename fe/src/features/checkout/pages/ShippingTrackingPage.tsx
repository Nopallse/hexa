import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Stack,
  Alert,
  Card,
  CardContent,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import ShippingTracking from '../components/ShippingTracking';
import ShippingConfigStatus from '../components/ShippingConfigStatus';

export default function ShippingTrackingPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courier, setCourier] = useState('');
  const [showTracking, setShowTracking] = useState(false);

  const handleSearch = () => {
    if (trackingNumber.trim()) {
      setShowTracking(true);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        {/* Page Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={600} sx={{ mb: 1, color: 'text.primary' }}>
            Tracking Pengiriman
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Lacak status pengiriman Anda dengan nomor tracking
          </Typography>
        </Box>

        {/* Configuration Status */}
        <Box sx={{ mb: 4 }}>
          <ShippingConfigStatus />
        </Box>

        {/* Search Form */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
              Cari Tracking
            </Typography>
            
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Nomor Tracking"
                placeholder="Masukkan nomor tracking"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                onKeyPress={handleKeyPress}
                helperText="Masukkan nomor tracking yang Anda terima dari email atau SMS"
              />
              
              <TextField
                fullWidth
                label="Kurir (Opsional)"
                placeholder="fedex, jne, jnt, dll"
                value={courier}
                onChange={(e) => setCourier(e.target.value)}
                helperText="Kosongkan untuk deteksi otomatis kurir"
              />
              
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleSearch}
                disabled={!trackingNumber.trim()}
                size="large"
                sx={{ alignSelf: 'flex-start' }}
              >
                Cari Tracking
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Tracking Results */}
        {showTracking && trackingNumber && (
          <Box sx={{ mb: 4 }}>
            <ShippingTracking
              trackingNumber={trackingNumber}
              courier={courier || undefined}
              onClose={() => setShowTracking(false)}
            />
          </Box>
        )}

        {/* Help Section */}
        <Card>
          <CardContent>
            <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
              Bantuan Tracking
            </Typography>
            
            <Stack spacing={2}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Untuk pengiriman lokal (Indonesia):</strong> Gunakan nomor tracking dari Biteship, JNE, J&T, SiCepat, dll.
                </Typography>
              </Alert>
              
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Untuk pengiriman internasional:</strong> Gunakan nomor tracking FedEx atau pilih "fedex" sebagai kurir.
                </Typography>
              </Alert>
              
              <Alert severity="warning">
                <Typography variant="body2">
                  <strong>Catatan:</strong> Sistem akan otomatis mendeteksi kurir berdasarkan format nomor tracking. Anda juga bisa memilih kurir secara manual.
                </Typography>
              </Alert>
            </Stack>
          </CardContent>
        </Card>

        {/* Back to Home */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
          >
            Kembali ke Beranda
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
