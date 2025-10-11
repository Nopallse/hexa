const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

const router = express.Router();


// Create Midtrans payment
router.post('/midtrans/create', [
  authenticateToken,
  body('order_id').isUUID(),
  body('payment_method').optional().isIn(['bank_transfer', 'e_wallet', 'credit_card', 'qris'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return paymentController.createMidtransPayment(req, res);
});

// Midtrans notification webhook (no authentication required)
router.post('/midtrans/notification', paymentController.handleMidtransNotification);

// Get payment status for an order
router.get('/status/:orderId', authenticateToken, paymentController.getPaymentStatus);

// Cancel active payment
router.post('/cancel/:orderId', authenticateToken, paymentController.cancelActivePayment);

// Get Midtrans transaction status
router.get('/midtrans/:orderId/status', authenticateToken, paymentController.getMidtransTransactionStatus);

// Continue existing Midtrans payment
router.post('/midtrans/continue', [
  authenticateToken,
  body('order_id').isUUID(),
  body('payment_method').optional().isIn(['bank_transfer', 'e_wallet', 'credit_card', 'qris'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return paymentController.continueMidtransPayment(req, res);
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
