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
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineOppositeContent,
} from '@mui/material';
import {
  LocalShipping as ShippingIcon,
  ExpandMore as ExpandMoreIcon,
  Refresh as RefreshIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
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

  const getProviderInfo = (provider: string) => {
    switch (provider) {
      case 'biteship':
        return { name: 'Biteship', color: 'primary', icon: '🚚' };
      case 'fedex':
        return { name: 'FedEx', color: 'error', icon: '📦' };
      default:
        return { name: 'Shipping', color: 'default', icon: '📦' };
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
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
            <CircularProgress size={24} />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Mencari informasi tracking...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert 
            severity="error" 
            action={
              <Button size="small" onClick={fetchTrackingData} startIcon={<RefreshIcon />}>
                Coba Lagi
              </Button>
            }
          >
            {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!trackingData) {
    return (
      <Card>
        <CardContent>
          <Alert severity="info">
            Tidak ada data tracking tersedia
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
              Tracking Pengiriman
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

        {/* Tracking Info */}
        <Box sx={{ mb: 3, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Nomor Tracking:
          </Typography>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            {trackingData.tracking_number}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Chip
              label={getStatusLabel(trackingData.status)}
              color={getStatusColor(trackingData.status) as any}
              icon={getStatusIcon(trackingData.status)}
              variant="filled"
            />
            {trackingData.carrier && (
              <Chip
                label={trackingData.carrier}
                variant="outlined"
                size="small"
              />
            )}
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {trackingData.message}
          </Typography>
          
          {trackingData.estimated_delivery && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Estimasi Pengiriman: {formatDate(trackingData.estimated_delivery)}
            </Typography>
          )}
        </Box>

        {/* Tracking Events */}
        {trackingData.events && trackingData.events.length > 0 && (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
              Riwayat Pengiriman
            </Typography>
            
            <Timeline>
              {trackingData.events.map((event: TrackingEvent, index: number) => (
                <TimelineItem key={index}>
                  <TimelineOppositeContent
                    sx={{ m: 'auto 0' }}
                    align="right"
                    variant="body2"
                    color="text.secondary"
                  >
                    {formatDate(event.timestamp)}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color={getStatusColor(event.status) as any}>
                      {getStatusIcon(event.status)}
                    </TimelineDot>
                    {index < trackingData.events.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent sx={{ py: '12px', px: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {event.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {event.location}
                    </Typography>
                    {event.details && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {event.details}
                      </Typography>
                    )}
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </Box>
        )}

        {/* No Events */}
        {(!trackingData.events || trackingData.events.length === 0) && (
          <Alert severity="info">
            Belum ada riwayat pengiriman tersedia
          </Alert>
        )}

        {/* Actions */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3, gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchTrackingData}
            disabled={loading}
          >
            Refresh
          </Button>
          {onClose && (
            <Button variant="contained" onClick={onClose}>
              Tutup
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
