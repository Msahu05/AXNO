import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload base64 image to Cloudinary
 * @param {string} base64Data - Base64 image data (with or without data URI prefix)
 * @param {string} mimeType - MIME type (e.g., 'image/jpeg', 'image/png')
 * @param {string} folder - Cloudinary folder path (optional)
 * @param {string} publicId - Public ID for the image (optional, auto-generated if not provided)
 * @returns {Promise<{url: string, public_id: string, secure_url: string}>}
 */
export async function uploadBase64Image(base64Data, mimeType = 'image/jpeg', folder = 'looklyn/products', publicId = null) {
  try {
    // Remove data URI prefix if present
    let cleanBase64 = base64Data;
    if (base64Data.includes(',')) {
      cleanBase64 = base64Data.split(',')[1];
    }

    // Determine file format from MIME type
    const format = mimeType.split('/')[1] || 'jpg';
    
    // Upload options
    const uploadOptions = {
      folder: folder,
      resource_type: 'image',
      format: format,
      transformation: [
        { quality: 'auto', fetch_format: 'auto' }, // Auto optimize
        { width: 1200, height: 1200, crop: 'limit' } // Limit max size
      ]
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(
      `data:${mimeType};base64,${cleanBase64}`,
      uploadOptions
    );

    return {
      url: result.secure_url,
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format
    };
  } catch (error) {
    console.error('Error uploading image to Cloudinary:', error);
    throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
  }
}

/**
 * Upload multiple base64 images to Cloudinary
 * @param {Array<{data: string, mimeType: string}>} images - Array of image objects
 * @param {string} folder - Cloudinary folder path (optional)
 * @returns {Promise<Array<{url: string, public_id: string, secure_url: string}>>}
 */
export async function uploadMultipleBase64Images(images, folder = 'looklyn/products') {
  try {
    const uploadPromises = images.map((image, index) => {
      const publicId = `product_${Date.now()}_${index}`;
      return uploadBase64Image(image.data, image.mimeType || 'image/jpeg', folder, publicId);
    });

    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Error uploading multiple images to Cloudinary:', error);
    throw error;
  }
}

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @returns {Promise<void>}
 */
export async function deleteCloudinaryImage(publicId) {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    // Don't throw - deletion failures shouldn't break the flow
  }
}

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} - Public ID or null if not a Cloudinary URL
 */
export function extractPublicIdFromUrl(url) {
  if (!url || typeof url !== 'string') return null;
  
  // Cloudinary URL pattern: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
  if (match) {
    return match[1];
  }
  return null;
}

/**
 * Upload local file to Cloudinary (supports images, PDFs, and other files)
 * @param {string} filePath - Local file path (relative to server root or absolute)
 * @param {string} folder - Cloudinary folder path (optional)
 * @param {string} publicId - Public ID for the file (optional)
 * @returns {Promise<{url: string, public_id: string, secure_url: string}>}
 */
export async function uploadLocalFile(filePath, folder = 'looklyn/products', publicId = null) {
  try {
    // Resolve file path
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    // Handle both relative and absolute paths
    let fullPath;
    if (filePath.startsWith('/uploads/')) {
      // Relative to server directory
      fullPath = path.join(__dirname, filePath);
    } else if (path.isAbsolute(filePath)) {
      fullPath = filePath;
    } else {
      // Assume relative to server directory
      fullPath = path.join(__dirname, filePath);
    }

    // Check if file exists
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${fullPath}`);
    }

    // Determine file type from extension
    const ext = path.extname(fullPath).toLowerCase();
    const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    const isPdf = ext === '.pdf';
    
    // Upload options
    const uploadOptions = {
      folder: folder,
      resource_type: isPdf ? 'raw' : (isImage ? 'image' : 'auto'),
    };

    // Add image transformations only for images
    if (isImage) {
      uploadOptions.transformation = [
        { quality: 'auto', fetch_format: 'auto' },
        { width: 1200, height: 1200, crop: 'limit' }
      ];
    }

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(fullPath, uploadOptions);

    return {
      url: result.secure_url,
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width || null,
      height: result.height || null,
      format: result.format,
      resource_type: result.resource_type
    };
  } catch (error) {
    console.error('Error uploading local file to Cloudinary:', error);
    throw new Error(`Failed to upload local file to Cloudinary: ${error.message}`);
  }
}

/**
 * Upload file buffer directly to Cloudinary (for multer files)
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} originalName - Original filename
 * @param {string} mimeType - MIME type
 * @param {string} folder - Cloudinary folder path (optional)
 * @param {string} publicId - Public ID for the file (optional)
 * @returns {Promise<{url: string, public_id: string, secure_url: string}>}
 */
export async function uploadFileBuffer(fileBuffer, originalName, mimeType, folder = 'looklyn/uploads', publicId = null) {
  try {
    // Determine file type
    const isImage = mimeType.startsWith('image/');
    const isPdf = mimeType === 'application/pdf';
    
    // Upload options
    const uploadOptions = {
      folder: folder,
      resource_type: isPdf ? 'raw' : (isImage ? 'image' : 'auto'),
    };

    // Add image transformations only for images
    if (isImage) {
      uploadOptions.transformation = [
        { quality: 'auto', fetch_format: 'auto' },
        { width: 1200, height: 1200, crop: 'limit' }
      ];
    }

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    // Convert buffer to data URI for upload
    const dataUri = `data:${mimeType};base64,${fileBuffer.toString('base64')}`;
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataUri, uploadOptions);

    return {
      url: result.secure_url,
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width || null,
      height: result.height || null,
      format: result.format,
      resource_type: result.resource_type
    };
  } catch (error) {
    console.error('Error uploading file buffer to Cloudinary:', error);
    throw new Error(`Failed to upload file to Cloudinary: ${error.message}`);
  }
}

/**
 * Check if URL is a local file path
 * @param {string} url - URL to check
 * @returns {boolean}
 */
export function isLocalFilePath(url) {
  if (!url || typeof url !== 'string') return false;
  return url.startsWith('/uploads/') || (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:'));
}

/**
 * Check if URL is a Cloudinary URL
 * @param {string} url - URL to check
 * @returns {boolean}
 */
export function isCloudinaryUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return url.includes('cloudinary.com') || url.includes('res.cloudinary.com');
}

/**
 * Verify if a Cloudinary URL is valid and accessible
 * @param {string} url - Cloudinary URL to verify
 * @returns {Promise<{valid: boolean, error?: string}>}
 */
export async function verifyCloudinaryUrl(url) {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: 'Invalid URL format' };
  }

  if (!isCloudinaryUrl(url)) {
    return { valid: false, error: 'Not a Cloudinary URL' };
  }

  try {
    // Extract public ID and check if image exists
    const publicId = extractPublicIdFromUrl(url);
    if (!publicId) {
      return { valid: false, error: 'Could not extract public ID from URL' };
    }

    // Check if image exists in Cloudinary
    const resource = await cloudinary.api.resource(publicId);
    if (resource) {
      return { valid: true };
    }
    return { valid: false, error: 'Image not found in Cloudinary' };
  } catch (error) {
    if (error.http_code === 404) {
      return { valid: false, error: 'Image not found in Cloudinary (404)' };
    }
    return { valid: false, error: error.message || 'Failed to verify URL' };
  }
}

