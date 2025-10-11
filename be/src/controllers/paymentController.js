const prisma = require('../utils/prisma');
const logger = require('../utils/logger');
const PayPalService = require('../services/paypalService');
const MidtransService = require('../services/midtransService');

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

// Create Midtrans payment
const createMidtransPayment = async (req, res) => {
  try {
    const { order_id, payment_method = 'bank_transfer' } = req.body;

    console.log('Midtrans payment request:', {
      order_id,
      payment_method,
      user_id: req.user.id
    });

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
        },
        address: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    console.log('Order data:', {
      id: order.id,
      total_amount: order.total_amount,
      shipping_cost: order.shipping_cost,
      address: order.address ? {
        recipient_name: order.address.recipient_name,
        phone_number: order.address.phone_number,
        address_line: order.address.address_line,
        city: order.address.city,
        postal_code: order.address.postal_code
      } : 'No address found'
    });

    if (order.payment_status === 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Order is already paid'
      });
    }

    // Check if there's an active payment session
    const existingPayment = await prisma.payment.findFirst({
      where: {
        order_id: order_id,
        payment_status: { in: ['pending', 'processing'] }
      },
      orderBy: {
        payment_date: 'desc'
      }
    });

    if (existingPayment) {
      // For now, we'll consider payments valid for 30 minutes from creation
      // Since we don't have created_at, we'll use a different approach
      // We'll check if payment_date is recent (within 30 minutes) or if it's null (newly created)
      const now = new Date();
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
      
      // If payment_date is null (newly created) or within 30 minutes, consider it active
      const isRecent = !existingPayment.payment_date || 
                      new Date(existingPayment.payment_date) > thirtyMinutesAgo;

      if (isRecent) {
        // Instead of returning error, try to get fresh token from Midtrans
        try {
          const statusResult = await MidtransService.getTransactionStatus(order.id);
          
          if (statusResult.success && statusResult.data.transaction_status === 'pending') {
            // Transaction is still pending, return the existing token
            return res.status(400).json({
              success: false,
              error: 'Payment session already exists',
              data: {
                existing_payment: {
                  id: existingPayment.id,
                  payment_reference: existingPayment.payment_reference,
                  payment_status: existingPayment.payment_status,
                  payment_date: existingPayment.payment_date,
                  expires_at: existingPayment.payment_date ? 
                    new Date(new Date(existingPayment.payment_date).getTime() + 30 * 60 * 1000) :
                    new Date(now.getTime() + 30 * 60 * 1000),
                  can_retry: false
                }
              }
            });
          } else {
            // Transaction is expired or completed, mark as cancelled and continue
            await prisma.payment.update({
              where: { id: existingPayment.id },
              data: { payment_status: 'cancelled' }
            });
          }
        } catch (statusError) {
          console.log('Error checking transaction status:', statusError);
          // If we can't check status, mark as cancelled and continue
          await prisma.payment.update({
            where: { id: existingPayment.id },
            data: { payment_status: 'cancelled' }
          });
        }
      } else {
        // Mark expired payment as cancelled
        await prisma.payment.update({
          where: { id: existingPayment.id },
          data: { payment_status: 'cancelled' }
        });
      }
    }

    // Prepare items for Midtrans
    const itemDetails = order.order_items.map(item => {
      // Truncate name if too long (Midtrans limit is 50 characters)
      const fullName = `${item.product_variant.product.name} - ${item.product_variant.variant_name}`;
      const truncatedName = fullName.length > 50 ? fullName.substring(0, 47) + '...' : fullName;
      
      return {
        id: item.product_variant.id,
        price: parseFloat(item.price),
        quantity: item.quantity,
        name: truncatedName
      };
    });

    // Add shipping as separate item
    if (order.shipping_cost > 0) {
      itemDetails.push({
        id: 'shipping',
        price: parseFloat(order.shipping_cost),
        quantity: 1,
        name: 'Biaya Pengiriman'
      });
    }

    // Calculate total from item details to ensure accuracy
    const calculatedTotal = itemDetails.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderTotal = parseFloat(order.total_amount) + parseFloat(order.shipping_cost);

    console.log('Item details and totals:', {
      itemDetails,
      calculatedTotal,
      orderTotal,
      difference: Math.abs(calculatedTotal - orderTotal)
    });

    // Prepare customer details
    const recipientName = order.address.recipient_name || 'Customer';
    const nameParts = recipientName.split(' ');
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    console.log('Customer details preparation:', {
      recipientName,
      firstName,
      lastName,
      email: req.user.email,
      phone: order.address.phone_number,
      address: order.address.address_line,
      city: order.address.city,
      postal_code: order.address.postal_code
    });
    
    const customerDetails = {
      first_name: firstName,
      last_name: lastName,
      email: req.user.email,
      phone: order.address.phone_number || '',
      billing_address: {
        first_name: firstName,
        last_name: lastName,
        address: order.address.address_line || '',
        city: order.address.city || '',
        postal_code: order.address.postal_code || '',
        country_code: 'IDN'
      },
      shipping_address: {
        first_name: firstName,
        last_name: lastName,
        address: order.address.address_line || '',
        city: order.address.city || '',
        postal_code: order.address.postal_code || '',
        country_code: 'IDN'
      }
    };

    // Create Midtrans Snap payment
    const midtransPayment = await MidtransService.createSnapPayment({
      orderId: order.id,
      totalAmount: calculatedTotal, // Use calculated total instead of order total
      customerDetails,
      itemDetails,
      paymentMethod: payment_method
    });

    if (!midtransPayment.success) {
      return res.status(400).json({
        success: false,
        error: midtransPayment.error
      });
    }

    // Save Midtrans payment record
    await prisma.payment.create({
      data: {
        order_id,
        payment_method: 'midtrans',
        amount: calculatedTotal, // Use calculated total
        payment_reference: midtransPayment.data.token,
        payment_status: 'pending'
      }
    });

    logger.info(`Midtrans Snap payment created for order ${order_id} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Midtrans Snap payment created successfully',
      data: {
        token: midtransPayment.data.token,
        redirect_url: midtransPayment.data.redirect_url,
        order_id: order.id,
        payment_type: payment_method
      }
    });
  } catch (error) {
    logger.error('Create Midtrans payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create Midtrans payment'
    });
  }
};

// Handle Midtrans notification
const handleMidtransNotification = async (req, res) => {
  try {
    const notificationData = req.body;

    // Process notification
    const result = await MidtransService.handleNotification(notificationData);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    const { order_id, transaction_status, fraud_status } = result.data;

    // Find payment record
    const payment = await prisma.payment.findFirst({
      where: {
        order_id: order_id,
        payment_method: 'midtrans'
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

    // Update payment and order status based on transaction status
    let paymentStatus = 'pending';
    let orderStatus = payment.order.status;

    switch (transaction_status) {
      case 'capture':
        if (fraud_status === 'accept') {
          paymentStatus = 'paid';
          orderStatus = 'processing';
        } else {
          paymentStatus = 'failed';
        }
        break;
      case 'settlement':
        paymentStatus = 'paid';
        orderStatus = 'processing';
        break;
      case 'pending':
        paymentStatus = 'pending';
        break;
      case 'deny':
      case 'expire':
      case 'cancel':
        paymentStatus = 'failed';
        break;
    }

    // Update payment and order
    await prisma.$transaction(async (tx) => {
      // Update payment
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          payment_status: paymentStatus,
          payment_date: paymentStatus === 'paid' ? new Date() : null
        }
      });

      // Update order
      await tx.order.update({
        where: { id: payment.order_id },
        data: {
          payment_status: paymentStatus,
          status: orderStatus
        }
      });

      // Create transaction log
      await tx.transaction.create({
        data: {
          user_id: payment.order.user_id,
          order_id: payment.order_id,
          status: 'success',
          message: `Midtrans payment ${transaction_status}: ${fraud_status || 'N/A'}`
        }
      });
    });

    logger.info(`Midtrans notification processed: ${transaction_status} for order ${order_id}`);

    res.json({
      success: true,
      message: 'Notification processed successfully'
    });
  } catch (error) {
    logger.error('Midtrans notification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process notification'
    });
  }
};

// Get Midtrans transaction status
const getMidtransTransactionStatus = async (req, res) => {
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

    // Get status from Midtrans
    const statusResult = await MidtransService.getTransactionStatus(orderId);

    if (!statusResult.success) {
      return res.status(400).json({
        success: false,
        error: statusResult.error
      });
    }

    res.json({
      success: true,
      data: {
        order_id: orderId,
        transaction_status: statusResult.data.transaction_status,
        fraud_status: statusResult.data.fraud_status,
        gross_amount: statusResult.data.gross_amount,
        payment_type: statusResult.data.payment_type
      }
    });
  } catch (error) {
    logger.error('Get Midtrans status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get transaction status'
    });
  }
};

// Get payment status for an order
const getPaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        user_id: req.user.id
      },
      include: {
        payments: {
          orderBy: {
            payment_date: 'desc'
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

    // Find active payment
    const activePayment = order.payments.find(payment => 
      payment.payment_status === 'pending' || payment.payment_status === 'processing'
    );

    if (activePayment) {
      // Use payment_date or consider it recent if null
      const now = new Date();
      const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
      
      const isRecent = !activePayment.payment_date || 
                      new Date(activePayment.payment_date) > thirtyMinutesAgo;

      if (!isRecent) {
        // Mark as cancelled
        await prisma.payment.update({
          where: { id: activePayment.id },
          data: { payment_status: 'cancelled' }
        });

        return res.json({
          success: true,
          data: {
            has_active_payment: false,
            can_create_payment: true,
            message: 'Previous payment session has expired'
          }
        });
      }

      return res.json({
        success: true,
        data: {
          has_active_payment: true,
          can_create_payment: false,
          active_payment: {
            id: activePayment.id,
            payment_method: activePayment.payment_method,
            payment_reference: activePayment.payment_reference,
            payment_status: activePayment.payment_status,
            payment_date: activePayment.payment_date,
            expires_at: activePayment.payment_date ? 
              new Date(new Date(activePayment.payment_date).getTime() + 30 * 60 * 1000) :
              new Date(now.getTime() + 30 * 60 * 1000)
          }
        }
      });
    }

    res.json({
      success: true,
      data: {
        has_active_payment: false,
        can_create_payment: true,
        message: 'No active payment session'
      }
    });
  } catch (error) {
    logger.error('Get payment status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get payment status'
    });
  }
};

// Cancel active payment
const cancelActivePayment = async (req, res) => {
  try {
    const { orderId } = req.params;

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

    // Find active payment
    const activePayment = await prisma.payment.findFirst({
      where: {
        order_id: orderId,
        payment_status: { in: ['pending', 'processing'] }
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    if (!activePayment) {
      return res.status(400).json({
        success: false,
        error: 'No active payment to cancel'
      });
    }

    // Mark as cancelled
    await prisma.payment.update({
      where: { id: activePayment.id },
      data: { payment_status: 'cancelled' }
    });

    logger.info(`Payment ${activePayment.id} cancelled for order ${orderId} by ${req.user.email}`);

    res.json({
      success: true,
      message: 'Payment session cancelled successfully',
      data: {
        cancelled_payment_id: activePayment.id
      }
    });
  } catch (error) {
    logger.error('Cancel payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel payment'
    });
  }
};

// Continue existing Midtrans payment
const continueMidtransPayment = async (req, res) => {
  try {
    const { order_id, payment_method = 'bank_transfer' } = req.body;

    console.log('Continue Midtrans payment request:', {
      order_id,
      payment_method,
      user_id: req.user.id
    });

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
        },
        address: true
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

    // Find existing payment
    const existingPayment = await prisma.payment.findFirst({
      where: {
        order_id: order_id,
        payment_status: { in: ['pending', 'processing'] }
      },
      orderBy: {
        payment_date: 'desc'
      }
    });

    if (!existingPayment) {
      return res.status(400).json({
        success: false,
        error: 'No existing payment found'
      });
    }

    // Check if existing payment is still valid
    const now = new Date();
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    
    const isRecent = !existingPayment.payment_date || 
                    new Date(existingPayment.payment_date) > thirtyMinutesAgo;

    if (!isRecent) {
      // Mark as cancelled and create new payment
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: { payment_status: 'cancelled' }
      });
      
      // Continue with normal payment creation flow
      return createMidtransPayment(req, res);
    }

    // Try to get fresh status from Midtrans
    const statusResult = await MidtransService.getTransactionStatus(order.id);
    
    if (statusResult.success && statusResult.data.transaction_status === 'pending') {
      // Transaction is still pending, return existing token
      res.json({
        success: true,
        message: 'Continuing existing payment',
        data: {
          token: existingPayment.payment_reference,
          redirect_url: null,
          order_id: order.id,
          payment_type: payment_method,
          is_existing: true
        }
      });
    } else {
      // Transaction is expired or completed, cancel and create new
      await prisma.payment.update({
        where: { id: existingPayment.id },
        data: { payment_status: 'cancelled' }
      });
      
      // Continue with normal payment creation flow
      return createMidtransPayment(req, res);
    }
  } catch (error) {
    logger.error('Continue Midtrans payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to continue Midtrans payment'
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
  refundPayPalPayment,
  createMidtransPayment,
  handleMidtransNotification,
  getMidtransTransactionStatus,
  getPaymentStatus,
  cancelActivePayment,
  continueMidtransPayment
};
