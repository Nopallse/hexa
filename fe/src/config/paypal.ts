// PayPal Configuration
export const PAYPAL_CONFIG = {
  // PayPal Client ID dari PayPal Developer Dashboard (Sandbox)
  clientId: 'AYKAvNoH0v3AJtyJ8UDHfNjb2Kh7vdwyNyAi59oFcVce8TNZFrz6stA4kklmkfAlur7RdJxhmpDA6yFM',
  
  // Environment: 'sandbox' untuk testing, 'live' untuk production
  environment: 'sandbox',
  
  // Currency - sesuaikan dengan kebutuhan bisnis
  currency: 'USD',
  
  // Locale
  locale: 'en_US',
  
  // Sandbox URL
  sandboxUrl: 'https://www.sandbox.paypal.com/sdk/js',
  liveUrl: 'https://www.paypal.com/sdk/js',
};

// PayPal SDK URL
export const getPayPalSDKUrl = () => {
  const { clientId, environment, currency, locale, sandboxUrl, liveUrl } = PAYPAL_CONFIG;
  const baseUrl = environment === 'sandbox' ? sandboxUrl : liveUrl;
  return `${baseUrl}?client-id=${clientId}&currency=${currency}&locale=${locale}`;
};

// PayPal Button Styles
export const PAYPAL_BUTTON_STYLES = {
  layout: 'vertical' as const,
  color: 'blue' as const,
  shape: 'rect' as const,
  label: 'paypal' as const,
  height: 50,
};
