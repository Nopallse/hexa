import { RouterProvider } from 'react-router-dom';
import { useEffect } from 'react';
import { router } from './routes';
import Providers from './providers';
import { useAuthStore } from '@/store/authStore';

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    // Check authentication status on app start (only once)
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  );
}

export default App;
