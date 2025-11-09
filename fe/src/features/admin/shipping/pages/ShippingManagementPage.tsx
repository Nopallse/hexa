import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
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
  TablePagination,
  IconButton,
  Tooltip,
  useTheme,
  Skeleton,
} from '@mui/material';
import { 
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
import ShippingFilter, { ShippingFilterParams } from '../components/ShippingFilter';
import Loading from '@/components/ui/Loading';
import { useUiStore } from '@/store/uiStore';

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'delivered':
      return 'success';
    case 'in_transit':
    case 'confirmed':
      return 'info';
    case 'pending':
    case 'shipped':
      return 'warning';
    default:
      return 'default';
  }
};

const getStatusIcon = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'delivered':
      return <CheckCircleIcon />;
    case 'in_transit':
    case 'confirmed':
      return <ShippingOutlinedIcon />;
    case 'pending':
    case 'shipped':
      return <ScheduleIcon />;
    default:
      return <ScheduleIcon />;
  }
};

const getStatusText = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'delivered':
      return 'Terkirim';
    case 'in_transit':
      return 'Dalam Perjalanan';
    case 'confirmed':
      return 'Dikonfirmasi';
    case 'pending':
      return 'Menunggu Pengiriman';
    case 'shipped':
      return 'Terkirim';
    default:
      return status || 'Unknown';
  }
};

export default function ShippingManagementPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { showNotification } = useUiStore();
  
  const [activeOrigin, setActiveOrigin] = useState<Location | null>(null);
  const [shippingStats, setShippingStats] = useState<ShippingStats | null>(null);
  const [shippingData, setShippingData] = useState<ShippingData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [apiConfigStatus, setApiConfigStatus] = useState<{ biteshipConfigured: boolean; message: string } | null>(null);
  const [filters, setFilters] = useState<ShippingFilterParams>({
    status: '',
    courier: '',
    startDate: '',
    endDate: '',
    page: 1,
    limit: 10,
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);

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

  const fetchShippingData = async (filterParams?: ShippingFilterParams) => {
    try {
      const params = filterParams || filters;
      const response = await shippingApi.getShippingData({
        page: (page || 0) + 1,
        limit: rowsPerPage,
        status: params.status || undefined,
        courier: params.courier || undefined,
        startDate: params.startDate || undefined,
        endDate: params.endDate || undefined,
      });
      
      if (response.success && response.data) {
        setShippingData(response.data);
        if (response.pagination) {
          setTotal(response.pagination.total_items || 0);
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch shipping data:', error);
      setError(error.message || 'Gagal memuat data pengiriman');
    }
  };

  const memoizedFilters = useMemo(() => filters, [filters]);

  const handleFilterChange = (newFilters: ShippingFilterParams) => {
    setFilters(newFilters);
    setPage(0);
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
        fetchApiConfigStatus(),
      ]);
    };
    
    loadData();
  }, []);

  useEffect(() => {
    fetchShippingData(memoizedFilters);
  }, [page, rowsPerPage, memoizedFilters]);

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

  if (isLoading && !activeOrigin) {
    return <Loading message="Memuat data lokasi origin..." />;
  }

  return (
    <Container maxWidth={false}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Manajemen Pengiriman
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Kelola lokasi origin, statistik pengiriman, dan tracking order
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* API Configuration Status Alert */}
      {apiConfigStatus && !apiConfigStatus.biteshipConfigured && (
        <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setApiConfigStatus(null)}>
          <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
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
        <Paper elevation={0} sx={{ mb: 3, borderRadius: 2, border: `1px solid ${theme.palette.grey[200]}` }}>
          <Box sx={{ p: 3 }}>
            <LocationForm
              mode="edit"
              location={editingLocation}
              isLoading={isSubmitting}
              error={error}
              onSubmit={handleUpdateLocation}
              onCancel={handleCancelForm}
            />
          </Box>
        </Paper>
      ) : (
        /* Main Dashboard */
        <Box>
          {/* Location Origin & Statistics Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 2, border: `1px solid ${theme.palette.grey[200]}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                  <LocationOnIcon sx={{ fontSize: '1.5rem', color: 'primary.main' }} />
                  <Typography variant="h6" fontWeight={600} color="text.primary">
                    Lokasi Origin
                  </Typography>
                </Box>
                
                {activeOrigin ? (
                  <Box>
                    <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ mb: 0.5 }}>
                      {activeOrigin.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                      {activeOrigin.address}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                      {activeOrigin.postal_code} | {activeOrigin.contact_phone}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip 
                        label="Aktif" 
                        size="small" 
                        color="success"
                        sx={{ fontWeight: 600 }}
                      />
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<EditIcon />}
                        onClick={handleEditLocation}
                        sx={{ textTransform: 'none' }}
                      >
                        Edit
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="body2" color="textSecondary">
                      Belum ada lokasi origin
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<RefreshIcon />}
                      onClick={fetchActiveOrigin}
                      sx={{ mt: 1, textTransform: 'none' }}
                    >
                      Refresh
                    </Button>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Statistics Cards */}
            <Grid item xs={12} md={8}>
              <Grid container spacing={2}>
                <Grid item xs={6} md={3}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center', borderRadius: 2, border: `1px solid ${theme.palette.grey[200]}` }}>
                    <TrendingUpIcon sx={{ fontSize: '2rem', color: 'primary.main', mb: 1 }} />
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                      {shippingStats?.totalOrders || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Total Order
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={6} md={3}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center', borderRadius: 2, border: `1px solid ${theme.palette.grey[200]}` }}>
                    <ScheduleIcon sx={{ fontSize: '2rem', color: 'warning.main', mb: 1 }} />
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                      {shippingStats?.pendingShipment || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Menunggu Kirim
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={6} md={3}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center', borderRadius: 2, border: `1px solid ${theme.palette.grey[200]}` }}>
                    <ShippingOutlinedIcon sx={{ fontSize: '2rem', color: 'info.main', mb: 1 }} />
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                      {shippingStats?.inTransit || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Dalam Perjalanan
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={6} md={3}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center', borderRadius: 2, border: `1px solid ${theme.palette.grey[200]}` }}>
                    <CheckCircleIcon sx={{ fontSize: '2rem', color: 'success.main', mb: 1 }} />
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                      {shippingStats?.delivered || 0}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Terkirim
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
          </Grid>

          {/* Shipping Filter */}
          <ShippingFilter
            onFilterChange={handleFilterChange}
            loading={isLoading}
            initialFilters={memoizedFilters}
          />

          {/* Shipping Table */}
          {isLoading && shippingData.length === 0 ? (
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.grey[200]}` }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID Pengiriman</TableCell>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Penerima</TableCell>
                    <TableCell>Tujuan</TableCell>
                    <TableCell>Kurir</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Tracking</TableCell>
                    <TableCell align="right">Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[...Array(5)].map((_, index) => (
                    <TableRow key={index}>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell><Skeleton /></TableCell>
                      <TableCell align="right"><Skeleton /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : shippingData.length === 0 ? (
            <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 2, border: `1px solid ${theme.palette.grey[200]}` }}>
              <Typography variant="body1" color="textSecondary">
                Tidak ada data pengiriman ditemukan
              </Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${theme.palette.grey[200]}` }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID Pengiriman</TableCell>
                    <TableCell>Order ID</TableCell>
                    <TableCell>Penerima</TableCell>
                    <TableCell>Tujuan</TableCell>
                    <TableCell>Kurir</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Tracking</TableCell>
                    <TableCell align="right">Aksi</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {shippingData.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {row.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {row.orderId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {row.recipient}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {row.destination}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {row.courier}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(row.status)}
                          label={getStatusText(row.status)}
                          size="small"
                          color={getStatusColor(row.status) as any}
                          variant="outlined"
                          sx={{ fontSize: '0.75rem', height: 24, fontWeight: 500 }}
                        />
                      </TableCell>
                      <TableCell>
                        {row.trackingNumber ? (
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {row.trackingNumber}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="textSecondary">
                            -
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Lihat Detail">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/admin/shipping/${row.id}`)}
                            sx={{ color: 'primary.main' }}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Pagination */}
          {total > 0 && (
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={total}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Baris per halaman:"
              labelDisplayedRows={({ from, to, count }) => 
                `${from}-${to} dari ${count !== -1 ? count : `lebih dari ${to}`}`
              }
            />
          )}
        </Box>
      )}
    </Container>
  );
}