import React from 'react';
import { useCurrencyConversion, currencyUtils } from '@/hooks/useCurrencyConversion';

interface PriceDisplayProps {
  price: number;
  fromCurrency?: string;
  showOriginal?: boolean;
  className?: string;
}

export function PriceDisplay({ 
  price, 
  fromCurrency = 'IDR', 
  showOriginal = false,
  className = '' 
}: PriceDisplayProps) {
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
