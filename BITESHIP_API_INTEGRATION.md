# Biteship API Integration

## Overview
Integrasi dengan [Biteship API](https://api.biteship.com) untuk fitur shipping yang lengkap, termasuk area autocomplete, tarif pengiriman, dan tracking.

## Features Implemented

### 1. **Area Autocomplete**
- Pencarian area berdasarkan input user
- Support untuk Indonesia (ID)
- Autocomplete dengan debouncing
- Format area yang user-friendly

### 2. **Shipping Rates**
- Kalkulasi tarif pengiriman real-time
- Support multiple courier (JNE, J&T, SiCepat, POS, AnterAja)
- Filter berdasarkan courier
- Informasi durasi pengiriman

### 3. **Shipment Tracking**
- Tracking status pengiriman
- Real-time updates dari Biteship

## Backend Implementation

### 1. **BiteshipService** (`be/src/services/biteshipService.js`)

```javascript
class BiteshipService {
  // Get areas for autocomplete
  async getAreas(params = {}) {
    const response = await axios.get(`${this.baseURL}/v1/maps/areas`, {
      params: {
        countries: params.countries || 'ID',
        input: params.input,
        type: params.type || 'single',
        limit: params.limit || 10
      },
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    return { success: true, data: response.data };
  }

  // Get shipping rates
  async getShippingRates(params = {}) {
    const response = await axios.post(`${this.baseURL}/v1/rates/couriers`, {
      origin_postal_code: params.origin_postal_code,
      destination_postal_code: params.destination_postal_code,
      couriers: params.couriers || 'jne,jnt,sicepat,pos,anteraja',
      items: params.items
    }, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    return { success: true, data: response.data };
  }

  // Track shipment
  async trackShipment(waybillId) {
    const response = await axios.get(`${this.baseURL}/v1/trackings/${waybillId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    return { success: true, data: response.data };
  }
}
```

### 2. **Shipping Controller** (`be/src/controllers/shippingController.js`)

#### Get Areas Endpoint
```javascript
// GET /api/shipping/areas?input=Jakarta+Selatan&countries=ID&type=single&limit=10
const getAreas = async (req, res) => {
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

  res.json({ success: true, data: result.data });
};
```

#### Get Shipping Rates Endpoint
```javascript
// POST /api/shipping/rates
const getShippingRates = async (req, res) => {
  const { 
    origin_postal_code, 
    destination_postal_code, 
    couriers = 'jne,jnt,sicepat,pos,anteraja',
    items = []
  } = req.body;

  const result = await BiteshipService.getShippingRates({
    origin_postal_code,
    destination_postal_code,
    couriers,
    items
  });

  res.json({ success: true, data: result.data });
};
```

#### Track Shipment Endpoint
```javascript
// GET /api/shipping/track/:waybillId
const trackShipment = async (req, res) => {
  const { waybillId } = req.params;
  
  const result = await BiteshipService.trackShipment(waybillId);
  
  res.json({ success: true, data: result.data });
};
```

### 3. **Routes** (`be/src/routes/shipping.js`)

```javascript
// Public endpoints (no authentication required)
router.get('/areas', shippingController.getAreas);
router.post('/rates', [
  body('origin_postal_code').isNumeric().isLength({ min: 5, max: 5 }),
  body('destination_postal_code').isNumeric().isLength({ min: 5, max: 5 }),
  body('couriers').optional().isString(),
  body('items').optional().isArray()
], shippingController.getShippingRates);
router.get('/track/:waybillId', shippingController.trackShipment);
```

## Frontend Implementation

### 1. **AreaAutocomplete Component** (`fe/src/components/common/AreaAutocomplete.tsx`)

```typescript
interface Area {
  id: string;
  name: string;
  country_name: string;
  country_code: string;
  administrative_division_level_1_name: string;
  administrative_division_level_2_name: string;
  administrative_division_level_3_name: string;
  postal_code: number;
}

export default function AreaAutocomplete({
  label = 'Pilih Area',
  placeholder = 'Ketik nama kota, kecamatan, atau kode pos...',
  value,
  onChange,
  countries = 'ID',
  type = 'single',
  limit = 10
}: AreaAutocompleteProps) {
  // Debounced search with 300ms delay
  // Auto-format area names
  // Error handling and loading states
}
```

**Features:**
- ✅ Debounced search (300ms delay)
- ✅ Auto-format area names
- ✅ Loading states
- ✅ Error handling
- ✅ Custom styling with Material-UI
- ✅ Support for single/multiple selection

### 2. **ShippingRates Component** (`fe/src/components/common/ShippingRates.tsx`)

```typescript
interface ShippingRate {
  courier_name: string;
  courier_code: string;
  courier_service_name: string;
  courier_service_code: string;
  description: string;
  service_type: string;
  shipping_type: string;
  shiping_duration_range: string;
  price: number;
}

export default function ShippingRates({
  originPostalCode,
  destinationPostalCode,
  items,
  onRateSelect,
  selectedRate,
  disabled = false
}: ShippingRatesProps) {
  // Real-time rate calculation
  // Courier filtering
  // Rate selection
}
```

**Features:**
- ✅ Real-time rate calculation
- ✅ Courier filtering (JNE, J&T, SiCepat, POS, AnterAja)
- ✅ Rate selection with visual feedback
- ✅ Price formatting (IDR)
- ✅ Duration formatting
- ✅ Loading and error states

## API Endpoints

### 1. **Get Areas**
```http
GET /api/shipping/areas?input=Jakarta+Selatan&countries=ID&type=single&limit=10
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "areas": [
      {
        "id": "IDNP6IDNC148IDND843IDZ12250",
        "name": "Pesanggrahan, Jakarta Selatan, DKI Jakarta. 12250",
        "country_name": "Indonesia",
        "country_code": "ID",
        "administrative_division_level_1_name": "DKI Jakarta",
        "administrative_division_level_2_name": "Jakarta Selatan",
        "administrative_division_level_3_name": "Pesanggrahan",
        "postal_code": 12250
      }
    ]
  }
}
```

### 2. **Get Shipping Rates**
```http
POST /api/shipping/rates
Content-Type: application/json

{
  "origin_postal_code": "12345",
  "destination_postal_code": "67890",
  "couriers": "jne,jnt,sicepat,pos,anteraja",
  "items": [
    {
      "name": "Product Name",
      "description": "Product Description",
      "value": 100000,
      "length": 10,
      "width": 10,
      "height": 10,
      "weight": 1000,
      "quantity": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "pricing": [
      {
        "courier_name": "JNE",
        "courier_code": "jne",
        "courier_service_name": "REG",
        "courier_service_code": "jne_reg",
        "description": "Layanan Reguler",
        "service_type": "standard",
        "shipping_type": "parcel",
        "shiping_duration_range": "1-2 hari",
        "price": 15000
      }
    ]
  }
}
```

### 3. **Track Shipment**
```http
GET /api/shipping/track/:waybillId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "waybill_id": "1234567890",
    "courier": "jne",
    "status": "delivered",
    "tracking": [
      {
        "status": "delivered",
        "note": "Paket telah diterima",
        "updated_at": "2024-01-01T10:00:00Z"
      }
    ]
  }
}
```

## Environment Variables

### Backend (.env)
```bash
# Biteship API Configuration
BITESHIP_API_KEY=your_biteship_api_key_here
```

### Frontend (.env)
```bash
# API Base URL
VITE_API_URL=https://your-api-domain.com
```

## Usage Examples

### 1. **Area Autocomplete in Address Form**
```typescript
import AreaAutocomplete from '@/components/common/AreaAutocomplete';

function AddressForm() {
  const [selectedArea, setSelectedArea] = useState(null);

  return (
    <AreaAutocomplete
      label="Pilih Area Pengiriman"
      placeholder="Ketik nama kota atau kecamatan..."
      value={selectedArea}
      onChange={setSelectedArea}
      required
    />
  );
}
```

### 2. **Shipping Rates in Checkout**
```typescript
import ShippingRates from '@/components/common/ShippingRates';

function CheckoutPage() {
  const [selectedRate, setSelectedRate] = useState(null);
  const items = [
    {
      name: "Product Name",
      description: "Product Description",
      value: 100000,
      length: 10,
      width: 10,
      height: 10,
      weight: 1000,
      quantity: 1
    }
  ];

  return (
    <ShippingRates
      originPostalCode="12345"
      destinationPostalCode="67890"
      items={items}
      onRateSelect={setSelectedRate}
      selectedRate={selectedRate}
    />
  );
}
```

## Error Handling

### 1. **Backend Error Handling**
```javascript
try {
  const result = await BiteshipService.getAreas(params);
  if (!result.success) {
    return res.status(400).json({
      success: false,
      error: result.error
    });
  }
  res.json({ success: true, data: result.data });
} catch (error) {
  logger.error('Get areas error:', error);
  res.status(500).json({
    success: false,
    error: 'Failed to fetch areas'
  });
}
```

### 2. **Frontend Error Handling**
```typescript
try {
  const response = await axiosInstance.get('/shipping/areas', { params });
  if (response.data.success) {
    setOptions(response.data.data.areas || []);
  } else {
    setErrorMessage(response.data.error || 'Gagal memuat data area');
  }
} catch (error) {
  setErrorMessage('Terjadi kesalahan saat mencari area');
}
```

## Performance Optimizations

### 1. **Debounced Search**
- 300ms delay untuk menghindari terlalu banyak API calls
- Cancel previous requests saat user masih mengetik

### 2. **Caching**
- Cache area results untuk input yang sama
- Cache shipping rates untuk route yang sama

### 3. **Loading States**
- Loading indicators untuk better UX
- Skeleton loading untuk large lists

## Testing

### 1. **Backend Testing**
```javascript
// Test area search
describe('BiteshipService', () => {
  it('should get areas for valid input', async () => {
    const result = await BiteshipService.getAreas({
      input: 'Jakarta',
      countries: 'ID'
    });
    expect(result.success).toBe(true);
    expect(result.data.areas).toBeDefined();
  });
});
```

### 2. **Frontend Testing**
```typescript
// Test component rendering
describe('AreaAutocomplete', () => {
  it('should render with correct props', () => {
    render(<AreaAutocomplete label="Test Label" />);
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
  });
});
```

## Security Considerations

### 1. **API Key Protection**
- Store API key in environment variables
- Never expose API key in frontend code
- Use backend proxy for all Biteship API calls

### 2. **Input Validation**
- Validate postal codes (5 digits)
- Sanitize user input
- Rate limiting untuk prevent abuse

### 3. **Error Information**
- Don't expose internal errors to users
- Log errors for debugging
- Return user-friendly error messages

## Future Enhancements

### 1. **Additional Features**
- Waybill creation
- Shipment scheduling
- Bulk shipping rates
- International shipping

### 2. **UI Improvements**
- Map integration
- Real-time tracking
- Shipping history
- Favorite couriers

### 3. **Performance**
- Redis caching
- CDN for static assets
- API response compression
- Database optimization

## Troubleshooting

### 1. **Common Issues**

#### API Key Invalid
```bash
Error: Invalid API key
Solution: Check BITESHIP_API_KEY in .env file
```

#### Rate Limit Exceeded
```bash
Error: Rate limit exceeded
Solution: Implement request throttling
```

#### Network Timeout
```bash
Error: Network timeout
Solution: Increase timeout value or retry logic
```

### 2. **Debug Tips**
- Check browser network tab for API calls
- Verify API key in backend logs
- Test with simple requests first
- Check Biteship API documentation

Sekarang sistem shipping sudah terintegrasi dengan Biteship API! 🚚📦
