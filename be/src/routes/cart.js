const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const cartController = require('../controllers/cartController');

const router = express.Router();

// Get user's cart
router.get('/', authenticateToken, cartController.getCart);

// Get cart summary (total items count)
router.get('/summary', authenticateToken, cartController.getCartSummary);

// Add item to cart
router.post('/', [
  authenticateToken,
  body('product_variant_id').isUUID(),
  body('quantity').isInt({ min: 1 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return cartController.addToCart(req, res);
});

// Update cart item quantity
router.put('/:id', [
  authenticateToken,
  body('quantity').isInt({ min: 1 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return cartController.updateCartItem(req, res);
});

// Remove item from cart
router.delete('/:id', authenticateToken, cartController.removeFromCart);

// Clear entire cart
router.delete('/', authenticateToken, cartController.clearCart);

module.exports = router;
