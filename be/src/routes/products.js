const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');
const productController = require('../controllers/productController');

const router = express.Router();

// Get all products with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('category').optional().isUUID(),
  query('search').optional().trim(),
  query('min_price').optional().isFloat({ min: 0 }),
  query('max_price').optional().isFloat({ min: 0 }),
  query('sort').optional().isIn(['name', 'price', 'created_at']),
  query('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return productController.getAllProducts(req, res);
});

// Get product by ID
router.get('/:id', [
  query('currency').optional().isLength({ min: 3, max: 3 }).withMessage('Currency must be 3 characters')
], productController.getProductById);

// Create new product (admin only)
router.post('/', [
  authenticateToken,
  requireRole(['admin']),
  body('category_id').isUUID(),
  body('name').notEmpty().trim(),
  body('description').optional().trim(),
  body('price').isFloat({ min: 0 }),
  body('stock').isInt({ min: 0 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return productController.createProduct(req, res);
});

// Update product (admin only)
router.put('/:id', [
  authenticateToken,
  requireRole(['admin']),
  body('category_id').optional().isUUID(),
  body('name').optional().notEmpty().trim(),
  body('description').optional().trim(),
  body('price').optional().isFloat({ min: 0 }),
  body('stock').optional().isInt({ min: 0 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return productController.updateProduct(req, res);
});

// Delete product (admin only)
router.delete('/:id', [
  authenticateToken,
  requireRole(['admin'])
], productController.deleteProduct);

// Restore deleted product (admin only)
router.patch('/:id/restore', [
  authenticateToken,
  requireRole(['admin'])
], productController.restoreProduct);

// Get deleted products (admin only)
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
  return productController.getDeletedProducts(req, res);
});

// ========== PRODUCT VARIANT ROUTES ==========

// Bulk create product variants (admin only)
router.post('/:product_id/variants/bulk',
  authenticateToken,
  requireRole(['admin']),
  require('../middleware/upload').uploadFields(20), // Support up to 20 variant images (image_0, image_1, etc.)
  async (req, res) => {
    return productController.createProductVariantsBulk(req, res);
  }
);

// Create product variant (admin only)
router.post('/:product_id/variants', [
  authenticateToken,
  requireRole(['admin']),
  body('sku').notEmpty().trim(),
  body('variant_name').notEmpty().trim(),
  body('price').isFloat({ min: 0 }),
  body('stock').isInt({ min: 0 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return productController.createProductVariant(req, res);
});

// Get all variants for a product
router.get('/:product_id/variants', productController.getProductVariants);

// Get variant by ID
router.get('/variants/:variant_id', productController.getVariantById);

// Update product variant (admin only)
router.put('/variants/:variant_id', [
  authenticateToken,
  requireRole(['admin']),
  body('sku').optional().notEmpty().trim(),
  body('variant_name').optional().notEmpty().trim(),
  body('price').optional().isFloat({ min: 0 }),
  body('stock').optional().isInt({ min: 0 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return productController.updateProductVariant(req, res);
});

// Update variant image (admin only)
router.put('/variants/:variant_id/image',
  authenticateToken,
  requireRole(['admin']),
  uploadSingle('image'), // Handle image upload
  async (req, res) => {
    return productController.updateVariantImage(req, res);
  }
);

// Delete product variant (admin only)
router.delete('/variants/:variant_id', [
  authenticateToken,
  requireRole(['admin'])
], productController.deleteProductVariant);

// ========== VARIANT OPTION ROUTES ==========

// Create variant option (admin only)
router.post('/variants/:variant_id/options', [
  authenticateToken,
  requireRole(['admin']),
  body('option_name').notEmpty().trim(),
  body('option_value').notEmpty().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return productController.createVariantOption(req, res);
});

// Get variant options
router.get('/variants/:variant_id/options', productController.getVariantOptions);

// Update variant option (admin only)
router.put('/options/:option_id', [
  authenticateToken,
  requireRole(['admin']),
  body('option_name').optional().notEmpty().trim(),
  body('option_value').optional().notEmpty().trim()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: errors.array()
    });
  }
  return productController.updateVariantOption(req, res);
});

// Delete variant option (admin only)
router.delete('/options/:option_id', [
  authenticateToken,
  requireRole(['admin'])
], productController.deleteVariantOption);

// ========== PRODUCT IMAGE ROUTES ==========

// Create product image (admin only)
router.post('/:product_id/images',
  authenticateToken,
  requireRole(['admin']),
  uploadSingle('image'), // Handle image upload
  async (req, res) => {
    return productController.createProductImage(req, res);
  }
);

// Get product images
router.get('/:product_id/images', productController.getProductImages);

// Update product image (admin only)
router.put('/images/:image_id',
  authenticateToken,
  requireRole(['admin']),
  uploadSingle('image'), // Handle optional image upload
  async (req, res) => {
    return productController.updateProductImage(req, res);
  }
);

// Delete product image (admin only)
router.delete('/images/:image_id', [
  authenticateToken,
  requireRole(['admin'])
], productController.deleteProductImage);

module.exports = router;
