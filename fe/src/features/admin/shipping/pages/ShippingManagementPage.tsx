import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Breadcrumbs,
  Link,
  Alert,
  Button,
  Card,
  CardContent,
  Stack,
  Divider,
  Chip,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import { 
  Home as HomeIcon, 
  LocalShipping as ShippingIcon,
  LocationOn as LocationOnIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  LocalShippingOutlined as ShippingOutlinedIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { locationApi } from '../services/locationApi';
import { shippingApi, ShippingStats, ShippingData } from '../services/shippingApi';
import { Location } from '../types';
import LocationForm from '../components/LocationForm';
import Loading from '@/components/ui/Loading';
import { useUiStore } from '@/store/uiStore';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'delivered':
      return 'success';
    case 'in_transit':
      return 'info';
    case 'pending':
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
      return <ShippingOutlinedIcon />;
    case 'pending':
      return <ScheduleIcon />;
    default:
      return <ScheduleIcon />;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'delivered':
      return 'Terkirim';
    case 'in_transit':
      return 'Dalam Perjalanan';
    case 'pending':
      return 'Menunggu Pengiriman';
    default:
      return 'Unknown';
  }
};

export default function ShippingManagementPage() {
  const navigate = useNavigate();
  const { showNotification } = useUiStore();
  
  const [activeOrigin, setActiveOrigin] = useState<Location | null>(null);
  const [shippingStats, setShippingStats] = useState<ShippingStats | null>(null);
  const [shippingData, setShippingData] = useState<ShippingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [apiConfigStatus, setApiConfigStatus] = useState<{ biteshipConfigured: boolean; message: string } | null>(null);

  const fetchActiveOrigin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await locationApi.getActiveOriginLocation();
      
      if (response.success) {
        setActiveOrigin(response.data);
      } else {
        throw new Error('Failed to fetch active origin');
      }
    } catch (error: any) {
      setError(error.message || 'Gagal memuat data lokasi origin');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchShippingStats = async () => {
    try {
      const response = await shippingApi.getShippingStats();
      
      if (response.success && response.data) {
        setShippingStats(response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch shipping stats:', error);
    }
  };

  const fetchShippingData = async () => {
    try {
      const response = await shippingApi.getShippingData({ limit: 10 });
      
      if (response.success && response.data) {
        setShippingData(response.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch shipping data:', error);
    }
  };

  const fetchApiConfigStatus = async () => {
    try {
      const response = await locationApi.checkConfigStatus();
      
      if (response.success && response.data) {
        setApiConfigStatus({
          biteshipConfigured: response.data.biteshipConfigured,
          message: response.data.message
        });
      }
    } catch (error: any) {
      console.error('Failed to fetch API config status:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([
        fetchActiveOrigin(),
        fetchShippingStats(),
        fetchShippingData(),
        fetchApiConfigStatus(),
      ]);
    };
    
    loadData();
  }, []);

  const handleUpdateLocation = async (data: any) => {
    if (!editingLocation) return;

    try {
      setIsSubmitting(true);
      setError(null);
      
      const response = await locationApi.updateLocation(editingLocation.id, data);
      
      if (response.success) {
        showNotification({
          type: 'success',
          message: 'Lokasi origin berhasil diperbarui',
        });
        
        setEditingLocation(null);
        await fetchActiveOrigin();
      } else {
        throw new Error('Failed to update location');
      }
    } catch (error: any) {
      setError(error.message || 'Gagal memperbarui lokasi');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditLocation = () => {
    if (activeOrigin) {
      setEditingLocation(activeOrigin);
    }
  };

  const handleCancelForm = () => {
    setEditingLocation(null);
    setError(null);
  };

  const handleRefresh = async () => {
    await Promise.all([
      fetchActiveOrigin(),
      fetchShippingStats(),
      fetchShippingData(),
      fetchApiConfigStatus(),
    ]);
  };

  if (isLoading) {
    return <Loading message="Memuat data lokasi origin..." />;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 4 }}>
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate('/admin')}
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 0.5,
            color: 'text.secondary',
            textDecoration: 'none',
            '&:hover': {
              color: 'primary.main',
              textDecoration: 'underline'
            }
          }}
        >
          <HomeIcon fontSize="small" />
          Dashboard
        </Link>
        <Typography variant="body2" color="textPrimary" sx={{ fontWeight: 500 }}>
          Pengiriman
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <ShippingIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />
            <Typography variant="h4" fontWeight={700} color="text.primary" className="craft-heading">
              Manajemen Pengiriman
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              fontWeight: 500,
              textTransform: 'none',
              borderColor: 'primary.main',
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'rgba(150, 130, 219, 0.05)',
                borderColor: 'primary.dark'
              }
            }}
          >
            Refresh Data
          </Button>
        </Box>
        <Typography variant="body1" color="text.secondary" className="craft-body">
          Kelola lokasi origin, statistik pengiriman, dan tracking order
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            backgroundColor: 'error.light',
            color: 'error.dark',
            border: '1px solid',
            borderColor: 'error.main'
          }}
        >
          {error}
        </Alert>
      )}

      {/* API Configuration Status Alert */}
      {apiConfigStatus && !apiConfigStatus.biteshipConfigured && (
        <Alert 
          severity="warning" 
          sx={{ 
            mb: 3,
            borderRadius: 2,
            backgroundColor: 'warning.light',
            color: 'warning.dark',
            border: '1px solid',
            borderColor: 'warning.main'
          }}
        >
          <Typography variant="body2" fontWeight={600} sx={{ mb: 1 }}>
            ⚠️ Biteship API Tidak Dikonfigurasi
          </Typography>
          <Typography variant="body2">
            {apiConfigStatus.message}
          </Typography>
        </Alert>
      )}

      {/* Main Content */}
      {editingLocation ? (
        /* Edit Form */
        <Card sx={{ 
          borderRadius: 3,
          boxShadow: '0 4px 16px rgba(150, 130, 219, 0.12)',
          border: '1px solid rgba(150, 130, 219, 0.08)',
          mb: 4
        }}>
          <CardContent sx={{ p: 4 }}>
            <LocationForm
              mode="edit"
              location={editingLocation}
              isLoading={isSubmitting}
              error={error}
              onSubmit={handleUpdateLocation}
              onCancel={handleCancelForm}
            />
          </CardContent>
        </Card>
      ) : (
        /* Main Dashboard */
        <Box>
          {/* Location Origin Card - Compact */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card sx={{ 
                borderRadius: 3,
                boxShadow: '0 4px 16px rgba(150, 130, 219, 0.12)',
                border: '1px solid rgba(150, 130, 219, 0.08)',
                height: '100%'
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                    <Box sx={{ 
                      p: 1, 
                      borderRadius: 1.5, 
                      backgroundColor: 'primary.main',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <LocationOnIcon sx={{ fontSize: '1.2rem' }} />
                    </Box>
                    <Typography variant="h6" fontWeight={600} color="text.primary" className="craft-heading">
                      Lokasi Origin
                    </Typography>
                  </Box>
                  
                  {activeOrigin ? (
                    <Box>
                      <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ mb: 0.5 }}>
                        {activeOrigin.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {activeOrigin.address}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        📮 {activeOrigin.postal_code} | 📞 {activeOrigin.contact_phone}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip 
                          label="Aktif" 
                          size="small" 
                          sx={{ 
                            backgroundColor: 'success.main',
                            color: 'white',
                            fontWeight: 600
                          }} 
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={handleEditLocation}
                          sx={{
                            borderRadius: 2,
                            px: 2,
                            py: 0.5,
                            fontWeight: 500,
                            textTransform: 'none',
                            borderColor: 'primary.main',
                            color: 'primary.main',
                            '&:hover': {
                              backgroundColor: 'rgba(150, 130, 219, 0.05)',
                              borderColor: 'primary.dark'
                            }
                          }}
                        >
                          Edit
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Belum ada lokasi origin
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<RefreshIcon />}
                        onClick={fetchActiveOrigin}
                        sx={{ mt: 1 }}
                      >
                        Refresh
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Statistics Cards */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Card sx={{ 
                    borderRadius: 3,
                    boxShadow: '0 4px 16px rgba(150, 130, 219, 0.12)',
                    border: '1px solid rgba(150, 130, 219, 0.08)',
                    height: '100%'
                  }}>
                    <CardContent sx={{ p: 2, textAlign: 'center' }}>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: '50%', 
                        backgroundColor: 'rgba(150, 130, 219, 0.1)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1
                      }}>
                        <TrendingUpIcon sx={{ fontSize: '1.5rem', color: 'primary.main' }} />
                      </Box>
                      <Typography variant="h6" fontWeight={700} color="text.primary">
                        {shippingStats?.totalOrders || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Order
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={6} md={3}>
                  <Card sx={{ 
                    borderRadius: 3,
                    boxShadow: '0 4px 16px rgba(150, 130, 219, 0.12)',
                    border: '1px solid rgba(150, 130, 219, 0.08)',
                    height: '100%'
                  }}>
                    <CardContent sx={{ p: 2, textAlign: 'center' }}>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: '50%', 
                        backgroundColor: 'rgba(243, 156, 18, 0.1)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1
                      }}>
                        <ScheduleIcon sx={{ fontSize: '1.5rem', color: 'warning.main' }} />
                      </Box>
                      <Typography variant="h6" fontWeight={700} color="text.primary">
                        {shippingStats?.pendingShipment || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Menunggu Kirim
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={6} md={3}>
                  <Card sx={{ 
                    borderRadius: 3,
                    boxShadow: '0 4px 16px rgba(150, 130, 219, 0.12)',
                    border: '1px solid rgba(150, 130, 219, 0.08)',
                    height: '100%'
                  }}>
                    <CardContent sx={{ p: 2, textAlign: 'center' }}>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: '50%', 
                        backgroundColor: 'rgba(52, 152, 219, 0.1)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1
                      }}>
                        <ShippingOutlinedIcon sx={{ fontSize: '1.5rem', color: 'info.main' }} />
                      </Box>
                      <Typography variant="h6" fontWeight={700} color="text.primary">
                        {shippingStats?.inTransit || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Dalam Perjalanan
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={6} md={3}>
                  <Card sx={{ 
                    borderRadius: 3,
                    boxShadow: '0 4px 16px rgba(150, 130, 219, 0.12)',
                    border: '1px solid rgba(150, 130, 219, 0.08)',
                    height: '100%'
                  }}>
                    <CardContent sx={{ p: 2, textAlign: 'center' }}>
                      <Box sx={{ 
                        p: 1.5, 
                        borderRadius: '50%', 
                        backgroundColor: 'rgba(39, 174, 96, 0.1)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mb: 1
                      }}>
                        <CheckCircleIcon sx={{ fontSize: '1.5rem', color: 'success.main' }} />
                      </Box>
                      <Typography variant="h6" fontWeight={700} color="text.primary">
                        {shippingStats?.delivered || 0}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Terkirim
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* Shipping Table */}
          <Card sx={{ 
            borderRadius: 3,
            boxShadow: '0 4px 16px rgba(150, 130, 219, 0.12)',
            border: '1px solid rgba(150, 130, 219, 0.08)'
          }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 3, borderBottom: '1px solid rgba(150, 130, 219, 0.1)' }}>
                <Typography variant="h6" fontWeight={600} color="text.primary" className="craft-heading">
                  Data Pengiriman
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Tracking dan status pengiriman order
                </Typography>
              </Box>
              
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(150, 130, 219, 0.05)' }}>
                      <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>ID Pengiriman</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Order ID</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Penerima</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Tujuan</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Kurir</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Tracking</TableCell>
                      <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>Aksi</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {shippingData.map((row) => (
                      <TableRow key={row.id} hover>
                        <TableCell sx={{ fontWeight: 500 }}>{row.id}</TableCell>
                        <TableCell>{row.orderId}</TableCell>
                        <TableCell>{row.recipient}</TableCell>
                        <TableCell>{row.destination}</TableCell>
                        <TableCell>{row.courier}</TableCell>
                        <TableCell>
                          <Chip
                            icon={getStatusIcon(row.status)}
                            label={getStatusText(row.status)}
                            size="small"
                            color={getStatusColor(row.status) as any}
                            sx={{ fontWeight: 500 }}
                          />
                        </TableCell>
                        <TableCell>
                          {row.trackingNumber ? (
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {row.trackingNumber}
                            </Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              -
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Lihat Detail">
                            <IconButton size="small" color="primary">
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      )}
    </Container>
  );
}