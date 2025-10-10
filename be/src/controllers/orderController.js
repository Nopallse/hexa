const prisma = require('../utils/prisma');
const logger = require('../utils/logger');

// Get user's orders
const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      user_id: req.user.id,
      ...(status && { status })
    };

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { created_at: 'desc' },
        include: {
          address: {
            select: {
              address_line: true,
              city: true,
              province: true,
              postal_code: true
            }
          },
          order_items: {
            include: {
              product_variant: {
                include: {
                  product: {
                    select: {
                      name: true,
                      product_images: {
                        where: { is_primary: true },
                        select: {
                          image_name: true
                        }
                      }
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
          },
          shipping: {
            select: {
              courier: true,
              tracking_number: true,
              shipping_status: true,
              estimated_delivery: true
            }
          }
        }
      }),
      prisma.order.count({ where })
    ]);

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    logger.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        user_id: req.user.id
      },
      include: {
        address: true,
        order_items: {
          include: {
            product_variant: {
              include: {
                product: {
                  select: {
                    name: true,
                    product_images: {
                      where: { is_primary: true },
                      select: {
                        image_name: true
                      }
                    }
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
        },
        shipping: true,
        payments: {
          orderBy: { payment_date: 'desc' }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    logger.error('Get order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order'
    });
  }
};

// Create new order (checkout)
const createOrder = async (req, res) => {
  try {
    const { address_id, shipping_cost } = req.body;

    // Check if address exists and belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: address_id,
        user_id: req.user.id
      }
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        error: 'Address not found'
      });
    }

    // Get cart items
    const cartItems = await prisma.cartItem.findMany({
      where: { user_id: req.user.id },
      include: {
        product_variant: {
          include: {
            product: {
              select: {
                name: true,
                deleted_at: true
              }
            }
          }
        }
      }
    });

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cart is empty'
      });
    }

    // Validate cart items and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const cartItem of cartItems) {
      if (cartItem.product_variant.product.deleted_at) {
        return res.status(400).json({
          success: false,
          error: `Product ${cartItem.product_variant.product.name} is not available`
        });
      }

      if (cartItem.product_variant.stock < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${cartItem.product_variant.product.name}`
        });
      }

      const itemTotal = cartItem.product_variant.price * cartItem.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product_variant_id: cartItem.product_variant_id,
        quantity: cartItem.quantity,
        price: cartItem.product_variant.price,
        base_price: cartItem.product_variant.price, // Same as price since we only use IDR
        currency_code: 'IDR'
      });
    }

    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create order
      const order = await tx.order.create({
        data: {
          user_id: req.user.id,
          address_id,
          total_amount: totalAmount,
          shipping_cost: parseFloat(shipping_cost),
          status: 'pending',
          payment_status: 'unpaid'
        }
      });

      // Create order items
      await tx.orderItem.createMany({
        data: orderItems.map(item => ({
          order_id: order.id,
          ...item
        }))
      });

      // Update product stock
      for (const cartItem of cartItems) {
        await tx.productVariant.update({
          where: { id: cartItem.product_variant_id },
          data: {
            stock: {
              decrement: cartItem.quantity
            }
          }
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { user_id: req.user.id }
      });

      // Create transaction log
      await tx.transaction.create({
        data: {
          user_id: req.user.id,
          order_id: order.id,
          status: 'success',
          message: 'Order created successfully'
        }
      });

      return order;
    });

    logger.info(`New order created: ${result.id} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order_id: result.id,
        total_amount: result.total_amount,
        shipping_cost: result.shipping_cost,
        status: result.status
      }
    });
  } catch (error) {
    logger.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create order'
    });
  }
};



// Cancel order
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        user_id: req.user.id,
        status: 'pending'
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found or cannot be cancelled'
      });
    }

    // Use transaction to restore stock and cancel order
    await prisma.$transaction(async (tx) => {
      // Get order items to restore stock
      const orderItems = await tx.orderItem.findMany({
        where: { order_id: id },
        include: {
          product_variant: true
        }
      });

      // Restore stock
      for (const orderItem of orderItems) {
        await tx.productVariant.update({
          where: { id: orderItem.product_variant_id },
          data: {
            stock: {
              increment: orderItem.quantity
            }
          }
        });
      }

      // Update order status
      await tx.order.update({
        where: { id },
        data: { status: 'cancelled' }
      });

      // Create transaction log
      await tx.transaction.create({
        data: {
          user_id: req.user.id,
          order_id: id,
          status: 'success',
          message: 'Order cancelled by user'
        }
      });
    });

    logger.info(`Order cancelled: ${id} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    logger.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel order'
    });
  }
};

// Get available payment methods
const getPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = [
      {
        id: 'midtrans',
        name: 'Midtrans Payment Gateway',
        description: 'Pembayaran lokal dengan berbagai metode (Bank Transfer, E-Wallet, Credit Card, QRIS)',
        icon: '💳',
        available: true,
        is_local: true,
        supported_methods: ['bank_transfer', 'e_wallet', 'credit_card', 'qris']
      },
      {
        id: 'paypal',
        name: 'PayPal',
        description: 'Pembayaran internasional dengan PayPal',
        icon: '🌍',
        available: true,
        is_international: true,
        supported_methods: ['paypal']
      },
      {
        id: 'COD',
        name: 'Cash on Delivery',
        description: 'Bayar saat barang diterima',
        icon: '💰',
        available: true,
        requires_approval: true,
        is_local: true
      }
    ];

    res.json({
      success: true,
      data: paymentMethods
    });
  } catch (error) {
    logger.error('Get payment methods error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment methods'
    });
  }
};

// Get order payment status
const getOrderPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id,
        user_id: req.user.id
      },
      include: {
        payments: {
          orderBy: { created_at: 'desc' }
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: {
        order_id: order.id,
        payment_status: order.payment_status,
        total_amount: order.total_amount,
        shipping_cost: order.shipping_cost,
        payments: order.payments
      }
    });
  } catch (error) {
    logger.error('Get order payment status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order payment status'
    });
  }
};

// Update order status (admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.findUnique({
      where: { id }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status }
    });

    // Create transaction log
    await prisma.transaction.create({
      data: {
        user_id: order.user_id,
        order_id: order.id,
        status: 'success',
        message: `Order status updated to ${status}`
      }
    });

    logger.info(`Order status updated: ${id} to ${status} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder
    });
  } catch (error) {
    logger.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update order status'
    });
  }
};

module.exports = {
  getUserOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  cancelOrder,
  getPaymentMethods,
  getOrderPaymentStatus
};
