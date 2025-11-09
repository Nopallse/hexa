import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Alert,
  TablePagination,
  Paper,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { adminOrderApi, AdminOrderQueryParams, OrderWithUser } from '../services/orderApi';
import { Order } from '@/features/orders/types';
import Loading from '@/components/ui/Loading';
import { useUiStore } from '@/store/uiStore';
import OrderTable from '../components/OrderTable';
import OrderFilter from '../components/OrderFilter';

function a11yProps(index: number) {
  return {
    id: `order-tab-${index}`,
    'aria-controls': `order-tabpanel-${index}`,
  };
}

export default function OrderManagementPage() {
  const navigate = useNavigate();
  const { showNotification } = useUiStore();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [orders, setOrders] = useState<OrderWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState<AdminOrderQueryParams>({});

  const statusTabs = [
    { label: 'Semua', value: '' },
    { label: 'Belum Bayar', value: 'belum_bayar' },
    { label: 'Dikemas', value: 'dikemas' },
    { label: 'Dikirim', value: 'dikirim' },
    { label: 'Diterima', value: 'diterima' },
    { label: 'Dibatalkan', value: 'dibatalkan' },
  ];

  const memoizedFilters = useMemo(() => filters, [filters]);

  const fetchOrders = async (params?: AdminOrderQueryParams) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await adminOrderApi.getAllOrders({
        page: (page || 0) + 1,
        limit: rowsPerPage,
        ...params,
      });
      
      if (response.success) {
        setOrders(response.data as OrderWithUser[]);
        setTotal(response.pagination?.total || 0);
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (error: any) {
      setError(error.response?.data?.error || error.message || 'Gagal memuat data pesanan');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(memoizedFilters);
  }, [page, rowsPerPage, memoizedFilters]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    const status = statusTabs[newValue].value;
    setFilters(prev => ({ ...prev, status }));
    setPage(0);
  };

  const handleFilterChange = (newFilters: AdminOrderQueryParams) => {
    setFilters(newFilters);
    setPage(0);
  };

  const handleView = (order: Order) => {
    navigate(`/admin/orders/${order.id}`);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const response = await adminOrderApi.updateOrderStatus(orderId, newStatus);
      
      if (response.success) {
        showNotification({
          type: 'success',
          message: 'Status pesanan berhasil diperbarui',
        });
        fetchOrders(memoizedFilters);
      } else {
        throw new Error(response.error || 'Failed to update order status');
      }
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.response?.data?.error || error.message || 'Gagal memperbarui status pesanan',
      });
    }
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (isLoading && orders.length === 0) {
    return <Loading message="Memuat data pesanan..." />;
  }

  return (
    <Container maxWidth={false}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Kelola Pesanan
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Kelola dan lacak semua pesanan pelanggan
        </Typography>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Status Tabs */}
      <Paper elevation={0} sx={{ mb: 3, borderRadius: 2, border: `1px solid ${theme.palette.grey[200]}` }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons={isMobile ? 'auto' : false}
          allowScrollButtonsMobile
          sx={{
            borderBottom: `1px solid ${theme.palette.grey[200]}`,
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '1rem',
              py: 2,
              px: 3,
              minHeight: 'auto',
              '&.Mui-selected': {
                fontWeight: 600,
                color: 'primary.main',
              },
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0',
            },
          }}
        >
          {statusTabs.map((tab, index) => (
            <Tab
              key={tab.value}
              label={tab.label}
              {...a11yProps(index)}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Filter */}
      <OrderFilter
        onFilterChange={handleFilterChange}
        loading={isLoading}
        initialFilters={memoizedFilters}
      />

      {/* Orders Table */}
      <OrderTable
        orders={orders}
        isLoading={isLoading}
        onView={handleView}
        onStatusUpdate={handleStatusUpdate}
      />

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
    </Container>
  );
}
