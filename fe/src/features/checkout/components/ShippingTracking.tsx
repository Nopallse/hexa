import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Alert,
  CircularProgress,
  Chip,
  useTheme,
  Button,
  Stepper,
  Step,
  StepLabel,
  useMediaQuery,
} from '@mui/material';
import {
  LocalShipping as ShippingIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
} from '@mui/icons-material';
import { shippingApi } from '@/services/shippingApi';
import { TrackingResponse, TrackingEvent } from '../types/shipping';

interface ShippingTrackingProps {
  trackingNumber: string;
  courier?: string;
  onClose?: () => void;
}

export default function ShippingTracking({ 
  trackingNumber, 
  courier, 
  onClose 
}: ShippingTrackingProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [trackingData, setTrackingData] = useState<TrackingResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [provider, setProvider] = useState<string>('');

  useEffect(() => {
    if (trackingNumber) {
      fetchTrackingData();
    }
  }, [trackingNumber, courier]);

  const fetchTrackingData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await shippingApi.trackShipment(trackingNumber, courier);
      
      if (response.success && response.data) {
        setTrackingData(response.data);
        setProvider(response.provider || '');
      } else {
        setError(response.error || 'Failed to fetch tracking data');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tracking data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'in_transit':
        return 'primary';
      case 'picked_up':
        return 'info';
      case 'cancelled':
        return 'error';
      case 'exception':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircleIcon />;
      case 'in_transit':
        return <ShippingIcon />;
      case 'picked_up':
        return <ScheduleIcon />;
      default:
        return <LocationIcon />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Menunggu';
      case 'picked_up':
        return 'Diambil';
      case 'in_transit':
        return 'Dalam Perjalanan';
      case 'delivered':
        return 'Terkirim';
      case 'cancelled':
        return 'Dibatalkan';
      case 'exception':
        return 'Ada Masalah';
      default:
        return status;
    }
  };



  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            py: { xs: 3, sm: 4 },
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 1, sm: 2 }
          }}>
            <CircularProgress size={24} />
            <Typography 
              variant="body2" 
              sx={{ 
                ml: { xs: 0, sm: 2 },
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              Mencari informasi tracking...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Alert 
            severity="error" 
            action={
              <Button 
                size="small" 
                onClick={fetchTrackingData} 
                startIcon={<RefreshIcon />}
                sx={{
                  fontSize: { xs: '0.75rem', sm: '0.875rem' }
                }}
              >
                Coba Lagi
              </Button>
            }
            sx={{ 
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!trackingData) {
    return (
      <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Alert 
            severity="info"
            sx={{ 
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            Tidak ada data tracking tersedia
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          mb: { xs: 2, sm: 3 },
          flexWrap: 'wrap',
          gap: 1
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ShippingIcon sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, mr: 1, color: 'primary.main' }} />
            <Typography 
              variant="h6" 
              fontWeight={600}
              sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              Tracking Pengiriman
            </Typography>
          </Box>
       
        </Box>

        {/* Tracking Info */}
        <Box sx={{ 
          mb: { xs: 2, sm: 3 }, 
          p: { xs: 1.5, sm: 2 }, 
          backgroundColor: 'grey.50', 
          borderRadius: 2 
        }}>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 1,
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          >
            Nomor Tracking:
          </Typography>
          <Typography 
            variant="h6" 
            fontWeight={600} 
            sx={{ 
              mb: { xs: 1.5, sm: 2 },
              fontSize: { xs: '1rem', sm: '1.25rem' }
            }}
          >
            {trackingData.tracking_number}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 2 }, flexWrap: 'wrap' }}>
            <Chip
              label={getStatusLabel(trackingData.status)}
              color={getStatusColor(trackingData.status) as any}
              icon={getStatusIcon(trackingData.status)}
              variant="filled"
              sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.875rem' },
                height: { xs: 24, sm: 28 }
              }}
            />
            {trackingData.carrier && (
              <Chip
                label={trackingData.carrier}
                variant="outlined"
                size="small"
                sx={{ 
                  fontSize: { xs: '0.65rem', sm: '0.75rem' },
                  height: { xs: 20, sm: 24 }
                }}
              />
            )}
          </Box>
          
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mt: 1,
              fontSize: { xs: '0.75rem', sm: '0.875rem' }
            }}
          >
            {trackingData.message}
          </Typography>
          
          {trackingData.estimated_delivery && (
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ 
                mt: 1,
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            >
              Estimasi Pengiriman: {formatDate(trackingData.estimated_delivery)}
            </Typography>
          )}
        </Box>

        {/* Tracking Events */}
        {trackingData.events && trackingData.events.length > 0 && (
          <Box>
            <Typography 
              variant="subtitle1" 
              fontWeight={600} 
              sx={{ 
                mb: { xs: 1.5, sm: 2 },
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              Riwayat Pengiriman
            </Typography>
            
            <Stepper 
              orientation="vertical" 
              sx={{ 
                '& .MuiStepLabel-root': { alignItems: 'flex-start' },
                '& .MuiStepContent-root': { ml: { xs: 2, sm: 3 } }
              }}
            >
              {trackingData.events.map((event: TrackingEvent, index: number) => (
                <Step key={index} active={index === 0} completed={index > 0}>
                  <StepLabel
                    StepIconComponent={() => (
                      <Box
                        sx={{ 
                          width: { xs: 20, sm: 24 },
                          height: { xs: 20, sm: 24 },
                          borderRadius: '50%',
                          bgcolor: index === 0 ? 'primary.main' : 'grey.300',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                        }}
                      >
                        {index === 0 ? (
                          <CheckCircleIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                        ) : (
                          <RadioButtonUncheckedIcon sx={{ fontSize: { xs: 16, sm: 20 } }} />
                        )}
                      </Box>
                    )}
                  >
                    <Box>
                      <Typography 
                        variant="body2" 
                        fontWeight={600} 
                        sx={{ 
                          mb: 0.5,
                          fontSize: { xs: '0.875rem', sm: '1rem' }
                        }}
                      >
                        {event.description}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 0.5,
                          fontSize: { xs: '0.75rem', sm: '0.875rem' }
                        }}
                      >
                        {event.location}
                      </Typography>
                      {event.details && (
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          sx={{ 
                            mb: 0.5,
                            fontSize: { xs: '0.75rem', sm: '0.875rem' }
                          }}
                        >
                          {event.details}
                        </Typography>
                      )}
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          mt: 0.5,
                          fontSize: { xs: '0.7rem', sm: '0.75rem' },
                          fontStyle: 'italic'
                        }}
                      >
                        {formatDate(event.timestamp)}
                      </Typography>
                    </Box>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        )}

        {/* No Events */}
        {(!trackingData.events || trackingData.events.length === 0) && (
          <Alert 
            severity="info"
            sx={{ 
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            Belum ada riwayat pengiriman tersedia
          </Alert>
        )}

        {/* Actions */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          mt: { xs: 2, sm: 3 }, 
          gap: { xs: 1, sm: 2 },
          flexWrap: 'wrap'
        }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchTrackingData}
            disabled={loading}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: { xs: '0.875rem', sm: '1rem' },
              minHeight: { xs: 40, sm: 44 },
            }}
          >
            Refresh
          </Button>
          {onClose && (
            <Button 
              variant="contained" 
              onClick={onClose}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                fontSize: { xs: '0.875rem', sm: '1rem' },
                minHeight: { xs: 40, sm: 44 },
              }}
            >
              Tutup
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
