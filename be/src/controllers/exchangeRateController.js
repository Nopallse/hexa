const exchangeRateService = require('../services/exchangeRateService');
const logger = require('../utils/logger');

/**
 * Get all exchange rates for frontend
 * GET /api/rates
 */
const getExchangeRates = async (req, res) => {
  try {
    const rates = await exchangeRateService.getRatesForFrontend();
    
    res.json({
      success: true,
      data: rates
    });
  } catch (error) {
    logger.error('Get exchange rates error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch exchange rates'
    });
  }
};

/**
 * Update exchange rates manually (admin only)
 * POST /api/rates/update
 */
const updateExchangeRates = async (req, res) => {
  try {
    const result = await exchangeRateService.updateExchangeRates();
    
    if (result.success) {
      res.json({
        success: true,
        message: result.message,
        data: {
          rates: result.rates,
          timestamp: result.timestamp
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        timestamp: result.timestamp
      });
    }
  } catch (error) {
    logger.error('Update exchange rates error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update exchange rates'
    });
  }
};

/**
 * Check if exchange rates are fresh
 * GET /api/rates/fresh
 */
const checkRatesFresh = async (req, res) => {
  try {
    const isFresh = await exchangeRateService.areRatesFresh();
    
    res.json({
      success: true,
      data: {
        is_fresh: isFresh,
        timestamp: new Date()
      }
    });
  } catch (error) {
    logger.error('Check rates fresh error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check rates freshness'
    });
  }
};

/**
 * Convert currency amount
 * POST /api/rates/convert
 */
const convertCurrency = async (req, res) => {
  try {
    const { amount, from_currency, to_currency } = req.body;
    
    if (!amount || !from_currency || !to_currency) {
      return res.status(400).json({
        success: false,
        error: 'Amount, from_currency, and to_currency are required'
      });
    }

    const convertedAmount = await exchangeRateService.convertCurrency(
      parseFloat(amount),
      from_currency,
      to_currency
    );
    
    res.json({
      success: true,
      data: {
        original_amount: parseFloat(amount),
        from_currency,
        to_currency,
        converted_amount: convertedAmount,
        timestamp: new Date()
      }
    });
  } catch (error) {
    logger.error('Convert currency error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to convert currency'
    });
  }
};

module.exports = {
  getExchangeRates,
  updateExchangeRates,
  checkRatesFresh,
  convertCurrency
};
