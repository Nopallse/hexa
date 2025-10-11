import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  useTheme,
  useMediaQuery,
  Alert,
  CircularProgress,
  Button,
} from '@mui/material';
import {
  ShoppingBag as OrdersIcon,
  Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useOrderStore } from '@/features/orders/store/orderStore';
import { orderApi } from '@/features/orders/services/orderApi';
import { Order, OrderQueryParams } from '@/features/orders/types';
import OrderCard from '@/features/orders/components/OrderCard';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`orders-tabpanel-${index}`}
      aria-labelledby={`orders-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `orders-tab-${index}`,
    'aria-controls': `orders-tabpanel-${index}`,
  };
}

export default function OrdersPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  const { orders, setOrders } = useOrderStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  const statusTabs = [
    { label: 'Semua', value: '' },
    { label: 'Pending', value: 'pending' },
    { label: 'Processing', value: 'processing' },
    { label: 'Shipped', value: 'shipped' },
    { label: 'Delivered', value: 'delivered' },
    { label: 'Cancelled', value: 'cancelled' },
  ];

  const fetchOrders = async (params: OrderQueryParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = {
        page: pagination.page,
        limit: pagination.limit,
        ...params,
      };

      const response = await orderApi.getUserOrders(queryParams);
      
      if (response.success) {
        setOrders(response.data);
        setPagination(prev => ({
          ...prev,
          total: response.total || 0,
          pages: response.pages || 0,
        }));
      } else {
        setError(response.error || 'Gagal memuat pesanan');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat pesanan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [pagination.page, pagination.limit]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    const status = statusTabs[newValue].value;
    fetchOrders({ status });
  };

  const handleOrderClick = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      setLoading(true);
      const response = await orderApi.cancelOrder(orderId);
      
      if (response.success) {
        // Refresh orders
        fetchOrders();
      } else {
        setError(response.error || 'Gagal membatalkan pesanan');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal membatalkan pesanan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 600, 
            color: 'text.primary',
            mb: 1
          }}
        >
          Pesanan Saya
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary"
        >
          Kelola dan lacak pesanan Anda
        </Typography>
      </Box>

      {/* Status Tabs */}
      <Paper 
        elevation={0}
        sx={{ 
          mb: 3,
          borderRadius: 2,
          border: `1px solid ${theme.palette.grey[200]}`,
          overflow: 'hidden'
        }}
      >
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

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3, borderRadius: 2 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : orders.length === 0 ? (
        /* Empty State */
        <Paper 
          elevation={0}
          sx={{ 
            borderRadius: 2, 
            border: `1px solid ${theme.palette.grey[200]}`,
            p: 4, 
            textAlign: 'center' 
          }}
        >
          <ReceiptIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600, 
              color: 'text.primary',
              mb: 1
            }}
          >
            Belum Ada Pesanan
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Pesanan Anda akan muncul di sini setelah melakukan pembelian
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/products')}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              backgroundColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            }}
          >
            Mulai Belanja
          </Button>
        </Paper>
      ) : (
        /* Orders List */
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {orders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onOrderClick={handleOrderClick}
              onCancelOrder={handleCancelOrder}
            />
          ))}
        </Box>
      )}
    </Container>
  );
}
