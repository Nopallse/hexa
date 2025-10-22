import React, { useState, useEffect } from 'react';
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
  Box,
  CircularProgress,
  Chip,
  useTheme,
  Button,
} from '@mui/material';
import {
  LocalShipping as ShippingIcon,
  Schedule as ScheduleIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { shippingApi } from '@/services/shippingApi';
import { locationApi } from '@/features/admin/shipping/services/locationApi';
import { useDebounce } from '@/hooks/useDebounce';
import { ShippingMethod, ShippingRatesResponse } from '../types/shipping';

// Remove duplicate interface - using imported type

interface ShippingMethodSelectorProps {
  selectedAddress: any;
  cartItems: any[];
  selectedMethod: string | null;
  onMethodSelect: (method: ShippingMethod) => void;
}

export default function ShippingMethodSelector({
  selectedAddress,
  cartItems,
  selectedMethod,
  onMethodSelect,
}: ShippingMethodSelectorProps) {
  const theme = useTheme();
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchKey, setLastFetchKey] = useState<string | null>(null);
  const [activeOrigin, setActiveOrigin] = useState<any>(null);
  const [provider, setProvider] = useState<string>('');
  const [isInternational, setIsInternational] = useState(false);

  // Calculate items for shipping calculation
  const shippingItems = React.useMemo(() => 
    cartItems.map(item => ({
      name: item.product_variant.product.name,
      description: item.product_variant.product.description || '',
      length: item.product_variant.product.length || 10, // Default 10cm if no length
      width: item.product_variant.product.width || 10, // Default 10cm if no width
      height: item.product_variant.product.height || 1, // Default 1cm if no height
      weight: item.product_variant.product.weight || item.product_variant.weight || 1000, // Use product weight first, then variant weight, then default 1kg
      quantity: item.quantity,
      value: item.product_variant.price * item.quantity
    })), [cartItems]
  );

  // Create stable address identifier
  const addressId = React.useMemo(() => 
    selectedAddress ? `${selectedAddress.id}_${selectedAddress.country}_${selectedAddress.postal_code}` : null,
    [selectedAddress?.id, selectedAddress?.country, selectedAddress?.postal_code]
  );

  // Calculate total weight for caching
  const totalWeight = React.useMemo(() => 
    shippingItems.reduce((sum, item) => sum + (item.weight * item.quantity), 0),
    [shippingItems]
  );

  // Create fetch key for caching
  const fetchKey = React.useMemo(() => {
    if (!selectedAddress || cartItems.length === 0) return null;
    return `${addressId}_${totalWeight}_${shippingItems.length}`;
  }, [addressId, totalWeight, shippingItems.length, cartItems.length]);

  // Debounce fetch key to prevent rapid API calls
  const debouncedFetchKey = useDebounce(fetchKey, 500);

  // Fetch active origin location on component mount
  useEffect(() => {
    const fetchActiveOrigin = async () => {
      try {
        const response = await locationApi.getActiveOriginLocation();
        if (response.success && response.data) {
          setActiveOrigin(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch active origin:', error);
      }
    };

    fetchActiveOrigin();
  }, []);

  // Fetch shipping rates when address is selected
  useEffect(() => {
    if (selectedAddress && cartItems.length > 0 && activeOrigin && debouncedFetchKey && debouncedFetchKey !== lastFetchKey) {
      fetchShippingRates();
    }
  }, [debouncedFetchKey, activeOrigin]);

  const fetchShippingRates = async () => {
    if (!selectedAddress || !debouncedFetchKey || !activeOrigin) return;
    
    // Prevent duplicate requests
    if (loading) return;
    
    try {
      setLoading(true);
      setError(null);
      setLastFetchKey(debouncedFetchKey);

      const response = await shippingApi.getShippingRates({
        origin_postal_code: activeOrigin.postal_code,
        destination_postal_code: selectedAddress.postal_code,
        origin_country: 'ID', // Always ID for origin
        destination_country: selectedAddress.country,
        items: shippingItems
      });

      // Check if this is still the current request
      if (debouncedFetchKey === lastFetchKey || !lastFetchKey) {
        if (response.success && response.data) {
          setShippingMethods((response.data.pricing || []) as ShippingMethod[]);
          setProvider(response.provider || '');
          setIsInternational(selectedAddress.country !== 'ID');
        } else {
          setError(response.error || 'Failed to fetch shipping rates');
        }
      }
    } catch (err: any) {
      // Check if this is still the current request
      if (debouncedFetchKey === lastFetchKey || !lastFetchKey) {
        setError(err.message || 'Failed to fetch shipping rates');
      }
    } finally {
      setLoading(false);
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      setLoading(false);
      setError(null);
    };
  }, []);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getDeliveryTime = (minDay: number, maxDay: number) => {
    if (minDay === maxDay) {
      return `${minDay} hari`;
    }
    return `${minDay}-${maxDay} hari`;
  };

  const getServiceTypeColor = (serviceType: string) => {
    switch (serviceType) {
      case 'express':
        return 'error';
      case 'standard':
        return 'primary';
      case 'economy':
        return 'success';
      default:
        return 'default';
    }
  };

  const getServiceTypeLabel = (serviceType: string) => {
    switch (serviceType) {
      case 'express':
        return 'Express';
      case 'standard':
        return 'Standard';
      case 'economy':
        return 'Economy';
      default:
        return serviceType;
    }
  };

  const getProviderInfo = (provider: string) => {
    switch (provider) {
      case 'biteship':
        return { name: 'Biteship', color: 'primary', icon: '🚚' };
      case 'fedex':
        return { name: 'FedEx', color: 'error', icon: '📦' };
      case 'fedex-estimated':
        return { name: 'FedEx (Estimated)', color: 'warning', icon: '📦' };
      case 'indonesia-estimated':
        return { name: 'Indonesia (Estimated)', color: 'info', icon: '🇮🇩' };
      default:
        return { name: 'Shipping', color: 'default', icon: '📦' };
    }
  };

  if (!selectedAddress) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info">
            Pilih alamat pengiriman terlebih dahulu untuk melihat opsi pengiriman
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ShippingIcon sx={{ fontSize: '1.5rem', mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={600}>
              Pilih Metode Pengiriman
            </Typography>
          </Box>
          {provider && (
            <Chip
              label={`${getProviderInfo(provider).icon} ${getProviderInfo(provider).name}`}
              color={getProviderInfo(provider).color as any}
              size="small"
              variant="outlined"
            />
          )}
        </Box>

        {/* Address Info */}
        <Box sx={{ mb: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Alamat Pengiriman:
          </Typography>
          <Typography variant="body1" fontWeight={500}>
            {selectedAddress.recipient_name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedAddress.address_line}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedAddress.city}, {selectedAddress.province} {selectedAddress.postal_code}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedAddress.country === 'ID' ? '🇮🇩 Indonesia' : `🌍 ${selectedAddress.country}`}
            {isInternational && (
              <Chip
                label="Internasional"
                size="small"
                color="warning"
                variant="outlined"
                sx={{ ml: 1, fontSize: '0.7rem' }}
              />
            )}
          </Typography>
        </Box>

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Mencari opsi pengiriman...
            </Typography>
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
            <Button 
              size="small" 
              onClick={fetchShippingRates}
              sx={{ ml: 2 }}
            >
              Coba Lagi
            </Button>
          </Alert>
        )}

        {/* Shipping Methods */}
        {!loading && !error && shippingMethods.length > 0 && (
          <FormControl component="fieldset" fullWidth>
            <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>
              Pilih Metode Pengiriman
            </FormLabel>
            <RadioGroup
              value={selectedMethod || ''}
              onChange={(e) => {
                const method = shippingMethods.find(m => 
                  `${m.courier_code}_${m.courier_service_code}` === e.target.value
                );
                if (method) {
                  onMethodSelect(method);
                }
              }}
            >
              <Stack spacing={2}>
                {shippingMethods.map((method) => {
                  const methodId = `${method.courier_code}_${method.courier_service_code}`;
                  const isSelected = selectedMethod === methodId;
                  
                  return (
                    <Card
                      key={methodId}
                      sx={{
                        border: isSelected ? `2px solid ${theme.palette.primary.main}` : '1px solid',
                        borderColor: isSelected ? 'primary.main' : 'grey.300',
                        backgroundColor: isSelected ? 'primary.light' : 'white',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        '&:hover': {
                          borderColor: 'primary.main',
                          backgroundColor: 'primary.light',
                        },
                      }}
                      onClick={() => {
                        const methodId = `${method.courier_code}_${method.courier_service_code}`;
                        onMethodSelect(method);
                      }}
                    >
                      <CardContent sx={{ p: 2 }}>
                        <FormControlLabel
                          value={methodId}
                          control={<Radio />}
                          label=""
                          sx={{ m: 0 }}
                        />
                        <Box sx={{ ml: 4 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {method.courier_name}
                            </Typography>
                            <Chip
                              label={getServiceTypeLabel(method.service_type)}
                              color={getServiceTypeColor(method.service_type)}
                              size="small"
                            />
                            {method.provider && method.provider !== provider && (
                              <Chip
                                label={`${getProviderInfo(method.provider).icon} ${getProviderInfo(method.provider).name}`}
                                color={getProviderInfo(method.provider).color as any}
                                size="small"
                                variant="outlined"
                              />
                            )}
                          </Box>
                          
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {method.description}
                          </Typography>
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <MoneyIcon sx={{ fontSize: '1rem', mr: 0.5, color: 'success.main' }} />
                              <Typography variant="h6" fontWeight={600} color="success.main">
                                {formatPrice(method.price)}
                              </Typography>
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <ScheduleIcon sx={{ fontSize: '1rem', mr: 0.5, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary">
                                {getDeliveryTime(method.min_day, method.max_day)}
                              </Typography>
                            </Box>
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
            </RadioGroup>
          </FormControl>
        )}

        {/* No Methods Available */}
        {!loading && !error && shippingMethods.length === 0 && (
          <Alert severity="warning">
            Tidak ada opsi pengiriman tersedia untuk alamat ini
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
