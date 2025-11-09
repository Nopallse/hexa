const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { shippingRatesLimiter, areasLimiter } = require('../middleware/rateLimiter');
const shippingController = require('../controllers/shippingController');
const locationController = require('../controllers/locationController');

const router = express.Router();

// ========== LOCATION MANAGEMENT ROUTES ==========

// Check API configuration status (admin only)
router.get('/config-status', [
  authenticateToken,
  requireRole(['admin'])
], async (req, res) => {
  try {
    const biteshipApiKey = process.env.BITESHIP_API_KEY;
    console.log('biteshipApiKey', biteshipApiKey);
    const biteshipConfigured = biteshipApiKey && biteshipApiKey !== 'your-biteship-api-key-here';
    
    res.json({
      success: true,
      data: {
        biteshipConfigured,
        biteshipApiKeyPresent: !!biteshipApiKey,
        fedexConfigured: true, // FedEx keys are hardcoded in service
        message: {
          biteship: biteshipConfigured 
            ? 'Biteship API is properly configured' 
            : 'Biteship API key not configured. Please set BITESHIP_API_KEY in your environment variables.',
          fedex: 'FedEx API is configured and ready for international shipping'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to check configuration status'
    });
  }
});

// Get all locations (admin only)
router.get('/locations', [
  authenticateToken,
  requireRole(['admin'])
], locationController.getLocations);

// Get active origin location (public)
router.get('/locations/active-origin', locationController.getActiveOriginLocation);

// Get location by ID (admin only)
router.get('/locations/:id', [
  authenticateToken,
  requireRole(['admin'])
], locationController.getLocationById);

// Create new location (admin only)
router.post('/locations', [
  authenticateToken,
  requireRole(['admin']),
  body('name').notEmpty().trim().withMessage('Location name is required'),
  body('contact_name').notEmpty().trim().withMessage('Contact name is required'),
  body('contact_phone').notEmpty().trim().withMessage('Contact phone is required'),
  body('address').notEmpty().trim().withMessage('Address is required'),
  body('postal_code').isNumeric().isLength({ min: 5, max: 5 }).withMessage('Postal code must be 5 digits'),
  body('note').optional().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return locationController.createLocation(req, res);
});

// Update location (admin only)
router.put('/locations/:id', [
  authenticateToken,
  requireRole(['admin']),
  body('name').optional().notEmpty().trim(),
  body('contact_name').optional().notEmpty().trim(),
  body('contact_phone').optional().notEmpty().trim(),
  body('address').optional().notEmpty().trim(),
  body('postal_code').optional().isNumeric().isLength({ min: 5, max: 5 }),
  body('note').optional().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return locationController.updateLocation(req, res);
});

// Update location status (admin only)
router.patch('/locations/:id/status', [
  authenticateToken,
  requireRole(['admin']),
  body('status').isIn(['active', 'inactive']).withMessage('Status must be either active or inactive')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return locationController.updateLocationStatus(req, res);
});

// Delete location (admin only)
router.delete('/locations/:id', [
  authenticateToken,
  requireRole(['admin'])
], locationController.deleteLocation);

// ========== SHIPPING MANAGEMENT ROUTES ==========

// Get all shipping records (admin only)
router.get('/', [
  authenticateToken,
  requireRole(['admin'])
], shippingController.getAllShipping);

// Get shipping statistics (admin only)
router.get('/stats', [
  authenticateToken,
  requireRole(['admin'])
], shippingController.getShippingStats);

// Create shipping info (admin only)
router.post('/', [
  authenticateToken,
  requireRole(['admin']),
  body('order_id').isUUID(),
  body('courier').notEmpty().trim(),
  body('tracking_number').optional().trim(),
  body('estimated_delivery').optional().isISO8601()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return shippingController.createShipping(req, res);
});


// Get areas for autocomplete (public endpoint)
router.get('/areas', areasLimiter, shippingController.getAreas);

// Get shipping rates (public endpoint)
router.post('/rates', [
  shippingRatesLimiter,
  body('origin_postal_code').isNumeric().isLength({ min: 5, max: 5 }),
  body('destination_postal_code').isNumeric().isLength({ min: 5, max: 5 }),
  body('origin_country').optional().isLength({ min: 2, max: 2 }).withMessage('Origin country code must be 2 characters'),
  body('destination_country').optional().isLength({ min: 2, max: 2 }).withMessage('Destination country code must be 2 characters'),
  body('couriers').optional().isString(),
  body('items').optional().isArray()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return shippingController.getShippingRates(req, res);
});

// Biteship webhook endpoint (public, no authentication required)
// IMPORTANT: This route must be placed before other routes to avoid conflicts
router.post('/webhook/biteship', (req, res, next) => {
  console.log('Biteship webhook received:', {
    method: req.method,
    url: req.url,
    body: req.body,
    headers: req.headers
  });
  shippingController.handleBiteshipWebhook(req, res, next);
});

// Track shipment (public endpoint)
router.get('/track/:waybillId', shippingController.trackShipment);

// Track FedEx shipment specifically (public endpoint)
router.get('/track/fedex/:waybillId', (req, res) => {
  req.query.courier = 'fedex';
  return shippingController.trackShipment(req, res);
});

// Get shipping by ID (admin only) - must be before /:id routes
router.get('/detail/:id', [
  authenticateToken,
  requireRole(['admin'])
], shippingController.getShippingById);

// Update shipping info (admin only)
router.put('/:id', [
  authenticateToken,
  requireRole(['admin']),
  body('courier').optional().notEmpty().trim(),
  body('tracking_number').optional().trim(),
  body('shipping_status').optional().isIn(['pending', 'shipped', 'in_transit', 'delivered']),
  body('estimated_delivery').optional().isISO8601(),
  body('shipped_at').optional().isISO8601(),
  body('delivered_at').optional().isISO8601()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return shippingController.updateShipping(req, res);
});

// Get shipping info for order (customer)
router.get('/order/:orderId', authenticateToken, shippingController.getShippingInfo);

module.exports = router;
