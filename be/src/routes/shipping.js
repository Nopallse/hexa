const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const shippingController = require('../controllers/shippingController');

const router = express.Router();

// Get shipping info for order
router.get('/:orderId', authenticateToken, shippingController.getShippingInfo);

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

module.exports = router;
