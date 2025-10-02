const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const currencies = [
  {
    code: 'IDR',
    name: 'Indonesian Rupiah',
    symbol: 'Rp',
    is_base: true,
    is_active: true,
    decimal_places: 0
  },
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    is_base: false,
    is_active: true,
    decimal_places: 2
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    is_base: false,
    is_active: true,
    decimal_places: 2
  },
  {
    code: 'SGD',
    name: 'Singapore Dollar',
    symbol: 'S$',
    is_base: false,
    is_active: true,
    decimal_places: 2
  },
  {
    code: 'MYR',
    name: 'Malaysian Ringgit',
    symbol: 'RM',
    is_base: false,
    is_active: true,
    decimal_places: 2
  },
  {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    is_base: false,
    is_active: true,
    decimal_places: 0
  }
];

// Initial exchange rates (example rates, should be updated regularly)
const initialRates = {
  'USD': 15800, // 1 USD = 15,800 IDR
  'EUR': 17200, // 1 EUR = 17,200 IDR
  'SGD': 11700, // 1 SGD = 11,700 IDR
  'MYR': 3500,  // 1 MYR = 3,500 IDR
  'JPY': 106    // 1 JPY = 106 IDR
};

async function seedCurrencies() {
  console.log('🌍 Seeding currencies...');

  try {
    // Create currencies
    const createdCurrencies = {};
    
    for (const currency of currencies) {
      const existing = await prisma.currency.findUnique({
        where: { code: currency.code }
      });

      if (existing) {
        console.log(`✓ Currency ${currency.code} already exists`);
        createdCurrencies[currency.code] = existing;
      } else {
        const created = await prisma.currency.create({
          data: currency
        });
        console.log(`✓ Created currency: ${currency.code} - ${currency.name}`);
        createdCurrencies[currency.code] = created;
      }
    }

    // Create exchange rates (from IDR to other currencies)
    console.log('\n💱 Seeding exchange rates...');
    
    const idrCurrency = createdCurrencies['IDR'];
    
    for (const [code, rateToIDR] of Object.entries(initialRates)) {
      const toCurrency = createdCurrencies[code];
      
      if (!toCurrency) continue;

      // Check if rate already exists
      const existingRate = await prisma.exchangeRate.findUnique({
        where: {
          from_currency_id_to_currency_id: {
            from_currency_id: idrCurrency.id,
            to_currency_id: toCurrency.id
          }
        }
      });

      if (existingRate) {
        console.log(`✓ Exchange rate IDR -> ${code} already exists`);
        continue;
      }

      // Rate from IDR to target currency (e.g., IDR to USD)
      const rateFromIDR = 1 / rateToIDR;
      
      await prisma.exchangeRate.create({
        data: {
          from_currency_id: idrCurrency.id,
          to_currency_id: toCurrency.id,
          rate: rateFromIDR,
          source: 'seed'
        }
      });
      
      // Reverse rate (e.g., USD to IDR)
      await prisma.exchangeRate.create({
        data: {
          from_currency_id: toCurrency.id,
          to_currency_id: idrCurrency.id,
          rate: rateToIDR,
          source: 'seed'
        }
      });

      console.log(`✓ Created exchange rates: IDR <-> ${code} (1 ${code} = ${rateToIDR} IDR)`);
    }

    console.log('\n✅ Currency seeding completed!');
    
    // Display summary
    const totalCurrencies = await prisma.currency.count();
    const totalRates = await prisma.exchangeRate.count();
    
    console.log(`\n📊 Summary:`);
    console.log(`   - Currencies: ${totalCurrencies}`);
    console.log(`   - Exchange Rates: ${totalRates}`);

  } catch (error) {
    console.error('❌ Error seeding currencies:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  seedCurrencies()
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { seedCurrencies };

