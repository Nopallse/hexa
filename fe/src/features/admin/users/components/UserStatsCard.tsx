import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  Skeleton,
} from '@mui/material';
import {
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon,
  Person as UserIcon,
  TrendingUp as TrendingUpIcon,
  ShoppingCart as CartIcon,
  PersonOff as PersonOffIcon,
} from '@mui/icons-material';
import { UserStats } from '../types';

interface UserStatsCardProps {
  stats: UserStats | null;
  isLoading: boolean;
}

export default function UserStatsCard({ stats, isLoading }: UserStatsCardProps) {
  const statItems = [
    {
      title: 'Total Pengguna',
      value: stats?.total_users || 0,
      icon: <PeopleIcon />,
      color: 'primary',
      description: 'Semua pengguna terdaftar',
    },
    {
      title: 'Admin',
      value: stats?.total_admins || 0,
      icon: <AdminIcon />,
      color: 'error',
      description: 'Pengguna dengan akses admin',
    },
    {
      title: 'User Biasa',
      value: stats?.total_regular_users || 0,
      icon: <UserIcon />,
      color: 'info',
      description: 'Pengguna dengan akses terbatas',
    },
    {
      title: 'Pengguna Baru',
      value: stats?.recent_users || 0,
      icon: <TrendingUpIcon />,
      color: 'success',
      description: 'Bergabung dalam 30 hari terakhir',
    },
    {
      title: 'Dengan Pesanan',
      value: stats?.users_with_orders || 0,
      icon: <CartIcon />,
      color: 'warning',
      description: 'Pengguna yang pernah berbelanja',
    },
    {
      title: 'Tanpa Pesanan',
      value: stats?.users_without_orders || 0,
      icon: <PersonOffIcon />,
      color: 'default',
      description: 'Pengguna yang belum berbelanja',
    },
  ];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
        {statItems.map((_, index) => (
          <Box key={index} sx={{ flex: '1 1 250px', minWidth: '250px' }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Skeleton variant="circular" width={40} height={40} />
                  <Box sx={{ ml: 2, flex: 1 }}>
                    <Skeleton variant="text" width="80%" />
                    <Skeleton variant="text" width="60%" />
                  </Box>
                </Box>
                <Skeleton variant="text" width="40%" />
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3, mb: 3 }}>
      {statItems.map((item, index) => (
        <Box key={index} sx={{ flex: '1 1 250px', minWidth: '250px' }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 1,
                    bgcolor: `${item.color}.light`,
                    color: `${item.color}.main`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.icon}
                </Box>
                <Box sx={{ ml: 2, flex: 1 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    {item.title}
                  </Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {item.value.toLocaleString('id-ID')}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="caption" color="textSecondary">
                {item.description}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      ))}
    </Box>
  );
}
