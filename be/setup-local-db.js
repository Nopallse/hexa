const { Client } = require('pg');
const { execSync } = require('child_process');
require('dotenv').config();

async function setupLocalDatabase() {
  console.log('🚀 Setting up local PostgreSQL database...\n');

  // Database connection string
  const connectionString = process.env.POSTGRES_PASSWORD 
    ? `postgresql://postgres:${process.env.POSTGRES_PASSWORD}@localhost:5432/postgres`
    : 'postgresql://postgres@localhost:5432/postgres';

  const client = new Client({
    connectionString: connectionString
  });

  try {
    // Connect to PostgreSQL
    console.log('📡 Connecting to PostgreSQL...');
    await client.connect();
    console.log('✅ Connected to PostgreSQL\n');

    // Check if database exists
    console.log('🔍 Checking if database "hexa" exists...');
    const dbCheckResult = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = 'hexa'"
    );

    if (dbCheckResult.rows.length === 0) {
      // Create database
      console.log('📝 Creating database "hexa"...');
      await client.query('CREATE DATABASE hexa');
      console.log('✅ Database "hexa" created successfully\n');
    } else {
      console.log('✅ Database "hexa" already exists\n');
    }

    // Close connection to default database
    await client.end();

    // Update environment variables for the new database
    console.log('🔧 Setting up environment variables...');
    const envContent = `# PostgreSQL Local Configuration
DATABASE_URL="postgresql://postgres:Oppoa92020@localhost:5432/hexa"

# Direct connection to the database. Used for migrations
DIRECT_URL="postgresql://postgres:Oppoa92020@localhost:5432/hexa"

# JWT Configuration
JWT_SECRET="hkoAwsO8uWuxBpmDMWGJRWDczdkywF6/0TtT/GQlJSCRrdRNFcf/HR1zzSmHgemCVV6HrWDW9wn0guesjR7YQA=="

PAYPAL_CLIENT_ID="AYKAvNoH0v3AJtyJ8UDHfNjb2Kh7vdwyNyAi59oFcVce8TNZFrz6stA4kklmkfAlur7RdJxhmpDA6yFM"
PAYPAL_CLIENT_SECRET="EEFIKYaSv83gcLckquqfpkMjJduGDfd2PWVTuUmeKZ_DyzzHmBfEzQbvUvI8RPDJ4ukxS1tGIVsK45m1"
PAYPAL_WEBHOOK_ID="4HV264793U495940C"

# ExchangeRate.host API Key (for currency service)
EXCHANGERATE_API_KEY="0fcc123ea0c0c1f4d5b8cbd612f8dd4b"
# Server Configuration
PORT=3000
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN="http://localhost:5173"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100`;

    const fs = require('fs');
    fs.writeFileSync('.env', envContent);
    console.log('✅ Environment file (.env) created\n');

    // Generate Prisma client
    console.log('🔧 Generating Prisma client...');
    execSync('npx prisma generate', { stdio: 'inherit' });
    console.log('✅ Prisma client generated\n');

    // Run database migrations
    console.log('📊 Running database migrations...');
    execSync('npx prisma db push', { stdio: 'inherit' });
    console.log('✅ Database migrations completed\n');

    // Seed database (optional)
    console.log('🌱 Seeding database...');
    try {
      execSync('node prisma/seed.js', { stdio: 'inherit' });
      console.log('✅ Database seeded successfully\n');
    } catch (error) {
      console.log('⚠️  Seeding failed or not available, continuing...\n');
    }

    console.log('🎉 Local PostgreSQL database setup completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Start the server: npm run dev');
    console.log('2. Check health: http://localhost:3000/health');
    console.log('3. View API docs: http://localhost:3000/api-docs');
    console.log('\n🔗 Database connection: postgresql://postgres:@localhost:5432/hexa');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure PostgreSQL is running on your system:');
      console.log('   - Start PostgreSQL service');
      console.log('   - Verify connection with: psql -h localhost -U postgres');
    }
    
    process.exit(1);
  }
}

// Run setup
setupLocalDatabase();
