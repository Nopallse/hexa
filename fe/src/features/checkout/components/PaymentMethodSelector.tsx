import {
  Card,
  CardContent,
  Typography,
  Stack,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Box,
  useTheme,
} from '@mui/material';
import { PaymentMethod } from '@/features/orders/types';

interface PaymentMethodSelectorProps {
  paymentMethods: PaymentMethod[];
  selectedMethod: string | null;
  onMethodSelect: (methodId: string) => void;
}

export default function PaymentMethodSelector({
  paymentMethods,
  selectedMethod,
  onMethodSelect,
}: PaymentMethodSelectorProps) {
  const theme = useTheme();

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Metode Pembayaran
        </Typography>

        <FormControl component="fieldset" fullWidth>
          <RadioGroup
            value={selectedMethod || ''}
            onChange={(e) => onMethodSelect(e.target.value)}
          >
            {paymentMethods.map((method) => (
              <FormControlLabel
                key={method.id}
                value={method.id}
                control={<Radio />}
                disabled={!method.available}
                label={
                  <Box
                    sx={{
                      p: 2,
                      border: selectedMethod === method.id 
                        ? `2px solid ${theme.palette.primary.main}` 
                        : `1px solid ${theme.palette.grey[300]}`,
                      borderRadius: 2,
                      backgroundColor: selectedMethod === method.id 
                        ? theme.palette.primary.light + '10' 
                        : 'transparent',
                      opacity: method.available ? 1 : 0.5,
                      transition: 'all 0.2s ease',
                      width: '100%',
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontSize: '2rem',
                          flexShrink: 0,
                          filter: method.available ? 'none' : 'grayscale(100%)',
                        }}
                      >
                        {method.icon}
                      </Typography>
                      
                      <Box sx={{ flex: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {method.name}
                          </Typography>
                          {method.requires_approval && (
                            <Box
                              sx={{
                                backgroundColor: theme.palette.warning.main,
                                color: 'white',
                                px: 1,
                                py: 0.25,
                                borderRadius: 1,
                                fontSize: '0.7rem',
                                fontWeight: 600,
                              }}
                            >
                              Manual
                            </Box>
                          )}
                          {!method.available && (
                            <Box
                              sx={{
                                backgroundColor: theme.palette.grey[500],
                                color: 'white',
                                px: 1,
                                py: 0.25,
                                borderRadius: 1,
                                fontSize: '0.7rem',
                                fontWeight: 600,
                              }}
                            >
                              Tidak Tersedia
                            </Box>
                          )}
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {method.description}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                }
                sx={{
                  width: '100%',
                  margin: 0,
                  mb: 1,
                  '& .MuiFormControlLabel-label': {
                    width: '100%',
                  },
                  '&.Mui-disabled': {
                    opacity: 0.5,
                  },
                }}
              />
            ))}
          </RadioGroup>
        </FormControl>

        {paymentMethods.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 4,
              px: 2,
              borderRadius: 2,
              backgroundColor: theme.palette.grey[50],
              border: `1px solid ${theme.palette.grey[200]}`,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Tidak ada metode pembayaran yang tersedia
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
