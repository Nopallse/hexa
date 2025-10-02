import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuthStore } from '@/store/authStore';
import { RegisterRequest } from '../types';

const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password harus mengandung huruf kecil, huruf besar, dan angka'),
  full_name: z
    .string()
    .min(1, 'Nama lengkap wajib diisi')
    .min(2, 'Nama lengkap minimal 2 karakter'),
  phone: z
    .string()
    .min(1, 'Nomor telepon wajib diisi')
    .regex(/^08[0-9]{8,11}$/, 'Nomor telepon harus dimulai dengan 08 dan 10-13 digit'),
  confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export default function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const { register: registerUser, isLoading, error, requiresVerification } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const registerData: RegisterRequest = {
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        phone: data.phone,
      };

      const response = await registerUser(registerData);
      
      if (response.success) {
        setRegistrationSuccess(true);
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      // Error sudah dihandle di store
    }
  };

  if (registrationSuccess || requiresVerification) {
    return (
      <Box>
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Registrasi Berhasil!
          </Typography>
          <Typography variant="body2">
            Kami telah mengirimkan email verifikasi ke <strong>{getValues('email')}</strong>.
            Silakan cek email Anda dan klik link verifikasi untuk mengaktifkan akun.
          </Typography>
        </Alert>

        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Sudah verifikasi email?
          </Typography>
          <Button variant="contained" onClick={onSwitchToLogin} fullWidth>
            Login Sekarang
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="h4" gutterBottom textAlign="center" fontWeight="bold">
        Daftar Akun Baru
      </Typography>
      
      <Typography variant="body2" textAlign="center" color="textSecondary" sx={{ mb: 4 }}>
        Bergabunglah dengan Hexa Crochet dan temukan produk rajutan terbaik
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TextField
        {...register('full_name')}
        label="Nama Lengkap"
        fullWidth
        margin="normal"
        error={!!errors.full_name}
        helperText={errors.full_name?.message}
        disabled={isLoading}
      />

      <TextField
        {...register('email')}
        label="Email"
        type="email"
        fullWidth
        margin="normal"
        error={!!errors.email}
        helperText={errors.email?.message}
        disabled={isLoading}
      />

      <TextField
        {...register('phone')}
        label="Nomor Telepon"
        fullWidth
        margin="normal"
        error={!!errors.phone}
        helperText={errors.phone?.message}
        placeholder="08xxxxxxxxxx"
        disabled={isLoading}
      />

      <TextField
        {...register('password')}
        label="Password"
        type={showPassword ? 'text' : 'password'}
        fullWidth
        margin="normal"
        error={!!errors.password}
        helperText={errors.password?.message}
        disabled={isLoading}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <TextField
        {...register('confirmPassword')}
        label="Konfirmasi Password"
        type={showConfirmPassword ? 'text' : 'password'}
        fullWidth
        margin="normal"
        error={!!errors.confirmPassword}
        helperText={errors.confirmPassword?.message}
        disabled={isLoading}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                edge="end"
              >
                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isLoading}
        sx={{ mt: 3, mb: 2 }}
      >
        {isLoading ? 'Mendaftar...' : 'Daftar'}
      </Button>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2">
          Sudah punya akun?{' '}
          <Button variant="text" onClick={onSwitchToLogin} disabled={isLoading}>
            Login di sini
          </Button>
        </Typography>
      </Box>
    </Box>
  );
}
