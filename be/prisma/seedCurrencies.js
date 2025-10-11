const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedCurrencies() {
  try {
    console.log('🌍 Seeding currencies...');

    const currencies = [
      {
        code: 'IDR',
        name: 'Indonesian Rupiah',
        symbol: 'Rp',
        is_active: true,
        is_base: true,
        decimal_places: 0
      },
      {
        code: 'USD',
        name: 'US Dollar',
        symbol: '$',
        is_active: true,
        is_base: false,
        decimal_places: 2
      },
      {
        code: 'EUR',
        name: 'Euro',
        symbol: '€',
        is_active: true,
        is_base: false,
        decimal_places: 2
      },
      {
        code: 'MYR',
        name: 'Malaysian Ringgit',
        symbol: 'RM',
        is_active: true,
        is_base: false,
        decimal_places: 2
      },
      {
        code: 'SGD',
        name: 'Singapore Dollar',
        symbol: 'S$',
        is_active: true,
        is_base: false,
        decimal_places: 2
      },
      {
        code: 'HKD',
        name: 'Hong Kong Dollar',
        symbol: 'HK$',
        is_active: true,
        is_base: false,
        decimal_places: 2
      },
      {
        code: 'AED',
        name: 'UAE Dirham',
        symbol: 'د.إ',
        is_active: true,
        is_base: false,
        decimal_places: 2
      }
    ];

    for (const currency of currencies) {
      await prisma.currency.upsert({
        where: { code: currency.code },
        update: currency,
        create: currency
      });
      console.log(`✅ Currency ${currency.code} seeded`);
    }

    console.log('🎉 Currencies seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding currencies:', error);
    throw error;
  }
}

async function seedInitialExchangeRates() {
  try {
    console.log('💱 Seeding initial exchange rates...');

    // Sample exchange rates (these will be updated by cronjob)
    const initialRates = [
      {
        from_currency: 'USD',
        to_currency: 'IDR',
        rate: 16604.6,
        source: 'exchangerate.host',
        last_updated: new Date()
      },
      {
        from_currency: 'USD',
        to_currency: 'EUR',
        rate: 0.860704,
        source: 'exchangerate.host',
        last_updated: new Date()
      },
      {
        from_currency: 'USD',
        to_currency: 'MYR',
        rate: 4.225039,
        source: 'exchangerate.host',
        last_updated: new Date()
      },
      {
        from_currency: 'USD',
        to_currency: 'SGD',
        rate: 1.297904,
        source: 'exchangerate.host',
        last_updated: new Date()
      },
      {
        from_currency: 'USD',
        to_currency: 'HKD',
        rate: 7.784804,
        source: 'exchangerate.host',
        last_updated: new Date()
      },
      {
        from_currency: 'USD',
        to_currency: 'AED',
        rate: 3.672504,
        source: 'exchangerate.host',
        last_updated: new Date()
      }
    ];

    for (const rate of initialRates) {
      await prisma.exchangeRate.upsert({
        where: {
          from_currency_to_currency: {
            from_currency: rate.from_currency,
            to_currency: rate.to_currency
          }
        },
        update: rate,
        create: rate
      });
      console.log(`✅ Exchange rate ${rate.from_currency} -> ${rate.to_currency} seeded`);
    }

    console.log('🎉 Initial exchange rates seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding exchange rates:', error);
    throw error;
  }
}

async function main() {
  try {
    await seedCurrencies();
    await seedInitialExchangeRates();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  seedCurrencies,
  seedInitialExchangeRates
};