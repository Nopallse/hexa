# Multi-Currency System Documentation

## Overview
Sistem multi-currency yang efisien untuk aplikasi Hexa Crochet yang memungkinkan user mengganti mata uang tanpa membebani API eksternal dengan request berlebihan.

## Features
- ✅ Support 7 mata uang: IDR, USD, EUR, MYR, SGD, HKD, AED
- ✅ Auto-update kurs 3x sehari (00:00, 08:00, 16:00 UTC)
- ✅ Cached exchange rates di database
- ✅ Frontend conversion tanpa API calls
- ✅ Graceful error handling
- ✅ Admin manual update endpoint

## Architecture

### Database Schema
```sql
-- Currencies table
CREATE TABLE currencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(3) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_base BOOLEAN DEFAULT false,
  decimal_places INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Exchange rates table
CREATE TABLE exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_currency VARCHAR(3) NOT NULL,
  to_currency VARCHAR(3) NOT NULL,
  rate DECIMAL(18,6) NOT NULL,
  source VARCHAR(50) DEFAULT 'exchangerate.host',
  last_updated TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(from_currency, to_currency)
);
```

### API Endpoints

#### Public Endpoints
- `GET /api/rates` - Get all exchange rates
- `GET /api/rates/fresh` - Check if rates are fresh
- `POST /api/rates/convert` - Convert currency amount

#### Admin Endpoints
- `POST /api/rates/update` - Manual update exchange rates

### Supported Currencies
| Code | Name | Symbol | Decimal Places |
|------|------|--------|----------------|
| IDR  | Indonesian Rupiah | Rp | 0 |
| USD  | US Dollar | $ | 2 |
| EUR  | Euro | € | 2 |
| MYR  | Malaysian Ringgit | RM | 2 |
| SGD  | Singapore Dollar | S$ | 2 |
| HKD  | Hong Kong Dollar | HK$ | 2 |
| AED  | UAE Dirham | د.إ | 2 |

## Implementation Details

### 1. Exchange Rate Service (`exchangeRateService.js`)
```javascript
// Fetch rates from API
const apiData = await exchangeRateService.fetchExchangeRates();

// Process and store rates
const storedRates = await exchangeRateService.processAndStoreRates(apiData);

// Get rates for frontend
const frontendRates = await exchangeRateService.getRatesForFrontend();
```

### 2. Cron Job Service (`exchangeRateCronJob.js`)
```javascript
// Start cron jobs
exchangeRateCronJob.start();

// Stop cron jobs
exchangeRateCronJob.stop();

// Manual update
await exchangeRateCronJob.runExchangeRateUpdate();
```

### 3. Currency Utils (`currencyUtils.js`)
```javascript
// Format currency
const formatted = currencyUtils.formatCurrency(100000, 'IDR'); // "Rp 100,000"

// Convert amount
const converted = currencyUtils.convertAmount(100, 'USD', 'IDR', exchangeRates);

// Calculate price range
const priceRange = currencyUtils.calculatePriceRange(variants, 'USD', exchangeRates);
```

## API Response Examples

### GET /api/rates
```json
{
  "success": true,
  "data": {
    "base": "USD",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "rates": {
      "IDR": {
        "rate": 16604.6,
        "last_updated": "2024-01-15T08:00:00.000Z"
      },
      "EUR": {
        "rate": 0.860704,
        "last_updated": "2024-01-15T08:00:00.000Z"
      }
    }
  }
}
```

### POST /api/rates/convert
```json
{
  "success": true,
  "data": {
    "original_amount": 100,
    "from_currency": "USD",
    "to_currency": "IDR",
    "converted_amount": 1660460,
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## Setup Instructions

### 1. Database Migration
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed currencies
npm run db:seed:currencies
```

### 2. Environment Variables
```env
# Add to .env file
EXCHANGERATE_API_KEY=your_api_key_here
```

### 3. Install Dependencies
```bash
npm install node-cron
```

### 4. Start Server
```bash
# Development
npm run dev

# Production
npm start
```

## Usage Examples

### Frontend Integration
```javascript
// Fetch exchange rates once on app load
const exchangeRates = await fetch('/api/rates').then(r => r.json());

// Convert product price
const convertedPrice = currencyUtils.convertAmount(
  product.price,
  'IDR', // from currency
  'USD', // to currency
  exchangeRates.data.rates
);

// Format for display
const formattedPrice = currencyUtils.formatCurrency(convertedPrice, 'USD');
```

### Backend Integration
```javascript
// In product controller
const exchangeRates = await exchangeRateService.getAllExchangeRates();

// Convert product prices
products.forEach(product => {
  product.price_usd = currencyUtils.convertAmount(
    product.price,
    'IDR',
    'USD',
    exchangeRates
  );
});
```

## Error Handling

### API Errors
- **Rate not found**: Returns 404 with error message
- **Invalid currency**: Returns 400 with validation error
- **API timeout**: Returns 500 with timeout error
- **Database error**: Returns 500 with database error

### Cron Job Errors
- **API failure**: Logs error, continues with existing rates
- **Database failure**: Logs error, retries on next schedule
- **Network timeout**: Logs error, uses cached rates

## Monitoring

### Logs
- Exchange rate updates
- API call failures
- Cron job status
- Conversion errors

### Health Checks
- `GET /api/rates/fresh` - Check rate freshness
- Cron job status in server logs
- Database connection status

## Performance Considerations

### Caching Strategy
- Exchange rates cached in database
- Frontend caches rates for session
- No real-time API calls during conversion

### Rate Limiting
- API calls limited to 3x per day
- Manual updates require admin authentication
- Frontend conversion has no rate limits

### Database Optimization
- Indexed on currency pairs
- Unique constraints prevent duplicates
- Efficient upsert operations

## Troubleshooting

### Common Issues

1. **Rates not updating**
   - Check cron job status in logs
   - Verify API key is valid
   - Check network connectivity

2. **Conversion errors**
   - Verify currency codes are supported
   - Check if rates exist in database
   - Validate amount is numeric

3. **Database errors**
   - Check Prisma connection
   - Verify schema is up to date
   - Check database permissions

### Debug Commands
```bash
# Check cron job status
curl http://localhost:3000/api/rates/fresh

# Manual rate update
curl -X POST http://localhost:3000/api/rates/update \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"

# Test conversion
curl -X POST http://localhost:3000/api/rates/convert \
  -H "Content-Type: application/json" \
  -d '{"amount": 100, "from_currency": "USD", "to_currency": "IDR"}'
```

## Future Enhancements

### Planned Features
- [ ] Historical rate tracking
- [ ] Rate alerts/notifications
- [ ] More currency support
- [ ] Rate comparison charts
- [ ] Mobile app integration

### Performance Improvements
- [ ] Redis caching layer
- [ ] Rate preloading
- [ ] Batch conversion API
- [ ] CDN for static rate data

## Security Considerations

### API Security
- Admin endpoints require authentication
- Rate limiting on public endpoints
- Input validation on all parameters
- SQL injection prevention via Prisma

### Data Privacy
- No user data stored in rate tables
- Anonymous conversion tracking
- GDPR compliant data handling
- Secure API key management

## Support

For issues or questions:
- Check logs in `logs/` directory
- Review API documentation
- Contact development team
- Submit GitHub issues

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Maintainer**: Hexa Crochet Development Team