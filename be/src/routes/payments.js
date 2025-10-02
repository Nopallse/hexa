const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

// Create payment (traditional methods)
router.post('/', [
  authenticateToken,
  body('order_id').isUUID(),
  body('payment_method').isIn(['transfer', 'e-wallet', 'COD']),
  body('amount').isFloat({ min: 0 }),
  body('payment_reference').optional().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return paymentController.createPayment(req, res);
});

// Create PayPal payment
router.post('/paypal/create', [
  authenticateToken,
  body('order_id').isUUID()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return paymentController.createPayPalPayment(req, res);
});

// Capture PayPal payment
router.post('/paypal/capture', [
  authenticateToken,
  body('paypal_order_id').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return paymentController.capturePayPalPayment(req, res);
});

// PayPal webhook (no authentication required)
router.post('/paypal/webhook', paymentController.handlePayPalWebhook);

// Refund PayPal payment
router.post('/paypal/refund', [
  authenticateToken,
  requireRole(['admin']),
  body('payment_id').isUUID(),
  body('amount').optional().isFloat({ min: 0 }),
  body('reason').optional().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return paymentController.refundPayPalPayment(req, res);
});

// Get payment info for order
router.get('/:orderId', authenticateToken, paymentController.getPaymentInfo);

// Verify payment (admin only)
router.put('/:id/verify', [
  authenticateToken,
  requireRole(['admin']),
  body('payment_status').isIn(['paid', 'failed', 'refunded']),
  body('payment_date').optional().isISO8601()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return paymentController.verifyPayment(req, res);
});

module.exports = router;
