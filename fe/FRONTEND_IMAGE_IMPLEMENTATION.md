# 📸 Frontend Image Implementation

## ✅ Yang Sudah Diimplementasikan

### 1. **Image Utils** (`src/utils/image.ts`)

```typescript
// Get image URL dari filename
getImageUrl(filename) // Generic
getCategoryImageUrl(filename) // Untuk category
getProductImageUrl(filename) // Untuk product
getVariantImageUrl(variantImage, productImages) // Untuk variant dengan fallback

// Generate filename untuk upload
generateImageFilename(originalName, prefix)
```

### 2. **Updated Types**

#### Category Types (`features/categories/types/index.ts`)
```typescript
interface CreateCategoryRequest {
  name: string;
  description?: string;
  image?: string; // ✅ Image filename
}

interface CategoryResponse {
  data: {
    id: string;
    name: string;
    image?: string | null; // ✅ Image filename
    ...
  }
}
```

#### Product Types (`features/products/types/index.ts`)
```typescript
interface ProductImage {
  id: string;
  image_name: string; // ✅ Changed from image_url
  is_primary: boolean;
}

interface ProductVariant {
  id: string;
  sku: string;
  variant_name: string;
  price: string;
  stock: number;
  image?: string | null; // ✅ NEW: variant-specific image
  display_image?: string; // ✅ Computed from backend
  has_own_image?: boolean; // ✅ Computed from backend
  variant_options?: VariantOption[];
}

interface Product {
  id: string;
  name: string;
  price: string | null; // ✅ Null if has variants
  stock: number | null; // ✅ Null if has variants
  product_images: ProductImage[];
  product_variants: ProductVariant[];
  hasVariants?: boolean; // ✅ Computed from backend
  price_range?: { min, max, display }; // ✅ Computed from backend
  total_stock?: number; // ✅ Computed from backend
}
```

### 3. **CategoryForm dengan Image Upload**

Features:
- ✅ Image preview
- ✅ Upload validation (type, size)
- ✅ Remove image button
- ✅ Edit mode shows existing image
- ✅ Auto upload on submit

## 📋 Next Steps: Update Product Components

### 1. Product Form Components

Lokasi files yang perlu diupdate:
- `features/admin/products/pages/CreateProductPage.tsx`
- `features/admin/products/pages/EditProductPage.tsx`
- `features/admin/products/components/*`

### 2. Variant Form

Tambah upload image untuk variant:

```typescript
// CreateProductVariantRequest
{
  sku: string;
  variant_name: string;
  price: number;
  stock: number;
  image?: string; // ✅ Optional variant image
}
```

**Logic:**
- Varian warna → Upload image per varian
- Varian ukuran → Tidak perlu image (pakai product images)

### 3. Display Components

Update komponen yang menampilkan product/category:

```typescript
// Category Card
<Avatar
  src={getCategoryImageUrl(category.image)}
  alt={category.name}
/>

// Product Card
<img 
  src={getProductImageUrl(product.product_images[0]?.image_name)}
  alt={product.name}
/>

// Variant Selector
{product.product_variants.map(variant => (
  <img 
    src={getVariantImageUrl(variant.image, product.product_images)}
    alt={variant.variant_name}
  />
))}
```

## 🎨 Example Usage

### Category with Image
```typescript
// Create category
const createCategory = async () => {
  // 1. Upload image
  const uploadResult = await uploadService.uploadFile(imageFile);
  
  // 2. Create category with image filename
  await categoryApi.createCategory({
    name: "Boneka Rajutan",
    description: "Boneka rajutan handmade",
    image: uploadResult.filename // "category-123456.jpg"
  });
};

// Display category
<Avatar
  src={getCategoryImageUrl(category.image)}
  alt={category.name}
  sx={{ width: 100, height: 100 }}
/>
```

### Product with Variants

```typescript
// Product tanpa variant
{
  id: "1",
  name: "Tas Rajut Polos",
  price: "150000",
  stock: 10,
  hasVariants: false,
  product_images: [
    { id: "1", image_name: "product-1.jpg", is_primary: true },
    { id: "2", image_name: "product-2.jpg", is_primary: false }
  ]
}

// Product dengan variant (warna + ukuran)
{
  id: "2",
  name: "Tas Rajut Warna-Warni",
  price: null, // Tidak ada single price
  stock: null, // Tidak ada single stock
  hasVariants: true,
  price_range: { min: 150000, max: 200000, display: "Rp 150.000 - Rp 200.000" },
  total_stock: 50,
  product_images: [
    { id: "1", image_name: "product-default.jpg", is_primary: true }
  ],
  product_variants: [
    {
      id: "v1",
      variant_name: "Merah - S",
      price: "150000",
      stock: 10,
      image: "variant-red.jpg", // ✅ Punya image sendiri (warna merah)
      display_image: "variant-red.jpg",
      has_own_image: true
    },
    {
      id: "v2",
      variant_name: "Merah - M",
      price: "160000",
      stock: 15,
      image: null, // ❌ Tidak punya image sendiri (ukuran beda)
      display_image: "variant-red.jpg", // ✅ Fallback ke variant warna yang sama
      has_own_image: false
    },
    {
      id: "v3",
      variant_name: "Biru - S",
      price: "150000",
      stock: 12,
      image: "variant-blue.jpg", // ✅ Punya image sendiri (warna biru)
      display_image: "variant-blue.jpg",
      has_own_image: true
    },
    {
      id: "v4",
      variant_name: "Biru - M",
      price: "160000",
      stock: 13,
      image: null, // ❌ Tidak punya image sendiri
      display_image: "variant-blue.jpg", // ✅ Fallback ke variant warna yang sama
      has_own_image: false
    }
  ]
}
```

## 🎯 Recommendation: Variant Image Strategy

### Option 1: Upload Per Warna (Recommended)
```
1. Admin create product dengan general images
2. Admin create variant: "Merah - S" dengan upload image merah
3. Admin create variant: "Merah - M" TANPA upload image
4. Admin create variant: "Biru - S" dengan upload image biru
5. Admin create variant: "Biru - M" TANPA upload image

Result:
- Variant "Merah-*" pakai image merah
- Variant "Biru-*" pakai image biru
```

### Option 2: Smart Grouping
Frontend bisa group variants by first option (warna) dan auto-assign image:
```typescript
// Group variants by color
const variantsByColor = groupBy(variants, v => v.variant_options.find(o => o.option_name === 'warna')?.option_value);

// Display one image per color group
```

## Environment Variables

Add to `.env`:
```env
VITE_IMAGE_BASE_URL=http://localhost:3000/uploads
```

Production:
```env
VITE_IMAGE_BASE_URL=https://cdn.hexacrochet.com
```

