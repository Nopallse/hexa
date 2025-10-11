import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { exchangeRateService, ExchangeRatesResponse } from '@/services/exchangeRateService';

// Currency utility functions
class CurrencyUtils {
  private supportedCurrencies = {
    'IDR': { name: 'Indonesian Rupiah', symbol: 'Rp', decimal: 0 },
    'USD': { name: 'US Dollar', symbol: '$', decimal: 2 },
    'EUR': { name: 'Euro', symbol: '€', decimal: 2 },
    'MYR': { name: 'Malaysian Ringgit', symbol: 'RM', decimal: 2 },
    'SGD': { name: 'Singapore Dollar', symbol: 'S$', decimal: 2 },
    'HKD': { name: 'Hong Kong Dollar', symbol: 'HK$', decimal: 2 },
    'AED': { name: 'UAE Dirham', symbol: 'د.إ', decimal: 2 }
  };

  formatCurrency(amount: number, currency: string = 'IDR'): string {
    const currencyInfo = this.supportedCurrencies[currency as keyof typeof this.supportedCurrencies];
    
    if (!currencyInfo) {
      return `${amount.toFixed(2)} ${currency}`;
    }

    const { symbol, decimal } = currencyInfo;
    const formattedAmount = amount.toLocaleString('en-US', {
      minimumFractionDigits: decimal,
      maximumFractionDigits: decimal
    });

    return `${symbol} ${formattedAmount}`;
  }

  convertAmount(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
    exchangeRates: Record<string, { rate: number }>
  ): number {
    if (fromCurrency === toCurrency) {
      return amount;
    }

    if (fromCurrency === 'USD') {
      const rate = exchangeRates[toCurrency];
      if (!rate) return amount;
      return amount * rate.rate;
    }

    if (toCurrency === 'USD') {
      const rate = exchangeRates[fromCurrency];
      if (!rate) return amount;
      return amount / rate.rate;
    }

    // Convert between non-base currencies
    const fromRate = exchangeRates[fromCurrency];
    const toRate = exchangeRates[toCurrency];
    
    if (!fromRate || !toRate) return amount;

    const usdAmount = amount / fromRate.rate;
    return usdAmount * toRate.rate;
  }

  roundToCurrency(amount: number, currency: string = 'IDR'): number {
    const currencyInfo = this.supportedCurrencies[currency as keyof typeof this.supportedCurrencies];
    const decimal = currencyInfo ? currencyInfo.decimal : 2;
    
    return Math.round(amount * Math.pow(10, decimal)) / Math.pow(10, decimal);
  }

  calculatePriceRange(
    variants: Array<{ price: string | number; currency_code?: string }>,
    targetCurrency: string,
    exchangeRates: Record<string, { rate: number }>
  ) {
    if (!variants || variants.length === 0) {
      return null;
    }

    const prices = variants.map(variant => {
      const convertedPrice = this.convertAmount(
        parseFloat(String(variant.price)),
        variant.currency_code || 'IDR',
        targetCurrency,
        exchangeRates
      );
      return this.roundToCurrency(convertedPrice, targetCurrency);
    });

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
      formatted_min: this.formatCurrency(Math.min(...prices), targetCurrency),
      formatted_max: this.formatCurrency(Math.max(...prices), targetCurrency)
    };
  }

  formatPriceRange(priceRange: { min: number; max: number } | null, currency: string = 'IDR'): string {
    if (!priceRange) return '';
    
    if (priceRange.min === priceRange.max) {
      return this.formatCurrency(priceRange.min, currency);
    }
    
    return `${this.formatCurrency(priceRange.min, currency)} - ${this.formatCurrency(priceRange.max, currency)}`;
  }

  getCurrencyInfo(currency: string) {
    return this.supportedCurrencies[currency as keyof typeof this.supportedCurrencies] || null;
  }

  getAllSupportedCurrencies() {
    return this.supportedCurrencies;
  }
}

export const currencyUtils = new CurrencyUtils();

// Custom hook for exchange rates
export function useExchangeRates() {
  const [exchangeRates, setExchangeRates] = useState<Record<string, { rate: number }> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const rates = await exchangeRateService.getCachedExchangeRates();
        setExchangeRates(rates.rates);
      } catch (err) {
        console.error('Error fetching exchange rates:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch exchange rates');
      } finally {
        setLoading(false);
      }
    };

    fetchExchangeRates();
  }, []);

  return { exchangeRates, loading, error };
}

// Custom hook for currency conversion
export function useCurrencyConversion() {
  const { exchangeRates, loading, error } = useExchangeRates();
  const { currency } = useSettingsStore();

  const convertPrice = (price: number, fromCurrency: string = 'IDR'): number => {
    if (!exchangeRates) return price;
    
    const converted = currencyUtils.convertAmount(
      price,
      fromCurrency,
      currency,
      exchangeRates
    );
    
    return currencyUtils.roundToCurrency(converted, currency);
  };

  const formatPrice = (price: number, fromCurrency: string = 'IDR'): string => {
    const convertedPrice = convertPrice(price, fromCurrency);
    return currencyUtils.formatCurrency(convertedPrice, currency);
  };

  const formatPriceRange = (variants: Array<{ price: string | number; currency_code?: string }>): string => {
    if (!exchangeRates) return '';
    
    const priceRange = currencyUtils.calculatePriceRange(
      variants,
      currency,
      exchangeRates
    );
    
    return currencyUtils.formatPriceRange(priceRange, currency);
  };

  return {
    convertPrice,
    formatPrice,
    formatPriceRange,
    exchangeRates,
    currentCurrency: currency,
    loading,
    error
  };
}


