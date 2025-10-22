import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Stack,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel
} from '@mui/material';
import {
  LocalShipping,
  AccessTime,
  CheckCircle,
  Error as ErrorIcon
} from '@mui/icons-material';
import axiosInstance from '@/services/axiosInstance';

interface ShippingRate {
  courier_name: string;
  courier_code: string;
  courier_service_name: string;
  courier_service_code: string;
  description: string;
  service_type: string;
  shipping_type: string;
  shiping_duration_range: string;
  shiping_duration_unit: string;
  price: number;
  type: string;
}

interface ShippingRatesProps {
  originPostalCode: string;
  destinationPostalCode: string;
  items: Array<{
    name: string;
    description: string;
    value: number;
    length: number;
    width: number;
    height: number;
    weight: number;
    quantity: number;
  }>;
  onRateSelect?: (rate: ShippingRate) => void;
  selectedRate?: ShippingRate | null;
  disabled?: boolean;
}

export default function ShippingRates({
  originPostalCode,
  destinationPostalCode,
  items,
  onRateSelect,
  selectedRate,
  disabled = false
}: ShippingRatesProps) {
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCourier, setSelectedCourier] = useState<string>('');

  const fetchRates = async () => {
    if (!originPostalCode || !destinationPostalCode || items.length === 0) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.post('/shipping/rates', {
        origin_postal_code: originPostalCode,
        destination_postal_code: destinationPostalCode,
        couriers: 'jne,jnt,sicepat,pos,anteraja',
        items: items.map(item => ({
          name: item.name,
          description: item.description,
          value: item.value,
          length: item.length,
          width: item.width,
          height: item.height,
          weight: item.weight,
          quantity: item.quantity
        }))
      });

      if (response.data.success) {
        const ratesData = response.data.data.pricing || [];
        setRates(ratesData);
        
        // Group by courier
        const couriers = [...new Set(ratesData.map((rate: ShippingRate) => rate.courier_name))];
        if (couriers.length > 0 && !selectedCourier) {
          setSelectedCourier(couriers[0]);
        }
      } else {
        setError(response.data.error || 'Gagal memuat tarif pengiriman');
      }
    } catch (error: any) {
      console.error('Shipping rates error:', error);
      setError('Terjadi kesalahan saat memuat tarif pengiriman');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, [originPostalCode, destinationPostalCode, items]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDuration = (duration: string) => {
    return duration.replace(/\s+/g, ' ').trim();
  };

  const getCourierIcon = (courierCode: string) => {
    const icons: { [key: string]: string } = {
      'jne': '🚚',
      'jnt': '📦',
      'sicepat': '⚡',
      'pos': '📮',
      'anteraja': '🏃'
    };
    return icons[courierCode] || '🚚';
  };

  const getCourierColor = (courierCode: string) => {
    const colors: { [key: string]: string } = {
      'jne': '#FF6B35',
      'jnt': '#4CAF50',
      'sicepat': '#2196F3',
      'pos': '#FF9800',
      'anteraja': '#9C27B0'
    };
    return colors[courierCode] || '#666';
  };

  const filteredRates = rates.filter(rate => 
    !selectedCourier || rate.courier_name === selectedCourier
  );

  const couriers = [...new Set(rates.map(rate => rate.courier_name))];

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Memuat tarif pengiriman...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Gagal memuat tarif pengiriman</strong>
          <br />
          {error}
        </Typography>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={fetchRates}
          sx={{ mt: 1 }}
        >
          Coba Lagi
        </Button>
      </Alert>
    );
  }

  if (rates.length === 0) {
    return (
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          Tidak ada tarif pengiriman tersedia untuk rute ini.
        </Typography>
      </Alert>
    );
  }

  return (
    <Box>
      {/* Courier Filter */}
      {couriers.length > 1 && (
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <FormControl component="fieldset">
              <FormLabel component="legend">
                <Typography variant="subtitle2" fontWeight={600}>
                  Pilih Kurir
                </Typography>
              </FormLabel>
              <RadioGroup
                row
                value={selectedCourier}
                onChange={(e) => setSelectedCourier(e.target.value)}
              >
                {couriers.map(courier => (
                  <FormControlLabel
                    key={courier}
                    value={courier}
                    control={<Radio />}
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">{courier}</Typography>
                        <Chip 
                          label={rates.filter(r => r.courier_name === courier).length}
                          size="small"
                          variant="outlined"
                        />
                      </Box>
                    }
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </CardContent>
        </Card>
      )}

      {/* Shipping Rates */}
      <Stack spacing={2}>
        {filteredRates.map((rate, index) => (
          <Card 
            key={`${rate.courier_code}-${rate.courier_service_code}`}
            sx={{
              border: selectedRate?.courier_service_code === rate.courier_service_code 
                ? '2px solid' 
                : '1px solid',
              borderColor: selectedRate?.courier_service_code === rate.courier_service_code 
                ? 'primary.main' 
                : 'divider',
              cursor: disabled ? 'default' : 'pointer',
              '&:hover': disabled ? {} : {
                borderColor: 'primary.main',
                boxShadow: 2
              }
            }}
            onClick={() => !disabled && onRateSelect?.(rate)}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Typography variant="h6" sx={{ fontSize: '1.2rem' }}>
                      {getCourierIcon(rate.courier_code)}
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {rate.courier_service_name}
                    </Typography>
                    <Chip 
                      label={rate.courier_name}
                      size="small"
                      sx={{ 
                        backgroundColor: getCourierColor(rate.courier_code),
                        color: 'white',
                        fontWeight: 600
                      }}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {rate.description}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTime sx={{ fontSize: '1rem', color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatDuration(rate.shiping_duration_range)}
                      </Typography>
                    </Box>
                    
                    <Chip 
                      label={rate.service_type}
                      size="small"
                      variant="outlined"
                      color="secondary"
                    />
                  </Box>
                </Box>
                
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="h6" fontWeight={600} color="primary">
                    {formatPrice(rate.price)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {rate.shipping_type}
                  </Typography>
                </Box>
              </Box>
              
              {selectedRate?.courier_service_code === rate.courier_service_code && (
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1, 
                  mt: 2, 
                  pt: 2, 
                  borderTop: '1px solid',
                  borderColor: 'divider'
                }}>
                  <CheckCircle sx={{ color: 'success.main', fontSize: '1.2rem' }} />
                  <Typography variant="body2" color="success.main" fontWeight={600}>
                    Dipilih
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        ))}
      </Stack>
      
      {filteredRates.length === 0 && selectedCourier && (
        <Alert severity="info">
          <Typography variant="body2">
            Tidak ada layanan tersedia untuk kurir {selectedCourier}.
          </Typography>
        </Alert>
      )}
    </Box>
  );
}
