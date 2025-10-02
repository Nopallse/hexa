const { PrismaClient } = require('@prisma/client');
const logger = require('../src/utils/logger');

const prisma = new PrismaClient();

async function main() {
  try {
    logger.info('🌱 Starting database seeding...');

    // Create categories
    const categories = await Promise.all([
      prisma.category.create({
        data: {
          name: 'Boneka Rajutan',
          description: 'Berbagai macam boneka rajutan lucu dan menggemaskan'
        }
      }),
      prisma.category.create({
        data: {
          name: 'Tas Rajutan',
          description: 'Tas-tas cantik hasil rajutan tangan'
        }
      }),
      prisma.category.create({
        data: {
          name: 'Aksesoris Rajutan',
          description: 'Aksesoris seperti topi, syal, dan lainnya'
        }
      }),
      prisma.category.create({
        data: {
          name: 'Dekorasi Rumah',
          description: 'Produk dekorasi rumah dari rajutan'
        }
      })
    ]);

    logger.info(`✅ Created ${categories.length} categories`);

    // Create sample products
    const products = await Promise.all([
      // Boneka Rajutan
      prisma.product.create({
        data: {
          category_id: categories[0].id,
          name: 'Boneka Beruang Rajutan',
          description: 'Boneka beruang lucu dengan ukuran 25cm, cocok untuk hadiah atau koleksi',
          price: 75000,
          stock: 10,
          is_active: true
        }
      }),
      prisma.product.create({
        data: {
          category_id: categories[0].id,
          name: 'Boneka Kelinci Rajutan',
          description: 'Boneka kelinci imut dengan telinga panjang, ukuran 20cm',
          price: 65000,
          stock: 8,
          is_active: true
        }
      }),
      // Tas Rajutan
      prisma.product.create({
        data: {
          category_id: categories[1].id,
          name: 'Tas Rajutan Tote Bag',
          description: 'Tas tote bag cantik dengan motif bunga, cocok untuk sehari-hari',
          price: 85000,
          stock: 15,
          is_active: true
        }
      }),
      prisma.product.create({
        data: {
          category_id: categories[1].id,
          name: 'Tas Rajutan Crossbody',
          description: 'Tas crossbody elegan dengan tali panjang, ukuran sedang',
          price: 95000,
          stock: 12,
          is_active: true
        }
      }),
      // Aksesoris
      prisma.product.create({
        data: {
          category_id: categories[2].id,
          name: 'Topi Rajutan Winter',
          description: 'Topi hangat untuk musim dingin dengan motif ribbed',
          price: 45000,
          stock: 20,
          is_active: true
        }
      }),
      prisma.product.create({
        data: {
          category_id: categories[2].id,
          name: 'Syal Rajutan Panjang',
          description: 'Syal panjang dengan motif zigzag, sangat hangat dan nyaman',
          price: 120000,
          stock: 18,
          is_active: true
        }
      })
    ]);

    logger.info(`✅ Created ${products.length} products`);

    // Create product variants
    const variants = await Promise.all([
      // Boneka Beruang - Warna
      prisma.productVariant.create({
        data: {
          product_id: products[0].id,
          sku: 'BEAR-BROWN-001',
          variant_name: 'Beruang Coklat',
          price: 75000,
          stock: 5
        }
      }),
      prisma.productVariant.create({
        data: {
          product_id: products[0].id,
          sku: 'BEAR-PINK-001',
          variant_name: 'Beruang Pink',
          price: 75000,
          stock: 5
        }
      }),
      // Boneka Kelinci - Warna
      prisma.productVariant.create({
        data: {
          product_id: products[1].id,
          sku: 'RABBIT-WHITE-001',
          variant_name: 'Kelinci Putih',
          price: 65000,
          stock: 4
        }
      }),
      prisma.productVariant.create({
        data: {
          product_id: products[1].id,
          sku: 'RABBIT-GRAY-001',
          variant_name: 'Kelinci Abu-abu',
          price: 65000,
          stock: 4
        }
      }),
      // Tas Tote Bag - Warna
      prisma.productVariant.create({
        data: {
          product_id: products[2].id,
          sku: 'TOTE-BEIGE-001',
          variant_name: 'Tote Bag Beige',
          price: 85000,
          stock: 8
        }
      }),
      prisma.productVariant.create({
        data: {
          product_id: products[2].id,
          sku: 'TOTE-NAVY-001',
          variant_name: 'Tote Bag Navy',
          price: 85000,
          stock: 7
        }
      })
    ]);

    logger.info(`✅ Created ${variants.length} product variants`);

    // Create variant options
    await Promise.all([
      // Beruang Coklat
      prisma.variantOption.create({
        data: {
          variant_id: variants[0].id,
          option_name: 'warna',
          option_value: 'Coklat'
        }
      }),
      // Beruang Pink
      prisma.variantOption.create({
        data: {
          variant_id: variants[1].id,
          option_name: 'warna',
          option_value: 'Pink'
        }
      }),
      // Kelinci Putih
      prisma.variantOption.create({
        data: {
          variant_id: variants[2].id,
          option_name: 'warna',
          option_value: 'Putih'
        }
      }),
      // Kelinci Abu-abu
      prisma.variantOption.create({
        data: {
          variant_id: variants[3].id,
          option_name: 'warna',
          option_value: 'Abu-abu'
        }
      }),
      // Tote Bag Beige
      prisma.variantOption.create({
        data: {
          variant_id: variants[4].id,
          option_name: 'warna',
          option_value: 'Beige'
        }
      }),
      // Tote Bag Navy
      prisma.variantOption.create({
        data: {
          variant_id: variants[5].id,
          option_name: 'warna',
          option_value: 'Navy'
        }
      })
    ]);

    logger.info(`✅ Created variant options`);

    // Create sample product images (placeholder URLs)
    await Promise.all([
      prisma.productImage.create({
        data: {
          product_id: products[0].id,
          image_url: 'https://example.com/bear-brown-1.jpg',
          is_primary: true
        }
      }),
      prisma.productImage.create({
        data: {
          product_id: products[0].id,
          image_url: 'https://example.com/bear-brown-2.jpg',
          is_primary: false
        }
      }),
      prisma.productImage.create({
        data: {
          product_id: products[1].id,
          image_url: 'https://example.com/rabbit-white-1.jpg',
          is_primary: true
        }
      }),
      prisma.productImage.create({
        data: {
          product_id: products[2].id,
          image_url: 'https://example.com/tote-beige-1.jpg',
          is_primary: true
        }
      })
    ]);

    logger.info(`✅ Created product images`);

    logger.info('🎉 Database seeding completed successfully!');
  } catch (error) {
    logger.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
