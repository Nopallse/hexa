import { Container, Paper, Typography, Box } from '@mui/material';

export default function ForgotPasswordPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box textAlign="center">
          <Typography variant="h4" gutterBottom>
            Lupa Password
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Halaman ini akan dikembangkan selanjutnya.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
