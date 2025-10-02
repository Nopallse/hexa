# 📸 Panduan Penyimpanan Gambar

## Overview
Sistem menyimpan **nama file saja** di database, bukan full URL. Full URL akan di-construct di frontend berdasarkan base URL.

## Database Schema

### Category
```prisma
model Category {
  id          String    @id @default(uuid())
  name        String
  description String?
  image       String?   // Nama file: "category-12345.jpg"
  deleted_at  DateTime?
  created_at  DateTime  @default(now())
}
```

### ProductImage
```prisma
model ProductImage {
  id         String   @id @default(uuid())
  product_id String
  image_name String   // Nama file: "product-67890.jpg"
  is_primary Boolean  @default(false)
  created_at DateTime @default(now())
}
```

## API Endpoints

### Category

#### Create Category
```http
POST /api/categories
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Rajutan Tangan",
  "description": "Produk rajutan handmade",
  "image": "category-unique-id.jpg"
}
```

#### Update Category
```http
PUT /api/categories/:id
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "name": "Updated Name",
  "image": "new-category-image.jpg"  // Atau null untuk hapus
}
```

### Product Image

#### Create Product Image
```http
POST /api/products/:product_id/images
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "image_name": "product-unique-id.jpg",
  "is_primary": true
}
```

#### Update Product Image
```http
PUT /api/products/images/:image_id
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "image_name": "updated-product-image.jpg",
  "is_primary": false
}
```

## Upload Flow

### 1. Upload File (Frontend)
```javascript
// Upload file ke server/cloud storage
const formData = new FormData();
formData.append('file', file);

const response = await axios.post('/api/upload', formData);
// Response: { filename: "category-123456789.jpg" }
```

### 2. Save to Database
```javascript
// Simpan hanya filename ke database
await axios.post('/api/categories', {
  name: "Category Name",
  image: response.filename  // Hanya nama file
});
```

### 3. Display Image (Frontend)
```javascript
// Construct full URL di frontend
const imageUrl = `${process.env.VITE_IMAGE_BASE_URL}/${category.image}`;

// Contoh: https://cdn.example.com/images/category-123456789.jpg
```

## Keuntungan Approach Ini

### ✅ **Flexibility**
- Mudah ganti CDN atau storage location tanpa ubah database
- Bisa pakai multiple base URLs (thumbnail, original, etc)

### ✅ **Storage Efficiency**
- Database lebih kecil (hanya filename)
- Tidak perlu update ribuan rows jika ganti domain

### ✅ **Migration Friendly**
- Pindah storage location hanya perlu update environment variable
- Tidak perlu migration data

### ✅ **Multi-Environment**
```javascript
// Development
const BASE_URL = "https://hexacrochet.my.id/uploads";

// Staging
const BASE_URL = "https://staging-cdn.example.com";

// Production
const BASE_URL = "https://cdn.example.com";
```

## Environment Variables

### Backend (.env)
```env
# Upload directory
UPLOAD_DIR=./uploads

# Public URL for uploaded files (optional)
PUBLIC_URL=https://hexacrochet.my.id/uploads
```

### Frontend (.env)
```env
# Base URL untuk construct image URLs
VITE_IMAGE_BASE_URL=https://hexacrochet.my.id/uploads

# Atau untuk production
# VITE_IMAGE_BASE_URL=https://cdn.hexacrochet.com
```

## File Naming Convention

### Format
```
{type}-{uuid}.{extension}
```

### Examples
```
category-550e8400-e29b-41d4-a716-446655440000.jpg
product-123e4567-e89b-12d3-a456-426614174000.png
product-987fcdeb-51a2-43f7-8abc-123456789012.webp
```

### Generate Filename
```javascript
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

function generateFilename(originalName, type = 'product') {
  const ext = path.extname(originalName);
  const uuid = uuidv4();
  return `${type}-${uuid}${ext}`;
}

// Usage
const filename = generateFilename('photo.jpg', 'category');
// Output: "category-550e8400-e29b-41d4-a716-446655440000.jpg"
```

## Helper Functions

### Frontend Image URL Helper
```typescript
// utils/image.ts
export function getImageUrl(filename: string | null | undefined): string {
  if (!filename) {
    return '/images/placeholder.png';
  }
  
  const baseUrl = import.meta.env.VITE_IMAGE_BASE_URL || '/uploads';
  return `${baseUrl}/${filename}`;
}

// Usage
<img src={getImageUrl(category.image)} alt={category.name} />
```

### Backend Upload Response
```javascript
// controllers/uploadController.js
const uploadImage = async (req, res) => {
  try {
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }
    
    // File already saved by multer with generated name
    res.json({
      success: true,
      data: {
        filename: file.filename,  // category-uuid.jpg
        size: file.size,
        mimetype: file.mimetype
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Upload failed'
    });
  }
};
```

## Migration dari URL Lama

Jika ada data lama dengan full URL:

```javascript
// Migration script
async function migrateImageUrls() {
  // Get all categories with old URL format
  const categories = await prisma.category.findMany({
    where: {
      image: {
        startsWith: 'http'
      }
    }
  });
  
  for (const category of categories) {
    // Extract filename from URL
    const url = new URL(category.image);
    const filename = path.basename(url.pathname);
    
    // Update to filename only
    await prisma.category.update({
      where: { id: category.id },
      data: { image: filename }
    });
  }
  
  console.log(`Migrated ${categories.length} categories`);
}
```

## Security Notes

1. **Validate File Types**
   ```javascript
   const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
   if (!allowedTypes.includes(file.mimetype)) {
     throw new Error('Invalid file type');
   }
   ```

2. **Limit File Size**
   ```javascript
   const maxSize = 5 * 1024 * 1024; // 5MB
   if (file.size > maxSize) {
     throw new Error('File too large');
   }
   ```

3. **Sanitize Filenames**
   - Gunakan UUID untuk menghindari path traversal
   - Jangan gunakan original filename dari user

4. **Access Control**
   - Public images: Serve dari static folder
   - Private images: Require authentication

