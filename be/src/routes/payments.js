const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

// IMPORTANT: Midtrans notification webhook must be placed FIRST before other routes
// This route has no authentication to allow Midtrans to send notifications
router.post('/midtrans/notification', (req, res, next) => {
  console.log('Midtrans notification received:', {
    method: req.method,
    url: req.url,
    originalUrl: req.originalUrl,
    body: req.body,
    headers: req.headers
  });
  paymentController.handleMidtransNotification(req, res, next);
});

// Temporary route for incorrect URL (without 's' in payments)
// This handles the case where Midtrans dashboard is configured with wrong URL
router.post('/payment/midtrans/notification', paymentController.handleMidtransNotification);

// ========== ADMIN PAYMENT MANAGEMENT ROUTES ==========

// Get all payments (admin only)
router.get('/admin/all', [
  authenticateToken,
  requireRole(['admin'])
], paymentController.getAllPayments);

// Get payment statistics (admin only)
router.get('/admin/stats', [
  authenticateToken,
  requireRole(['admin'])
], paymentController.getPaymentStats);

// Get payment by ID (admin only) - MUST be before /:orderId route
router.get('/admin/detail/:id', [
  authenticateToken,
  requireRole(['admin'])
], paymentController.getPaymentById);

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


// Get payment info for order (customer)
router.get('/order/:orderId', authenticateToken, paymentController.getPaymentInfo);

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
