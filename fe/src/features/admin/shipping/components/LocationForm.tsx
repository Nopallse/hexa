import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Card,
  CardContent,
  Stack,
  CircularProgress,
} from '@mui/material';
import { LocationOn as LocationIcon } from '@mui/icons-material';
import { UpdateLocationRequest, Location } from '../types';

const locationSchema = z.object({
  name: z
    .string()
    .min(1, 'Nama lokasi wajib diisi')
    .min(2, 'Nama lokasi minimal 2 karakter')
    .max(100, 'Nama lokasi maksimal 100 karakter'),
  contact_name: z
    .string()
    .min(1, 'Nama kontak wajib diisi')
    .min(2, 'Nama kontak minimal 2 karakter')
    .max(100, 'Nama kontak maksimal 100 karakter'),
  contact_phone: z
    .string()
    .min(1, 'Nomor telepon wajib diisi')
    .min(10, 'Nomor telepon minimal 10 digit')
    .max(15, 'Nomor telepon maksimal 15 digit')
    .regex(/^[0-9+\-\s()]+$/, 'Nomor telepon hanya boleh berisi angka dan simbol +, -, (, ), spasi'),
  address: z
    .string()
    .min(1, 'Alamat wajib diisi')
    .min(10, 'Alamat minimal 10 karakter')
    .max(500, 'Alamat maksimal 500 karakter'),
  postal_code: z
    .number()
    .int('Kode pos harus berupa bilangan bulat')
    .min(10000, 'Kode pos minimal 10000')
    .max(99999, 'Kode pos maksimal 99999'),
  note: z
    .string()
    .max(200, 'Catatan maksimal 200 karakter')
    .optional()
    .or(z.literal('')),
});

type LocationFormData = z.infer<typeof locationSchema>;

interface LocationFormProps {
  mode: 'edit';
  location: Location | null;
  isLoading?: boolean;
  error?: string | null;
  onSubmit: (data: UpdateLocationRequest) => Promise<void>;
  onCancel: () => void;
}

export default function LocationForm({
  mode,
  location,
  isLoading = false,
  error,
  onSubmit,
  onCancel,
}: LocationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      name: '',
      contact_name: '',
      contact_phone: '',
      address: '',
      postal_code: 0,
      note: '',
    },
  });

  useEffect(() => {
    if (location) {
      reset({
        name: location.name,
        contact_name: location.contact_name,
        contact_phone: location.contact_phone,
        address: location.address,
        postal_code: location.postal_code,
        note: location.note || '',
      });
    }
  }, [location, reset]);

  const handleFormSubmit = async (data: LocationFormData) => {
    await onSubmit(data);
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <LocationIcon sx={{ fontSize: '1.5rem', mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" fontWeight={600}>
            Edit Lokasi Origin
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(handleFormSubmit)} sx={{ mt: 3 }}>
          <Stack spacing={3}>
            {/* Basic Information */}
            <Typography variant="h6" fontWeight="bold">
              Informasi Dasar
            </Typography>

            <TextField
              {...register('name')}
              label="Nama Lokasi"
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
              disabled={isLoading}
              placeholder="Contoh: Toko Utama Jakarta"
              required
            />

            <TextField
              {...register('contact_name')}
              label="Nama Kontak"
              fullWidth
              error={!!errors.contact_name}
              helperText={errors.contact_name?.message}
              disabled={isLoading}
              placeholder="Contoh: Ahmad"
              required
            />

            <TextField
              {...register('contact_phone')}
              label="Nomor Telepon"
              fullWidth
              error={!!errors.contact_phone}
              helperText={errors.contact_phone?.message}
              disabled={isLoading}
              placeholder="Contoh: 08123456789"
              required
            />

            {/* Address Information */}
            <Typography variant="h6" fontWeight="bold" sx={{ mt: 2 }}>
              Informasi Alamat
            </Typography>

            <TextField
              {...register('address')}
              label="Alamat Lengkap"
              fullWidth
              multiline
              rows={3}
              error={!!errors.address}
              helperText={errors.address?.message}
              disabled={isLoading}
              placeholder="Contoh: Jl. Gambir Selatan no 5. Blok F 92. Jakarta Pusat."
              required
            />

            <TextField
              {...register('postal_code', { 
                valueAsNumber: true,
                setValueAs: (value) => {
                  const numValue = parseInt(value);
                  return isNaN(numValue) ? 0 : numValue;
                }
              })}
              label="Kode Pos"
              fullWidth
              type="number"
              error={!!errors.postal_code}
              helperText={errors.postal_code?.message}
              disabled={isLoading}
              placeholder="10110"
              required
              InputProps={{
                inputProps: { 
                  min: 10000, 
                  max: 99999,
                  style: { textAlign: 'right' }
                }
              }}
            />

            <TextField
              {...register('note')}
              label="Catatan (Opsional)"
              fullWidth
              multiline
              rows={2}
              error={!!errors.note}
              helperText={errors.note?.message || 'Catatan tambahan untuk lokasi ini'}
              disabled={isLoading}
              placeholder="Contoh: Dekat tulisan warung Bu Indah"
            />

            {/* Action Buttons */}
            <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : undefined}
                sx={{ minWidth: 120 }}
              >
                {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
              
              <Button
                variant="outlined"
                onClick={onCancel}
                disabled={isLoading}
                sx={{ minWidth: 120 }}
              >
                Batal
              </Button>
            </Stack>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
