import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Box,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Tooltip,
  Skeleton,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AdminPanelSettings as AdminIcon,
  Person as UserIcon,
  ShoppingCart as CartIcon,
  Home as AddressIcon,
  Receipt as OrderIcon,
} from '@mui/icons-material';
import { User } from '../types';

interface UserTableProps {
  users: User[];
  isLoading: boolean;
  onView: (user: User) => void;
  onEditRole: (user: User) => void;
  onDelete: (userId: string) => void;
}

export default function UserTable({
  users,
  isLoading,
  onView,
  onEditRole,
  onDelete,
}: UserTableProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedUser(null);
  };

  const handleView = () => {
    if (selectedUser) {
      onView(selectedUser);
    }
    handleMenuClose();
  };

  const handleEditRole = () => {
    if (selectedUser) {
      onEditRole(selectedUser);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    if (selectedUser) {
      setUserToDelete(selectedUser.id);
      setDeleteDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteConfirm = () => {
    if (userToDelete) {
      onDelete(userToDelete);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'error' : 'default';
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? <AdminIcon /> : <UserIcon />;
  };

  if (isLoading) {
    return (
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Pengguna</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Statistik</TableCell>
              <TableCell>Tanggal Dibuat</TableCell>
              <TableCell align="center">Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Skeleton variant="circular" width={40} height={40} />
                    <Box>
                      <Skeleton variant="text" width={120} />
                      <Skeleton variant="text" width={80} />
                    </Box>
                  </Box>
                </TableCell>
                <TableCell><Skeleton variant="text" width={150} /></TableCell>
                <TableCell><Skeleton variant="text" width={60} /></TableCell>
                <TableCell><Skeleton variant="text" width={100} /></TableCell>
                <TableCell><Skeleton variant="text" width={120} /></TableCell>
                <TableCell align="center">
                  <Skeleton variant="circular" width={32} height={32} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Pengguna</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Statistik</TableCell>
              <TableCell>Tanggal Dibuat</TableCell>
              <TableCell align="center">Aksi</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="textSecondary">
                    Tidak ada data pengguna
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main' }}>
                        {user.full_name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="medium">
                          {user.full_name}
                        </Typography>
                        {user.phone && (
                          <Typography variant="caption" color="textSecondary">
                            {user.phone}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{user.email}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getRoleIcon(user.role)}
                      label={user.role === 'admin' ? 'Admin' : 'User'}
                      color={getRoleColor(user.role)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Tooltip title="Alamat">
                        <Chip
                          icon={<AddressIcon />}
                          label={user._count?.addresses || 0}
                          size="small"
                          variant="outlined"
                        />
                      </Tooltip>
                      <Tooltip title="Keranjang">
                        <Chip
                          icon={<CartIcon />}
                          label={user._count?.cart_items || 0}
                          size="small"
                          variant="outlined"
                        />
                      </Tooltip>
                      <Tooltip title="Pesanan">
                        <Chip
                          icon={<OrderIcon />}
                          label={user._count?.orders || 0}
                          size="small"
                          variant="outlined"
                        />
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(user.created_at)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, user)}
                      size="small"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleView}>
          <ViewIcon sx={{ mr: 1 }} />
          Lihat Detail
        </MenuItem>
        <MenuItem onClick={handleEditRole}>
          <EditIcon sx={{ mr: 1 }} />
          Ubah Role
        </MenuItem>
        <MenuItem onClick={handleDeleteClick} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Hapus
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Konfirmasi Hapus Pengguna
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Apakah Anda yakin ingin menghapus pengguna{' '}
            <strong>{selectedUser?.full_name}</strong>? 
            Tindakan ini tidak dapat dibatalkan dan akan menghapus semua data terkait pengguna.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel} color="inherit">
            Batal
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Hapus
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
