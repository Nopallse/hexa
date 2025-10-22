const FedExService = require('./src/services/fedexService');

async function testFedEx() {
  console.log('🧪 Testing FedEx API...');
  
  try {
    // Test 1: Get Access Token
    console.log('1. Testing access token...');
    const token = await FedExService.getAccessToken();
    console.log('✅ Access token:', token.substring(0, 20) + '...');
    
    // Test 2: Get Shipping Rates
    console.log('\n2. Testing shipping rates...');
    const rates = await FedExService.getShippingRates({
      origin_country: 'ID',
      destination_country: 'US',
      origin_postal_code: '12345',
      destination_postal_code: '10001',
      items: [{ weight: 1000, quantity: 1, price: 100000 }]
    });
    
    if (rates.success) {
      console.log('✅ Rates fetched successfully');
      console.log('   Provider:', rates.provider);
      console.log('   Number of rates:', rates.data.pricing.length);
      if (rates.data.pricing.length > 0) {
        console.log('   Sample rate:', rates.data.pricing[0]);
      }
    } else {
      console.log('❌ Rates failed:', rates.error);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testFedEx();
