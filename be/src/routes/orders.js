const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

const router = express.Router();

// Get available payment methods (no auth required) - MUST be before /:id route
router.get('/payment-methods', orderController.getPaymentMethods);

// Get user's orders
router.get('/', authenticateToken, orderController.getUserOrders);

// Get order by ID
router.get('/:id', authenticateToken, orderController.getOrderById);

// Create new order (checkout)
router.post('/', [
  authenticateToken,
  body('address_id').isUUID(),
  body('shipping_cost').isFloat({ min: 0 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return orderController.createOrder(req, res);
});



// Cancel order
router.delete('/:id', authenticateToken, orderController.cancelOrder);

// Get order payment status
router.get('/:id/payment-status', authenticateToken, orderController.getOrderPaymentStatus);


// Update order status (admin only)
router.put('/:id/status', [
  authenticateToken,
  requireRole(['admin']),
  body('status').isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return orderController.updateOrderStatus(req, res);
});
module.exports = router;
