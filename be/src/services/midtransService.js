const midtransClient = require('midtrans-client');
const crypto = require('crypto');

class MidtransService {
  constructor() {
    // Use fallback values for testing if environment variables are not set
    this.serverKey = process.env.MIDTRANS_SERVER_KEY || 'SB-Mid-server-UtRW_uI4F5Wz6Pv8Tq8TQ';
    this.clientKey = process.env.MIDTRANS_CLIENT_KEY || 'SB-Mid-client-UtRW_uI4F5Wz6Pv8Tq8TQ';
    this.isProduction = process.env.NODE_ENV === 'production';
    
    // Initialize Midtrans Snap client
    this.snap = new midtransClient.Snap({
      isProduction: this.isProduction,
      serverKey: this.serverKey,
      clientKey: this.clientKey
    });
    
    // Debug logging
    console.log('MidtransService initialized:');
    console.log('- Server Key:', this.serverKey ? 'SET' : 'NOT SET');
    console.log('- Client Key:', this.clientKey ? 'SET' : 'NOT SET');
    console.log('- Environment:', this.isProduction ? 'PRODUCTION' : 'SANDBOX');
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
        paymentMethod = 'bank_transfer'
      } = orderData;

      const parameter = {
        transaction_details: {
          order_id: orderId,
          gross_amount: totalAmount
        },
        customer_details: customerDetails,
        item_details: itemDetails
      };

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
