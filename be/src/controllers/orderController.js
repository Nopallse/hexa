const prisma = require('../utils/prisma');
const logger = require('../utils/logger');
const BiteshipService = require('../services/biteshipService');
const BiteshipLocationService = require('../services/biteshipLocationService');
const emailService = require('../services/emailService');

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
    const { address_id, shipping_cost, cart_item_ids, courier_code, courier_service_code } = req.body;

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

    // Get cart items - filter by cart_item_ids if provided
    const whereClause = { 
      user_id: req.user.id,
      ...(cart_item_ids && Array.isArray(cart_item_ids) && cart_item_ids.length > 0
        ? { id: { in: cart_item_ids } }
        : {})
    };

    const cartItems = await prisma.cartItem.findMany({
      where: whereClause,
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
        error: cart_item_ids && cart_item_ids.length > 0 
          ? 'Tidak ada item yang dipilih untuk checkout'
          : 'Cart is empty'
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
          courier_code: courier_code || null,
          courier_service_code: courier_service_code || null,
          status: 'belum_bayar',
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

      // Remove only selected cart items (or all if cart_item_ids not provided)
      const cartItemIdsToDelete = cartItems.map(item => item.id);
      await tx.cartItem.deleteMany({
        where: { 
          id: { in: cartItemIdsToDelete },
          user_id: req.user.id
        }
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

    // Send order confirmation email
    try {
      // Get full order data with relations for email
      const fullOrder = await prisma.order.findUnique({
        where: { id: result.id },
        include: {
          address: true,
          order_items: {
            include: {
              product_variant: {
                include: {
                  product: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          },
          user: {
            select: {
              email: true,
              full_name: true
            }
          }
        }
      });

      if (fullOrder && fullOrder.user) {
        await emailService.sendOrderConfirmationEmail(
          fullOrder,
          fullOrder.user.email,
          fullOrder.user.full_name
        );
      }
    } catch (emailError) {
      logger.error('Failed to send order confirmation email:', emailError);
      // Don't fail the request if email fails
    }

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
        status: 'belum_bayar'
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
        data: { status: 'dibatalkan' }
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

// Validate status transition
const isValidStatusTransition = (currentStatus, newStatus) => {
  const validTransitions = {
    'belum_bayar': ['dikemas', 'dibatalkan'],
    'dikemas': ['dikirim', 'dibatalkan'],
    'dikirim': ['diterima'],
    'diterima': [], // Final state
    'dibatalkan': [] // Final state
  };

  return validTransitions[currentStatus]?.includes(newStatus) || false;
};

// Update order status (admin only) with workflow validation
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status value
    const validStatuses = ['belum_bayar', 'dikemas', 'dikirim', 'diterima', 'dibatalkan'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Valid statuses are: ${validStatuses.join(', ')}`
      });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        address: true,
        order_items: {
          include: {
            product_variant: {
              include: {
                product: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        shipping: true
      }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }

    // Check if status transition is valid
    if (order.status !== status && !isValidStatusTransition(order.status, status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status transition. Cannot change from ${order.status} to ${status}`
      });
    }

    // If status is already the same, return success
    if (order.status === status) {
      return res.json({
        success: true,
        message: 'Order status is already set to this value',
        data: order
      });
    }

    // Handle dikemas -> dikirim: Create waybill in Biteship
    if (order.status === 'dikemas' && status === 'dikirim') {
      // Check if shipping already exists
      if (order.shipping) {
        return res.status(400).json({
          success: false,
          error: 'Shipping info already exists for this order'
        });
      }

      // Get origin location (active origin)
      const originLocationResult = await BiteshipLocationService.getActiveOriginLocation();
      if (!originLocationResult.success || !originLocationResult.data) {
        return res.status(400).json({
          success: false,
          error: 'Origin location not configured. Please set up origin location in Biteship first.'
        });
      }
      logger.info(`Origin location: ${JSON.stringify(originLocationResult.data)}`);

      const originLocation = originLocationResult.data;

      // Get origin area_id from Biteship Maps API (using postal code from location)
      // Biteship requires area_id from Maps API, not location_id from Locations API
      let originAreaId = null;
      if (originLocation.postal_code) {
        try {
          const originAreaSearch = await BiteshipService.getAreas({
            countries: 'ID',
            input: originLocation.postal_code,
            type: 'single',
            limit: 1
          });
          
          if (originAreaSearch.success) {
            const areas = originAreaSearch.data?.areas || originAreaSearch.data || [];
            if (Array.isArray(areas) && areas.length > 0 && areas[0].id) {
              originAreaId = areas[0].id;
              logger.info(`Found origin area_id for postal code ${originLocation.postal_code}: ${originAreaId}`);
            }
          }
        } catch (error) {
          logger.warn(`Failed to get origin area_id for postal code ${originLocation.postal_code}:`, error.message);
        }
      }

      // If area_id not found, we still need postal_code for Biteship
      if (!originAreaId && !originLocation.postal_code) {
        return res.status(400).json({
          success: false,
          error: 'Origin location must have postal_code configured'
        });
      }

      // Prepare items for Biteship order
      // Items structure: { name, description, category, value, quantity, height, length, weight, width }
      const items = order.order_items.map(item => ({
        name: item.product_variant.product.name.substring(0, 100), // Limit to 100 chars
        description: (item.product_variant.variant_name || '').substring(0, 200), // Limit to 200 chars
        category: 'fashion', // Default category, should be configurable from product
        value: parseFloat(item.price) * item.quantity, // Total value for this item
        quantity: item.quantity,
        weight: 1000, // Default weight 1kg per item in grams, should be configurable from product
        height: 10, // Default height in cm, should be configurable from product
        length: 20, // Default length in cm, should be configurable from product
        width: 15 // Default width in cm, should be configurable from product
      }));

      // Calculate total weight (default 1kg per item)
      const totalWeight = items.reduce((sum, item) => sum + (item.weight * item.quantity), 0);

      // Get destination area from Biteship (search by postal code or address)
      // Search for area_id using postal code or city name
      let destinationAreaId = null;
      try {
        logger.info(`Searching for area_id by postal code: ${order.address.postal_code}`);
        // Try searching by postal code first
        const postalCodeSearch = await BiteshipService.getAreas({
          countries: 'ID',
          input: order.address.postal_code,
          type: 'single',
          limit: 1
        });

        logger.info(`Postal code search result: ${JSON.stringify(postalCodeSearch)}`);
        if (postalCodeSearch.success) {
          // Biteship getAreas returns { areas: [...] } structure
          const areas = postalCodeSearch.data?.areas || postalCodeSearch.data || [];
          if (Array.isArray(areas) && areas.length > 0) {
            // Find area with matching postal code
            const matchingArea = areas.find(area => 
              area.postal_code === parseInt(order.address.postal_code) ||
              String(area.postal_code) === String(order.address.postal_code)
            );
            
            if (matchingArea && matchingArea.id) {
              destinationAreaId = matchingArea.id;
              logger.info(`Found area_id for postal code ${order.address.postal_code}: ${destinationAreaId}`);
            } else if (areas[0] && areas[0].id) {
              // Use first result if no exact match
              destinationAreaId = areas[0].id;
              logger.info(`Using first area_id for postal code ${order.address.postal_code}: ${destinationAreaId}`);
            }
          }
        }

        // If not found by postal code, try searching by city
        if (!destinationAreaId && order.address.city) {
          const citySearch = await BiteshipService.getAreas({
            countries: 'ID',
            input: `${order.address.city}, ${order.address.province}`,
            type: 'single',
            limit: 5
          });
          
          if (citySearch.success) {
            const areas = citySearch.data?.areas || citySearch.data || [];
            // Find area that matches postal code
            const matchingArea = areas.find(area => 
              area.postal_code === parseInt(order.address.postal_code) ||
              area.postal_code === order.address.postal_code
            );
            
            if (matchingArea && matchingArea.id) {
              destinationAreaId = matchingArea.id;
              logger.info(`Found area_id for city ${order.address.city}: ${destinationAreaId}`);
            } else if (areas.length > 0 && areas[0].id) {
              // Use first result if no exact match
              destinationAreaId = areas[0].id;
              logger.info(`Using first area_id for city ${order.address.city}: ${destinationAreaId}`);
            }
          }
        }
      } catch (error) {
        logger.warn(`Failed to get area_id for destination:`, error.message);
      }

      // Validate required fields
      if (!originLocation.contact_name || !originLocation.contact_phone) {
        return res.status(400).json({
          success: false,
          error: 'Origin location must have contact_name and contact_phone configured in Biteship'
        });
      }

      if (!order.address.recipient_name || !order.address.phone_number) {
        return res.status(400).json({
          success: false,
          error: 'Order address must have recipient_name and phone_number'
        });
      }

      // Prepare order payload according to Biteship API documentation
      // Endpoint: POST /v1/orders
      // Note: If area_id is provided, postal_code is optional
      const orderPayload = {
        // Shipper info (optional)
        shipper_contact_name: originLocation.contact_name,
        shipper_contact_phone: originLocation.contact_phone,
        shipper_contact_email: originLocation.contact_email || undefined,
        
        // Origin info (REQUIRED)
        origin_contact_name: originLocation.contact_name,
        origin_contact_phone: originLocation.contact_phone,
        origin_contact_email: originLocation.contact_email || undefined,
        origin_address: originLocation.address,
        // Use area_id from Maps API if found, otherwise use postal_code
        ...(originAreaId 
          ? { origin_area_id: originAreaId }
          : { origin_postal_code: parseInt(originLocation.postal_code) }),
        origin_note: `Pickup location for Order #${order.id.slice(-8).toUpperCase()}`,
        
        // Destination info (REQUIRED)
        destination_contact_name: order.address.recipient_name,
        destination_contact_phone: order.address.phone_number,
        destination_contact_email: req.user.email || undefined,
        destination_address: order.address.address_line,
        // Use area_id if found, otherwise use postal_code as number (Biteship expects number)
        // NOTE: Biteship requires EITHER area_id OR postal_code OR coordinates, NOT all of them
        // Biteship area_id format: IDNP... or can be any string from areas API
        ...(destinationAreaId && typeof destinationAreaId === 'string' && destinationAreaId.length > 0
          ? { destination_area_id: destinationAreaId }
          : { destination_postal_code: parseInt(order.address.postal_code) }),
        destination_note: `Delivery for Order #${order.id.slice(-8).toUpperCase()}`,
        
        // Courier info (REQUIRED)
        // Use courier from order if available, otherwise use defaults
        courier_company: order.courier_code || 'jne', // Use courier selected by user, fallback to default
        courier_type: order.courier_service_code || 'reg', // Use service selected by user, fallback to default
        
        // Delivery info (REQUIRED)
        delivery_type: 'now', // Immediate delivery
        
        // Order info
        order_note: `Order #${order.id.slice(-8).toUpperCase()}`,
        reference_id: order.id, // Use order ID as reference
        metadata: {
          order_id: order.id
        },
        
        // Items (REQUIRED)
        items: items
      };

      // Remove undefined fields to avoid sending them
      Object.keys(orderPayload).forEach(key => {
        if (orderPayload[key] === undefined || orderPayload[key] === null || orderPayload[key] === '') {
          delete orderPayload[key];
        }
      });

      // CRITICAL: Biteship requires EITHER area_id OR postal_code, NOT both
      // If area_id is provided, remove postal_code to avoid conflict
      if (orderPayload.origin_area_id && orderPayload.origin_postal_code) {
        delete orderPayload.origin_postal_code;
        logger.info('Removed origin_postal_code because origin_area_id is provided');
      }
      
      if (orderPayload.destination_area_id && orderPayload.destination_postal_code) {
        delete orderPayload.destination_postal_code;
        logger.info('Removed destination_postal_code because destination_area_id is provided');
      }

      // Log payload for debugging
      logger.info(`Creating Biteship order with payload:`, {
        origin_area_id: orderPayload.origin_area_id,
        origin_postal_code: orderPayload.origin_postal_code,
        destination_area_id: orderPayload.destination_area_id,
        destination_postal_code: orderPayload.destination_postal_code,
        courier_company: orderPayload.courier_company,
        courier_type: orderPayload.courier_type,
        items_count: orderPayload.items?.length || 0
      });

      // Create order in Biteship
      const biteshipOrderResult = await BiteshipService.createWaybill(orderPayload);
      
      if (!biteshipOrderResult.success) {
        logger.error(`Failed to create Biteship order for order ${id}:`, biteshipOrderResult.error);
        return res.status(500).json({
          success: false,
          error: `Failed to create shipping order: ${biteshipOrderResult.error}`,
          code: biteshipOrderResult.code,
          details: biteshipOrderResult.details
        });
      }

      const biteshipOrder = biteshipOrderResult.data;

      // Use transaction to update order status and create shipping
      const result = await prisma.$transaction(async (tx) => {
        // Create shipping record
        // Biteship order response structure: 
        // { id, courier: { tracking_id, company, type }, delivery: { datetime }, status }
        // Note: tracking_number should only be set if courier.tracking_id exists
        // Do not use biteshipOrder.id as fallback (that's waybill_id, not tracking number)
        // Tracking number will be updated later via webhook (courier_waybill_id or courier_tracking_id)
        const shipping = await tx.shipping.create({
          data: {
            order_id: id,
            biteship_order_id: biteshipOrder.id || null, // Store Biteship order ID for webhook matching
            courier: biteshipOrder.courier?.company || 'JNE',
            tracking_number: biteshipOrder.courier?.tracking_id || null, // Only use actual tracking_id, don't fallback to waybill_id
            estimated_delivery: biteshipOrder.delivery?.datetime ? new Date(biteshipOrder.delivery.datetime) : null,
            shipping_status: biteshipOrder.status || 'confirmed',
            shipped_at: new Date()
          }
        });

        // Update order status
        const updatedOrder = await tx.order.update({
          where: { id },
          data: { status }
        });

        // Create transaction log
        await tx.transaction.create({
          data: {
            user_id: order.user_id,
            order_id: id,
            status: 'success',
            message: `Order status updated to ${status} and shipping order created in Biteship`
          }
        });

        return { order: updatedOrder, shipping };
      });

      logger.info(`Order status updated: ${id} to ${status} and Biteship order created by ${req.user.email}`);

      // Send order status update email
      try {
        const fullOrder = await prisma.order.findUnique({
          where: { id },
          include: {
            address: true,
            shipping: true,
            user: {
              select: {
                email: true,
                full_name: true
              }
            }
          }
        });

        if (fullOrder && fullOrder.user) {
          await emailService.sendOrderStatusUpdateEmail(
            fullOrder,
            order.status,
            status,
            fullOrder.user.email,
            fullOrder.user.full_name
          );
        }
      } catch (emailError) {
        logger.error('Failed to send order status update email:', emailError);
      }

      return res.json({
        success: true,
        message: 'Order status updated and shipping order created successfully',
        data: result.order,
        shipping: result.shipping,
        biteship_order: biteshipOrder
      });
    }

    // For other status transitions, just update the status
    const oldStatus = order.status;
    const updatedOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
      where: { id },
      data: { status }
    });

    // Create transaction log
      await tx.transaction.create({
      data: {
        user_id: order.user_id,
          order_id: id,
        status: 'success',
        message: `Order status updated to ${status}`
      }
      });

      return order;
    });

    logger.info(`Order status updated: ${id} to ${status} by ${req.user.email}`);

    // Send order status update email
    try {
      const fullOrder = await prisma.order.findUnique({
        where: { id },
        include: {
          address: true,
          shipping: true,
          user: {
            select: {
              email: true,
              full_name: true
            }
          }
        }
      });

      if (fullOrder && fullOrder.user) {
        await emailService.sendOrderStatusUpdateEmail(
          fullOrder,
          oldStatus,
          status,
          fullOrder.user.email,
          fullOrder.user.full_name
        );
      }
    } catch (emailError) {
      logger.error('Failed to send order status update email:', emailError);
    }

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

// Get all orders (admin only)
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, payment_status, user_id } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {};
    if (status) where.status = status;
    if (payment_status) where.payment_status = payment_status;
    if (user_id) where.user_id = user_id;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { created_at: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              full_name: true,
              email: true,
              phone: true
            }
          },
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
    logger.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch orders'
    });
  }
};

// Get order by ID (admin only)
const getOrderByIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
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
    logger.error('Get order by ID (admin) error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch order'
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
  getOrderPaymentStatus,
  getAllOrders,
  getOrderByIdAdmin
};
