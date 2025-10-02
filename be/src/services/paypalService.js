const {
  ApiError,
  Client,
  Environment,
  LogLevel,
  OrdersController,
  PaymentsController
} = require('@paypal/paypal-server-sdk');
const logger = require('../utils/logger');

// Configure PayPal environment
let client, ordersController, paymentsController;

// Debug logging
logger.info(`NODE_ENV: ${process.env.NODE_ENV}`);
logger.info(`PAYPAL_CLIENT_ID: ${process.env.PAYPAL_CLIENT_ID ? 'SET' : 'NOT SET'}`);
logger.info(`PAYPAL_CLIENT_SECRET: ${process.env.PAYPAL_CLIENT_SECRET ? 'SET' : 'NOT SET'}`);

if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET && 
    process.env.PAYPAL_CLIENT_ID !== 'your-paypal-client-id') {
  
  const isProduction = process.env.NODE_ENV === 'production';
  logger.info(`PayPal Environment: ${isProduction ? 'PRODUCTION' : 'SANDBOX'}`);
  
  client = new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: process.env.PAYPAL_CLIENT_ID,
      oAuthClientSecret: process.env.PAYPAL_CLIENT_SECRET,
    },
    timeout: 0,
    environment: isProduction ? Environment.Production : Environment.Sandbox,
    logging: {
      logLevel: LogLevel.Info,
      logRequest: { logBody: true },
      logResponse: { logHeaders: true },
    },
  });

  ordersController = new OrdersController(client);
  paymentsController = new PaymentsController(client);
  
  logger.info('PayPal client initialized successfully');
} else {
  logger.warn('PayPal credentials not configured. PayPal features will be disabled.');
  logger.warn(`Client ID: ${process.env.PAYPAL_CLIENT_ID}`);
  logger.warn(`Client Secret: ${process.env.PAYPAL_CLIENT_SECRET ? 'SET' : 'NOT SET'}`);
}

class PayPalService {
  /**
   * Create PayPal order
   * @param {Object} orderData - Order data
   * @param {string} orderData.orderId - Internal order ID
   * @param {number} orderData.totalAmount - Total amount
   * @param {number} orderData.shippingCost - Shipping cost
   * @param {Array} orderData.items - Order items
   * @param {string} orderData.returnUrl - Return URL after payment
   * @param {string} orderData.cancelUrl - Cancel URL
   * @returns {Object} PayPal order response
   */
  static async createOrder(orderData) {
    try {
      if (!client || !ordersController) {
        throw new Error('PayPal is not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in your .env file');
      }

      const { orderId, totalAmount, shippingCost, items, returnUrl, cancelUrl } = orderData;
      
      const total = totalAmount + shippingCost;
      
      // Build PayPal order request sesuai dokumentasi referensi
      const collect = {
        body: {
          intent: "CAPTURE",
          purchaseUnits: [{
            referenceId: orderId,
            amount: {
              currencyCode: "USD",
              value: total.toFixed(2),
              breakdown: {
                itemTotal: {
                  currencyCode: "USD",
                  value: totalAmount.toFixed(2)
                },
                shipping: {
                  currencyCode: "USD",
                  value: shippingCost.toFixed(2)
                }
              }
            },
                items: items.map(item => ({
                  name: item.name,
                  description: item.description || '',
                  quantity: item.quantity.toString(),
                  unitAmount: {
                    currencyCode: "USD",
                    value: item.price.toFixed(2)
                  },
                  sku: item.sku || ''
                }))
          }],
          applicationContext: {
            brandName: 'Hexa Crochet',
            landingPage: 'NO_PREFERENCE',
            userAction: 'PAY_NOW',
            returnUrl: returnUrl,
            cancelUrl: cancelUrl
          }
        },
        prefer: "return=minimal"
      };

      const { body, ...httpResponse } = await ordersController.createOrder(collect);
      const jsonResponse = JSON.parse(body);
      
      logger.info(`PayPal order created: ${jsonResponse.id} for order ${orderId}`);
      
      return {
        success: true,
        orderId: jsonResponse.id,
        approvalUrl: jsonResponse.links.find(link => link.rel === 'approve')?.href,
        data: jsonResponse,
        httpStatusCode: httpResponse.statusCode
      };
    } catch (error) {
      if (error instanceof ApiError) {
        logger.error('PayPal API error:', error.message);
        throw new Error(`PayPal API error: ${error.message}`);
      }
      logger.error('PayPal create order error:', error);
      throw new Error(`Failed to create PayPal order: ${error.message}`);
    }
  }

  /**
   * Capture PayPal order
   * @param {string} paypalOrderId - PayPal order ID
   * @returns {Object} Capture response
   */
  static async captureOrder(paypalOrderId) {
    try {
      if (!client || !ordersController) {
        throw new Error('PayPal is not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in your .env file');
      }

      const collect = {
        id: paypalOrderId,
        body: {},
        prefer: "return=minimal"
      };

      logger.info(`Capturing PayPal order: ${paypalOrderId}`);
      const { body, ...httpResponse } = await ordersController.captureOrder(collect);
      const jsonResponse = JSON.parse(body);
      
      logger.info(`PayPal order captured: ${paypalOrderId}, Status: ${httpResponse.statusCode}`);
      logger.info(`PayPal capture response structure:`, JSON.stringify(jsonResponse, null, 2));
      
      // Safely extract capture ID
      let captureId = null;
      if (jsonResponse.purchaseUnits && 
          jsonResponse.purchaseUnits[0] && 
          jsonResponse.purchaseUnits[0].payments && 
          jsonResponse.purchaseUnits[0].payments.captures && 
          jsonResponse.purchaseUnits[0].payments.captures[0]) {
        captureId = jsonResponse.purchaseUnits[0].payments.captures[0].id;
      }
      
      return {
        success: true,
        captureId: captureId,
        status: jsonResponse.status,
        data: jsonResponse,
        httpStatusCode: httpResponse.statusCode
      };
    } catch (error) {
      if (error instanceof ApiError) {
        logger.error('PayPal API error:', {
          message: error.message,
          statusCode: error.statusCode,
          headers: error.headers,
          body: error.body
        });
        
        // Handle specific PayPal errors
        if (error.body) {
          try {
            const errorBody = JSON.parse(error.body);
            if (errorBody.details && errorBody.details[0]) {
              const errorDetail = errorBody.details[0];
              if (errorDetail.issue === 'INSTRUMENT_DECLINED') {
                throw new Error('Payment method declined. Please try a different payment method.');
              }
            }
          } catch (parseError) {
            // If we can't parse the error body, use the original message
          }
        }
        
        throw new Error(`PayPal API error: ${error.message}`);
      }
      logger.error('PayPal capture order error:', error);
      throw new Error(`Failed to capture PayPal order: ${error.message}`);
    }
  }

  /**
   * Get PayPal order details
   * @param {string} paypalOrderId - PayPal order ID
   * @returns {Object} Order details
   */
  static async getOrderDetails(paypalOrderId) {
    try {
      if (!client || !ordersController) {
        throw new Error('PayPal is not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in your .env file');
      }

      const collect = {
        id: paypalOrderId
      };

      const { body, ...httpResponse } = await ordersController.getOrder(collect);
      const jsonResponse = JSON.parse(body);
      
      return {
        success: true,
        data: jsonResponse,
        httpStatusCode: httpResponse.statusCode
      };
    } catch (error) {
      if (error instanceof ApiError) {
        logger.error('PayPal API error:', error.message);
        throw new Error(`PayPal API error: ${error.message}`);
      }
      logger.error('PayPal get order details error:', error);
      throw new Error(`Failed to get PayPal order details: ${error.message}`);
    }
  }

  /**
   * Refund PayPal payment
   * @param {string} captureId - PayPal capture ID
   * @param {number} amount - Refund amount (optional, full refund if not provided)
   * @param {string} reason - Refund reason
   * @returns {Object} Refund response
   */
  static async refundPayment(captureId, amount = null, reason = 'Refund requested') {
    try {
      if (!client || !paymentsController) {
        throw new Error('PayPal is not configured. Please set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET in your .env file');
      }

      const collect = {
        id: captureId,
        body: {
          amount: amount ? {
            currencyCode: 'USD',
            value: amount.toFixed(2)
          } : undefined,
          noteToPayer: reason
        },
        prefer: "return=minimal"
      };

      const { body, ...httpResponse } = await paymentsController.capturesRefund(collect);
      const jsonResponse = JSON.parse(body);
      
      logger.info(`PayPal refund processed: ${jsonResponse.id} for capture ${captureId}`);
      
      return {
        success: true,
        refundId: jsonResponse.id,
        status: jsonResponse.status,
        data: jsonResponse,
        httpStatusCode: httpResponse.statusCode
      };
    } catch (error) {
      if (error instanceof ApiError) {
        logger.error('PayPal API error:', error.message);
        throw new Error(`PayPal API error: ${error.message}`);
      }
      logger.error('PayPal refund error:', error);
      throw new Error(`Failed to refund PayPal payment: ${error.message}`);
    }
  }

  /**
   * Validate webhook signature
   * @param {Object} headers - Request headers
   * @param {string} body - Request body
   * @returns {boolean} Is valid signature
   */
  static validateWebhook(headers, body) {
    try {
      // PayPal webhook validation logic
      // This is a simplified version - in production, implement proper webhook validation
      const webhookId = process.env.PAYPAL_WEBHOOK_ID;
      if (!webhookId) {
        logger.warn('PayPal webhook ID not configured');
        return false;
      }
      
      // TODO: Implement proper webhook signature validation
      // For now, we'll trust the webhook (not recommended for production)
      return true;
    } catch (error) {
      logger.error('PayPal webhook validation error:', error);
      return false;
    }
  }

  /**
   * Process webhook event
   * @param {Object} event - Webhook event data
   * @returns {Object} Processed event
   */
  static async processWebhook(event) {
    try {
      const { event_type, resource } = event;
      
      logger.info(`PayPal webhook received: ${event_type}`);
      
      switch (event_type) {
        case 'PAYMENT.CAPTURE.COMPLETED':
          return {
            success: true,
            type: 'payment_completed',
            captureId: resource.id,
            orderId: resource.supplementary_data?.related_ids?.order_id,
            amount: parseFloat(resource.amount.value),
            currency: resource.amount.currency_code
          };
          
        case 'PAYMENT.CAPTURE.DENIED':
          return {
            success: true,
            type: 'payment_denied',
            captureId: resource.id,
            reason: resource.reason_code
          };
          
        case 'PAYMENT.CAPTURE.REFUNDED':
          return {
            success: true,
            type: 'payment_refunded',
            refundId: resource.id,
            captureId: resource.capture_id,
            amount: parseFloat(resource.amount.value)
          };
          
        default:
          logger.info(`Unhandled PayPal webhook event: ${event_type}`);
          return {
            success: true,
            type: 'unhandled',
            eventType: event_type
          };
      }
    } catch (error) {
      logger.error('PayPal webhook processing error:', error);
      throw new Error(`Failed to process PayPal webhook: ${error.message}`);
    }
  }
}

module.exports = PayPalService;