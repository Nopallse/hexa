import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Typography,
  Chip,
  Box,
  Tooltip,
  Avatar,
} from '@mui/material';
import {
  Edit as EditIcon,
  LocationOn as LocationOnIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Location } from '../types';

interface LocationTableProps {
  locations: Location[];
  isLoading?: boolean;
  onEdit: (location: Location) => void;
  onToggleStatus: (locationId: string, status: 'active' | 'inactive') => Promise<void>;
}

export default function LocationTable({
  locations,
  isLoading = false,
  onEdit,
  onToggleStatus,
}: LocationTableProps) {
  const handleToggleStatus = async (location: Location) => {
    const newStatus = location.status === 'active' ? 'inactive' : 'active';
    try {
      await onToggleStatus(location.id, newStatus);
    } catch (error) {
      console.error('Toggle status error:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'inactive':
        return 'Tidak Aktif';
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <Typography>Memuat data lokasi...</Typography>
      </Box>
    );
  }

  if (locations.length === 0) {
    return (
      <Alert severity="info">
        Belum ada lokasi origin yang dibuat. Klik tombol "Tambah Lokasi" untuk membuat lokasi pertama.
      </Alert>
    );
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nama Lokasi</TableCell>
              <TableCell>Kontak</TableCell>
              <TableCell>Alamat</TableCell>
              <TableCell align="center">Kode Pos</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Dibuat</TableCell>
              <TableCell align="center">Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {locations.map((location) => (
              <TableRow key={location.id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                      <LocationOnIcon fontSize="small" />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" fontWeight="medium">
                        {location.name}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {location.type === 'origin' ? 'Origin' : 'Destination'}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {location.contact_name}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PhoneIcon sx={{ fontSize: '0.75rem', color: 'text.secondary' }} />
                      <Typography variant="body2" color="textSecondary">
                        {location.contact_phone}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                <TableCell>
                  <Box sx={{ maxWidth: 300 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {location.address}
                    </Typography>
                    {location.note && (
                      <Typography 
                        variant="caption" 
                        color="textSecondary"
                        sx={{ 
                          fontStyle: 'italic',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          display: 'block'
                        }}
                      >
                        {location.note}
                      </Typography>
                    )}
                  </Box>
                </TableCell>

                <TableCell align="center">
                  <Typography variant="body2" fontWeight="medium">
                    {location.postal_code}
                  </Typography>
                </TableCell>

                <TableCell align="center">
                  <Chip
                    label={getStatusLabel(location.status)}
                    color={getStatusColor(location.status)}
                    size="small"
                    variant={location.status === 'active' ? 'filled' : 'outlined'}
                  />
                </TableCell>

                <TableCell align="center">
                  <Typography variant="body2" color="textSecondary">
                    {format(new Date(location.created_at), 'dd MMM yyyy', { locale: idLocale })}
                  </Typography>
                </TableCell>

                <TableCell align="center">
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <Tooltip title="Edit Lokasi">
                      <IconButton
                        size="small"
                        onClick={() => onEdit(location)}
                        color="primary"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title={location.status === 'active' ? 'Nonaktifkan Lokasi' : 'Aktifkan Lokasi'}>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleStatus(location)}
                        color={location.status === 'active' ? 'warning' : 'success'}
                      >
                        {location.status === 'active' ? (
                          <ToggleOnIcon fontSize="small" />
                        ) : (
                          <ToggleOffIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
