const prisma = require('../utils/prisma');
const logger = require('../utils/logger');
const PayPalService = require('../services/paypalService');

// Create payment
const createPayment = async (req, res) => {
  try {
    const { order_id, payment_method, amount, payment_reference } = req.body;

    // Check if order exists and belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: order_id,
        user_id: req.user.id
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    if (order.payment_status === 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Order is already paid'
      });
    }

    // Validate payment amount
    const expectedAmount = order.total_amount + order.shipping_cost;
    if (Math.abs(amount - expectedAmount) > 0.01) { // Allow small floating point differences
      return res.status(400).json({
        success: false,
        error: `Payment amount must be ${expectedAmount}`
      });
    }

    // Use transaction to create payment and update order
    const result = await prisma.$transaction(async (tx) => {
      // Create payment record
      const payment = await tx.payment.create({
        data: {
          order_id,
          payment_method,
          amount,
          payment_reference,
          payment_status: payment_method === 'COD' ? 'pending' : 'pending'
        }
      });

      // Update order payment status
      await tx.order.update({
        where: { id: order_id },
        data: {
          payment_status: payment_method === 'COD' ? 'paid' : 'unpaid'
        }
      });

      // Create transaction log
      await tx.transaction.create({
        data: {
          user_id: req.user.id,
          order_id,
          status: 'success',
          message: `Payment created via ${payment_method}`
        }
      });

      return payment;
    });

    logger.info(`Payment created for order ${order_id} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: result
    });
  } catch (error) {
    logger.error('Create payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create payment'
    });
  }
};

// Get payment info for order
const getPaymentInfo = async (req, res) => {
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

    const payments = await prisma.payment.findMany({
      where: { order_id: orderId },
      orderBy: { payment_date: 'desc' }
    });

    res.json({
      success: true,
      data: {
        order_id: orderId,
        total_amount: order.total_amount,
        shipping_cost: order.shipping_cost,
        payment_status: order.payment_status,
        payments
      }
    });
  } catch (error) {
    logger.error('Get payment info error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment info'
    });
  }
};

// Verify payment (admin only)
const verifyPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status, payment_date } = req.body;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        order: true
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    // Use transaction to update payment and order
    const result = await prisma.$transaction(async (tx) => {
      // Update payment
      const updatedPayment = await tx.payment.update({
        where: { id },
        data: {
          payment_status,
          payment_date: payment_date ? new Date(payment_date) : new Date()
        }
      });

      // Update order payment status
      await tx.order.update({
        where: { id: payment.order_id },
        data: {
          payment_status: payment_status === 'paid' ? 'paid' : 'unpaid',
          status: payment_status === 'paid' ? 'processing' : payment.order.status
        }
      });

      // Create transaction log
      await tx.transaction.create({
        data: {
          user_id: payment.order.user_id,
          order_id: payment.order_id,
          status: 'success',
          message: `Payment ${payment_status} by admin`
        }
      });

      return updatedPayment;
    });

    logger.info(`Payment ${payment_status}: ${id} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Payment status updated successfully',
      data: result
    });
  } catch (error) {
    logger.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify payment'
    });
  }
};

// Create PayPal payment
const createPayPalPayment = async (req, res) => {
  try {
    const { order_id } = req.body;

    // Check if order exists and belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: order_id,
        user_id: req.user.id
      },
      include: {
        order_items: {
          include: {
            product_variant: {
              include: {
                product: {
                  select: {
                    name: true,
                    description: true
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
        }
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    if (order.payment_status === 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Order is already paid'
      });
    }

    // Prepare items for PayPal
    const items = order.order_items.map(item => ({
      name: `${item.product_variant.product.name} - ${item.product_variant.variant_name}`,
      description: item.product_variant.product.description || '',
      quantity: item.quantity,
      price: parseFloat(item.price),
      sku: item.product_variant.sku || ''
    }));

    // Create PayPal order
    const paypalOrder = await PayPalService.createOrder({
      orderId: order.id,
      totalAmount: parseFloat(order.total_amount),
      shippingCost: parseFloat(order.shipping_cost),
      items,
      returnUrl: `${process.env.CORS_ORIGIN}/payment/success?order_id=${order.id}`,
      cancelUrl: `${process.env.CORS_ORIGIN}/payment/cancel?order_id=${order.id}`
    });

    // Save PayPal order ID to database
    await prisma.payment.create({
      data: {
        order_id,
        payment_method: 'paypal',
        amount: order.total_amount + order.shipping_cost,
        payment_reference: paypalOrder.orderId,
        payment_status: 'pending'
      }
    });

    logger.info(`PayPal payment created for order ${order_id} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'PayPal payment created successfully',
      data: {
        paypal_order_id: paypalOrder.orderId,
        approval_url: paypalOrder.approvalUrl,
        order_id: order.id
      }
    });
  } catch (error) {
    logger.error('Create PayPal payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create PayPal payment'
    });
  }
};

// Capture PayPal payment
const capturePayPalPayment = async (req, res) => {
  try {
    const { paypal_order_id } = req.body;

    // Capture PayPal order
    const captureResult = await PayPalService.captureOrder(paypal_order_id);

    if (!captureResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to capture PayPal payment'
      });
    }

    // Find payment record
    const payment = await prisma.payment.findFirst({
      where: {
        payment_reference: paypal_order_id
      },
      include: {
        order: true
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment record not found'
      });
    }

    // Update payment and order status
    await prisma.$transaction(async (tx) => {
      // Update payment
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          payment_status: 'paid',
          payment_date: new Date()
        }
      });

      // Update order
      await tx.order.update({
        where: { id: payment.order_id },
        data: {
          payment_status: 'paid',
          status: 'processing'
        }
      });

      // Create transaction log
      await tx.transaction.create({
        data: {
          user_id: payment.order.user_id,
          order_id: payment.order_id,
          status: 'success',
          message: `PayPal payment captured: ${captureResult.captureId}`
        }
      });
    });

    logger.info(`PayPal payment captured: ${captureResult.captureId} for order ${payment.order_id}`);

    res.json({
      success: true,
      message: 'PayPal payment captured successfully',
      data: {
        capture_id: captureResult.captureId,
        order_id: payment.order_id,
        status: captureResult.status
      }
    });
  } catch (error) {
    logger.error('Capture PayPal payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to capture PayPal payment'
    });
  }
};

// PayPal webhook handler
const handlePayPalWebhook = async (req, res) => {
  try {
    const headers = req.headers;
    const body = req.body;

    // Validate webhook signature
    if (!PayPalService.validateWebhook(headers, body)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid webhook signature'
      });
    }

    // Process webhook event
    const event = await PayPalService.processWebhook(body);

    if (!event.success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to process webhook event'
      });
    }

    // Handle different event types
    switch (event.type) {
      case 'payment_completed':
        // Update payment status
        await prisma.payment.updateMany({
          where: {
            payment_reference: event.orderId
          },
          data: {
            payment_status: 'paid',
            payment_date: new Date()
          }
        });

        // Update order status
        await prisma.order.updateMany({
          where: {
            id: event.orderId
          },
          data: {
            payment_status: 'paid',
            status: 'processing'
          }
        });
        break;

      case 'payment_denied':
        // Update payment status
        await prisma.payment.updateMany({
          where: {
            payment_reference: event.orderId
          },
          data: {
            payment_status: 'failed'
          }
        });
        break;

      case 'payment_refunded':
        // Handle refund
        await prisma.payment.updateMany({
          where: {
            payment_reference: event.captureId
          },
          data: {
            payment_status: 'refunded'
          }
        });
        break;
    }

    logger.info(`PayPal webhook processed: ${event.type}`);

    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    logger.error('PayPal webhook error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process webhook'
    });
  }
};

// Refund PayPal payment
const refundPayPalPayment = async (req, res) => {
  try {
    const { payment_id, amount, reason } = req.body;

    // Find payment record
    const payment = await prisma.payment.findFirst({
      where: {
        id: payment_id,
        payment_method: 'paypal',
        payment_status: 'paid'
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found or not eligible for refund'
      });
    }

    // Process refund with PayPal
    const refundResult = await PayPalService.refundPayment(
      payment.payment_reference,
      amount ? parseFloat(amount) : null,
      reason || 'Refund requested'
    );

    if (!refundResult.success) {
      return res.status(400).json({
        success: false,
        error: 'Failed to process refund with PayPal'
      });
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: payment_id },
      data: {
        payment_status: 'refunded'
      }
    });

    // Create transaction log
    await prisma.transaction.create({
      data: {
        user_id: req.user.id,
        order_id: payment.order_id,
        status: 'success',
        message: `PayPal refund processed: ${refundResult.refundId}`
      }
    });

    logger.info(`PayPal refund processed: ${refundResult.refundId} for payment ${payment_id}`);

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        refund_id: refundResult.refundId,
        status: refundResult.status
      }
    });
  } catch (error) {
    logger.error('Refund PayPal payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to refund PayPal payment'
    });
  }
};

module.exports = {
  createPayment,
  getPaymentInfo,
  verifyPayment,
  createPayPalPayment,
  capturePayPalPayment,
  handlePayPalWebhook,
  refundPayPalPayment
};
