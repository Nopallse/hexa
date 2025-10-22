# Checkout Feature - FedEx Integration

## Overview
Fitur checkout telah diintegrasikan dengan FedEx untuk mendukung shipping internasional. Sistem akan otomatis menggunakan Biteship untuk shipping lokal (Indonesia) dan FedEx untuk shipping internasional.

## Komponen

### 1. ShippingMethodSelector
**File:** `components/ShippingMethodSelector.tsx`

Komponen untuk memilih metode pengiriman dengan dukungan:
- **Biteship** untuk shipping lokal Indonesia
- **FedEx** untuk shipping internasional
- **Auto-detection** provider berdasarkan destination country
- **Provider indicator** dengan icon dan warna

**Fitur:**
- Menampilkan provider info (Biteship/FedEx)
- Indicator untuk shipping internasional
- Fallback ke estimated rates jika API gagal
- Caching untuk optimasi performa

### 2. ShippingTracking
**File:** `components/ShippingTracking.tsx`

Komponen untuk tracking pengiriman dengan dukungan:
- **Multi-provider tracking** (Biteship & FedEx)
- **Timeline view** untuk riwayat pengiriman
- **Auto-detection** kurir berdasarkan tracking number
- **Real-time status** updates

**Fitur:**
- Timeline dengan status dan lokasi
- Provider indicator
- Refresh functionality
- Error handling dengan retry

### 3. ShippingConfigStatus
**File:** `components/ShippingConfigStatus.tsx`

Komponen untuk menampilkan status konfigurasi shipping:
- **Biteship status** (local shipping)
- **FedEx status** (international shipping)
- **Coverage indicator** (Indonesia/International)

### 4. ShippingTrackingPage
**File:** `pages/ShippingTrackingPage.tsx`

Halaman khusus untuk tracking pengiriman:
- **Search form** dengan nomor tracking
- **Manual courier selection** (opsional)
- **Configuration status** display
- **Help section** dengan panduan

## Types

### ShippingMethod
```typescript
interface ShippingMethod {
  courier_name: string;
  courier_code: string;
  courier_service_name: string;
  courier_service_code: string;
  service_type: 'express' | 'standard' | 'economy';
  description: string;
  shipping_type: string;
  ship_type: string;
  service_name: string;
  price: number;
  currency?: string;
  type: string;
  min_day: number;
  max_day: number;
  provider?: 'biteship' | 'fedex' | 'fedex-estimated' | 'indonesia-estimated';
}
```

### TrackingResponse
```typescript
interface TrackingResponse {
  status: 'pending' | 'picked_up' | 'in_transit' | 'delivered' | 'cancelled' | 'exception' | 'unknown';
  message: string;
  tracking_number: string;
  events: TrackingEvent[];
  estimated_delivery?: string;
  carrier?: string;
}
```

## Services

### checkoutApi
**File:** `services/checkoutApi.ts`

API service untuk checkout dengan dukungan:
- `getShippingConfigStatus()` - Status konfigurasi
- `trackShipment()` - Tracking dengan auto-detection
- `trackFedExShipment()` - Tracking FedEx khusus

### useShippingConfig
**File:** `hooks/useShippingConfig.ts`

Custom hook untuk:
- Fetch shipping configuration status
- Loading dan error states
- Refetch functionality

## Routing Logic

### Shipping Rates
- **Indonesia → Indonesia**: Biteship API
- **Indonesia → Luar Negeri**: FedEx API
- **Luar Negeri → Indonesia**: FedEx API
- **Luar Negeri → Luar Negeri**: FedEx API

### Tracking
- **Auto-detection**: Berdasarkan pattern tracking number
- **Manual selection**: Parameter `courier` untuk override
- **FedEx specific**: Endpoint `/shipping/track/fedex/:waybillId`

## UI Features

### Provider Indicators
- **Biteship**: 🚚 Primary color
- **FedEx**: 📦 Error color
- **FedEx (Estimated)**: 📦 Warning color
- **Indonesia (Estimated)**: 🇮🇩 Info color

### International Shipping
- **Country flag** indicator
- **"Internasional"** chip untuk non-Indonesia
- **Provider-specific** styling

### Status Indicators
- **Express**: Red chip
- **Standard**: Blue chip
- **Economy**: Green chip

## Usage Examples

### 1. Checkout dengan Shipping Internasional
```tsx
<ShippingMethodSelector
  selectedAddress={addressData}
  cartItems={cartItems}
  selectedMethod={selectedMethod}
  onMethodSelect={(method) => {
    // method.provider akan berisi 'fedex' untuk internasional
    setSelectedShippingMethod(method);
  }}
/>
```

### 2. Tracking FedEx
```tsx
<ShippingTracking
  trackingNumber="123456789012"
  courier="fedex" // Opsional, bisa auto-detect
  onClose={() => setShowTracking(false)}
/>
```

### 3. Configuration Status
```tsx
<ShippingConfigStatus />
```

## Error Handling

### API Errors
- **Graceful fallback** ke estimated rates
- **User-friendly** error messages
- **Retry functionality** untuk failed requests

### Network Issues
- **Loading states** dengan spinner
- **Timeout handling** dengan fallback
- **Caching** untuk mengurangi API calls

## Caching Strategy

### Shipping Rates
- **Memory cache** untuk session
- **Redis cache** untuk cross-session (jika tersedia)
- **TTL**: 30 menit untuk Biteship, 1 jam untuk FedEx

### Configuration Status
- **Session cache** untuk status
- **Auto-refresh** jika diperlukan

## Testing

### Manual Testing
1. **Local Shipping**: Pilih alamat Indonesia
2. **International Shipping**: Pilih alamat luar negeri
3. **Tracking**: Test dengan nomor FedEx dan Biteship
4. **Error Handling**: Test dengan nomor tracking invalid

### Test Cases
- ✅ Biteship rates untuk Indonesia
- ✅ FedEx rates untuk internasional
- ✅ Auto-detection tracking number
- ✅ Manual courier selection
- ✅ Error handling dan fallback
- ✅ Provider indicators
- ✅ International shipping UI

## Dependencies

### External
- `@mui/material` - UI components
- `@mui/icons-material` - Icons
- `axios` - HTTP client

### Internal
- `@/services/shippingApi` - Shipping API
- `@/hooks/useCurrencyConversion` - Currency conversion
- `@/features/addresses` - Address management

## Future Enhancements

1. **Real-time tracking** dengan WebSocket
2. **Push notifications** untuk status updates
3. **Bulk tracking** untuk multiple shipments
4. **Tracking history** untuk user
5. **Delivery confirmation** dengan photo
6. **SMS/Email notifications** untuk status changes
