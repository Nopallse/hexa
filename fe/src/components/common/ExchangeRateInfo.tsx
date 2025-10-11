import React from 'react';
import { useExchangeRates, currencyUtils } from '@/hooks/useCurrencyConversion';
import { useSettingsStore } from '@/store/settingsStore';

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
        Last updated: {new Date().toLocaleString()}
      </small>
    </div>
  );
}
