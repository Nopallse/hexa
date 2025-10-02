# Bulk Variant Creation dengan Image Management

## Overview
Fitur ini memungkinkan pembuatan banyak varian produk sekaligus dengan intelligent image management. Hanya varian yang mempengaruhi tampilan visual (seperti warna) yang memerlukan foto berbeda.

## Database Schema

### ProductVariant Model
```prisma
model ProductVariant {
  id             String   @id @default(uuid())
  product_id     String
  sku            String   @unique
  variant_name   String
  price          Decimal  @db.Decimal(10, 2)
  currency_code  String   @default("IDR")
  stock          Int      @default(0)
  image          String?  // Variant-specific image filename
  affects_image  Boolean  @default(false) // ✨ NEW: menandai varian yang butuh foto berbeda
  created_at     DateTime @default(now())
}
```

## Backend API

### Endpoint: Bulk Create Variants
```
POST /api/products/:product_id/variants/bulk
```

#### Headers
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

#### Request Body
- **variants** (JSON string): Array of variant objects
- **image_0**, **image_1**, ... (files): Image files untuk variants yang `affects_image = true`

#### Variants Array Structure
```json
[
  {
    "sku": "PRODUCT-MERAH",
    "variant_name": "Warna: Merah",
    "price": 100000,
    "stock": 10,
    "affects_image": true,  // ✨ Butuh foto
    "attributes": {
      "Warna": "Merah"
    }
  },
  {
    "sku": "PRODUCT-BIRU",
    "variant_name": "Warna: Biru",
    "price": 100000,
    "stock": 15,
    "affects_image": true,  // ✨ Butuh foto
    "attributes": {
      "Warna": "Biru"
    }
  },
  {
    "sku": "PRODUCT-MERAH-S",
    "variant_name": "Warna: Merah, Ukuran: S",
    "price": 100000,
    "stock": 5,
    "affects_image": true,  // ✨ Warna mempengaruhi foto
    "attributes": {
      "Warna": "Merah",
      "Ukuran": "S"
    }
  },
  {
    "sku": "PRODUCT-MERAH-M",
    "variant_name": "Warna: Merah, Ukuran: M",
    "price": 120000,
    "stock": 5,
    "affects_image": false, // ❌ Ukuran tidak mempengaruhi foto (pakai foto dari Merah-S)
    "attributes": {
      "Warna": "Merah",
      "Ukuran": "M"
    }
  }
]
```

#### File Upload Mapping
- `image_0` → untuk variant di index 0 (jika `affects_image = true`)
- `image_1` → untuk variant di index 1 (jika `affects_image = true`)
- dst...

#### Response
```json
{
  "success": true,
  "message": "4 variants created successfully",
  "data": [
    {
      "id": "uuid",
      "sku": "PRODUCT-MERAH",
      "variant_name": "Warna: Merah",
      "price": "100000",
      "stock": 10,
      "affects_image": true,
      "image": "file-1234567890-abc.webp",
      "variant_options": [
        {
          "id": "uuid",
          "option_name": "Warna",
          "option_value": "Merah"
        }
      ]
    },
    // ... more variants
  ]
}
```

## Frontend Implementation

### SimpleVariantBuilder Component

#### 1. Atribut dengan Affects Image Toggle
```tsx
// Auto-detect: "Warna" atau "Color" → affects_image = true
// User bisa toggle manual dengan klik chip
<Chip
  label={attribute.affects_image ? "Mempengaruhi Foto" : "Tidak Mempengaruhi Foto"}
  onClick={() => toggleAffectsImage(index)}
/>
```

#### 2. Auto-Generate Variants
- Variants dibuat otomatis saat atribut ditambahkan
- Tidak perlu klik tombol "Generate"
- Price & stock default = 0 (user edit per variant nanti)

#### 3. Image Upload per Variant
```tsx
{variant.affects_image ? (
  <Button component="label">
    Upload
    <input type="file" onChange={handleImageUpload} />
  </Button>
) : (
  <Chip label="Tidak Perlu" />
)}
```

#### 4. Edit Dialog
- Edit harga, stok
- Upload/remove image (jika affects_image = true)
- Preview image

#### 5. Bulk Create
```typescript
await productApi.createProductVariantsBulk(productId, generatedVariants);
```

## Use Cases

### Case 1: Product dengan Warna Saja
- Atribut: **Warna** (affects_image = ✅)
- Nilai: Merah, Biru, Hijau
- **Result**: 3 varian, SEMUA butuh foto berbeda

### Case 2: Product dengan Ukuran Saja
- Atribut: **Ukuran** (affects_image = ❌)
- Nilai: S, M, L, XL
- **Result**: 4 varian, TIDAK butuh foto (pakai foto produk utama)

### Case 3: Product dengan Warna + Ukuran
- Atribut 1: **Warna** (affects_image = ✅) → Merah, Biru
- Atribut 2: **Ukuran** (affects_image = ❌) → S, M, L
- **Result**: 6 varian (2 warna × 3 ukuran)
  - Semua varian `affects_image = true` (karena ada atribut warna)
  - Upload 2 foto saja (Merah, Biru)
  - Varian Merah-S, Merah-M, Merah-L → pakai foto Merah
  - Varian Biru-S, Biru-M, Biru-L → pakai foto Biru

### Case 4: Product dengan Bahan + Ukuran
- Atribut 1: **Bahan** (affects_image = ❌) → Katun, Polyester
- Atribut 2: **Ukuran** (affects_image = ❌) → S, M, L
- **Result**: 6 varian, SEMUA `affects_image = false`
  - Tidak perlu upload foto
  - Semua pakai foto produk utama

## Benefits

✅ **Efisien**: Upload foto sekali untuk semua ukuran warna yang sama
✅ **Fleksibel**: User bisa toggle manual mana atribut yang affects image
✅ **Auto-detect**: "Warna"/"Color" otomatis detected sebagai affects_image
✅ **Bulk Operation**: Buat semua varian sekaligus (lebih cepat)
✅ **Clear UI**: Visual indicator (chip, icon) untuk status affects_image

## Example Workflow

1. **Tambah Atribut "Warna"**
   - Input: "Merah, Biru, Hijau"
   - Otomatis ter-generate 3 varian
   - Semua `affects_image = true`

2. **Upload Foto per Warna**
   - Klik "Upload" di kolom Gambar
   - Pilih foto untuk Merah, Biru, Hijau

3. **Edit Harga & Stok**
   - Klik ✏️ Edit per varian
   - Isi harga & stok

4. **Buat Semua Varian**
   - Klik "Buat Semua 3 Varian"
   - Selesai! ✅

## Migration

Untuk update database:
```bash
cd be
npx prisma db push
# atau
npx prisma migrate dev --name add_affects_image_to_product_variant
```

Restart backend server setelah migration untuk reload Prisma client.

