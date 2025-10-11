# Multi-Currency System Implementation

## Overview
Sistem multi-currency telah berhasil diimplementasikan untuk mendukung konversi mata uang real-time dengan kurs yang di-cache di database.

## Backend Implementation

### 1. Database Schema
- **Currency Model**: Menyimpan informasi mata uang (IDR, USD, EUR, MYR, SGD, HKD, AED)
- **ExchangeRate Model**: Menyimpan kurs mata uang dengan precision tinggi (18,6 decimal places)

### 2. Services
- **ExchangeRateService**: 
  - Fetch kurs dari API exchangerate.host
  - Process dan store kurs ke database
  - Generate inverse rates (IDRUSD, EURUSD, dll)
  - Cache management dengan upsert operations

### 3. Cron Jobs
- **ExchangeRateCronJob**: Update kurs 3x sehari (00:00, 08:00, 16:00 UTC)
- Automatic initial update saat server start
- Graceful shutdown handling

### 4. API Endpoints
- `GET /api/rates` - Ambil semua kurs untuk frontend
- `GET /api/rates/fresh` - Cek apakah kurs masih fresh
- `POST /api/rates/convert` - Konversi amount antar mata uang
- `POST /api/rates/update` - Manual update kurs (admin only)

## Frontend Implementation

### 1. Services
- **ExchangeRateService**: 
  - Fetch kurs dari backend API
  - Cache management (5 menit)
  - Error handling

### 2. Hooks
- **useCurrencyConversion**: 
  - Currency conversion utilities
  - Price formatting
  - Price range calculation
  - Real-time conversion

### 3. Components
- **CurrencySelector**: Dropdown untuk pilih mata uang
- **PriceDisplay**: Component untuk display harga dengan konversi
- **ExchangeRateInfo**: Info kurs terbaru

### 4. Integration
- **ProductCard**: Support multi-currency dengan price range
- **ProductListPage**: Currency loading states dan error handling
- **Header**: Currency selector di top contact bar

## Currency Support
- **IDR** (Indonesian Rupiah) - Base currency
- **USD** (US Dollar) - Reference currency
- **EUR** (Euro)
- **MYR** (Malaysian Ringgit)
- **SGD** (Singapore Dollar)
- **HKD** (Hong Kong Dollar)
- **AED** (UAE Dirham)

## Features
- ✅ Real-time currency conversion
- ✅ Cached exchange rates (3x daily update)
- ✅ Price range support untuk products dengan variants
- ✅ Responsive currency selector
- ✅ Error handling dan fallback
- ✅ Loading states
- ✅ Price formatting dengan symbol dan decimal places

## Usage

### Backend
```bash
# Setup currency system
cd be
npm run db:seed:currencies
npm run dev
```

### Frontend
```typescript
// Use currency conversion hook
const { formatPrice, convertPrice, currentCurrency } = useCurrencyConversion();

// Format price
const formattedPrice = formatPrice(100000, 'IDR'); // Rp 100.000

// Convert price
const convertedPrice = convertPrice(100000, 'IDR', 'USD'); // $6.02
```

## API Response Format
```json
{
  "success": true,
  "data": {
    "base": "USD",
    "timestamp": "2024-01-15T10:30:00Z",
    "rates": {
      "IDR": { "rate": 16604.6, "last_updated": "2024-01-15T10:30:00Z" },
      "EUR": { "rate": 0.860704, "last_updated": "2024-01-15T10:30:00Z" },
      "MYR": { "rate": 4.225039, "last_updated": "2024-01-15T10:30:00Z" }
    }
  }
}
```

## Error Handling
- Network errors: Fallback ke default currency
- API errors: Display warning message
- Invalid rates: Skip conversion
- Cache miss: Fetch from API

## Performance
- Kurs di-cache di database (3x daily update)
- Frontend cache 5 menit
- Upsert operations untuk efficiency
- Lazy loading untuk exchange rates

## Security
- Admin-only manual update endpoint
- Rate limiting untuk API calls
- Input validation untuk currency codes
- SQL injection protection dengan Prisma

## Monitoring
- Logging untuk semua operations
- Error tracking
- Rate freshness monitoring
- Performance metrics

## Future Enhancements
- [ ] Historical rate tracking
- [ ] Multiple API sources
- [ ] Rate alerts
- [ ] Bulk conversion API
- [ ] Currency trends
- [ ] Admin dashboard untuk rate management
