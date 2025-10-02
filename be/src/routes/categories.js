const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const categoryController = require('../controllers/categoryController');

const router = express.Router();

// Get all categories
router.get('/', categoryController.getAllCategories);

// Get category by ID
router.get('/:id', categoryController.getCategoryById);

// Create new category (admin only)
router.post('/', 
  authenticateToken,
  requireRole(['admin']),
  uploadSingle('image'), // Handle image upload
  [
    body('name').notEmpty().trim(),
    body('description').optional().trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }
    return categoryController.createCategory(req, res);
  }
);

// Update category (admin only)
router.put('/:id',
  authenticateToken,
  requireRole(['admin']),
  uploadSingle('image'), // Handle image upload
  [
    body('name').optional().notEmpty().trim(),
    body('description').optional().trim()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }
    return categoryController.updateCategory(req, res);
  }
);

// Delete category (admin only)
router.delete('/:id', [
  authenticateToken,
  requireRole(['admin'])
], categoryController.deleteCategory);

// Restore deleted category (admin only)
router.patch('/:id/restore', [
  authenticateToken,
  requireRole(['admin'])
], categoryController.restoreCategory);

// Get deleted categories (admin only)
router.get('/deleted/list', [
  authenticateToken,
  requireRole(['admin']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return categoryController.getDeletedCategories(req, res);
});

module.exports = router;
