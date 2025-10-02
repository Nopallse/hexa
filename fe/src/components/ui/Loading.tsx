import { Box, CircularProgress, Typography } from '@mui/material';

interface LoadingProps {
  message?: string;
  size?: number;
  fullScreen?: boolean;
}

export default function Loading({ 
  message = 'Memuat...', 
  size = 40, 
  fullScreen = false 
}: LoadingProps) {
  const content = (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={2}
      p={4}
    >
      <CircularProgress size={size} color="primary" />
      {message && (
        <Typography variant="body2" color="textSecondary" textAlign="center">
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bgcolor="rgba(255, 255, 255, 0.9)"
        zIndex={9999}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {content}
      </Box>
    );
  }

  return content;
}
