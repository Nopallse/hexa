import { Container, Paper, Typography, Box } from '@mui/material';

export default function OrderDetailPage() {
  return (
    <Container maxWidth={false}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box textAlign="center">
          <Typography variant="h4" gutterBottom>
            Detail Pesanan Admin
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Halaman ini akan dikembangkan selanjutnya.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
