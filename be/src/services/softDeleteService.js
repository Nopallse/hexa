const prisma = require('../utils/prisma');
const logger = require('../utils/logger');

/**
 * Service untuk menangani soft delete logic
 */
class SoftDeleteService {
  
  /**
   * Soft delete produk dengan logic:
   * - Jika produk sudah pernah dipakai di order_items -> soft delete
   * - Jika belum pernah dipakai -> hard delete
   */
  static async deleteProduct(productId, userId) {
    try {
      // Cek apakah produk ada
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          product_variants: {
            include: {
              order_items: true
            }
          }
        }
      });

      if (!product) {
        throw new Error('Product not found');
      }

      // Cek apakah produk sudah pernah dipakai di order_items
      const hasOrderItems = product.product_variants.some(variant => 
        variant.order_items.length > 0
      );

      if (hasOrderItems) {
        // Soft delete - update deleted_at = now()
        const updatedProduct = await prisma.product.update({
          where: { id: productId },
          data: {
            deleted_at: new Date()
          }
        });

        logger.info(`Product soft deleted: ${product.name} by user ${userId} (has order history)`);
        
        return {
          type: 'soft_delete',
          message: 'Product has been deactivated (has order history)',
          data: updatedProduct
        };
      } else {
        // Hard delete - hapus produk sepenuhnya
        await prisma.product.delete({
          where: { id: productId }
        });

        logger.info(`Product hard deleted: ${product.name} by user ${userId} (no order history)`);
        
        return {
          type: 'hard_delete',
          message: 'Product has been permanently deleted',
          data: null
        };
      }
    } catch (error) {
      logger.error('Delete product error:', error);
      throw error;
    }
  }

  /**
   * Soft delete kategori dengan logic:
   * - Jika masih ada produk aktif -> soft delete
   * - Jika tidak ada produk aktif -> hard delete
   */
  static async deleteCategory(categoryId, userId) {
    try {
      // Cek apakah kategori ada
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      include: {
        products: {
          where: { 
            deleted_at: null
          }
        }
      }
      });

      if (!category) {
        throw new Error('Category not found');
      }

      // Cek apakah masih ada produk aktif di kategori
      const hasActiveProducts = category.products.length > 0;

      if (hasActiveProducts) {
        // Soft delete - update deleted_at = now()
        const updatedCategory = await prisma.category.update({
          where: { id: categoryId },
          data: {
            deleted_at: new Date()
          }
        });

        logger.info(`Category soft deleted: ${category.name} by user ${userId} (has active products)`);
        
        return {
          type: 'soft_delete',
          message: 'Category has been deactivated (has active products)',
          data: updatedCategory
        };
      } else {
        // Hard delete - hapus kategori sepenuhnya
        await prisma.category.delete({
          where: { id: categoryId }
        });

        logger.info(`Category hard deleted: ${category.name} by user ${userId} (no active products)`);
        
        return {
          type: 'hard_delete',
          message: 'Category has been permanently deleted',
          data: null
        };
      }
    } catch (error) {
      logger.error('Delete category error:', error);
      throw error;
    }
  }

  /**
   * Restore produk yang sudah di-soft delete
   */
  static async restoreProduct(productId, userId) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId }
      });

      if (!product) {
        throw new Error('Product not found');
      }

      if (!product.deleted_at) {
        throw new Error('Product is already active');
      }

      const restoredProduct = await prisma.product.update({
        where: { id: productId },
        data: {
          deleted_at: null
        }
      });

      logger.info(`Product restored: ${product.name} by user ${userId}`);
      
      return {
        message: 'Product has been restored',
        data: restoredProduct
      };
    } catch (error) {
      logger.error('Restore product error:', error);
      throw error;
    }
  }

  /**
   * Restore kategori yang sudah di-soft delete
   */
  static async restoreCategory(categoryId, userId) {
    try {
      const category = await prisma.category.findUnique({
        where: { id: categoryId }
      });

      if (!category) {
        throw new Error('Category not found');
      }

      if (!category.deleted_at) {
        throw new Error('Category is already active');
      }

      const restoredCategory = await prisma.category.update({
        where: { id: categoryId },
        data: {
          deleted_at: null
        }
      });

      logger.info(`Category restored: ${category.name} by user ${userId}`);
      
      return {
        message: 'Category has been restored',
        data: restoredCategory
      };
    } catch (error) {
      logger.error('Restore category error:', error);
      throw error;
    }
  }

  /**
   * Get all active products (deleted_at = null)
   */
  static async getActiveProducts(options = {}) {
    const {
      page = 1,
      limit = 10,
      category,
      search,
      min_price,
      max_price,
      sort = 'created_at'
    } = options;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause untuk produk aktif
    const where = {
      deleted_at: null,
      ...(category && { category_id: category }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(min_price && { price: { gte: parseFloat(min_price) } }),
      ...(max_price && { price: { lte: parseFloat(max_price) } })
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { [sort]: 'desc' },
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          },
          product_images: {
            where: { is_primary: true },
            select: {
              id: true,
              image_name: true,
              is_primary: true
            }
          },
          product_variants: {
            select: {
              id: true,
              sku: true,
              variant_name: true,
              price: true,
              stock: true
            }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    return {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  /**
   * Get all active categories (deleted_at = null)
   */
  static async getActiveCategories(options = {}) {
    const {
      page = 1,
      limit = 10,
      search
    } = options;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause untuk kategori aktif
    const where = {
      deleted_at: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      })
    };

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { created_at: 'desc' },
        include: {
          products: {
            where: {
              deleted_at: null
            },
            select: {
              id: true,
              name: true,
              price: true,
              stock: true
            }
          }
        }
      }),
      prisma.category.count({ where })
    ]);

    return {
      categories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  /**
   * Get deleted products (untuk admin)
   */
  static async getDeletedProducts(options = {}) {
    const {
      page = 1,
      limit = 10
    } = options;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      deleted_at: { not: null }
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { deleted_at: 'desc' },
        include: {
          category: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    return {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    };
  }

  /**
   * Get deleted categories (untuk admin)
   */
  static async getDeletedCategories(options = {}) {
    const {
      page = 1,
      limit = 10
    } = options;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      deleted_at: { not: null }
    };

    const [categories, total] = await Promise.all([
      prisma.category.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { deleted_at: 'desc' }
      }),
      prisma.category.count({ where })
    ]);

    return {
      categories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    };
  }
}

module.exports = SoftDeleteService;
