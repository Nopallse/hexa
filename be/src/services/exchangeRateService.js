const prisma = require('../utils/prisma');
const logger = require('../utils/logger');
const axios = require('axios');

class ExchangeRateService {
  constructor() {
    this.apiUrl = 'https://api.exchangerate.host/live';
    this.accessKey = process.env.EXCHANGERATE_API_KEY || '0fcc123ea0c0c1f4d5b8cbd612f8dd4b';
    this.baseCurrency = 'USD';
    this.supportedCurrencies = ['IDR', 'EUR', 'MYR', 'SGD', 'HKD', 'AED'];
  }

  /**
   * Fetch exchange rates from external API
   * @returns {Promise<Object>} Exchange rates data
   */
  async fetchExchangeRates() {
    try {
      logger.info('Fetching exchange rates from exchangerate.host API...');
      
      const response = await axios.get(this.apiUrl, {
        params: {
          access_key: this.accessKey,
          source: this.baseCurrency,
          currencies: this.supportedCurrencies.join(',')
        },
        timeout: 10000 // 10 seconds timeout
      });

      if (!response.data.success) {
        throw new Error(`API Error: ${response.data.error?.info || 'Unknown error'}`);
      }

      logger.info('Successfully fetched exchange rates from API');
      return response.data;
    } catch (error) {
      logger.error('Failed to fetch exchange rates:', error.message);
      throw error;
    }
  }

  /**
   * Process and store exchange rates to database
   * @param {Object} apiData - Raw API response data
   */
  async processAndStoreRates(apiData) {
    try {
      const { quotes, timestamp } = apiData;
      const rates = [];

      // Process each supported currency (USD to others)
      for (const currency of this.supportedCurrencies) {
        const quoteKey = `${this.baseCurrency}${currency}`;
        const rate = quotes[quoteKey];

        if (rate) {
          // Store USD to currency rate
          rates.push({
            from_currency: this.baseCurrency,
            to_currency: currency,
            rate: parseFloat(rate),
            source: 'exchangerate.host',
            last_updated: new Date(timestamp * 1000) // Convert Unix timestamp to Date
          });

          // Store inverse rate (currency to USD)
          rates.push({
            from_currency: currency,
            to_currency: this.baseCurrency,
            rate: 1 / parseFloat(rate), // Inverse rate
            source: 'exchangerate.host',
            last_updated: new Date(timestamp * 1000)
          });
        }
      }

      // Store/update rates in database using upsert
      for (const rateData of rates) {
        await prisma.exchangeRate.upsert({
          where: {
            from_currency_to_currency: {
              from_currency: rateData.from_currency,
              to_currency: rateData.to_currency
            }
          },
          update: {
            rate: rateData.rate,
            source: rateData.source,
            last_updated: rateData.last_updated,
            updated_at: new Date()
          },
          create: rateData
        });
      }

      logger.info(`Successfully processed and stored ${rates.length} exchange rates (including inverse rates)`);
      return rates;
    } catch (error) {
      logger.error('Failed to process and store exchange rates:', error.message);
      throw error;
    }
  }

  /**
   * Update exchange rates (main method for cronjob)
   */
  async updateExchangeRates() {
    try {
      logger.info('Starting exchange rate update process...');
      
      const apiData = await this.fetchExchangeRates();
      const storedRates = await this.processAndStoreRates(apiData);
      
      logger.info('Exchange rate update completed successfully');
      return {
        success: true,
        message: `Updated ${storedRates.length} exchange rates`,
        rates: storedRates,
        timestamp: new Date()
      };
    } catch (error) {
      logger.error('Exchange rate update failed:', error.message);
      return {
        success: false,
        error: error.message,
        timestamp: new Date()
      };
    }
  }

  /**
   * Get all exchange rates from database
   * @returns {Promise<Array>} Array of exchange rates
   */
  async getAllExchangeRates() {
    try {
      const rates = await prisma.exchangeRate.findMany({
        where: {
          from_currency: this.baseCurrency,
          to_currency: { in: this.supportedCurrencies }
        },
        orderBy: { to_currency: 'asc' }
      });

      return rates;
    } catch (error) {
      logger.error('Failed to get exchange rates from database:', error.message);
      throw error;
    }
  }

  /**
   * Get exchange rate for specific currency pair
   * @param {string} fromCurrency - Source currency
   * @param {string} toCurrency - Target currency
   * @returns {Promise<Object|null>} Exchange rate or null if not found
   */
  async getExchangeRate(fromCurrency, toCurrency) {
    try {
      const rate = await prisma.exchangeRate.findUnique({
        where: {
          from_currency_to_currency: {
            from_currency: fromCurrency,
            to_currency: toCurrency
          }
        }
      });

      return rate;
    } catch (error) {
      logger.error(`Failed to get exchange rate for ${fromCurrency} to ${toCurrency}:`, error.message);
      throw error;
    }
  }

  /**
   * Convert amount from one currency to another
   * @param {number} amount - Amount to convert
   * @param {string} fromCurrency - Source currency
   * @param {string} toCurrency - Target currency
   * @returns {Promise<number>} Converted amount
   */
  async convertCurrency(amount, fromCurrency, toCurrency) {
    try {
      // If same currency, return original amount
      if (fromCurrency === toCurrency) {
        return amount;
      }

      // Get exchange rate
      const rate = await this.getExchangeRate(fromCurrency, toCurrency);
      
      if (!rate) {
        throw new Error(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
      }

      // Convert amount
      const convertedAmount = amount * parseFloat(rate.rate);
      
      return convertedAmount;
    } catch (error) {
      logger.error(`Failed to convert ${amount} from ${fromCurrency} to ${toCurrency}:`, error.message);
      throw error;
    }
  }

  /**
   * Get rates formatted for frontend consumption
   * @returns {Promise<Object>} Formatted rates object
   */
  async getRatesForFrontend() {
    try {
      const rates = await this.getAllExchangeRates();
      
      // Format rates for frontend
      const formattedRates = {
        base: this.baseCurrency,
        timestamp: new Date(),
        rates: {}
      };

      rates.forEach(rate => {
        formattedRates.rates[rate.to_currency] = {
          rate: parseFloat(rate.rate),
          last_updated: rate.last_updated
        };
      });

      return formattedRates;
    } catch (error) {
      logger.error('Failed to get rates for frontend:', error.message);
      throw error;
    }
  }

  /**
   * Check if rates are fresh (updated within last 8 hours)
   * @returns {Promise<boolean>} True if rates are fresh
   */
  async areRatesFresh() {
    try {
      const rates = await this.getAllExchangeRates();
      
      if (rates.length === 0) {
        return false;
      }

      const eightHoursAgo = new Date(Date.now() - 8 * 60 * 60 * 1000);
      
      // Check if all rates are fresh
      return rates.every(rate => rate.last_updated > eightHoursAgo);
    } catch (error) {
      logger.error('Failed to check if rates are fresh:', error.message);
      return false;
    }
  }
}

module.exports = new ExchangeRateService();
