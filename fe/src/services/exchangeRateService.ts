import axiosInstance from '@/services/axiosInstance';

export interface ExchangeRate {
  rate: number;
  last_updated: string;
}

export interface ExchangeRatesResponse {
  base: string;
  timestamp: string;
  rates: Record<string, ExchangeRate>;
}

export interface ConvertCurrencyRequest {
  amount: number;
  from_currency: string;
  to_currency: string;
}

export interface ConvertCurrencyResponse {
  original_amount: number;
  from_currency: string;
  to_currency: string;
  converted_amount: number;
  timestamp: string;
}

class ExchangeRateService {
  private cache: ExchangeRatesResponse | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  /**
   * Get exchange rates from API
   */
  async getExchangeRates(): Promise<ExchangeRatesResponse> {
    try {
      const response = await axiosInstance.get('/rates');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      throw error;
    }
  }

  /**
   * Get cached exchange rates or fetch from API
   */
  async getCachedExchangeRates(): Promise<ExchangeRatesResponse> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.cache && (now - this.cacheTimestamp) < this.CACHE_DURATION) {
      return this.cache;
    }

    // Fetch new data
    const rates = await this.getExchangeRates();
    this.cache = rates;
    this.cacheTimestamp = now;
    
    return rates;
  }

  /**
   * Convert currency amount
   */
  async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<number> {
    try {
      const response = await axiosInstance.post('/rates/convert', {
        amount,
        from_currency: fromCurrency,
        to_currency: toCurrency,
      });
      
      return response.data.data.converted_amount;
    } catch (error) {
      console.error('Error converting currency:', error);
      throw error;
    }
  }

  /**
   * Check if exchange rates are fresh
   */
  async areRatesFresh(): Promise<boolean> {
    try {
      const response = await axiosInstance.get('/rates/fresh');
      return response.data.data.is_fresh;
    } catch (error) {
      console.error('Error checking rates freshness:', error);
      return false;
    }
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache = null;
    this.cacheTimestamp = 0;
  }
}

export const exchangeRateService = new ExchangeRateService();
