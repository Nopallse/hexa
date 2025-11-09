const prisma = require('../utils/prisma');
const logger = require('../utils/logger');
const BiteshipService = require('../services/biteshipService');

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
        error: 'Order not foundd'
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

      // Update order status to dikirim
      await tx.order.update({
        where: { id: order_id },
        data: { status: 'dikirim' }
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
      // Status order: belum_bayar, dikemas, dikirim, diterima, dibatalkan
      let orderStatus = shipping.order.status;
      if (shipping_status === 'delivered') {
        orderStatus = 'diterima';
      } else if (shipping_status === 'shipped' || shipping_status === 'in_transit') {
        orderStatus = 'dikirim';
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

// Get areas for autocomplete
const getAreas = async (req, res) => {
  try {
    const { input, countries = 'ID', type = 'single', limit = 10 } = req.query;

    if (!input || input.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Input must be at least 2 characters'
      });
    }

    const result = await BiteshipService.getAreas({
      countries,
      input: input.trim(),
      type,
      limit: parseInt(limit)
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.data,
      cached: result.cached || false
    });
  } catch (error) {
    logger.error('Get areas error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch areas'
    });
  }
};

// Get shipping rates
const getShippingRates = async (req, res) => {
  try {
    const { 
      origin_postal_code, 
      destination_postal_code,
      origin_country = 'ID',
      destination_country = 'ID',
      couriers = 'jne,jnt,sicepat,pos,anteraja',
      items = []
    } = req.body;

    if (!origin_postal_code || !destination_postal_code) {
      return res.status(400).json({
        success: false,
        error: 'Origin and destination postal codes are required'
      });
    }

    const result = await BiteshipService.getShippingRates({
      origin_postal_code,
      destination_postal_code,
      origin_country,
      destination_country,
      couriers,
      items
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    logger.info(`Shipping rates fetched: ${origin_country} -> ${destination_country}, provider: ${result.provider}`);

    res.json({
      success: true,
      data: result.data,
      provider: result.provider,
      cached: result.cached || false,
      origin_country,
      destination_country
    });
  } catch (error) {
    logger.error('Get shipping rates error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch shipping rates'
    });
  }
};

// Track shipment
const trackShipment = async (req, res) => {
  try {
    const { waybillId } = req.params;
    const { courier } = req.query; // Optional courier parameter

    if (!waybillId) {
      return res.status(400).json({
        success: false,
        error: 'Waybill ID is required'
      });
    }

    const result = await BiteshipService.trackShipment(waybillId, courier);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      data: result.data,
      provider: result.provider || 'biteship'
    });
  } catch (error) {
    logger.error('Track shipment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to track shipment'
    });
  }
};

// Get all shipping records (admin only)
const getAllShipping = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      courier,
      startDate,
      endDate
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    const where = {};
    if (status) where.shipping_status = status;
    if (courier) where.courier = { contains: courier, mode: 'insensitive' };
    
    // Filter by order created_at if date range is provided
    if (startDate || endDate) {
      where.order = {
        created_at: {}
      };
      if (startDate) where.order.created_at.gte = new Date(startDate);
      if (endDate) where.order.created_at.lte = new Date(endDate);
    }

    const [shippings, total] = await Promise.all([
      prisma.shipping.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { order: { created_at: 'desc' } },
        include: {
          order: {
            select: {
              id: true,
              status: true,
              total_amount: true,
              shipping_cost: true,
              created_at: true,
              address: {
                select: {
                  recipient_name: true,
                  address_line: true,
                  city: true,
                  province: true,
                  postal_code: true
                }
              },
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
      prisma.shipping.count({ where })
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: shippings.map(shipping => ({
        id: shipping.id,
        orderId: shipping.order_id,
        recipient: shipping.order.address?.recipient_name || 'N/A',
        destination: shipping.order.address 
          ? `${shipping.order.address.address_line}, ${shipping.order.address.city}, ${shipping.order.address.province} ${shipping.order.address.postal_code}`
          : 'N/A',
        courier: shipping.courier,
        status: shipping.shipping_status,
        trackingNumber: shipping.tracking_number,
        createdAt: shipping.created_at,
        deliveredAt: shipping.delivered_at,
        estimatedDelivery: shipping.estimated_delivery,
        shippingCost: shipping.order.shipping_cost,
        orderStatus: shipping.order.status,
        customer: shipping.order.user
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
    logger.error('Get all shipping error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch shipping records'
    });
  }
};

// Get shipping statistics (admin only)
const getShippingStats = async (req, res) => {
  try {
    const [totalOrders, pendingShipment, inTransit, delivered] = await Promise.all([
      prisma.shipping.count(),
      prisma.shipping.count({ where: { shipping_status: 'pending' } }),
      prisma.shipping.count({ where: { shipping_status: 'in_transit' } }),
      prisma.shipping.count({ where: { shipping_status: 'delivered' } })
    ]);

    // Calculate total revenue from delivered orders
    const deliveredOrders = await prisma.shipping.findMany({
      where: { shipping_status: 'delivered' },
      include: {
        order: {
          select: {
            total_amount: true
          }
        }
      }
    });

    const totalRevenue = deliveredOrders.reduce((sum, shipping) => {
      return sum + parseFloat(shipping.order.total_amount || 0);
    }, 0);

    res.json({
      success: true,
      data: {
        totalOrders,
        pendingShipment,
        inTransit,
        delivered,
        totalRevenue
      }
    });
  } catch (error) {
    logger.error('Get shipping stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch shipping statistics'
    });
  }
};

// Get shipping by ID (admin only)
const getShippingById = async (req, res) => {
  try {
    const { id } = req.params;

    const shipping = await prisma.shipping.findUnique({
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

    if (!shipping) {
      return res.status(404).json({
        success: false,
        error: 'Shipping not found'
      });
    }

    res.json({
      success: true,
      data: shipping
    });
  } catch (error) {
    logger.error('Get shipping by ID error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch shipping details'
    });
  }
};

// Handle Biteship webhook
const handleBiteshipWebhook = async (req, res) => {
  try {
    const webhookData = req.body || {};
    const { event, order_id } = webhookData;

    logger.info(`Biteship webhook received:`, {
      event,
      order_id,
      body: webhookData,
      isEmpty: !webhookData || Object.keys(webhookData).length === 0
    });

    // Handle webhook installation/test: Biteship sends empty body or minimal data during installation
    // According to Biteship docs, we must respond with "ok" for installation to succeed
    if (!event || !order_id) {
      logger.info('Biteship webhook installation/test detected - responding with ok');
      return res.status(200).send('ok');
    }

    // Find shipping record by Biteship order_id (webhook sends Biteship order ID, not our order ID)
    // Try to find by biteship_order_id first, then fallback to order_id (in case it's reference_id)
    let shipping = await prisma.shipping.findFirst({
      where: {
        OR: [
          { biteship_order_id: order_id },
          { order_id: order_id }
        ]
      },
      include: {
        order: true
      }
    });

    if (!shipping) {
      logger.warn(`Shipping not found for Biteship order_id: ${order_id}`);
      // Still respond with success to avoid webhook retries
      // Biteship might send webhooks for orders that don't exist in our system
      return res.status(200).json({
        success: true,
        message: 'Webhook received but shipping not found (order may not exist in our system)'
      });
    }

    // Handle different webhook events
    switch (event) {
      case 'order.status':
        await handleOrderStatusWebhook(webhookData, shipping);
        break;

      case 'order.price':
        await handleOrderPriceWebhook(webhookData, shipping);
        break;

      case 'order.waybill_id':
        await handleOrderWaybillIdWebhook(webhookData, shipping);
        break;

      default:
        logger.warn(`Unhandled webhook event: ${event}`);
        return res.status(400).json({
          success: false,
          error: `Unhandled event type: ${event}`
        });
    }

    logger.info(`Biteship webhook processed successfully: ${event} for order ${order_id}`);

    res.json({
      success: true,
      message: 'Webhook processed successfully'
    });
  } catch (error) {
    logger.error('Biteship webhook error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process webhook'
    });
  }
};

// Handle order.status webhook
const handleOrderStatusWebhook = async (webhookData, shipping) => {
  const {
    status,
    courier_tracking_id,
    courier_waybill_id,
    courier_company,
    courier_type,
    courier_driver_name,
    courier_driver_phone,
    courier_driver_photo_url,
    courier_driver_plate_number,
    courier_link
  } = webhookData;

  // Map Biteship status to shipping_status
  let shippingStatus = shipping.shipping_status;
  let orderStatus = shipping.order.status;

  switch (status?.toLowerCase()) {
    case 'confirmed':
      shippingStatus = 'pending';
      break;
    case 'picked':
    case 'picked_up':
      shippingStatus = 'shipped';
      orderStatus = 'dikirim';
      break;
    case 'in_transit':
      shippingStatus = 'in_transit';
      orderStatus = 'dikirim';
      break;
    case 'delivered':
      shippingStatus = 'delivered';
      orderStatus = 'diterima';
      break;
    default:
      // Keep current status if unknown
      break;
  }

  // Update shipping record
  // Priority: courier_tracking_id (actual courier tracking number) > courier_waybill_id (Biteship waybill ID)
  const trackingNumber = courier_tracking_id || courier_waybill_id || null;
  const updateData = {
    shipping_status: shippingStatus,
    ...(trackingNumber && { tracking_number: trackingNumber }),
    ...(courier_company && { courier: courier_company }),
    ...(status?.toLowerCase() === 'delivered' && { delivered_at: new Date() }),
    ...(status?.toLowerCase() === 'picked' && { shipped_at: new Date() })
  };

  await prisma.$transaction(async (tx) => {
    await tx.shipping.update({
      where: { id: shipping.id },
      data: updateData
    });

    // Update order status if changed
    if (orderStatus !== shipping.order.status) {
      await tx.order.update({
        where: { id: shipping.order_id },
        data: { status: orderStatus }
      });

      // Create transaction log
      await tx.transaction.create({
        data: {
          user_id: shipping.order.user_id,
          order_id: shipping.order_id,
          status: 'success',
          message: `Shipping status updated: ${status}`
        }
      });
    }
  });

  logger.info(`Order status updated: ${status} for shipping ${shipping.id}`);
};

// Handle order.price webhook
const handleOrderPriceWebhook = async (webhookData, shipping) => {
  const {
    price,
    shippment_fee,
    cash_on_delivery_fee,
    proof_of_delivery_fee,
    status
  } = webhookData;

  // Log price change (you might want to store this in a separate table)
  logger.info(`Price update for order ${shipping.order_id}:`, {
    new_price: price,
    shipping_fee: shippment_fee,
    cod_fee: cash_on_delivery_fee,
    pod_fee: proof_of_delivery_fee
  });

  // Update shipping cost if provided
  if (shippment_fee !== undefined) {
    await prisma.order.update({
      where: { id: shipping.order_id },
      data: {
        shipping_cost: parseFloat(shippment_fee)
      }
    });
  }

  // Also update status if provided
  if (status) {
    await handleOrderStatusWebhook({ ...webhookData, event: 'order.status' }, shipping);
  }
};

// Handle order.waybill_id webhook
const handleOrderWaybillIdWebhook = async (webhookData, shipping) => {
  const {
    courier_waybill_id,
    courier_tracking_id,
    status
  } = webhookData;

  // Update tracking number
  // Priority: courier_tracking_id (actual courier tracking number) > courier_waybill_id (Biteship waybill ID)
  const updateData = {};
  const trackingNumber = courier_tracking_id || courier_waybill_id || null;
  if (trackingNumber) {
    updateData.tracking_number = trackingNumber;
  }

  if (Object.keys(updateData).length > 0) {
    await prisma.shipping.update({
      where: { id: shipping.id },
      data: updateData
    });

    logger.info(`Waybill ID updated for shipping ${shipping.id}: ${courier_waybill_id}`);
  }

  // Also update status if provided
  if (status) {
    await handleOrderStatusWebhook({ ...webhookData, event: 'order.status' }, shipping);
  }
};

module.exports = {
  getShippingInfo,
  createShipping,
  updateShipping,
  getAreas,
  getShippingRates,
  trackShipment,
  getAllShipping,
  getShippingStats,
  getShippingById,
  handleBiteshipWebhook
};
