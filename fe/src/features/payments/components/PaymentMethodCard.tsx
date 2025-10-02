import {
  Card,
  CardContent,
  Box,
  Typography,
  Stack,
  Radio,
  Chip,
  useTheme,
} from '@mui/material';
import {
  CreditCard as CreditCardIcon,
} from '@mui/icons-material';
import { PaymentMethod } from '@/features/orders/types';

interface PaymentMethodCardProps {
  method: PaymentMethod;
  selected: boolean;
  onSelect: () => void;
}

export default function PaymentMethodCard({ method, selected, onSelect }: PaymentMethodCardProps) {
  const theme = useTheme();

  const getIcon = (methodId: string) => {
    // Hanya PayPal yang tersedia
    return <CreditCardIcon sx={{ fontSize: '2rem' }} />;
  };

  const getMethodColor = (methodId: string) => {
    // Hanya PayPal yang tersedia
    return '#003087';
  };

  return (
    <Card
      sx={{
        border: selected 
          ? `2px solid ${theme.palette.primary.main}` 
          : `1px solid ${theme.palette.grey[300]}`,
        borderRadius: 2,
        cursor: method.available ? 'pointer' : 'not-allowed',
        opacity: method.available ? 1 : 0.6,
        transition: 'all 0.2s ease',
        backgroundColor: selected 
          ? theme.palette.primary.light + '10' 
          : 'transparent',
        '&:hover': method.available ? {
          borderColor: theme.palette.primary.main,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        } : {},
      }}
      onClick={method.available ? onSelect : undefined}
    >
      <CardContent sx={{ p: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Radio
            checked={selected}
            onChange={onSelect}
            disabled={!method.available}
            sx={{ flexShrink: 0 }}
          />
          
          <Box
            sx={{
              color: getMethodColor(method.id),
              flexShrink: 0,
              filter: method.available ? 'none' : 'grayscale(100%)',
            }}
          >
            {getIcon(method.id)}
          </Box>
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                {method.name}
              </Typography>
              
              {method.id === 'paypal' && (
                <Chip
                  label="Gateway"
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              )}
              
              {!method.available && (
                <Chip
                  label="Tidak Tersedia"
                  size="small"
                  color="default"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem' }}
                />
              )}
            </Stack>
            
            <Typography variant="body2" color="text.secondary">
              {method.description}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
