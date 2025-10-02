# 🚀 PayPal Payment Gateway Setup

## 📋 Prerequisites

1. **PayPal Developer Account**: Daftar di [PayPal Developer](https://developer.paypal.com/)
2. **PayPal Client ID**: Sudah disediakan dalam kode
3. **Backend API**: Pastikan backend sudah mengimplementasikan PayPal endpoints

## 🔧 Configuration

### 1. Environment Variables

Buat file `.env` di root project dengan konfigurasi berikut:

```env
# PayPal Configuration
REACT_APP_PAYPAL_CLIENT_ID=AfuW9AiMIjgZ7qDjNxz24mbU4OOqPgXigsI4Ke3OGzERJG7--WLjOt5Dku4evVoNqm9dQH8Q4VnrYrUd

# API Configuration
REACT_APP_API_URL=http://localhost:5000/api

# Environment
NODE_ENV=development
```

### 2. PayPal Client ID

Client ID yang sudah disediakan:
```
AfuW9AiMIjgZ7qDjNxz24mbU4OOqPgXigsI4Ke3OGzERJG7--WLjOt5Dku4evVoNqm9dQH8Q4VnrYrUd
```

## 🔄 Payment Flow

### 1. Create PayPal Payment
```typescript
POST /api/payments/paypal/create
{
  "order_id": "uuid-order-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "paypal_order_id": "paypal-order-id",
    "approval_url": "https://www.sandbox.paypal.com/...",
    "order_id": "uuid-order-id"
  }
}
```

### 2. Capture PayPal Payment
```typescript
POST /api/payments/paypal/capture
{
  "paypal_order_id": "paypal-order-id"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "capture_id": "capture-id",
    "order_id": "uuid-order-id",
    "status": "COMPLETED"
  }
}
```

### 3. PayPal Webhook
```typescript
POST /api/payments/paypal/webhook
```

## 🎯 Features Implemented

### ✅ Frontend Components
- **PayPalPaymentButton**: PayPal SDK integration dengan Client ID
- **PaymentMethodCard**: Selection card untuk payment methods
- **PaymentPage**: Main payment page
- **PaymentSuccessPage**: Success page setelah pembayaran
- **PaymentCancelPage**: Cancel page jika pembayaran dibatalkan

### ✅ Backend Integration
- **Create PayPal Order**: Via backend API
- **Capture Payment**: After user approval
- **Webhook Handling**: For payment status updates
- **Refund Support**: Admin refund functionality

### ✅ User Experience
- **Real-time Loading**: SDK loading states
- **Error Handling**: Comprehensive error messages
- **Fallback Button**: Jika SDK gagal load
- **Success/Cancel Pages**: Dedicated pages untuk hasil pembayaran

## 🔐 Security Features

- ✅ **Client ID Authentication**: PayPal SDK authentication
- ✅ **Backend Validation**: Server-side payment validation
- ✅ **Webhook Verification**: PayPal webhook signature validation
- ✅ **Secure API Calls**: Authenticated API requests

## 🧪 Testing

### Sandbox Mode
- Environment: `sandbox` (development)
- Test Cards: Gunakan PayPal sandbox test accounts
- Test Amounts: Gunakan amount kecil untuk testing

### Production Mode
- Environment: `live` (production)
- Real Payments: Gunakan PayPal account yang sebenarnya
- Client ID: Pastikan menggunakan Live Client ID

## 📱 Usage Example

```typescript
import PayPalPaymentButton from '@/features/payments/components/PayPalPaymentButton';

<PayPalPaymentButton
  order={order}
  onSuccess={(payment) => {
    console.log('Payment successful:', payment);
    navigate('/payment/success');
  }}
  onError={(error) => {
    console.error('Payment failed:', error);
  }}
/>
```

## 🚨 Important Notes

1. **Client ID**: Jangan expose Client ID di public repository
2. **Environment**: Pastikan environment (sandbox/live) sesuai kebutuhan
3. **Webhook URL**: Konfigurasi webhook URL di PayPal Developer Dashboard
4. **Return URLs**: Pastikan return URLs sudah dikonfigurasi dengan benar

## 🔗 Useful Links

- [PayPal Developer Documentation](https://developer.paypal.com/docs/)
- [PayPal JavaScript SDK](https://developer.paypal.com/docs/checkout/)
- [PayPal Webhooks](https://developer.paypal.com/docs/api-basics/notifications/webhooks/)
- [PayPal Sandbox Testing](https://developer.paypal.com/docs/api-basics/sandbox/)

## 🎉 Ready to Use!

PayPal Payment Gateway sudah siap digunakan dengan:
- ✅ Real PayPal SDK integration
- ✅ Your Client ID configured
- ✅ Complete payment flow
- ✅ Success/Cancel handling
- ✅ Error handling & fallbacks
