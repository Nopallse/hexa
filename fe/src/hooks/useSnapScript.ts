import { useEffect, useState } from 'react';

declare global {
  interface Window {
    snap: any;
  }
}

export const useSnapScript = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSnapScript = async () => {
      if (window.snap) {
        setIsLoaded(true);
        return;
      }

      if (isLoading) return;

      setIsLoading(true);
      setError(null);

      try {
        const script = document.createElement('script');
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', 'SB-Mid-client-UtRW_uI4F5Wz6Pv8Tq8TQ');
        
        script.onload = () => {
          setIsLoaded(true);
          setIsLoading(false);
        };
        
        script.onerror = () => {
          setError('Failed to load Snap script');
          setIsLoading(false);
        };
        
        document.head.appendChild(script);
      } catch (err) {
        setError('Failed to load Snap script');
        setIsLoading(false);
      }
    };

    loadSnapScript();
  }, [isLoading]);

  return { isLoaded, isLoading, error };
};
