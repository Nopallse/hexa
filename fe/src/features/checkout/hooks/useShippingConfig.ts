import { useState, useEffect } from 'react';
import { checkoutApi } from '../services/checkoutApi';

interface ShippingConfig {
  biteshipConfigured: boolean;
  biteshipApiKeyPresent: boolean;
  fedexConfigured: boolean;
  message: {
    biteship: string;
    fedex: string;
  };
}

export function useShippingConfig() {
  const [config, setConfig] = useState<ShippingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await checkoutApi.getShippingConfigStatus();
        
        if (response.success && response.data) {
          setConfig(response.data);
        } else {
          setError(response.error || 'Failed to fetch shipping configuration');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch shipping configuration');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return {
    config,
    loading,
    error,
    refetch: () => {
      setLoading(true);
      setError(null);
      // Re-run the effect
      const fetchConfig = async () => {
        try {
          const response = await checkoutApi.getShippingConfigStatus();
          
          if (response.success && response.data) {
            setConfig(response.data);
          } else {
            setError(response.error || 'Failed to fetch shipping configuration');
          }
        } catch (err: any) {
          setError(err.message || 'Failed to fetch shipping configuration');
        } finally {
          setLoading(false);
        }
      };
      
      fetchConfig();
    }
  };
}
