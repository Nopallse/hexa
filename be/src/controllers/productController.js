const prisma = require('../utils/prisma');
const logger = require('../utils/logger');
const SoftDeleteService = require('../services/softDeleteService');
const productVariantService = require('../services/productVariantService');
const { deleteFile } = require('../middleware/upload');

// Get all active products with filtering and pagination
const getAllProducts = async (req, res) => {
  try {
    const options = req.query;
    
    const result = await SoftDeleteService.getActiveProducts(options);
    
    // Format products with variant info
    const formattedProducts = await Promise.all(
      result.products.map(product => productVariantService.formatProductResponse(product))
    );

    res.json({
      success: true,
      data: formattedProducts,
      pagination: result.pagination
    });
  } catch (error) {
    logger.error('Get products error:', error);
    logger.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch products',
      details: error.message
    });
  }
};

// Get active product by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { 
        id,
        deleted_at: null
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            description: true
          }
        },
        product_images: {
          orderBy: { is_primary: 'desc' },
          select: {
            id: true,
            image_name: true,
            is_primary: true
          }
        },
        product_variants: {
          include: {
            variant_options: {
              select: {
                id: true,
                option_name: true,
                option_value: true
              }
            }
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Format product with variant info
    const formattedProduct = await productVariantService.formatProductResponse(product);

    res.json({
      success: true,
      data: formattedProduct
    });
  } catch (error) {
    logger.error('Get product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product'
    });
  }
};

// Create new product (admin only)
const createProduct = async (req, res) => {
  try {
    const { 
      category_id, 
      name, 
      description, 
      price, 
      pre_order, 
      stock,
      length,
      width,
      height,
      weight
    } = req.body;

    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: category_id }
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        error: 'Category not found'
      });
    }

    const product = await prisma.product.create({
      data: {
        category_id,
        name,
        description,
        price: parseFloat(price),
        pre_order: parseInt(pre_order),
        stock: parseInt(stock),
        length: length ? parseFloat(length) : null,
        width: width ? parseFloat(width) : null,
        height: height ? parseFloat(height) : null,
        weight: weight ? parseFloat(weight) : null
      },
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    logger.info(`New product created: ${product.name} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    logger.error('Create product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product'
    });
  }
};

// Update product (admin only)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      category_id, 
      name, 
      description, 
      price, 
      pre_order, 
      stock,
      length,
      width,
      height,
      weight
    } = req.body;
    
    console.log('=== UPDATE PRODUCT DEBUG ===');
    console.log('Product ID:', id);
    console.log('Request Body:', req.body);
    console.log('Extracted values:');
    console.log('- price:', price, typeof price);
    console.log('- pre_order:', pre_order, typeof pre_order);
    console.log('- stock:', stock, typeof stock);
    console.log('- length:', length, typeof length);
    console.log('- width:', width, typeof width);
    console.log('- height:', height, typeof height);
    console.log('- weight:', weight, typeof weight);
    
    // Check if product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check if category exists (if provided)
    if (category_id) {
      const category = await prisma.category.findUnique({
        where: { id: category_id }
      });

      if (!category) {
        return res.status(404).json({
          success: false,
          error: 'Category not found'
        });
      }
    }

    // Build update data
    const updateData = {
      ...(category_id && { category_id }),
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(pre_order !== undefined && { pre_order: parseInt(pre_order) }),
      ...(stock !== undefined && { stock: parseInt(stock) }),
      ...(length !== undefined && { length: length ? parseFloat(length) : null }),
      ...(width !== undefined && { width: width ? parseFloat(width) : null }),
      ...(height !== undefined && { height: height ? parseFloat(height) : null }),
      ...(weight !== undefined && { weight: weight ? parseFloat(weight) : null })
    };

    console.log('Update data:', updateData);
    console.log('Price check:', price !== undefined, 'Value:', price);

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    console.log('Updated product from database:', product);
    console.log('Updated price:', product.price, typeof product.price);

    logger.info(`Product updated: ${product.name} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    logger.error('Update product error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product'
    });
  }
};

// Delete product with soft delete logic (admin only)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.email;

    const result = await SoftDeleteService.deleteProduct(id, userId);

    res.json({
      success: true,
      message: result.message,
      type: result.type,
      data: result.data
    });
  } catch (error) {
    logger.error('Delete product error:', error);
    
    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to delete product'
    });
  }
};

// Restore deleted product (admin only)
const restoreProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.email;

    const result = await SoftDeleteService.restoreProduct(id, userId);

    res.json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    logger.error('Restore product error:', error);
    
    if (error.message === 'Product not found' || error.message === 'Product is already active') {
      return res.status(400).json({
        success: false,
        error: error.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to restore product'
    });
  }
};

// Get deleted products (admin only)
const getDeletedProducts = async (req, res) => {
  try {
    const options = req.query;
    const result = await SoftDeleteService.getDeletedProducts(options);

    res.json({
      success: true,
      data: result.products,
      pagination: result.pagination
    });
  } catch (error) {
    logger.error('Get deleted products error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch deleted products'
    });
  }
};

// ========== PRODUCT VARIANT MANAGEMENT ==========

// Create product variant
const createProductVariant = async (req, res) => {
  try {
    const { product_id } = req.params;
    const { sku, variant_name, price, stock, image } = req.body;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: product_id, deleted_at: null }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check if SKU already exists
    const existingSku = await prisma.productVariant.findUnique({
      where: { sku }
    });

    if (existingSku) {
      return res.status(400).json({
        success: false,
        error: 'SKU already exists'
      });
    }

    const variant = await prisma.productVariant.create({
      data: {
        product_id,
        sku,
        variant_name,
        price,
        stock,
        ...(image && { image }) // Optional: variant-specific image
      },
      include: {
        product: {
          select: { id: true, name: true }
        },
        variant_options: true
      }
    });

    logger.info(`Product variant created: ${variant.variant_name} for ${product.name} by ${req.user.email}`);

    // Auto-sync product stock with total variant stock
    try {
      await productVariantService.syncProductStock(product_id);
    } catch (syncError) {
      logger.error('Failed to sync product stock after variant creation:', syncError);
      // Don't fail the request, just log the error
    }

    res.status(201).json({
      success: true,
      message: 'Product variant created successfully',
      data: variant
    });
  } catch (error) {
    logger.error('Create product variant error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create product variant'
    });
  }
};

// Bulk create product variants
const createProductVariantsBulk = async (req, res) => {
  try {
    const { product_id } = req.params;
    
    // Parse variants from JSON string (sent via FormData)
    let variants;
    try {
      variants = typeof req.body.variants === 'string' 
        ? JSON.parse(req.body.variants) 
        : req.body.variants;
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        error: 'Invalid variants data format'
      });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: product_id, deleted_at: null }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    if (!Array.isArray(variants) || variants.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Variants array is required and must not be empty'
      });
    }

    // Check for duplicate SKUs in request
    const skus = variants.map(v => v.sku);
    const duplicateSkus = skus.filter((sku, index) => skus.indexOf(sku) !== index);
    if (duplicateSkus.length > 0) {
      return res.status(400).json({
        success: false,
        error: `Duplicate SKUs in request: ${duplicateSkus.join(', ')}`
      });
    }

    // Check if any SKU already exists in database
    const existingSkus = await prisma.productVariant.findMany({
      where: {
        sku: { in: skus }
      },
      select: { sku: true }
    });

    if (existingSkus.length > 0) {
      return res.status(400).json({
        success: false,
        error: `SKU already exists: ${existingSkus.map(s => s.sku).join(', ')}`
      });
    }

    // Map uploaded files by field name (e.g., "image_0", "image_1")
    // req.files will be an object like: { image_0: [{...}], image_1: [{...}] }
    const fileMap = {};
    if (req.files && typeof req.files === 'object') {
      Object.keys(req.files).forEach(fieldName => {
        const fileArray = req.files[fieldName];
        if (fileArray && fileArray.length > 0) {
          fileMap[fieldName] = fileArray[0].filename;
        }
      });
    }

    // Create all variants
    const createdVariants = [];
    const variantOptions = []; // Store options to create after variants

    for (let i = 0; i < variants.length; i++) {
      const variantData = variants[i];
      
      // Determine image filename
      let imageName = null;
      if (variantData.affects_image) {
        // Look for uploaded image for this variant
        imageName = fileMap[`image_${i}`] || null;
      }

      // Create variant
      const variant = await prisma.productVariant.create({
        data: {
          product_id,
          sku: variantData.sku,
          variant_name: variantData.variant_name,
          price: parseFloat(variantData.price),
          stock: parseInt(variantData.stock),
          affects_image: variantData.affects_image === true || variantData.affects_image === 'true',
          image: imageName
        }
      });

      createdVariants.push(variant);

      // Store variant options for batch creation
      if (variantData.attributes && typeof variantData.attributes === 'object') {
        for (const [optionName, optionValue] of Object.entries(variantData.attributes)) {
          variantOptions.push({
            variant_id: variant.id,
            option_name: optionName,
            option_value: optionValue
          });
        }
      }
    }

    // Bulk create variant options
    if (variantOptions.length > 0) {
      await prisma.variantOption.createMany({
        data: variantOptions
      });
    }

    // Fetch created variants with relations
    const variantsWithRelations = await prisma.productVariant.findMany({
      where: {
        id: { in: createdVariants.map(v => v.id) }
      },
      include: {
        variant_options: true
      }
    });

    logger.info(`Bulk created ${createdVariants.length} variants for ${product.name} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: `${createdVariants.length} variants created successfully`,
      data: variantsWithRelations
    });
  } catch (error) {
    logger.error('Bulk create variants error:', error);
    
    // Clean up uploaded files on error
    if (req.files && typeof req.files === 'object') {
      Object.keys(req.files).forEach(fieldName => {
        const fileArray = req.files[fieldName];
        if (fileArray) {
          fileArray.forEach(file => {
            deleteFile(file.filename);
          });
        }
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create variants',
      details: error.message
    });
  }
};

// Get all variants for a product
const getProductVariants = async (req, res) => {
  try {
    const { product_id } = req.params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: product_id, deleted_at: null }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const variants = await prisma.productVariant.findMany({
      where: { product_id },
      include: {
        variant_options: true
      },
      orderBy: { created_at: 'desc' }
    });

    res.json({
      success: true,
      data: variants
    });
  } catch (error) {
    logger.error('Get product variants error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product variants'
    });
  }
};

// Get variant by ID
const getVariantById = async (req, res) => {
  try {
    const { variant_id } = req.params;

    const variant = await prisma.productVariant.findUnique({
      where: { id: variant_id },
      include: {
        product: {
          select: { id: true, name: true, deleted_at: true }
        },
        variant_options: true
      }
    });

    if (!variant) {
      return res.status(404).json({
        success: false,
        error: 'Product variant not found'
      });
    }

    res.json({
      success: true,
      data: variant
    });
  } catch (error) {
    logger.error('Get variant error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch variant'
    });
  }
};

// Update product variant
const updateProductVariant = async (req, res) => {
  try {
    const { variant_id } = req.params;
    const { sku, variant_name, price, stock, image } = req.body;

    // Check if variant exists
    const existingVariant = await prisma.productVariant.findUnique({
      where: { id: variant_id },
      include: { product: true }
    });

    if (!existingVariant) {
      return res.status(404).json({
        success: false,
        error: 'Product variant not found'
      });
    }

    // Check if SKU already exists (exclude current variant)
    if (sku && sku !== existingVariant.sku) {
      const existingSku = await prisma.productVariant.findUnique({
        where: { sku }
      });

      if (existingSku) {
        return res.status(400).json({
          success: false,
          error: 'SKU already exists'
        });
      }
    }

    const variant = await prisma.productVariant.update({
      where: { id: variant_id },
      data: {
        ...(sku && { sku }),
        ...(variant_name && { variant_name }),
        ...(price && { price }),
        ...(stock !== undefined && { stock }),
        ...(image !== undefined && { image }) // Allow null to remove variant image
      },
      include: {
        product: {
          select: { id: true, name: true }
        },
        variant_options: true
      }
    });

    logger.info(`Product variant updated: ${variant.variant_name} by ${req.user.email}`);

    // Auto-sync product stock with total variant stock
    try {
      await productVariantService.syncProductStock(existingVariant.product_id);
    } catch (syncError) {
      logger.error('Failed to sync product stock after variant update:', syncError);
      // Don't fail the request, just log the error
    }

    res.json({
      success: true,
      message: 'Product variant updated successfully',
      data: variant
    });
  } catch (error) {
    logger.error('Update product variant error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update product variant'
    });
  }
};

// Update variant image
const updateVariantImage = async (req, res) => {
  try {
    const { variant_id } = req.params;
    const imageFile = req.file; // From multer middleware

    if (!imageFile) {
      return res.status(400).json({
        success: false,
        error: 'Image file is required'
      });
    }

    // Check if variant exists
    const existingVariant = await prisma.productVariant.findUnique({
      where: { id: variant_id },
      include: { product: true }
    });

    if (!existingVariant) {
      // Delete uploaded file if variant not found
      deleteFile(imageFile.filename);
      
      return res.status(404).json({
        success: false,
        error: 'Product variant not found'
      });
    }

    // Delete old image file if exists
    if (existingVariant.image) {
      deleteFile(existingVariant.image);
    }

    // Update variant with new image
    const variant = await prisma.productVariant.update({
      where: { id: variant_id },
      data: {
        image: imageFile.filename
      },
      include: {
        product: {
          select: { id: true, name: true }
        },
        variant_options: true
      }
    });

    logger.info(`Variant image updated for ${variant.variant_name} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Variant image updated successfully',
      data: variant
    });
  } catch (error) {
    logger.error('Update variant image error:', error);
    
    // Delete uploaded file if update failed
    if (req.file) {
      deleteFile(req.file.filename);
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update variant image'
    });
  }
};

// Delete product variant
const deleteProductVariant = async (req, res) => {
  try {
    const { variant_id } = req.params;

    // Check if variant exists and has order items
    const variant = await prisma.productVariant.findUnique({
      where: { id: variant_id },
      include: {
        product: true,
        order_items: true
      }
    });

    if (!variant) {
      return res.status(404).json({
        success: false,
        error: 'Product variant not found'
      });
    }

    if (variant.order_items.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete variant that has been ordered'
      });
    }

    await prisma.productVariant.delete({
      where: { id: variant_id }
    });

    logger.info(`Product variant deleted: ${variant.variant_name} from ${variant.product.name} by ${req.user.email}`);

    // Auto-sync product stock with total variant stock
    try {
      await productVariantService.syncProductStock(variant.product_id);
    } catch (syncError) {
      logger.error('Failed to sync product stock after variant deletion:', syncError);
      // Don't fail the request, just log the error
    }

    res.json({
      success: true,
      message: 'Product variant deleted successfully'
    });
  } catch (error) {
    logger.error('Delete product variant error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product variant'
    });
  }
};

// ========== VARIANT OPTION MANAGEMENT ==========

// Create variant option
const createVariantOption = async (req, res) => {
  try {
    const { variant_id } = req.params;
    const { option_name, option_value } = req.body;

    // Check if variant exists
    const variant = await prisma.productVariant.findUnique({
      where: { id: variant_id },
      include: { product: true }
    });

    if (!variant) {
      return res.status(404).json({
        success: false,
        error: 'Product variant not found'
      });
    }

    const variantOption = await prisma.variantOption.create({
      data: {
        variant_id,
        option_name,
        option_value
      }
    });

    logger.info(`Variant option created: ${option_name}=${option_value} for ${variant.variant_name} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Variant option created successfully',
      data: variantOption
    });
  } catch (error) {
    logger.error('Create variant option error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create variant option'
    });
  }
};

// Get variant options
const getVariantOptions = async (req, res) => {
  try {
    const { variant_id } = req.params;

    // Check if variant exists
    const variant = await prisma.productVariant.findUnique({
      where: { id: variant_id }
    });

    if (!variant) {
      return res.status(404).json({
        success: false,
        error: 'Product variant not found'
      });
    }

    const options = await prisma.variantOption.findMany({
      where: { variant_id },
      orderBy: { created_at: 'desc' }
    });

    res.json({
      success: true,
      data: options
    });
  } catch (error) {
    logger.error('Get variant options error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch variant options'
    });
  }
};

// Update variant option
const updateVariantOption = async (req, res) => {
  try {
    const { option_id } = req.params;
    const { option_name, option_value } = req.body;

    // Check if option exists
    const existingOption = await prisma.variantOption.findUnique({
      where: { id: option_id }
    });

    if (!existingOption) {
      return res.status(404).json({
        success: false,
        error: 'Variant option not found'
      });
    }

    const option = await prisma.variantOption.update({
      where: { id: option_id },
      data: {
        ...(option_name && { option_name }),
        ...(option_value && { option_value })
      }
    });

    logger.info(`Variant option updated: ${option.option_name}=${option.option_value} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Variant option updated successfully',
      data: option
    });
  } catch (error) {
    logger.error('Update variant option error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update variant option'
    });
  }
};

// Delete variant option
const deleteVariantOption = async (req, res) => {
  try {
    const { option_id } = req.params;

    // Check if option exists
    const option = await prisma.variantOption.findUnique({
      where: { id: option_id }
    });

    if (!option) {
      return res.status(404).json({
        success: false,
        error: 'Variant option not found'
      });
    }

    await prisma.variantOption.delete({
      where: { id: option_id }
    });

    logger.info(`Variant option deleted: ${option.option_name}=${option.option_value} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Variant option deleted successfully'
    });
  } catch (error) {
    logger.error('Delete variant option error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete variant option'
    });
  }
};

// ========== PRODUCT IMAGE MANAGEMENT ==========

// Create product image
const createProductImage = async (req, res) => {
  try {
    const { product_id } = req.params;
    const imageFile = req.file; // From multer middleware
    const is_primary = req.body.is_primary === 'true' || req.body.is_primary === true;

    if (!imageFile) {
      return res.status(400).json({
        success: false,
        error: 'Image file is required'
      });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: product_id, deleted_at: null }
    });

    if (!product) {
      // Delete uploaded file if product not found
      deleteFile(imageFile.filename);
      
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // If this is set as primary, remove primary status from other images
    if (is_primary) {
      await prisma.productImage.updateMany({
        where: { product_id, is_primary: true },
        data: { is_primary: false }
      });
    }

    const productImage = await prisma.productImage.create({
      data: {
        product_id,
        image_name: imageFile.filename, // Store filename only
        is_primary
      }
    });

    logger.info(`Product image created for ${product.name} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Product image created successfully',
      data: productImage
    });
  } catch (error) {
    logger.error('Create product image error:', error);
    
    // Delete uploaded file if creation failed
    if (req.file) {
      deleteFile(req.file.filename);
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create product image'
    });
  }
};

// Get product images
const getProductImages = async (req, res) => {
  try {
    const { product_id } = req.params;

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: product_id, deleted_at: null }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    const images = await prisma.productImage.findMany({
      where: { product_id },
      orderBy: [
        { is_primary: 'desc' },
        { created_at: 'desc' }
      ]
    });

    res.json({
      success: true,
      data: images
    });
  } catch (error) {
    logger.error('Get product images error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product images'
    });
  }
};

// Update product image
const updateProductImage = async (req, res) => {
  try {
    const { image_id } = req.params;
    const imageFile = req.file; // From multer middleware (optional)
    const is_primary = req.body.is_primary === 'true' || req.body.is_primary === true;

    // Check if image exists
    const existingImage = await prisma.productImage.findUnique({
      where: { id: image_id }
    });

    if (!existingImage) {
      // Delete uploaded file if image not found
      if (imageFile) {
        deleteFile(imageFile.filename);
      }
      
      return res.status(404).json({
        success: false,
        error: 'Product image not found'
      });
    }

    // Prepare update data
    const updateData = {};

    // If new image file uploaded, replace old image
    if (imageFile) {
      updateData.image_name = imageFile.filename;
      
      // Delete old image file
      if (existingImage.image_name) {
        deleteFile(existingImage.image_name);
      }
    }

    // If primary status changed, update other images
    if (is_primary === true && !existingImage.is_primary) {
      await prisma.productImage.updateMany({
        where: { 
          product_id: existingImage.product_id, 
          is_primary: true,
          id: { not: image_id }
        },
        data: { is_primary: false }
      });
      updateData.is_primary = true;
    } else if (is_primary === false && existingImage.is_primary) {
      updateData.is_primary = false;
    }

    // Only update if there's something to update
    if (Object.keys(updateData).length === 0) {
      return res.json({
        success: true,
        message: 'No changes to update',
        data: existingImage
      });
    }

    const image = await prisma.productImage.update({
      where: { id: image_id },
      data: updateData
    });

    logger.info(`Product image updated by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Product image updated successfully',
      data: image
    });
  } catch (error) {
    logger.error('Update product image error:', error);
    
    // Delete uploaded file if update failed
    if (req.file) {
      deleteFile(req.file.filename);
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update product image'
    });
  }
};

// Delete product image
const deleteProductImage = async (req, res) => {
  try {
    const { image_id } = req.params;

    // Check if image exists
    const image = await prisma.productImage.findUnique({
      where: { id: image_id }
    });

    if (!image) {
      return res.status(404).json({
        success: false,
        error: 'Product image not found'
      });
    }

    await prisma.productImage.delete({
      where: { id: image_id }
    });

    logger.info(`Product image deleted by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Product image deleted successfully'
    });
  } catch (error) {
    logger.error('Delete product image error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete product image'
    });
  }
};

// Sync all product stocks with their variants
const syncAllProductStocks = async (req, res) => {
  try {
    const results = await productVariantService.syncAllProductStocks();
    
    const successCount = results.filter(r => !r.error).length;
    const errorCount = results.filter(r => r.error).length;
    
    logger.info(`Stock sync completed: ${successCount} success, ${errorCount} errors by ${req.user.email}`);
    
    res.json({
      success: true,
      message: `Stock sync completed: ${successCount} products synced successfully`,
      data: {
        total: results.length,
        success: successCount,
        errors: errorCount,
        results: results
      }
    });
  } catch (error) {
    logger.error('Sync all product stocks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync product stocks'
    });
  }
};

// Sync specific product stock with its variants
const syncProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await productVariantService.syncProductStock(id);
    
    logger.info(`Product stock synced: ${result.name} by ${req.user.email}`);
    
    res.json({
      success: true,
      message: 'Product stock synced successfully',
      data: result
    });
  } catch (error) {
    logger.error('Sync product stock error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to sync product stock'
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
  getDeletedProducts,
  // Product Variants
  createProductVariant,
  createProductVariantsBulk,
  getProductVariants,
  getVariantById,
  updateProductVariant,
  updateVariantImage,
  deleteProductVariant,
  // Variant Options
  createVariantOption,
  getVariantOptions,
  updateVariantOption,
  deleteVariantOption,
  // Product Images
  createProductImage,
  getProductImages,
  updateProductImage,
  deleteProductImage,
  // Stock Sync
  syncAllProductStocks,
  syncProductStock
};
