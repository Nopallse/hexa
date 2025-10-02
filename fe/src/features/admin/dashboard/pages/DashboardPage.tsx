import { Container, Paper, Typography, Box, Card, CardContent } from '@mui/material';
import { Dashboard, TrendingUp, People, ShoppingCart } from '@mui/icons-material';

export default function DashboardPage() {
  return (
    <Container maxWidth={false}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Dashboard Admin
      </Typography>
      
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
        {/* Stats Cards */}
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' } }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <ShoppingCart color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    0
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Pesanan
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' } }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <TrendingUp color="success" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    Rp 0
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Pendapatan
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' } }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Dashboard color="info" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    0
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Produk
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 22%' } }}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <People color="warning" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" fontWeight="bold">
                    0
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Pengguna
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Box mt={4}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>
            Selamat datang di Admin Panel Hexa Crochet
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Dashboard ini akan menampilkan statistik dan informasi penting untuk mengelola toko online Anda.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
