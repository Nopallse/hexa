const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Script Migrasi: Membuat Default Variant untuk Produk yang Belum Punya Variant
 * 
 * Script ini akan:
 * 1. Mencari semua produk yang belum punya variant
 * 2. Membuat default variant untuk setiap produk tersebut
 * 3. Menggunakan harga dan stok dari produk utama
 */

async function migrateProductsWithoutVariants() {
  try {
    console.log('🔄 Memulai migrasi produk tanpa variant...\n');

    // Cari semua produk aktif yang belum punya variant
    const productsWithoutVariants = await prisma.product.findMany({
      where: {
        deleted_at: null,
        product_variants: {
          none: {} // Produk yang tidak punya variant sama sekali
        }
      },
      select: {
        id: true,
        name: true,
        price: true,
        stock: true,
        currency_code: true
      }
    });

    if (productsWithoutVariants.length === 0) {
      console.log('✅ Semua produk sudah memiliki variant. Tidak ada yang perlu dimigrasi.\n');
      return;
    }

    console.log(`📦 Ditemukan ${productsWithoutVariants.length} produk tanpa variant:\n`);
    productsWithoutVariants.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} (ID: ${product.id})`);
    });
    console.log('');

    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Buat default variant untuk setiap produk
    for (const product of productsWithoutVariants) {
      try {
        // Generate SKU dari product name (sanitized)
        const skuBase = product.name
          .toUpperCase()
          .replace(/[^A-Z0-9]/g, '')
          .substring(0, 10) || 'PROD';
        const defaultSku = `${skuBase}-${product.id.substring(0, 8).toUpperCase()}-DEFAULT`;

        // Pastikan SKU unik
        let finalSku = defaultSku;
        let skuCounter = 1;
        while (await prisma.productVariant.findUnique({ where: { sku: finalSku } })) {
          finalSku = `${defaultSku}-${skuCounter}`;
          skuCounter++;
        }

        // Buat default variant
        const defaultVariant = await prisma.productVariant.create({
          data: {
            product_id: product.id,
            sku: finalSku,
            variant_name: 'Default',
            price: product.price,
            currency_code: product.currency_code || 'IDR',
            stock: product.stock
          }
        });

        console.log(`✅ Variant dibuat untuk "${product.name}" (SKU: ${finalSku})`);
        successCount++;
      } catch (error) {
        console.error(`❌ Error saat membuat variant untuk "${product.name}":`, error.message);
        errors.push({
          product: product.name,
          productId: product.id,
          error: error.message
        });
        errorCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Ringkasan Migrasi:');
    console.log(`✅ Berhasil: ${successCount} produk`);
    console.log(`❌ Gagal: ${errorCount} produk`);
    console.log('='.repeat(50) + '\n');

    if (errors.length > 0) {
      console.log('⚠️  Detail Error:');
      errors.forEach((err, index) => {
        console.log(`${index + 1}. ${err.product} (${err.productId}): ${err.error}`);
      });
      console.log('');
    }

    if (successCount > 0) {
      console.log('🎉 Migrasi selesai! Produk yang berhasil dimigrasi sekarang bisa ditambahkan ke keranjang.\n');
    }
  } catch (error) {
    console.error('❌ Error fatal saat migrasi:', error);
    throw error;
  }
}

// Jalankan migrasi
migrateProductsWithoutVariants()
  .then(() => {
    console.log('✅ Script migrasi selesai.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script migrasi gagal:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

