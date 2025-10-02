import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Alert,
  TablePagination,
} from '@mui/material';
import { userApi } from '../services/userApi';
import UserTable from '../components/UserTable';
import UserFilter from '../components/UserFilter';
import UserStatsCard from '../components/UserStatsCard';
import RoleEditDialog from '../components/RoleEditDialog';
import Loading from '@/components/ui/Loading';
import { useUiStore } from '@/store/uiStore';
import { UserQueryParams, User, UserStats } from '../types';

export default function UserListPage() {
  const navigate = useNavigate();
  const { showNotification } = useUiStore();
  
  const [users, setUsers] = useState<User[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState<UserQueryParams>({});
  
  // Role edit dialog state
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [roleUpdateLoading, setRoleUpdateLoading] = useState(false);

  const fetchUsers = async (params?: UserQueryParams) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await userApi.getUsers({
        page: (page || 0) + 1,
        limit: rowsPerPage,
        ...params,
      });
      
      if (response.success) {
        setUsers(response.data);
        setTotal(response.pagination?.total_items || 0);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error: any) {
      setError(error.message || 'Gagal memuat data pengguna');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      setIsStatsLoading(true);
      const response = await userApi.getUserStats();
      
      if (response.success) {
        setUserStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
    } finally {
      setIsStatsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(filters);
  }, [page, rowsPerPage, filters]);

  useEffect(() => {
    fetchUserStats();
  }, []);

  const handleView = (user: User) => {
    navigate(`/admin/users/${user.id}`);
  };

  const handleEditRole = (user: User) => {
    setSelectedUser(user);
    setRoleDialogOpen(true);
  };

  const handleRoleUpdate = async (userId: string, newRole: 'user' | 'admin') => {
    try {
      setRoleUpdateLoading(true);
      const response = await userApi.updateUserRole(userId, { role: newRole });
      
      if (response.success) {
        showNotification({
          type: 'success',
          message: response.message || 'Role pengguna berhasil diperbarui',
        });
        
        // Refresh data
        await fetchUsers(filters);
        await fetchUserStats();
      } else {
        throw new Error(response.message || 'Failed to update user role');
      }
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Gagal memperbarui role pengguna',
      });
      throw error;
    } finally {
      setRoleUpdateLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      const response = await userApi.deleteUser(userId);
      
      if (response.success) {
        showNotification({
          type: 'success',
          message: response.message || 'Pengguna berhasil dihapus',
        });
        
        // Refresh data
        await fetchUsers(filters);
        await fetchUserStats();
      } else {
        throw new Error(response.message || 'Failed to delete user');
      }
    } catch (error: any) {
      showNotification({
        type: 'error',
        message: error.message || 'Gagal menghapus pengguna',
      });
      throw error;
    }
  };

  const handleFilterChange = useCallback((newFilters: UserQueryParams) => {
    setFilters(newFilters);
    setPage(0); // Reset to first page when filtering
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (isLoading && users.length === 0) {
    return <Loading message="Memuat data pengguna..." />;
  }

  return (
    <Container maxWidth={false}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Kelola Pengguna
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Kelola pengguna dan akses sistem
        </Typography>
      </Box>

      {/* User Statistics */}
      <UserStatsCard stats={userStats} isLoading={isStatsLoading} />

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Filter */}
      <UserFilter
        onFilterChange={handleFilterChange}
        loading={isLoading}
        initialFilters={filters}
      />

      {/* Users Table */}
      <UserTable
        users={users}
        isLoading={isLoading}
        onView={handleView}
        onEditRole={handleEditRole}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      {total > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Baris per halaman:"
          labelDisplayedRows={({ from, to, count }) => 
            `${from}-${to} dari ${count !== -1 ? count : `lebih dari ${to}`}`
          }
        />
      )}

      {/* Role Edit Dialog */}
      <RoleEditDialog
        open={roleDialogOpen}
        user={selectedUser}
        onClose={() => setRoleDialogOpen(false)}
        onSave={handleRoleUpdate}
        loading={roleUpdateLoading}
      />
    </Container>
  );
}
