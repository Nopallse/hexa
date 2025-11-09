const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

// Get dashboard statistics (admin only)
router.get('/stats', [
  authenticateToken,
  requireRole(['admin'])
], dashboardController.getDashboardStats);

module.exports = router;

