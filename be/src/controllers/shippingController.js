const prisma = require('../utils/prisma');
const logger = require('../utils/logger');

// Get shipping info for order
const getShippingInfo = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Check if order exists and belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        user_id: req.user.id
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    const shipping = await prisma.shipping.findUnique({
      where: { order_id: orderId }
    });

    res.json({
      success: true,
      data: {
        order_id: orderId,
        order_status: order.status,
        shipping
      }
    });
  } catch (error) {
    logger.error('Get shipping info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch shipping info'
    });
  }
};

// Create shipping info (admin only)
const createShipping = async (req, res) => {
  try {
    const { order_id, courier, tracking_number, estimated_delivery } = req.body;

    // Check if order exists
    const order = await prisma.order.findUnique({
      where: { id: order_id }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Check if shipping already exists
    const existingShipping = await prisma.shipping.findUnique({
      where: { order_id }
    });

    if (existingShipping) {
      return res.status(400).json({
        success: false,
        error: 'Shipping info already exists for this order'
      });
    }

    // Use transaction to create shipping and update order
    const result = await prisma.$transaction(async (tx) => {
      // Create shipping record
      const shipping = await tx.shipping.create({
        data: {
          order_id,
          courier,
          tracking_number,
          estimated_delivery: estimated_delivery ? new Date(estimated_delivery) : null,
          shipping_status: 'pending'
        }
      });

      // Update order status to shipped
      await tx.order.update({
        where: { id: order_id },
        data: { status: 'shipped' }
      });

      // Create transaction log
      await tx.transaction.create({
        data: {
          user_id: order.user_id,
          order_id,
          status: 'success',
          message: `Shipping created with ${courier}`
        }
      });

      return shipping;
    });

    logger.info(`Shipping created for order ${order_id} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Shipping info created successfully',
      data: result
    });
  } catch (error) {
    logger.error('Create shipping error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create shipping info'
    });
  }
};

// Update shipping info (admin only)
const updateShipping = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      courier, 
      tracking_number, 
      shipping_status, 
      estimated_delivery, 
      shipped_at, 
      delivered_at 
    } = req.body;

    const shipping = await prisma.shipping.findUnique({
      where: { id },
      include: {
        order: true
      }
    });

    if (!shipping) {
      return res.status(404).json({
        success: false,
        error: 'Shipping info not found'
      });
    }

    // Use transaction to update shipping and order
    const result = await prisma.$transaction(async (tx) => {
      // Update shipping
      const updatedShipping = await tx.shipping.update({
        where: { id },
        data: {
          ...(courier && { courier }),
          ...(tracking_number !== undefined && { tracking_number }),
          ...(shipping_status && { shipping_status }),
          ...(estimated_delivery && { estimated_delivery: new Date(estimated_delivery) }),
          ...(shipped_at && { shipped_at: new Date(shipped_at) }),
          ...(delivered_at && { delivered_at: new Date(delivered_at) })
        }
      });

      // Update order status based on shipping status
      let orderStatus = shipping.order.status;
      if (shipping_status === 'delivered') {
        orderStatus = 'delivered';
      } else if (shipping_status === 'shipped' || shipping_status === 'in_transit') {
        orderStatus = 'shipped';
      }

      if (orderStatus !== shipping.order.status) {
        await tx.order.update({
          where: { id: shipping.order_id },
          data: { status: orderStatus }
        });
      }

      // Create transaction log
      await tx.transaction.create({
        data: {
          user_id: shipping.order.user_id,
          order_id: shipping.order_id,
          status: 'success',
          message: `Shipping updated: ${shipping_status || 'info updated'}`
        }
      });

      return updatedShipping;
    });

    logger.info(`Shipping updated: ${id} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Shipping info updated successfully',
      data: result
    });
  } catch (error) {
    logger.error('Update shipping error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update shipping info'
    });
  }
};

module.exports = {
  getShippingInfo,
  createShipping,
  updateShipping
};
