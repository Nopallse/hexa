import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
  language: string;
  currency: string;
  shipping: string;
  setLanguage: (language: string) => void;
  setCurrency: (currency: string) => void;
  setShipping: (shipping: string) => void;
  resetSettings: () => void;
}

const defaultSettings = {
  language: 'ID',
  currency: 'IDR',
  shipping: 'ID',
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      
      setLanguage: (language: string) => {
        set({ language });
      },
      
      setCurrency: (currency: string) => {
        set({ currency });
      },
      
      setShipping: (shipping: string) => {
        set({ shipping });
      },
      
      resetSettings: () => {
        set(defaultSettings);
      },
    }),
    {
      name: 'hexa-settings', // nama key di localStorage
      partialize: (state) => ({
        language: state.language,
        currency: state.currency,
        shipping: state.shipping,
      }),
    }
  )
);

// Helper functions untuk mendapatkan display values
export const getLanguageDisplay = (language: string) => {
  const languages = {
    'ID': { flag: '🇮🇩', name: 'Bahasa Indonesia' },
    'EN': { flag: '🇺🇸', name: 'English' },
  };
  return languages[language as keyof typeof languages] || languages['ID'];
};

export const getCurrencyDisplay = (currency: string) => {
  const currencies = {
    'IDR': { flag: '🇮🇩', name: 'IDR - Rupiah' },
    'USD': { flag: '🇺🇸', name: 'USD - Dollar' },
    'EUR': { flag: '🇪🇺', name: 'EUR - Euro' },
    'MYR': { flag: '🇲🇾', name: 'MYR - Malaysian Ringgit' },
    'SGD': { flag: '🇸🇬', name: 'SGD - Singapore Dollar' },
    'HKD': { flag: '🇭🇰', name: 'HKD - Hong Kong Dollar' },
    'AED': { flag: '🇦🇪', name: 'AED - UAE Dirham' },
  };
  return currencies[currency as keyof typeof currencies] || currencies['IDR'];
};

export const getShippingDisplay = (shipping: string) => {
  const shippingOptions = {
    'ID': { flag: '🇮🇩', name: 'Indonesia' },
    'SG': { flag: '🇸🇬', name: 'Singapore' },
    'MY': { flag: '🇲🇾', name: 'Malaysia' },
    'TH': { flag: '🇹🇭', name: 'Thailand' },
  };
  return shippingOptions[shipping as keyof typeof shippingOptions] || shippingOptions['ID'];
};
