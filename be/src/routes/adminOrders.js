const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const orderController = require('../controllers/orderController');

const router = express.Router();

// Get all orders (admin only)
router.get('/', authenticateToken, requireRole(['admin']), orderController.getAllOrders);

// Get order by ID (admin only)
router.get('/:id', authenticateToken, requireRole(['admin']), orderController.getOrderByIdAdmin);

module.exports = router;

