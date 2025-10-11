import { useState } from 'react';
import { Button, Alert, Box, CircularProgress, Typography, Stack } from '@mui/material';
import { CreditCard as CreditCardIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { Order } from '@/features/orders/types';
import { orderApi } from '@/features/orders/services/orderApi';
import { useSnapScript } from '@/hooks/useSnapScript';
import { useCurrencyConversion } from '@/hooks/useCurrencyConversion';

interface MidtransPaymentButtonProps {
  order: Order;
  onSuccess: (payment: any) => void;
  onError: (error: string) => void;
  paymentMethod?: string;
}

export default function MidtransPaymentButton({
  order,
  onSuccess,
  onError,
  paymentMethod = 'bank_transfer'
}: MidtransPaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const { isLoaded, isLoading, error: snapError } = useSnapScript();
  const { formatPrice, loading: currencyLoading, error: currencyError } = useCurrencyConversion();

  const handleMidtransPayment = async () => {
    try {
      setLoading(true);
      
      console.log('Snap script status:', { isLoaded, isLoading, snapError });
      console.log('Window.snap available:', !!window.snap);
      
      if (!isLoaded) {
        onError('Snap script belum dimuat. Silakan coba lagi.');
        return;
      }
      
      if (!window.snap) {
        onError('Snap script tidak tersedia. Silakan refresh halaman.');
        return;
      }
      
      // Create payment token
      const response = await orderApi.createMidtransPayment(order.id, paymentMethod);
      
      console.log('Create payment response:', response);
      
      if (response.success) {
        console.log('Payment token:', (response as any).data.token);
        console.log('Token length:', (response as any).data.token.length);
        console.log('Is existing payment:', (response as any).data.is_existing);
        
        // Open Snap popup
        window.snap.pay((response as any).data.token, {
          onSuccess: (result: any) => {
            console.log('Payment success:', result);
            onSuccess(result);
          },
          onPending: (result: any) => {
            console.log('Payment pending:', result);
            onSuccess(result);
          },
          onError: (result: any) => {
            console.log('Payment error:', result);
            onError('Pembayaran gagal: ' + (result.message || 'Unknown error'));
          },
          onClose: () => {
            console.log('Payment popup closed');
            setLoading(false);
          }
        });
      } else {
        console.log('Payment creation failed:', response.error);
        onError(response.error || 'Gagal membuat pembayaran Midtrans');
      }
    } catch (error: any) {
      console.error('Midtrans payment error:', error);
      
      // Handle specific error types
      if (error.response?.data?.error?.includes('Payment session already exists')) {
        console.log('Payment session already exists - this should not happen with new logic');
        onError('Sesi pembayaran sudah ada. Silakan coba lagi.');
        return;
      }
      
      onError(error.response?.data?.error || 'Gagal membuat pembayaran Midtrans');
    } finally {
      setLoading(false);
    }
  };


  if (snapError) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        <strong>Error Loading Snap Script</strong><br />
        {snapError}
      </Alert>
    );
  }

  if (currencyLoading) {
    return (
      <Alert severity="info" sx={{ mb: 3 }}>
        <strong>Memuat Kurs Mata Uang...</strong><br />
        Sedang memuat kurs mata uang untuk pembayaran.
      </Alert>
    );
  }

  if (currencyError) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        <strong>Error Kurs Mata Uang</strong><br />
        {currencyError}
      </Alert>
    );
  }

  return (
    <Box>
      

      <Button
        variant="contained"
        size="large"
        startIcon={loading || isLoading ? <CircularProgress size={20} color="inherit" /> : <CreditCardIcon />}
        onClick={handleMidtransPayment}
        disabled={loading || isLoading || !isLoaded}
        fullWidth
        sx={{
          py: 1.5,
          borderRadius: 2,
          fontWeight: 600,
          fontSize: '1rem',
          backgroundColor: 'primary.main',
          '&:hover': {
            backgroundColor: 'primary.dark',
          },
          '&:disabled': {
            backgroundColor: 'grey.300',
            color: 'grey.500',
          },
        }}
      >
        {loading ? 'Memproses Pembayaran...' : 
         isLoading ? 'Memuat Snap Script...' : 
         'Bayar dengan Midtrans'}
      </Button>
    </Box>
  );
}
