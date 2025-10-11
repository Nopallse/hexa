import {
  Card,
  CardContent,
  Box,
  Typography,
  Button,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
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
    <Card sx={{ 
      borderRadius: 2, 
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <CardContent sx={{ p: 3, flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 600,
              color: 'text.primary'
            }}
          >
            Alamat Utama
          </Typography>
          {address.is_primary && (
            <Box sx={{ 
              backgroundColor: 'primary.main', 
              color: 'white', 
              px: 1, 
              py: 0.5, 
              borderRadius: 1,
              fontSize: '0.75rem',
              fontWeight: 600
            }}>
              Default
            </Box>
          )}
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {address.address_line}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {address.city}, {address.province} {address.postal_code}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onEdit(address)}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.75rem',
            }}
          >
            Edit
          </Button>
          {!address.is_primary && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={handleDelete}
              disabled={deleting}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                fontSize: '0.75rem',
              }}
            >
              Hapus
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
