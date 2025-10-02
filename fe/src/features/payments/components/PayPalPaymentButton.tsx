import {
  Box,
  Button,
  Alert,
  CircularProgress,
  Typography,
  useTheme,
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
} from '@mui/icons-material';
import { useState, useEffect, useRef } from 'react';
import { Order } from '@/features/orders/types';
import { Payment } from '../types';
import { paymentApi } from '../services/paymentApi';
import { PAYPAL_CONFIG, PAYPAL_BUTTON_STYLES, getPayPalSDKUrl } from '@/config/paypal';

// Declare PayPal types
declare global {
  interface Window {
    paypal?: any;
  }
}

interface PayPalPaymentButtonProps {
  order: Order;
  onSuccess: (payment: Payment) => void;
  onError: (error: string) => void;
}

export default function PayPalPaymentButton({ order, onSuccess, onError }: PayPalPaymentButtonProps) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const paypalRef = useRef<HTMLDivElement>(null);

  // Load PayPal SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = getPayPalSDKUrl();
    script.async = true;
    
    script.onload = () => {
      setSdkReady(true);
    };
    
    script.onerror = () => {
      setError('Gagal memuat PayPal SDK');
    };
    
    document.body.appendChild(script);
    
    return () => {
      // Cleanup script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      // Cleanup PayPal buttons
      if (paypalRef.current) {
        paypalRef.current.innerHTML = '';
      }
    };
  }, []);

  // Initialize PayPal buttons when SDK is ready
  useEffect(() => {
    if (sdkReady && window.paypal && paypalRef.current) {
      // Clear previous buttons
      paypalRef.current.innerHTML = '';
      
      window.paypal.Buttons({
        style: PAYPAL_BUTTON_STYLES,
        createOrder: async (data: any, actions: any) => {
          try {
            setLoading(true);
            
            // Create PayPal order via your backend
            const response = await paymentApi.createPayPalPayment({
              order_id: order.id
            });

            if (response.success) {
              return response.data.paypal_order_id;
            } else {
              throw new Error('Failed to create PayPal order');
            }
          } catch (err: any) {
            console.error('Error creating PayPal order:', err);
            setError(err.response?.data?.error || 'Gagal membuat order PayPal');
            throw err;
          } finally {
            setLoading(false);
          }
        },
        onApprove: async (data: any, actions: any) => {
          try {
            setLoading(true);
            setError(null);

            // Capture the payment
            const response = await paymentApi.capturePayPalPayment({
              paypal_order_id: data.orderID
            });

            if (response.success) {
              // Create payment object
              const payment: Payment = {
                id: `paypal-payment-${Date.now()}`,
                order_id: order.id,
                payment_method: 'paypal',
                amount: order.total_amount + order.shipping_cost,
                payment_status: 'paid',
                payment_date: new Date().toISOString(),
                payment_reference: response.data.capture_id || data.orderID,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              
              onSuccess(payment);
            } else {
              throw new Error('Failed to capture payment');
            }
          } catch (err: any) {
            console.error('Error capturing PayPal payment:', err);
            const errorMessage = err.response?.data?.error || 'Gagal menangkap pembayaran PayPal';
            setError(errorMessage);
            onError(errorMessage);
          } finally {
            setLoading(false);
          }
        },
        onError: (err: any) => {
          console.error('PayPal error:', err);
          const errorMessage = 'Terjadi kesalahan saat memproses pembayaran PayPal';
          setError(errorMessage);
          onError(errorMessage);
        },
        onCancel: (data: any) => {
          console.log('PayPal payment cancelled:', data);
          setError('Pembayaran PayPal dibatalkan');
        }
      }).render(paypalRef.current);
    }
    
    // Cleanup function
    return () => {
      if (paypalRef.current) {
        paypalRef.current.innerHTML = '';
      }
    };
  }, [sdkReady, order, onSuccess, onError]);


  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {!sdkReady && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Memuat PayPal SDK...
        </Alert>
      )}

      {sdkReady ? (
        <>
          <Alert severity="success" sx={{ mb: 2 }}>
            PayPal Sandbox siap digunakan. Klik tombol di bawah untuk memulai pembayaran.
          </Alert>
          
          {PAYPAL_CONFIG.environment === 'sandbox' && (
            <Alert severity="info" sx={{ mb: 2 }}>
              <strong>Mode Sandbox:</strong> Gunakan akun PayPal sandbox untuk testing. 
              Tidak ada uang sungguhan yang akan diproses.
            </Alert>
          )}
          
          {/* PayPal Button Container */}
          <Box ref={paypalRef} />
        </>
      ) : (
        <Box sx={{ textAlign: 'center', py: 3 }}>
          <CircularProgress />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Memuat PayPal Payment Gateway...
          </Typography>
        </Box>
      )}

      {/* Fallback button jika SDK gagal load */}
      {!sdkReady && (
        <Button
          variant="contained"
          size="large"
          startIcon={<CreditCardIcon />}
          onClick={() => {
            setError('PayPal SDK belum dimuat. Silakan refresh halaman dan coba lagi.');
          }}
          disabled={loading}
          fullWidth
          sx={{
            py: 2,
            borderRadius: 2,
            fontWeight: 600,
            fontSize: '1.1rem',
            backgroundColor: '#003087',
            '&:hover': {
              backgroundColor: '#002366',
            },
            mt: 2,
          }}
        >
          {loading ? 'Memproses...' : 'PayPal SDK Belum Dimuat'}
        </Button>
      )}
    </Box>
  );
}
