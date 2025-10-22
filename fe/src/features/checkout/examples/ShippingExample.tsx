import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Stack,
  TextField,
  Alert,
  useTheme,
} from '@mui/material';
import {
  LocalShipping as ShippingIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import ShippingMethodSelector from '../components/ShippingMethodSelector';
import ShippingTracking from '../components/ShippingTracking';
import ShippingConfigStatus from '../components/ShippingConfigStatus';

// Mock data for testing
const mockAddresses = [
  {
    id: '1',
    recipient_name: 'John Doe',
    address_line: 'Jl. Sudirman No. 123',
    city: 'Jakarta',
    province: 'DKI Jakarta',
    postal_code: '12190',
    country: 'ID',
  },
  {
    id: '2',
    recipient_name: 'Jane Smith',
    address_line: '123 Main Street',
    city: 'New York',
    province: 'NY',
    postal_code: '10001',
    country: 'US',
  },
];

const mockCartItems = [
  {
    product_variant: {
      product: {
        name: 'Test Product',
        description: 'Test Description',
        weight: 1000,
        length: 10,
        width: 10,
        height: 5,
        deleted_at: null,
      },
      variant_name: 'Variant 1',
      price: 100000,
    },
    quantity: 2,
  },
];

export default function ShippingExample() {
  const theme = useTheme();
  const [selectedAddress, setSelectedAddress] = useState(mockAddresses[0]);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [showTracking, setShowTracking] = useState(false);

  const handleAddressChange = (addressId: string) => {
    const address = mockAddresses.find(addr => addr.id === addressId);
    if (address) {
      setSelectedAddress(address);
      setSelectedMethod(null);
    }
  };

  const handleMethodSelect = (method: any) => {
    setSelectedMethod(`${method.courier_code}_${method.courier_service_code}`);
    console.log('Selected method:', method);
  };

  const handleTrackingSearch = () => {
    if (trackingNumber.trim()) {
      setShowTracking(true);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={600} sx={{ mb: 4 }}>
        Shipping Integration Example
      </Typography>

      <Stack spacing={4}>
        {/* Configuration Status */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Configuration Status
            </Typography>
            <ShippingConfigStatus />
          </CardContent>
        </Card>

        {/* Address Selection */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Address Selection
            </Typography>
            <Stack direction="row" spacing={2}>
              {mockAddresses.map((address) => (
                <Button
                  key={address.id}
                  variant={selectedAddress.id === address.id ? 'contained' : 'outlined'}
                  onClick={() => handleAddressChange(address.id)}
                  sx={{ minWidth: 200 }}
                >
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="body2" fontWeight={600}>
                      {address.recipient_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {address.city}, {address.country}
                    </Typography>
                  </Box>
                </Button>
              ))}
            </Stack>
          </CardContent>
        </Card>

        {/* Shipping Method Selection */}
        <ShippingMethodSelector
          selectedAddress={selectedAddress}
          cartItems={mockCartItems}
          selectedMethod={selectedMethod}
          onMethodSelect={handleMethodSelect}
        />

        {/* Tracking Section */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Tracking Test
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
              <TextField
                label="Tracking Number"
                placeholder="Enter tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                sx={{ flex: 1 }}
              />
              <Button
                variant="contained"
                startIcon={<SearchIcon />}
                onClick={handleTrackingSearch}
                disabled={!trackingNumber.trim()}
              >
                Track
              </Button>
            </Stack>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Test tracking numbers:</strong><br />
                • FedEx: 123456789012, 1234-5678-9012<br />
                • Biteship: JNE1234567890, JNT1234567890
              </Typography>
            </Alert>

            {showTracking && trackingNumber && (
              <Box sx={{ mt: 2 }}>
                <ShippingTracking
                  trackingNumber={trackingNumber}
                  onClose={() => setShowTracking(false)}
                />
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Selected Method Info */}
        {selectedMethod && (
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Selected Shipping Method
              </Typography>
              <Alert severity="success">
                Method selected: {selectedMethod}
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Usage Instructions */}
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Usage Instructions
            </Typography>
            <Stack spacing={2}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>1. Local Shipping (Indonesia):</strong> Select Jakarta address to see Biteship rates
                </Typography>
              </Alert>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>2. International Shipping:</strong> Select New York address to see FedEx rates
                </Typography>
              </Alert>
              <Alert severity="warning">
                <Typography variant="body2">
                  <strong>3. Tracking:</strong> Use test tracking numbers to see different providers
                </Typography>
              </Alert>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
