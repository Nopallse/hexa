import { Container, Paper, Box } from '@mui/material';
import RegisterForm from '../components/RegisterForm';
import { useNavigate } from 'react-router-dom';

export default function RegisterPage() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box>
          <RegisterForm 
            onSuccess={() => navigate('/login')}
            onSwitchToLogin={() => navigate('/login')}
          />
        </Box>
      </Paper>
    </Container>
  );
}
