const { PrismaClient } = require('@prisma/client');

async function checkExchangeRates() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 Checking Exchange Rates in Database...\n');
    
    // Get all exchange rates
    const rates = await prisma.exchangeRate.findMany({
      orderBy: { to_currency: 'asc' }
    });
    
    console.log(`📊 Found ${rates.length} exchange rates:\n`);
    
    rates.forEach(rate => {
      console.log(`${rate.from_currency} → ${rate.to_currency}:`);
      console.log(`  Rate: ${rate.rate}`);
      console.log(`  Source: ${rate.source}`);
      console.log(`  Last Updated: ${rate.last_updated}`);
      console.log(`  Created: ${rate.created_at}`);
      console.log(`  Updated: ${rate.updated_at}`);
      console.log('---');
    });
    
    // Check if rates are from seeder or API
    const seederRates = rates.filter(rate => rate.source === 'seeder');
    const apiRates = rates.filter(rate => rate.source === 'exchangerate.host');
    
    console.log(`\n📈 Summary:`);
    console.log(`  Seeder rates: ${seederRates.length}`);
    console.log(`  API rates: ${apiRates.length}`);
    
    if (apiRates.length > 0) {
      console.log(`\n✅ API rates found! Latest update: ${apiRates[0].last_updated}`);
    } else {
      console.log(`\n⚠️ No API rates found, only seeder data`);
    }
    
  } catch (error) {
    console.error('❌ Error checking exchange rates:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkExchangeRates();
