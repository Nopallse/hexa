const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');
const addressController = require('../controllers/addressController');

const router = express.Router();

// Get user's addresses
router.get('/', authenticateToken, addressController.getUserAddresses);

// Add new address
router.post('/', [
  authenticateToken,
  body('recipient_name').notEmpty().trim(),
  body('phone_number').notEmpty().trim(),
  body('address_line').notEmpty().trim(),
  body('city').notEmpty().trim(),
  body('province').notEmpty().trim(),
  body('postal_code').notEmpty().trim(),
  body('country').optional().isLength({ min: 2, max: 2 }).withMessage('Country code must be 2 characters'),
  body('is_primary').optional().isBoolean()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return addressController.addAddress(req, res);
});

// Update address
router.put('/:id', [
  authenticateToken,
  body('recipient_name').optional().notEmpty().trim(),
  body('phone_number').optional().notEmpty().trim(),
  body('address_line').optional().notEmpty().trim(),
  body('city').optional().notEmpty().trim(),
  body('province').optional().notEmpty().trim(),
  body('postal_code').optional().notEmpty().trim(),
  body('country').optional().isLength({ min: 2, max: 2 }).withMessage('Country code must be 2 characters'),
  body('is_primary').optional().isBoolean()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return addressController.updateAddress(req, res);
});

// Delete address
router.delete('/:id', authenticateToken, addressController.deleteAddress);

// Set primary address
router.patch('/:id/primary', authenticateToken, addressController.setPrimaryAddress);

module.exports = router;
