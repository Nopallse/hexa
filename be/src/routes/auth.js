const express = require('express');
const { body, validationResult } = require('express-validator');
const authController = require('../controllers/authController');

const router = express.Router();

// Register user
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('full_name').notEmpty().trim(),
  body('phone').optional().isMobilePhone('id-ID')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return authController.register(req, res);
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return authController.login(req, res);
});

// Logout user
router.post('/logout', authController.logout);

// Get current user profile
router.get('/me', authController.getProfile);

// Refresh access token
router.post('/refresh', [
  body('refreshToken').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return authController.refreshToken(req, res);
});

// Verify email
router.post('/verify-email', [
  body('token').notEmpty().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return authController.verifyEmail(req, res);
});

// Resend verification email
router.post('/resend-verification', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return authController.resendVerification(req, res);
});

module.exports = router;
