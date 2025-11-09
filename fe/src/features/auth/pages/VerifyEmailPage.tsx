import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Alert,
  Button,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { authApi } from '../services/authApi';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setError('Token verifikasi tidak ditemukan');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await authApi.verifyEmail(token);

        if (response.success) {
          setSuccess(true);
        } else {
          setError(response.message || 'Gagal memverifikasi email');
        }
      } catch (err: any) {
        console.error('Error verifying email:', err);
        setError(
          err.response?.data?.error ||
          err.message ||
          'Terjadi kesalahan saat memverifikasi email'
        );
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress sx={{ mb: 3 }} />
            <Typography variant="h6" fontWeight={600} sx={{ mb: 1 }}>
              Memverifikasi Email...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Mohon tunggu sebentar
            </Typography>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 4, textAlign: 'center' }}>
          {success ? (
            <>
              <CheckCircleIcon
                sx={{
                  fontSize: 64,
                  color: 'success.main',
                  mb: 3,
                }}
              />
              <Typography variant="h5" fontWeight={600} sx={{ mb: 2, color: 'text.primary' }}>
                Email Berhasil Diverifikasi!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Email Anda telah berhasil diverifikasi. Anda sekarang dapat menggunakan semua fitur aplikasi.
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                fullWidth
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  backgroundColor: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                }}
              >
                Masuk ke Akun
              </Button>
            </>
          ) : (
            <>
              <ErrorIcon
                sx={{
                  fontSize: 64,
                  color: 'error.main',
                  mb: 3,
                }}
              />
              <Typography variant="h5" fontWeight={600} sx={{ mb: 2, color: 'text.primary' }}>
                Verifikasi Gagal
              </Typography>
              {error && (
                <Alert severity="error" sx={{ mb: 3, borderRadius: 2, textAlign: 'left' }}>
                  {error}
                </Alert>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Token verifikasi tidak valid atau sudah kedaluwarsa. Silakan minta email verifikasi baru.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
                <Button
                  variant="contained"
                  onClick={() => navigate('/login')}
                  fullWidth
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 600,
                    backgroundColor: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  }}
                >
                  Kembali ke Login
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<EmailIcon />}
                  onClick={() => {
                    const email = searchParams.get('email');
                    if (email) {
                      // TODO: Implement resend verification
                      navigate('/login', { state: { resendVerification: email } });
                    } else {
                      navigate('/login');
                    }
                  }}
                  fullWidth
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 500,
                  }}
                >
                  Kirim Ulang Email Verifikasi
                </Button>
              </Box>
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}

