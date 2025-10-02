import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  Button,
  useTheme,
  Chip,
  IconButton,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useState } from 'react';
import { Address } from '../types';
import { addressApi } from '../services/addressApi';

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (address: Address) => void;
  onUpdate: () => void;
}

export default function AddressCard({ address, onEdit, onDelete, onUpdate }: AddressCardProps) {
  const theme = useTheme();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus alamat ini?')) {
      return;
    }

    try {
      setDeleting(true);
      const response = await addressApi.deleteAddress(address.id);

      if (response.success) {
        onDelete(address);
        onUpdate();
      }
    } catch (err: any) {
      console.error('Error deleting address:', err);
      alert(err.response?.data?.error || 'Gagal menghapus alamat');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card
      sx={{
        border: address.is_primary 
          ? `2px solid ${theme.palette.primary.main}` 
          : `1px solid ${theme.palette.grey[300]}`,
        borderRadius: 2,
        transition: 'all 0.2s ease',
        backgroundColor: address.is_primary 
          ? theme.palette.primary.light + '10' 
          : 'transparent',
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <LocationIcon color="primary" />
              <Typography variant="h6" fontWeight={600}>
                Alamat
              </Typography>
              {address.is_primary && (
                <Chip
                  label="Utama"
                  color="primary"
                  size="small"
                  variant="outlined"
                  icon={<HomeIcon />}
                />
              )}
            </Stack>

            <Typography variant="body1" fontWeight={500} sx={{ mb: 1 }}>
              {address.address_line}
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {address.city}, {address.province} {address.postal_code}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Ditambahkan pada {formatDate(address.created_at)}
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <IconButton
              onClick={() => onEdit(address)}
              color="primary"
              sx={{
                border: `1px solid ${theme.palette.primary.light}`,
                '&:hover': {
                  backgroundColor: theme.palette.primary.light + '20',
                },
              }}
            >
              <EditIcon />
            </IconButton>
            
            <IconButton
              onClick={handleDelete}
              disabled={deleting}
              color="error"
              sx={{
                border: `1px solid ${theme.palette.error.light}`,
                '&:hover': {
                  backgroundColor: theme.palette.error.light + '20',
                },
              }}
            >
              <DeleteIcon />
            </IconButton>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
