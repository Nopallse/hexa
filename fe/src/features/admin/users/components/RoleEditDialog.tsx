import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Avatar,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  AdminPanelSettings as AdminIcon,
  Person as UserIcon,
} from '@mui/icons-material';
import { User } from '../types';

interface RoleEditDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSave: (userId: string, newRole: 'user' | 'admin') => Promise<void>;
  loading?: boolean;
}

export default function RoleEditDialog({
  open,
  user,
  onClose,
  onSave,
  loading = false,
}: RoleEditDialogProps) {
  const [selectedRole, setSelectedRole] = useState<'user' | 'admin'>('user');

  const handleClose = () => {
    if (!loading) {
      setSelectedRole('user');
      onClose();
    }
  };

  const handleSave = async () => {
    if (user && selectedRole !== user.role) {
      await onSave(user.id, selectedRole);
    }
    handleClose();
  };

  const handleRoleChange = (event: any) => {
    setSelectedRole(event.target.value);
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? <AdminIcon /> : <UserIcon />;
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'error' : 'default';
  };

  if (!user) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>
            {user.full_name.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="h6">Ubah Role Pengguna</Typography>
            <Typography variant="body2" color="textSecondary">
              {user.full_name} ({user.email})
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Role Saat Ini:
          </Typography>
          <Chip
            icon={getRoleIcon(user.role)}
            label={user.role === 'admin' ? 'Admin' : 'User'}
            color={getRoleColor(user.role)}
            size="medium"
          />
        </Box>

        <FormControl fullWidth>
          <InputLabel>Role Baru</InputLabel>
          <Select
            value={selectedRole}
            onChange={handleRoleChange}
            label="Role Baru"
            disabled={loading}
          >
            <MenuItem value="user">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <UserIcon />
                <Box>
                  <Typography variant="body2">User</Typography>
                  <Typography variant="caption" color="textSecondary">
                    Akses terbatas, hanya dapat berbelanja
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
            <MenuItem value="admin">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AdminIcon />
                <Box>
                  <Typography variant="body2">Admin</Typography>
                  <Typography variant="caption" color="textSecondary">
                    Akses penuh ke sistem administrasi
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          </Select>
        </FormControl>

        {selectedRole !== user.role && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
            <Typography variant="body2" color="warning.dark">
              ⚠️ Perubahan role akan mempengaruhi akses pengguna ke sistem.
              Pastikan perubahan ini sesuai dengan kebutuhan.
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Batal
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading || selectedRole === user.role}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          {loading ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
