# FedEx Integration untuk Shipping Internasional

## Overview
Sistem ini telah diintegrasikan dengan FedEx API untuk menangani shipping internasional. Untuk shipping lokal (Indonesia), sistem tetap menggunakan Biteship API.

## Konfigurasi

### API Keys
FedEx API keys sudah dikonfigurasi di `FedExService`:
- API Key: `l7a6e2cfb41918414bad1f6c60a5a6344b`
- Secret Key: `beaaf3f4cb57413eb8cfdc0a24ef9cbf`

### Environment Variables
Tidak ada environment variables tambahan yang diperlukan untuk FedEx karena keys sudah hardcoded di service.

## Endpoints

### 1. Get Shipping Rates
**POST** `/api/shipping/rates`

Untuk shipping internasional, sistem akan otomatis menggunakan FedEx API.

**Request Body:**
```json
{
  "origin_postal_code": "12345",
  "destination_postal_code": "54321",
  "origin_country": "ID",
  "destination_country": "US",
  "couriers": "fedex",
  "items": [
    {
      "weight": 1000,
      "quantity": 1,
      "price": 100000
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "pricing": [
      {
        "courier_name": "FedEx",
        "courier_code": "fedex",
        "courier_service_name": "International Priority",
        "courier_service_code": "priority",
        "service_type": "express",
        "description": "Fastest international delivery",
        "shipping_type": "parcel",
        "ship_type": "parcel",
        "service_name": "FedEx International Priority",
        "price": 450000,
        "currency": "IDR",
        "type": "parcel",
        "min_day": 2,
        "max_day": 4
      }
    ],
    "origin": {
      "postal_code": "12345",
      "country": "ID"
    },
    "destination": {
      "postal_code": "54321",
      "country": "US"
    }
  },
  "provider": "fedex",
  "cached": false,
  "origin_country": "ID",
  "destination_country": "US"
}
```

### 2. Track Shipment
**GET** `/api/shipping/track/:waybillId`

Untuk tracking FedEx, gunakan endpoint khusus:
**GET** `/api/shipping/track/fedex/:waybillId`

Atau gunakan parameter query:
**GET** `/api/shipping/track/:waybillId?courier=fedex`

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "in_transit",
    "message": "Package in transit",
    "tracking_number": "123456789012",
    "events": [
      {
        "status": "picked_up",
        "description": "Package picked up",
        "location": "Jakarta, ID",
        "timestamp": "2024-01-15T10:30:00Z",
        "details": "Package picked up from origin"
      }
    ],
    "estimated_delivery": "2024-01-18T17:00:00Z",
    "carrier": "FedEx"
  },
  "provider": "fedex"
}
```

### 3. Check Configuration Status
**GET** `/api/shipping/config-status`

**Response:**
```json
{
  "success": true,
  "data": {
    "biteshipConfigured": true,
    "biteshipApiKeyPresent": true,
    "fedexConfigured": true,
    "message": {
      "biteship": "Biteship API is properly configured",
      "fedex": "FedEx API is configured and ready for international shipping"
    }
  }
}
```

## Logika Routing

### Shipping Rates
- **Indonesia → Indonesia**: Menggunakan Biteship API
- **Indonesia → Luar Negeri**: Menggunakan FedEx API
- **Luar Negeri → Indonesia**: Menggunakan FedEx API
- **Luar Negeri → Luar Negeri**: Menggunakan FedEx API

### Tracking
- Sistem akan otomatis mendeteksi courier berdasarkan tracking number pattern
- FedEx tracking numbers: 12-14 digits atau pattern 4-4-4
- Bisa juga menggunakan parameter `courier=fedex` untuk memaksa menggunakan FedEx

## Error Handling

### FedEx API Errors
Jika FedEx API gagal, sistem akan fallback ke estimated rates berdasarkan destination country.

### Rate Limiting
FedEx API memiliki rate limiting yang lebih ketat dibanding Biteship. Sistem menggunakan caching untuk mengurangi API calls.

## Caching

### Shipping Rates
- FedEx rates di-cache selama 1 jam (3600 detik)
- Biteship rates di-cache selama 30 menit (1800 detik)

### Access Token
- FedEx access token di-cache dan auto-refresh
- Token expires 5 menit sebelum actual expiry untuk safety

## Testing

### Test FedEx Rates
```bash
curl -X POST http://localhost:3000/api/shipping/rates \
  -H "Content-Type: application/json" \
  -d '{
    "origin_postal_code": "12345",
    "destination_postal_code": "10001",
    "origin_country": "ID",
    "destination_country": "US",
    "items": [{"weight": 1000, "quantity": 1, "price": 100000}]
  }'
```

### Test FedEx Tracking
```bash
curl http://localhost:3000/api/shipping/track/fedex/123456789012
```

## Notes

1. **Sandbox vs Production**: Saat ini menggunakan production FedEx API. Untuk testing, bisa diubah ke sandbox URL di `FedExService`.

2. **Currency**: Semua harga dikonversi ke IDR (Indonesian Rupiah).

3. **Weight**: Input weight dalam gram, dikonversi ke kg untuk FedEx API.

4. **Fallback**: Jika FedEx API gagal, sistem akan menggunakan estimated rates berdasarkan destination country.

5. **Logging**: Semua API calls ke FedEx di-log untuk monitoring dan debugging.
