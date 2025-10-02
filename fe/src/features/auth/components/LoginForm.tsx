import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuthStore } from '@/store/authStore';
import { LoginRequest } from '../types';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email wajib diisi')
    .email('Format email tidak valid'),
  password: z
    .string()
    .min(1, 'Password wajib diisi'),
});

type LoginFormData = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export default function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const { login, isLoading, error, user, clearError } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    
    try {
      const loginData: LoginRequest = {
        email: data.email,
        password: data.password,
      };

      const userData = await login(loginData);
      
      // Login berhasil, redirect berdasarkan role
      if (userData.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      // Error sudah dihandle di store
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)}>
      <Typography variant="h4" gutterBottom textAlign="center" fontWeight="bold">
        Masuk ke Akun
      </Typography>
      
      <Typography variant="body2" textAlign="center" color="textSecondary" sx={{ mb: 4 }}>
        Selamat datang kembali di Hexa Crochet
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <TextField
        {...register('email')}
        label="Email"
        type="email"
        fullWidth
        margin="normal"
        error={!!errors.email}
        helperText={errors.email?.message}
        disabled={isLoading}
        autoComplete="email"
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
        autoComplete="current-password"
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

      <Box sx={{ textAlign: 'right', mt: 1, mb: 3 }}>
        <Button 
          variant="text" 
          size="small" 
          onClick={() => navigate('/forgot-password')}
          disabled={isLoading}
        >
          Lupa Password?
        </Button>
      </Box>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        size="large"
        disabled={isLoading}
        sx={{ mb: 3 }}
      >
        {isLoading ? 'Masuk...' : 'Masuk'}
      </Button>

      <Divider sx={{ my: 3 }}>
        <Typography variant="body2" color="textSecondary">
          atau
        </Typography>
      </Divider>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Belum punya akun?
        </Typography>
        <Button 
          variant="outlined" 
          fullWidth
          onClick={onSwitchToRegister} 
          disabled={isLoading}
        >
          Daftar Sekarang
        </Button>
      </Box>
    </Box>
  );
}
