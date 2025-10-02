/**
 * Image utilities
 * Handles image URL construction from filenames
 */

const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL || 'http://localhost:3000/uploads';

/**
 * Get full image URL from filename
 * @param filename - Image filename (e.g., "product-uuid.jpg")
 * @param fallback - Fallback image URL if filename is empty
 * @returns Full image URL
 */
export function getImageUrl(filename: string | null | undefined, fallback = '/images/placeholder.png'): string {
  if (!filename) {
    return fallback;
  }
  
  // If filename is already a full URL, return as is
  if (filename.startsWith('http://') || filename.startsWith('https://')) {
    return filename;
  }
  
  return `${IMAGE_BASE_URL}/${filename}`;
}

/**
 * Get category image URL
 */
export function getCategoryImageUrl(filename: string | null | undefined): string {
  return getImageUrl(filename, '/images/category-placeholder.png');
}

/**
 * Get product image URL
 */
export function getProductImageUrl(filename: string | null | undefined): string {
  return getImageUrl(filename, '/images/product-placeholder.png');
}

/**
 * Get variant image URL with fallback to product images
 */
export function getVariantImageUrl(
  variantImage: string | null | undefined,
  productImages?: Array<{ image_name: string; is_primary: boolean }>
): string {
  // Use variant image if available
  if (variantImage) {
    return getProductImageUrl(variantImage);
  }
  
  // Use product primary image
  if (productImages && productImages.length > 0) {
    const primaryImage = productImages.find(img => img.is_primary);
    if (primaryImage) {
      return getProductImageUrl(primaryImage.image_name);
    }
    
    // Use first product image
    return getProductImageUrl(productImages[0].image_name);
  }
  
  return getProductImageUrl(null);
}

/**
 * Generate unique filename for upload
 * @param originalName - Original filename
 * @param prefix - Prefix for the filename (e.g., "product", "category")
 * @returns Generated filename
 */
export function generateImageFilename(originalName: string, prefix = 'image'): string {
  const ext = originalName.split('.').pop();
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `${prefix}-${timestamp}-${random}.${ext}`;
}

