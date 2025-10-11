// Frontend Multi-Currency Implementation Example

import { useState, useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';

// Currency utility functions
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

  convertAmount(amount, fromCurrency, toCurrency, exchangeRates) {
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

  roundToCurrency(amount, currency = 'IDR') {
    const currencyInfo = this.supportedCurrencies[currency];
    const decimal = currencyInfo ? currencyInfo.decimal : 2;
    
    return Math.round(amount * Math.pow(10, decimal)) / Math.pow(10, decimal);
  }

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
}

const currencyUtils = new CurrencyUtils();

// Custom hook for exchange rates
export function useExchangeRates() {
  const [exchangeRates, setExchangeRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchExchangeRates = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/rates');
        const data = await response.json();
        
        if (data.success) {
          setExchangeRates(data.data.rates);
        } else {
          throw new Error(data.error || 'Failed to fetch exchange rates');
        }
      } catch (err) {
        console.error('Error fetching exchange rates:', err);
        setError(err.message);
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
  const { exchangeRates } = useExchangeRates();
  const { currency } = useSettingsStore();

  const convertPrice = (price, fromCurrency = 'IDR') => {
    if (!exchangeRates) return price;
    
    const converted = currencyUtils.convertAmount(
      price,
      fromCurrency,
      currency,
      exchangeRates
    );
    
    return currencyUtils.roundToCurrency(converted, currency);
  };

  const formatPrice = (price, fromCurrency = 'IDR') => {
    const convertedPrice = convertPrice(price, fromCurrency);
    return currencyUtils.formatCurrency(convertedPrice, currency);
  };

  const formatPriceRange = (variants) => {
    if (!exchangeRates) return '';
    
    const priceRange = currencyUtils.calculatePriceRange(
      variants,
      currency,
      exchangeRates
    );
    
    if (!priceRange) return '';
    
    if (priceRange.min === priceRange.max) {
      return priceRange.formatted_min;
    }
    
    return `${priceRange.formatted_min} - ${priceRange.formatted_max}`;
  };

  return {
    convertPrice,
    formatPrice,
    formatPriceRange,
    exchangeRates,
    currentCurrency: currency
  };
}

// Updated ProductCard component with multi-currency support
export function ProductCard({ product, onView }) {
  const { formatPrice, formatPriceRange } = useCurrencyConversion();
  
  const hasVariants = product.product_variants && product.product_variants.length > 0;
  const priceRange = hasVariants ? 
    formatPriceRange(product.product_variants) : 
    formatPrice(parseFloat(product.price || '0'));

  return (
    <div className="product-card" onClick={() => onView(product)}>
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p className="price">{priceRange}</p>
    </div>
  );
}

// Currency selector component
export function CurrencySelector() {
  const { currency, setCurrency } = useSettingsStore();
  const { exchangeRates, loading } = useExchangeRates();

  const currencies = [
    { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'MYR', name: 'Malaysian Ringgit', symbol: 'RM' },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' },
    { code: 'HKD', name: 'Hong Kong Dollar', symbol: 'HK$' },
    { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ' }
  ];

  if (loading) {
    return <div>Loading currencies...</div>;
  }

  return (
    <select 
      value={currency} 
      onChange={(e) => setCurrency(e.target.value)}
      className="currency-selector"
    >
      {currencies.map(curr => (
        <option key={curr.code} value={curr.code}>
          {curr.symbol} {curr.name}
        </option>
      ))}
    </select>
  );
}

// Price display component
export function PriceDisplay({ 
  price, 
  fromCurrency = 'IDR', 
  showOriginal = false,
  className = '' 
}) {
  const { formatPrice, convertPrice, currentCurrency } = useCurrencyConversion();
  
  const convertedPrice = convertPrice(price, fromCurrency);
  const formattedPrice = formatPrice(price, fromCurrency);

  return (
    <div className={`price-display ${className}`}>
      <span className="current-price">{formattedPrice}</span>
      {showOriginal && fromCurrency !== currentCurrency && (
        <span className="original-price">
          {currencyUtils.formatCurrency(price, fromCurrency)}
        </span>
      )}
    </div>
  );
}

// Exchange rate info component
export function ExchangeRateInfo() {
  const { exchangeRates, loading, error } = useExchangeRates();
  const { currency } = useSettingsStore();

  if (loading) return <div>Loading exchange rates...</div>;
  if (error) return <div>Error loading rates: {error}</div>;
  if (!exchangeRates) return null;

  const currentRate = exchangeRates[currency];
  if (!currentRate) return null;

  return (
    <div className="exchange-rate-info">
      <small>
        1 USD = {currencyUtils.formatCurrency(currentRate.rate, currency)}
        <br />
        Last updated: {new Date(currentRate.last_updated).toLocaleString()}
      </small>
    </div>
  );
}

// Usage example in a product list
export function ProductList({ products }) {
  const { formatPrice, formatPriceRange } = useCurrencyConversion();

  return (
    <div className="product-list">
      <CurrencySelector />
      <ExchangeRateInfo />
      
      {products.map(product => (
        <ProductCard 
          key={product.id} 
          product={product} 
          onView={(product) => console.log('View product:', product)}
        />
      ))}
    </div>
  );
}

// Usage example in cart
export function CartItem({ item }) {
  const { formatPrice } = useCurrencyConversion();
  
  return (
    <div className="cart-item">
      <h4>{item.product.name}</h4>
      <p>Price: {formatPrice(item.product.price)}</p>
      <p>Quantity: {item.quantity}</p>
      <p>Total: {formatPrice(item.product.price * item.quantity)}</p>
    </div>
  );
}

// Usage example in checkout
export function CheckoutSummary({ items, shippingCost }) {
  const { formatPrice } = useCurrencyConversion();
  
  const subtotal = items.reduce((sum, item) => 
    sum + (item.product.price * item.quantity), 0
  );
  
  const total = subtotal + shippingCost;

  return (
    <div className="checkout-summary">
      <div className="summary-row">
        <span>Subtotal:</span>
        <span>{formatPrice(subtotal)}</span>
      </div>
      <div className="summary-row">
        <span>Shipping:</span>
        <span>{formatPrice(shippingCost)}</span>
      </div>
      <div className="summary-row total">
        <span>Total:</span>
        <span>{formatPrice(total)}</span>
      </div>
    </div>
  );
}

export default {
  useExchangeRates,
  useCurrencyConversion,
  ProductCard,
  CurrencySelector,
  PriceDisplay,
  ExchangeRateInfo,
  ProductList,
  CartItem,
  CheckoutSummary,
  currencyUtils
};
