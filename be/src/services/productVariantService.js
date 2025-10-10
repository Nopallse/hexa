const prisma = require('../utils/prisma');

/**
 * Product Variant Service
 * Handles logic for products with/without variants
 */

/**
 * Get effective price and stock for a product
 * Logic:
 * - If product has variants: return null (must choose variant)
 * - If product has no variants: return product price & stock
 */
const getProductPriceAndStock = async (productId) => {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      product_variants: {
        select: {
          id: true,
          price: true,
          stock: true
        }
      }
    }
  });

  if (!product) {
    throw new Error('Product not found');
  }

  // Check if product has variants
  const hasVariants = product.product_variants.length > 0;

  if (hasVariants) {
    // Product has variants, return variant info
    return {
      hasVariants: true,
      price: null, // User must select variant
      stock: null,
      variants: product.product_variants,
      totalStock: product.product_variants.reduce((sum, v) => sum + v.stock, 0)
    };
  } else {
    // Product has no variants, use product price & stock
    return {
      hasVariants: false,
      price: parseFloat(product.price),
      stock: product.stock,
      variants: [],
      totalStock: product.stock
    };
  }
};

/**
 * Check if product/variant has enough stock
 */
const checkStock = async (productId, variantId, quantity) => {
  if (variantId) {
    // Check variant stock
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId }
    });

    if (!variant) {
      throw new Error('Product variant not found');
    }

    if (variant.stock < quantity) {
      throw new Error(`Insufficient stock. Available: ${variant.stock}`);
    }

    return {
      available: true,
      stock: variant.stock,
      price: parseFloat(variant.price)
    };
  } else {
    // Check product stock (no variant)
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        product_variants: true
      }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // If product has variants, must select one
    if (product.product_variants.length > 0) {
      throw new Error('This product has variants. Please select a variant.');
    }

    if (product.stock < quantity) {
      throw new Error(`Insufficient stock. Available: ${product.stock}`);
    }

    return {
      available: true,
      stock: product.stock,
      price: parseFloat(product.price)
    };
  }
};

/**
 * Get price for product or variant
 */
const getPrice = async (productId, variantId = null) => {
  if (variantId) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      select: { price: true }
    });

    if (!variant) {
      throw new Error('Product variant not found');
    }

    return parseFloat(variant.price);
  } else {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { 
        price: true,
        product_variants: {
          select: { id: true }
        }
      }
    });

    if (!product) {
      throw new Error('Product not found');
    }

    // If product has variants, must select one
    if (product.product_variants.length > 0) {
      throw new Error('This product has variants. Please select a variant.');
    }

    return parseFloat(product.price);
  }
};

/**
 * Reduce stock after purchase
 */
const reduceStock = async (productId, variantId, quantity) => {
  if (variantId) {
    // Reduce variant stock
    await prisma.productVariant.update({
      where: { id: variantId },
      data: {
        stock: {
          decrement: quantity
        }
      }
    });
  } else {
    // Reduce product stock
    await prisma.product.update({
      where: { id: productId },
      data: {
        stock: {
          decrement: quantity
        }
      }
    });
  }
};

/**
 * Restore stock (for order cancellation)
 */
const restoreStock = async (productId, variantId, quantity) => {
  if (variantId) {
    // Restore variant stock
    await prisma.productVariant.update({
      where: { id: variantId },
      data: {
        stock: {
          increment: quantity
        }
      }
    });
  } else {
    // Restore product stock
    await prisma.product.update({
      where: { id: productId },
      data: {
        stock: {
          increment: quantity
        }
      }
    });
  }
};

/**
 * Get display image for variant
 * Hierarchy: variant.image > product primary image > product first image
 * @param {Object} variant - Variant object
 * @param {Object} product - Product object with images
 * @returns {string|null} Image filename
 */
const getVariantDisplayImage = (variant, product) => {
  // 1. Use variant-specific image if available
  if (variant.image) {
    return variant.image;
  }

  // 2. Use product primary image
  if (product.product_images && product.product_images.length > 0) {
    const primaryImage = product.product_images.find(img => img.is_primary);
    if (primaryImage) {
      return primaryImage.image_name;
    }
    
    // 3. Use first product image
    return product.product_images[0].image_name;
  }

  return null;
};

/**
 * Format product for API response with variant info
 */
const formatProductResponse = async (product) => {
  const hasVariants = product.product_variants && product.product_variants.length > 0;

  if (hasVariants) {
    // Calculate price range from variants
    const prices = product.product_variants.map(v => parseFloat(v.price));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    const totalStock = product.product_variants.reduce((sum, v) => sum + v.stock, 0);

    // Enrich variants with display images
    const enrichedVariants = product.product_variants.map(variant => ({
      ...variant,
      display_image: getVariantDisplayImage(variant, product),
      has_own_image: !!variant.image
    }));

    return {
      ...product,
      hasVariants: true,
      product_variants: enrichedVariants,
      price_range: minPrice === maxPrice 
        ? { min: minPrice, max: maxPrice, display: `Rp ${minPrice.toLocaleString()}` }
        : { min: minPrice, max: maxPrice, display: `Rp ${minPrice.toLocaleString()} - Rp ${maxPrice.toLocaleString()}` },
      total_stock: totalStock,
      // Keep original price as default price for variant generation
      price: parseFloat(product.price),
      stock: product.stock
    };
  } else {
    // No variants, use product price & stock
    return {
      ...product,
      hasVariants: false,
      price: parseFloat(product.price),
      stock: product.stock,
      total_stock: product.stock,
      price_range: null
    };
  }
};

/**
 * Sync product stock with total variant stock
 * This ensures product.stock always equals sum of all variant stocks
 */
const syncProductStock = async (productId) => {
  try {
    // Get all variants for this product
    const variants = await prisma.productVariant.findMany({
      where: { product_id: productId },
      select: { stock: true }
    });

    // Calculate total stock from variants
    const totalVariantStock = variants.reduce((sum, variant) => sum + variant.stock, 0);

    // Update product stock to match total variant stock
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { stock: totalVariantStock },
      select: { id: true, name: true, stock: true }
    });

    console.log(`Stock synced for product ${updatedProduct.name}: ${updatedProduct.stock} (from ${variants.length} variants)`);
    
    return updatedProduct;
  } catch (error) {
    console.error('Error syncing product stock:', error);
    throw error;
  }
};

/**
 * Sync product stock for multiple products
 */
const syncMultipleProductStocks = async (productIds) => {
  const results = [];
  for (const productId of productIds) {
    try {
      const result = await syncProductStock(productId);
      results.push(result);
    } catch (error) {
      console.error(`Failed to sync stock for product ${productId}:`, error);
      results.push({ id: productId, error: error.message });
    }
  }
  return results;
};

/**
 * Sync all products with variants
 */
const syncAllProductStocks = async () => {
  try {
    // Get all products that have variants
    const productsWithVariants = await prisma.product.findMany({
      where: {
        deleted_at: null,
        product_variants: {
          some: {}
        }
      },
      select: { id: true }
    });

    const productIds = productsWithVariants.map(p => p.id);
    console.log(`Syncing stock for ${productIds.length} products with variants...`);
    
    return await syncMultipleProductStocks(productIds);
  } catch (error) {
    console.error('Error syncing all product stocks:', error);
    throw error;
  }
};

module.exports = {
  getProductPriceAndStock,
  checkStock,
  getPrice,
  reduceStock,
  restoreStock,
  formatProductResponse,
  getVariantDisplayImage,
  syncProductStock,
  syncMultipleProductStocks,
  syncAllProductStocks
};

