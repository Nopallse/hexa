const prisma = require('../utils/prisma');
const logger = require('../utils/logger');

// Get user's cart
const getCart = async (req, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { user_id: req.user.id },
      include: {
        product_variant: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                deleted_at: true  // ✅ Perbaikan: true bukan null
              }
            },
            variant_options: {
              select: {
                option_name: true,
                option_value: true
              }
            }
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json({
      success: true,
      data: cartItems
    });
  } catch (error) {
    logger.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cart items'
    });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { product_variant_id, quantity } = req.body;

    // Check if product variant exists and has stock
    const productVariant = await prisma.productVariant.findUnique({
      where: { id: product_variant_id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            deleted_at: true  // ✅ Perbaikan: true bukan null
          }
        }
      }
    });

    if (!productVariant) {
      return res.status(404).json({
        success: false,
        error: 'Product variant not found'
      });
    }

    // Cek apakah produk sudah dihapus (soft delete)
    if (productVariant.product.deleted_at) {
      return res.status(400).json({
        success: false,
        error: 'Product is not available'
      });
    }

    if (productVariant.stock < quantity) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient stock available'
      });
    }

    // Check if item already exists in cart
    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        user_id_product_variant_id: {
          user_id: req.user.id,
          product_variant_id
        }
      }
    });

    let cartItem;
    if (existingCartItem) {
      // Update quantity
      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
        include: {
          product_variant: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  deleted_at: true  // ✅ Perbaikan: true bukan null
                }
              },
              variant_options: {
                select: {
                  option_name: true,
                  option_value: true
                }
              }
            }
          }
        }
      });
    } else {
      // Create new cart item
      cartItem = await prisma.cartItem.create({
        data: {
          user_id: req.user.id,
          product_variant_id,
          quantity
        },
        include: {
          product_variant: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  deleted_at: true  // ✅ Perbaikan: true bukan null
                }
              },
              variant_options: {
                select: {
                  option_name: true,
                  option_value: true
                }
              }
            }
          }
        }
      });
    }

    logger.info(`Item added to cart: ${productVariant.product.name} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Item added to cart successfully',
      data: cartItem
    });
  } catch (error) {
    logger.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add item to cart'
    });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    // Check if cart item exists and belongs to user
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        id,
        user_id: req.user.id
      },
      include: {
        product_variant: {
          select: {
            stock: true
          }
        }
      }
    });

    if (!existingCartItem) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found'
      });
    }

    if (existingCartItem.product_variant.stock < quantity) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient stock available'
      });
    }

    const cartItem = await prisma.cartItem.update({
      where: { id },
      data: { quantity },
      include: {
        product_variant: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                deleted_at: true  // ✅ Perbaikan: true bukan null
              }
            },
            variant_options: {
              select: {
                option_name: true,
                option_value: true
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Cart item updated successfully',
      data: cartItem
    });
  } catch (error) {
    logger.error('Update cart item error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update cart item'
    });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if cart item exists and belongs to user
    const existingCartItem = await prisma.cartItem.findFirst({
      where: {
        id,
        user_id: req.user.id
      }
    });

    if (!existingCartItem) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found'
      });
    }

    await prisma.cartItem.delete({
      where: { id }
    });

    logger.info(`Item removed from cart by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Item removed from cart successfully'
    });
  } catch (error) {
    logger.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to remove item from cart'
    });
  }
};

// Clear entire cart
const clearCart = async (req, res) => {
  try {
    await prisma.cartItem.deleteMany({
      where: { user_id: req.user.id }
    });

    logger.info(`Cart cleared by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    logger.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to clear cart'
    });
  }
};

// Get cart summary (total items count)
const getCartSummary = async (req, res) => {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { user_id: req.user.id },
      select: { quantity: true }
    });

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      success: true,
      data: {
        totalItems,
        itemCount: cartItems.length // Number of different products
      }
    });
  } catch (error) {
    logger.error('Get cart summary error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cart summary'
    });
  }
};

module.exports = {
  getCart,
  getCartSummary,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};