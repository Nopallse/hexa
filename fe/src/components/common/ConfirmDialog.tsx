import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
  IconButton,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Close as CloseIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'warning' | 'info' | 'error' | 'success';
  confirmColor?: 'primary' | 'secondary' | 'error' | 'warning' | 'info' | 'success';
  loading?: boolean;
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Ya',
  cancelText = 'Batal',
  variant = 'warning',
  confirmColor = 'primary',
  loading = false,
}: ConfirmDialogProps) {
  const theme = useTheme();

  const getIcon = () => {
    switch (variant) {
      case 'error':
        return <ErrorIcon sx={{ color: 'error.main', fontSize: 40 }} />;
      case 'info':
        return <InfoIcon sx={{ color: 'info.main', fontSize: 40 }} />;
      case 'success':
        return <CheckCircleIcon sx={{ color: 'success.main', fontSize: 40 }} />;
      case 'warning':
      default:
        return <WarningIcon sx={{ color: 'warning.main', fontSize: 40 }} />;
    }
  };

  const getConfirmButtonColor = () => {
    if (confirmColor !== 'primary') return confirmColor;
    switch (variant) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'success':
        return 'success';
      case 'info':
      default:
        return 'primary';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2,
          pt: 3,
          px: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {getIcon()}
          <Typography variant="h6" fontWeight={600}>
            {title || 'Konfirmasi'}
          </Typography>
        </Box>
        {!loading && (
          <IconButton
            onClick={onClose}
            size="small"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                backgroundColor: 'action.hover',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent sx={{ px: 3, pb: 2 }}>
        <DialogContentText
          sx={{
            color: 'text.primary',
            fontSize: '1rem',
            lineHeight: 1.6,
            mb: 1,
          }}
        >
          {message}
        </DialogContentText>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3, gap: 1 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          variant="outlined"
          sx={{
            minWidth: 100,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            borderColor: 'divider',
            color: 'text.primary',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'action.hover',
            },
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          disabled={loading}
          variant="contained"
          color={getConfirmButtonColor()}
          sx={{
            minWidth: 100,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          {loading ? 'Memproses...' : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

