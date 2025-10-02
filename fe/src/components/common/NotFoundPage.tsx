import { Box, Typography, Button, Container } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        textAlign="center"
        gap={3}
      >
        <Typography variant="h1" color="primary" fontWeight="bold">
          404
        </Typography>
        
        <Typography variant="h4" gutterBottom>
          Halaman Tidak Ditemukan
        </Typography>
        
        <Typography variant="body1" color="textSecondary" mb={4}>
          Maaf, halaman yang Anda cari tidak dapat ditemukan. 
          Mungkin halaman telah dipindahkan atau dihapus.
        </Typography>
        
        <Button
          variant="contained"
          size="large"
          startIcon={<HomeIcon />}
          onClick={() => navigate('/')}
        >
          Kembali ke Beranda
        </Button>
      </Box>
    </Container>
  );
}
