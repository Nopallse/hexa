import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Chip,
  Alert,
  CircularProgress,
  useTheme,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  LocalShipping as ShippingIcon,
} from '@mui/icons-material';
import { useShippingConfig } from '../hooks/useShippingConfig';

export default function ShippingConfigStatus() {
  const theme = useTheme();
  const { config, loading, error } = useShippingConfig();

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" sx={{ ml: 2 }}>
              Checking shipping configuration...
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
          <Alert severity="error">
            Failed to check shipping configuration: {error}
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!config) {
    return null;
  }

  const getStatusIcon = (configured: boolean) => {
    return configured ? (
      <CheckCircleIcon color="success" />
    ) : (
      <ErrorIcon color="error" />
    );
  };

  const getStatusColor = (configured: boolean) => {
    return configured ? 'success' : 'error';
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <ShippingIcon sx={{ fontSize: '1.5rem', mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" fontWeight={600}>
            Shipping Configuration
          </Typography>
        </Box>

        <Stack spacing={2}>
          {/* Biteship Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {getStatusIcon(config.biteshipConfigured)}
              <Typography variant="body1" sx={{ ml: 1 }}>
                Biteship (Local Shipping)
              </Typography>
            </Box>
            <Chip
              label={config.biteshipConfigured ? 'Configured' : 'Not Configured'}
              color={getStatusColor(config.biteshipConfigured) as any}
              size="small"
            />
          </Box>

          {/* FedEx Status */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {getStatusIcon(config.fedexConfigured)}
              <Typography variant="body1" sx={{ ml: 1 }}>
                FedEx (International Shipping)
              </Typography>
            </Box>
            <Chip
              label={config.fedexConfigured ? 'Configured' : 'Not Configured'}
              color={getStatusColor(config.fedexConfigured) as any}
              size="small"
            />
          </Box>

          {/* Messages */}
          <Box sx={{ mt: 2 }}>
            {config.message.biteship && (
              <Alert 
                severity={config.biteshipConfigured ? 'success' : 'warning'} 
                sx={{ mb: 1 }}
              >
                <Typography variant="body2">
                  <strong>Biteship:</strong> {config.message.biteship}
                </Typography>
              </Alert>
            )}
            
            {config.message.fedex && (
              <Alert 
                severity={config.fedexConfigured ? 'success' : 'info'} 
                sx={{ mb: 1 }}
              >
                <Typography variant="body2">
                  <strong>FedEx:</strong> {config.message.fedex}
                </Typography>
              </Alert>
            )}
          </Box>

          {/* Overall Status */}
          <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Shipping Coverage:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {config.biteshipConfigured && (
                <Chip
                  label="🇮🇩 Indonesia"
                  color="primary"
                  size="small"
                  icon={<CheckCircleIcon />}
                />
              )}
              {config.fedexConfigured && (
                <Chip
                  label="🌍 International"
                  color="error"
                  size="small"
                  icon={<CheckCircleIcon />}
                />
              )}
              {!config.biteshipConfigured && !config.fedexConfigured && (
                <Chip
                  label="⚠️ No Shipping Available"
                  color="error"
                  size="small"
                  icon={<WarningIcon />}
                />
              )}
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
