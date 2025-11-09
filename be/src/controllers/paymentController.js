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
          status: payment_status === 'paid' ? 'dikemas' : payment.order.status
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
          status: 'dikemas'
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
            status: 'dikemas'
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
        // Return existing payment token instead of creating new one
        console.log('Using existing payment token:', existingPayment.payment_reference);
        return res.status(200).json({
          success: true,
          message: 'Using existing payment session',
          data: {
            token: existingPayment.payment_reference,
            redirect_url: null,
            order_id: order.id,
            payment_type: payment_method,
            is_existing: true
          }
        });
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

    // Create unique order ID for Midtrans (add timestamp to avoid duplicate)
    const uniqueOrderId = `${order.id}-${Date.now()}`;
    
    // Create Midtrans Snap payment
    const orderDetailUrl = `${process.env.CORS_ORIGIN}/orders/${order.id}`;
    const midtransPayment = await MidtransService.createSnapPayment({
      orderId: uniqueOrderId,
      totalAmount: calculatedTotal, // Use calculated total instead of order total
      customerDetails,
      itemDetails,
      paymentMethod: payment_method,
      finishRedirectUrl: orderDetailUrl,
      unfinishRedirectUrl: orderDetailUrl,
      errorRedirectUrl: orderDetailUrl
    });

    if (!midtransPayment.success) {
      return res.status(400).json({
        success: false,
        error: midtransPayment.error
      });
    }

    // Save Midtrans payment record
    // Store the uniqueOrderId in a separate field or use it to find the payment later
    await prisma.payment.create({
      data: {
        order_id,
        payment_method: 'midtrans',
        amount: calculatedTotal, // Use calculated total
        payment_reference: midtransPayment.data.token,
        payment_status: 'pending',
        // Store the unique order ID that was sent to Midtrans for reference
        // We'll use payment_reference to match, but also need to handle order_id matching
      }
    });

    logger.info(`Midtrans Snap payment created for order ${order_id} by ${req.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Midtrans Snap payment created successfully',
      data: {
        token: midtransPayment.data.token,
        redirect_url: midtransPayment.data.redirect_url,
        order_id: uniqueOrderId,
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
    logger.info('Midtrans notification received:', {
      method: req.method,
      url: req.url,
      originalUrl: req.originalUrl,
      body: req.body
    });
    
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

    // Handle test notifications from Midtrans
    if (order_id && order_id.startsWith('payment_notif_test_')) {
      return res.json({
        success: true,
        message: 'Test notification received successfully'
      });
    }

    // Find payment record
    // The order_id from Midtrans includes timestamp: "order-id-timestamp"
    // Example: "522804cd-c3ff-4d07-ac4a-89f6edb2a2d0-1762607516770"
    // Original order_id: "522804cd-c3ff-4d07-ac4a-89f6edb2a2d0"
    // We need to extract the original order_id by removing the timestamp part
    // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (36 chars)
    // So if order_id is longer than 36 chars, it likely has a timestamp appended
    
    let originalOrderId = order_id;
    if (order_id.length > 36) {
      // Extract UUID part (first 36 characters)
      originalOrderId = order_id.substring(0, 36);
    } else if (order_id.includes('-') && order_id.split('-').length > 5) {
      // Alternative: if it has more than 5 parts (UUID has 5 parts), remove the last part
      const parts = order_id.split('-');
      originalOrderId = parts.slice(0, 5).join('-');
    }
    
    logger.info(`Extracting order_id: ${order_id} -> ${originalOrderId}`);
    
    // Try to find payment by original order_id first
    // Get the most recent payment for this order by sorting by id (UUIDs are sequential)
    let payment = await prisma.payment.findFirst({
      where: {
        order_id: originalOrderId,
        payment_method: 'midtrans'
      },
      include: {
        order: true
      },
      orderBy: {
        id: 'desc' // Get the most recent payment for this order
      }
    });

    // If not found, try to find by the full order_id (in case it's stored differently)
    if (!payment) {
      logger.info(`Payment not found with original order_id, trying full order_id: ${order_id}`);
      payment = await prisma.payment.findFirst({
        where: {
          order_id: order_id,
          payment_method: 'midtrans'
        },
        include: {
          order: true
        },
        orderBy: {
          id: 'desc'
        }
      });
    }

    if (!payment) {
      logger.error(`Payment record not found for order_id: ${order_id} (original: ${originalOrderId})`);
      return res.status(404).json({
        success: false,
        error: 'Payment record not found',
        debug: {
          received_order_id: order_id,
          extracted_order_id: originalOrderId
        }
      });
    }

    // Update payment and order status based on transaction status
    // Status order: belum_bayar, dikemas, dikirim, diterima, dibatalkan
    let paymentStatus = 'pending';
    let orderStatus = payment.order.status;

    switch (transaction_status) {
      case 'capture':
        if (fraud_status === 'accept') {
          paymentStatus = 'paid';
          orderStatus = 'dikemas'; // Setelah bayar, status menjadi dikemas
        } else {
          paymentStatus = 'failed';
          // Tetap belum_bayar jika payment failed
        }
        break;
      case 'settlement':
        paymentStatus = 'paid';
        orderStatus = 'dikemas'; // Setelah bayar, status menjadi dikemas
        break;
      case 'pending':
        paymentStatus = 'pending';
        // Tetap belum_bayar jika masih pending
        break;
      case 'deny':
      case 'expire':
      case 'cancel':
        paymentStatus = 'failed';
        orderStatus = 'dibatalkan'; // Jika payment gagal, order dibatalkan
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

// Get all payments (admin only)
const getAllPayments = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      payment_status, 
      payment_method,
      order_id,
      user_id,
      startDate,
      endDate
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};
    if (payment_status) where.payment_status = payment_status;
    if (payment_method) where.payment_method = payment_method;
    if (order_id) where.order_id = order_id;
    if (user_id) where.order = { user_id };
    
    // Filter by payment_date if date range is provided
    if (startDate || endDate) {
      where.payment_date = {};
      if (startDate) where.payment_date.gte = new Date(startDate);
      if (endDate) where.payment_date.lte = new Date(endDate);
    }

    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { payment_date: 'desc' },
        include: {
          order: {
            select: {
              id: true,
              status: true,
              total_amount: true,
              shipping_cost: true,
              payment_status: true,
              created_at: true,
              user: {
                select: {
                  id: true,
                  full_name: true,
                  email: true,
                  phone: true
                }
              }
            }
          }
        }
      }),
      prisma.payment.count({ where })
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: payments.map(payment => ({
        id: payment.id,
        orderId: payment.order_id,
        orderStatus: payment.order.status,
        paymentMethod: payment.payment_method,
        paymentStatus: payment.payment_status,
        amount: payment.amount,
        currencyCode: payment.currency_code,
        paymentReference: payment.payment_reference,
        paymentDate: payment.payment_date,
        customer: payment.order.user,
        orderTotal: payment.order.total_amount,
        orderShippingCost: payment.order.shipping_cost,
        orderCreatedAt: payment.order.created_at
      })),
      pagination: {
        current_page: parseInt(page),
        total_pages: totalPages,
        total_items: total,
        items_per_page: parseInt(limit),
        has_next_page: parseInt(page) < totalPages,
        has_prev_page: parseInt(page) > 1
      }
    });
  } catch (error) {
    logger.error('Get all payments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payments'
    });
  }
};

// Get payment statistics (admin only)
const getPaymentStats = async (req, res) => {
  try {
    const [totalPayments, paidPayments, pendingPayments, failedPayments, totalRevenue] = await Promise.all([
      prisma.payment.count(),
      prisma.payment.count({ where: { payment_status: 'paid' } }),
      prisma.payment.count({ where: { payment_status: 'pending' } }),
      prisma.payment.count({ where: { payment_status: 'failed' } }),
      prisma.payment.aggregate({
        where: { payment_status: 'paid' },
        _sum: { amount: true }
      })
    ]);

    res.json({
      success: true,
      data: {
        totalPayments,
        paidPayments,
        pendingPayments,
        failedPayments,
        totalRevenue: totalRevenue._sum.amount ? parseFloat(totalRevenue._sum.amount) : 0
      }
    });
  } catch (error) {
    logger.error('Get payment stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment statistics'
    });
  }
};

// Get payment by ID (admin only)
const getPaymentById = async (req, res) => {
  try {
    const { id } = req.params;

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            user: {
              select: {
                id: true,
                full_name: true,
                email: true,
                phone: true
              }
            },
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
                          take: 1,
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
            }
          }
        }
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    logger.error('Get payment by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment details'
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
  continueMidtransPayment,
  getAllPayments,
  getPaymentStats,
  getPaymentById
};
