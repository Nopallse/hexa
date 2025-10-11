/**
 * Currency conversion utility functions
 */

class CurrencyUtils {
  constructor() {
    this.supportedCurrencies = {
      'IDR': { name: 'Indonesian Rupiah', symbol: 'Rp', decimal: 0 },
      'USD': { name: 'US Dollar', symbol: '$', decimal: 2 },
      'EUR': { name: 'Euro', symbol: '€', decimal: 2 },
      'MYR': { name: 'Malaysian Ringgit', symbol: 'RM', decimal: 2 },
      'SGD': { name: 'Singapore Dollar', symbol: 'S$', decimal: 2 },
      'HKD': { name: 'Hong Kong Dollar', symbol: 'HK$', decimal: 2 },
      'AED': { name: 'UAE Dirham', symbol: 'د.إ', decimal: 2 }
    };
  }

  /**
   * Format currency amount with proper symbol and decimal places
   * @param {number} amount - Amount to format
   * @param {string} currency - Currency code
   * @returns {string} Formatted currency string
   */
  formatCurrency(amount, currency = 'IDR') {
    const currencyInfo = this.supportedCurrencies[currency];
    
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

  /**
   * Convert amount from one currency to another using exchange rates
   * @param {number} amount - Amount to convert
   * @param {string} fromCurrency - Source currency
   * @param {string} toCurrency - Target currency
   * @param {Object} exchangeRates - Exchange rates object
   * @returns {number} Converted amount
   */
  convertAmount(amount, fromCurrency, toCurrency, exchangeRates) {
    // If same currency, return original amount
    if (fromCurrency === toCurrency) {
      return amount;
    }

    // If converting from base currency (USD) to target
    if (fromCurrency === 'USD') {
      const rate = exchangeRates[toCurrency];
      if (!rate) {
        throw new Error(`Exchange rate not found for ${toCurrency}`);
      }
      return amount * rate.rate;
    }

    // If converting to base currency (USD) from source
    if (toCurrency === 'USD') {
      const rate = exchangeRates[fromCurrency];
      if (!rate) {
        throw new Error(`Exchange rate not found for ${fromCurrency}`);
      }
      return amount / rate.rate;
    }

    // If converting between non-base currencies
    // First convert to USD, then to target currency
    const fromRate = exchangeRates[fromCurrency];
    const toRate = exchangeRates[toCurrency];
    
    if (!fromRate || !toRate) {
      throw new Error(`Exchange rates not found for ${fromCurrency} or ${toCurrency}`);
    }

    // Convert to USD first
    const usdAmount = amount / fromRate.rate;
    // Then convert to target currency
    return usdAmount * toRate.rate;
  }

  /**
   * Get currency info
   * @param {string} currency - Currency code
   * @returns {Object} Currency information
   */
  getCurrencyInfo(currency) {
    return this.supportedCurrencies[currency] || null;
  }

  /**
   * Get all supported currencies
   * @returns {Object} All supported currencies
   */
  getAllSupportedCurrencies() {
    return this.supportedCurrencies;
  }

  /**
   * Validate currency code
   * @param {string} currency - Currency code to validate
   * @returns {boolean} True if valid
   */
  isValidCurrency(currency) {
    return currency in this.supportedCurrencies;
  }

  /**
   * Round amount to appropriate decimal places for currency
   * @param {number} amount - Amount to round
   * @param {string} currency - Currency code
   * @returns {number} Rounded amount
   */
  roundToCurrency(amount, currency = 'IDR') {
    const currencyInfo = this.supportedCurrencies[currency];
    const decimal = currencyInfo ? currencyInfo.decimal : 2;
    
    return Math.round(amount * Math.pow(10, decimal)) / Math.pow(10, decimal);
  }

  /**
   * Calculate price range for products with variants
   * @param {Array} variants - Product variants
   * @param {string} targetCurrency - Target currency for conversion
   * @param {Object} exchangeRates - Exchange rates
   * @returns {Object} Price range object
   */
  calculatePriceRange(variants, targetCurrency, exchangeRates) {
    if (!variants || variants.length === 0) {
      return null;
    }

    const prices = variants.map(variant => {
      const convertedPrice = this.convertAmount(
        parseFloat(variant.price),
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

  /**
   * Format price range string
   * @param {Object} priceRange - Price range object
   * @param {string} currency - Currency code
   * @returns {string} Formatted price range string
   */
  formatPriceRange(priceRange, currency = 'IDR') {
    if (!priceRange) return '';
    
    if (priceRange.min === priceRange.max) {
      return this.formatCurrency(priceRange.min, currency);
    }
    
    return `${this.formatCurrency(priceRange.min, currency)} - ${this.formatCurrency(priceRange.max, currency)}`;
  }
}

module.exports = new CurrencyUtils();
