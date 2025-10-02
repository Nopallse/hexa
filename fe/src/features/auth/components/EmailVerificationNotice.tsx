import { useState } from 'react';
import {
  Box,
  Typography,
  Alert,
  Button,
  CircularProgress,
} from '@mui/material';
import { Email, CheckCircle } from '@mui/icons-material';
import { useAuthStore } from '@/store/authStore';

interface EmailVerificationNoticeProps {
  email: string;
  onBackToLogin?: () => void;
}

export default function EmailVerificationNotice({ 
  email, 
  onBackToLogin 
}: EmailVerificationNoticeProps) {
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');

  const { resendVerification } = useAuthStore();

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendError('');
    
    try {
      await resendVerification(email);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (error: any) {
      setResendError(error.message || 'Gagal mengirim ulang email verifikasi');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Email sx={{ fontSize: 64, color: 'primary.main', mb: 3 }} />
      
      <Typography variant="h5" gutterBottom fontWeight="bold">
        Verifikasi Email Anda
      </Typography>
      
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Kami telah mengirimkan email verifikasi ke:
      </Typography>
      
      <Typography variant="h6" color="primary" sx={{ mb: 4 }}>
        {email}
      </Typography>

      <Alert severity="info" sx={{ mb: 4, textAlign: 'left' }}>
        <Typography variant="body2">
          <strong>Langkah selanjutnya:</strong>
        </Typography>
        <Typography variant="body2" component="ul" sx={{ mt: 1, pl: 2 }}>
          <li>Buka email Anda dan cari email dari Hexa Crochet</li>
          <li>Klik link verifikasi dalam email</li>
          <li>Kembali ke halaman login setelah verifikasi berhasil</li>
        </Typography>
      </Alert>

      {resendSuccess && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CheckCircle fontSize="small" />
            <Typography variant="body2">
              Email verifikasi berhasil dikirim ulang!
            </Typography>
          </Box>
        </Alert>
      )}

      {resendError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {resendError}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={handleResendVerification}
          disabled={resendLoading || resendSuccess}
          startIcon={resendLoading ? <CircularProgress size={16} /> : undefined}
        >
          {resendLoading ? 'Mengirim...' : 'Kirim Ulang Email Verifikasi'}
        </Button>

        <Button variant="contained" onClick={onBackToLogin}>
          Kembali ke Login
        </Button>
      </Box>

      <Typography variant="body2" color="textSecondary" sx={{ mt: 3 }}>
        Tidak menerima email? Cek folder spam atau kirim ulang email verifikasi.
      </Typography>
    </Box>
  );
}
