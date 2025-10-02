import { Outlet } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import Header from './Header';
import Footer from './Footer';

export default function CustomerLayout() {
  return (
    <Box 
      display="flex" 
      flexDirection="column" 
      minHeight="100vh"
      sx={{
        backgroundColor: 'background.default',
      }}
    >
      <CssBaseline />
      <Header />
      
      <Box 
        component="main" 
        flex={1}
        sx={{
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Outlet />
      </Box>
      
      <Footer />
    </Box>
  );
}
