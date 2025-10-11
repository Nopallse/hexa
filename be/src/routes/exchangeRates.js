const express = require('express');
const router = express.Router();

// Debug: Check if controller exists
console.log('Loading exchange rate controller...');
const exchangeRateController = require('../controllers/exchangeRateController');
console.log('Controller loaded:', exchangeRateController);

const {
  getExchangeRates,
  updateExchangeRates,
  checkRatesFresh,
  convertCurrency
} = exchangeRateController;

// Debug: Check if functions exist
console.log('Functions:', {
  getExchangeRates: typeof getExchangeRates,
  updateExchangeRates: typeof updateExchangeRates,
  checkRatesFresh: typeof checkRatesFresh,
  convertCurrency: typeof convertCurrency,
  auth: typeof auth
});

// Public routes
router.get('/', getExchangeRates); // GET /api/rates
router.get('/fresh', checkRatesFresh); // GET /api/rates/fresh
router.post('/convert', convertCurrency); // POST /api/rates/convert

// Admin only routes
router.post('/update', updateExchangeRates); // POST /api/rates/update

module.exports = router;
