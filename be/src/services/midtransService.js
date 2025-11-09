const midtransClient = require('midtrans-client');
const crypto = require('crypto');

class MidtransService {
  constructor() {
    // Use fallback values for testing if environment variables are not set
    this.serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-UtRW_uI4F5Wz6Pv8Tq8TQ';
    this.clientKey = process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-UtRW_uI4F5Wz6Pv8Tq8TQ';
    
    // Validate key format
    const isSandboxKey = this.serverKey.startsWith('SB-Mid-');
    const isProductionKey = this.serverKey.startsWith('Mid-server-') && !this.serverKey.startsWith('SB-Mid-');
    
    // Check if explicitly set to use sandbox (override NODE_ENV)
    const forceSandbox = process.env.MIDTRANS_USE_SANDBOX === 'true' || process.env.MIDTRANS_USE_SANDBOX === '1';
    
    // Auto-detect sandbox if using sandbox key format
    // If using sandbox key, always use sandbox environment regardless of NODE_ENV
    if (isSandboxKey || forceSandbox) {
      this.isProduction = false;
      console.log('🔵 Using SANDBOX environment (detected from key format or MIDTRANS_USE_SANDBOX)');
    } else if (isProductionKey) {
      // Only use production if explicitly using production key
      this.isProduction = process.env.NODE_ENV === 'production';
      if (this.isProduction) {
        console.log('🟢 Using PRODUCTION environment');
      } else {
        console.log('🔵 Using SANDBOX environment (NODE_ENV is not production)');
      }
    } else {
      // Default to sandbox if key format is unknown
      this.isProduction = false;
      console.warn('⚠️  WARNING: Unknown key format, defaulting to SANDBOX');
    }
    
    // Warn if key format doesn't match environment
    if (this.isProduction && isSandboxKey) {
      console.warn('⚠️  WARNING: Production environment but using sandbox key format (SB-Mid-*)');
      console.warn('⚠️  Auto-switching to SANDBOX environment');
      this.isProduction = false;
    } else if (!this.isProduction && isProductionKey && process.env.NODE_ENV === 'production') {
      console.warn('⚠️  WARNING: Sandbox environment but using production key format (Mid-server-*)');
      console.warn('⚠️  If you want to use production, ensure NODE_ENV=production and use production key');
    }
    
    // Initialize Midtrans Snap client
    this.snap = new midtransClient.Snap({
      isProduction: this.isProduction,
      serverKey: this.serverKey,
      clientKey: this.clientKey
    });
    
    // Debug logging
    console.log('MidtransService initialized:');
    console.log('- Server Key:', this.serverKey ? `${this.serverKey.substring(0, 25)}...` : 'NOT SET');
    console.log('- Client Key:', this.clientKey ? `${this.clientKey.substring(0, 25)}...` : 'NOT SET');
    console.log('- Environment:', this.isProduction ? 'PRODUCTION' : 'SANDBOX');
    console.log('- NODE_ENV:', process.env.NODE_ENV || 'not set');
    console.log('- MIDTRANS_USE_SANDBOX:', process.env.MIDTRANS_USE_SANDBOX || 'not set');
    console.log('- Key Type:', isSandboxKey ? 'SANDBOX KEY' : isProductionKey ? 'PRODUCTION KEY' : 'UNKNOWN FORMAT');
    
    if (!this.serverKey || !this.clientKey) {
      console.error('❌ ERROR: Midtrans keys are not properly configured!');
    }
  }

  // Generate signature for Midtrans
  generateSignature(orderId, statusCode, grossAmount, serverKey) {
    const stringToSign = `${orderId}${statusCode}${grossAmount}${serverKey}`;
    return crypto.createHash('sha512').update(stringToSign).digest('hex');
  }

  // Create Snap payment (with Snap UI)
  async createSnapPayment(orderData) {
    try {
      console.log('MidtransService.createSnapPayment called with:', orderData);
      
      if (!this.serverKey) {
        throw new Error('MIDTRANS_SERVER_KEY is not set');
      }
      
      const {
        orderId,
        totalAmount,
        customerDetails,
        itemDetails,
        paymentMethod = 'bank_transfer',
        finishRedirectUrl,
        unfinishRedirectUrl,
        errorRedirectUrl
      } = orderData;

      const parameter = {
        transaction_details: {
          order_id: orderId,
          gross_amount: totalAmount
        },
        customer_details: customerDetails,
        item_details: itemDetails
      };

      // Add redirect URLs if provided
      if (finishRedirectUrl) {
        parameter.finish_redirect_url = finishRedirectUrl;
      }
      if (unfinishRedirectUrl) {
        parameter.unfinish_redirect_url = unfinishRedirectUrl;
      }
      if (errorRedirectUrl) {
        parameter.error_redirect_url = errorRedirectUrl;
      }

      console.log('Sending parameter to Midtrans Snap:', JSON.stringify(parameter, null, 2));
      
      const response = await this.snap.createTransaction(parameter);

      console.log('Midtrans Snap response:', response);

      return {
        success: true,
        data: {
          token: response.token,
          redirect_url: response.redirect_url,
          order_id: orderId,
          payment_type: paymentMethod
        }
      };
    } catch (error) {
      console.error('Midtrans create Snap payment error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create Midtrans Snap payment'
      };
    }
  }

  // Get available payment methods
  getAvailablePaymentMethods() {
    return [
      {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        description: 'Transfer Bank (BCA, Mandiri, BNI, BRI)',
        icon: '🏦',
        available: true,
        banks: ['bca', 'mandiri', 'bni', 'bri']
      },
      {
        id: 'e_wallet',
        name: 'E-Wallet',
        description: 'GoPay, OVO, DANA, LinkAja',
        icon: '📱',
        available: true,
        wallets: ['gopay', 'ovo', 'dana', 'linkaja']
      },
      {
        id: 'credit_card',
        name: 'Credit Card',
        description: 'Visa, Mastercard, JCB',
        icon: '💳',
        available: true,
        cards: ['visa', 'mastercard', 'jcb']
      },
      {
        id: 'qris',
        name: 'QRIS',
        description: 'Scan QR Code untuk pembayaran',
        icon: '📱',
        available: true
      }
    ];
  }

  // Get transaction status
  async getTransactionStatus(orderId) {
    try {
      const response = await this.snap.transaction.status(orderId);
      return {
        success: true,
        data: response
      };
    } catch (error) {
      console.error('Midtrans get status error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get transaction status'
      };
    }
  }

  // Handle notification from Midtrans
  async handleNotification(notificationData) {
    try {
      const {
        order_id,
        status_code,
        gross_amount,
        signature_key,
        transaction_status,
        fraud_status
      } = notificationData;

      // Skip signature verification for test notifications
      if (order_id && order_id.startsWith('payment_notif_test_')) {
        return {
          success: true,
          data: {
            order_id,
            transaction_status,
            fraud_status,
            gross_amount,
            status_code
          }
        };
      }

      // Verify signature
      const expectedSignature = this.generateSignature(
        order_id,
        status_code,
        gross_amount,
        this.serverKey
      );

      if (signature_key !== expectedSignature) {
        return {
          success: false,
          error: 'Invalid signature'
        };
      }

      return {
        success: true,
        data: {
          order_id,
          transaction_status,
          fraud_status,
          gross_amount,
          status_code
        }
      };
    } catch (error) {
      console.error('Midtrans notification error:', error);
      return {
        success: false,
        error: 'Failed to process notification'
      };
    }
  }

  // Cancel transaction
  async cancelTransaction(orderId) {
    try {
      const response = await axios.post(`${this.baseUrl}/transactions/${orderId}/cancel`, {}, {
        headers: {
          'Authorization': `Basic ${Buffer.from(this.serverKey + ':').toString('base64')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('Midtrans cancel error:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to cancel transaction'
      };
    }
  }
}

module.exports = new MidtransService();
