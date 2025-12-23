/**
 * Cleanup Script: Remove Duplicate Images from Cloudinary
 * 
 * This script:
 * 1. Lists all images in Cloudinary folders
 * 2. Identifies duplicates (same image, different public_id)
 * 3. Checks which images are actually used in the database
 * 4. Removes unused duplicates
 * 
 * Usage:
 *   node cleanupCloudinaryDuplicates.js
 */

import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { isCloudinaryUrl, extractPublicIdFromUrl } from './cloudinaryService.js';

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

// Product Schema
const productSchema = new mongoose.Schema({
  name: String,
  gallery: [{
    url: String,
    data: String,
    mimeType: String,
    isMain: Boolean,
    order: Number
  }]
}, { collection: 'products' });

// Slideshow Schema
const slideshowSchema = new mongoose.Schema({
  slideshow: [{
    image: String,
    redirectUrl: String,
    order: Number
  }]
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
const Slideshow = mongoose.model('Slideshow', slideshowSchema);

/**
 * Get all Cloudinary images in a folder
 */
async function getAllCloudinaryImages(folder = 'looklyn') {
  try {
    const allImages = [];
    let nextCursor = null;
    
    do {
      const result = await cloudinary.search
        .expression(`folder:${folder}/*`)
        .max_results(500)
        .next_cursor(nextCursor)
        .execute();
      
      allImages.push(...result.resources);
      nextCursor = result.next_cursor;
    } while (nextCursor);
    
    return allImages;
  } catch (error) {
    console.error('Error fetching Cloudinary images:', error);
    throw error;
  }
}

/**
 * Get all Cloudinary URLs used in the database
 */
async function getUsedCloudinaryUrls() {
  const usedUrls = new Set();
  const usedPublicIds = new Set();
  
  // Get all products
  const products = await Product.find({}).lean();
  for (const product of products) {
    if (product.gallery && Array.isArray(product.gallery)) {
      for (const img of product.gallery) {
        if (img.url && isCloudinaryUrl(img.url)) {
          usedUrls.add(img.url);
          const publicId = extractPublicIdFromUrl(img.url);
          if (publicId) {
            usedPublicIds.add(publicId);
          }
        }
      }
    }
  }
  
  // Get slideshow images
  const slideshow = await Slideshow.findOne().lean();
  if (slideshow && slideshow.slideshow && Array.isArray(slideshow.slideshow)) {
    for (const slide of slideshow.slideshow) {
      if (slide.image && isCloudinaryUrl(slide.image)) {
        usedUrls.add(slide.image);
        const publicId = extractPublicIdFromUrl(slide.image);
        if (publicId) {
          usedPublicIds.add(publicId);
        }
      }
    }
  }
  
  return { usedUrls, usedPublicIds };
}

/**
 * Extract product ID and image index from public_id
 * Pattern: product_{productId}_{imageIndex}_{timestamp}
 * Returns: { productId, imageIndex, type: 'product' } or null
 */
function parsePublicId(publicId) {
  if (!publicId) return null;
  
  // Product images: product_{productId}_{imageIndex}_{timestamp}
  const productMatch = publicId.match(/^product_([a-f0-9]+)_(\d+)_(\d+)$/);
  if (productMatch) {
    return {
      type: 'product',
      productId: productMatch[1],
      imageIndex: productMatch[2],
      timestamp: productMatch[3],
      key: `product_${productMatch[1]}_${productMatch[2]}` // Key without timestamp
    };
  }
  
  // Slideshow images: slideshow_{timestamp}_{index}
  const slideshowMatch = publicId.match(/^slideshow_(\d+)_(\d+)$/);
  if (slideshowMatch) {
    return {
      type: 'slideshow',
      timestamp: slideshowMatch[1],
      index: slideshowMatch[2],
      key: `slideshow_${slideshowMatch[2]}` // Key without timestamp
    };
  }
  
  return null;
}

/**
 * Group images by their public_id pattern (same product/image, different timestamp)
 * Images with same productId + imageIndex but different timestamp are duplicates
 */
function groupDuplicatesByPublicId(images) {
  const groups = new Map();
  
  for (const img of images) {
    const parsed = parsePublicId(img.public_id);
    
    if (parsed) {
      // Use the key (without timestamp) to group duplicates
      const key = parsed.key;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push({ ...img, parsed });
    } else {
      // For images that don't match our pattern, try asset_id or dimensions
      const fallbackKey = img.asset_id || `${img.width}x${img.height}_${img.format}_${img.bytes}`;
      if (!groups.has(fallbackKey)) {
        groups.set(fallbackKey, []);
      }
      groups.get(fallbackKey).push({ ...img, parsed: null });
    }
  }
  
  // Return only groups with more than one image (duplicates)
  const duplicates = new Map();
  for (const [key, group] of groups.entries()) {
    if (group.length > 1) {
      // Use the key as identifier
      duplicates.set(key, group);
    }
  }
  
  return duplicates;
}

/**
 * Delete image from Cloudinary
 */
async function deleteCloudinaryImage(publicId) {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok' || result.result === 'not found';
  } catch (error) {
    console.error(`Error deleting ${publicId}:`, error.message);
    return false;
  }
}

async function cleanupDuplicates() {
  try {
    console.log('🧹 Starting Cloudinary duplicate cleanup...\n');

    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required');
    }

    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary environment variables are required');
    }
    console.log('✅ Cloudinary configuration found\n');

    // Get all images from Cloudinary
    console.log('📥 Fetching all images from Cloudinary...');
    const allImages = await getAllCloudinaryImages('looklyn');
    console.log(`✅ Found ${allImages.length} total images in Cloudinary\n`);

    // Get used images from database
    console.log('🔍 Checking which images are used in database...');
    const { usedUrls, usedPublicIds } = await getUsedCloudinaryUrls();
    console.log(`✅ Found ${usedPublicIds.size} unique images used in database\n`);

    // Group duplicates by public_id pattern (same product/image, different timestamp)
    console.log('🔎 Identifying duplicates by public_id pattern...');
    console.log('   Looking for: product_{productId}_{imageIndex}_{timestamp}');
    console.log('   And: slideshow_{timestamp}_{index}\n');
    const duplicateGroups = groupDuplicatesByPublicId(allImages);
    console.log(`⚠️  Found ${duplicateGroups.size} sets of duplicate images\n`);
    
    // Calculate total duplicate images
    let totalDuplicateImages = 0;
    for (const group of duplicateGroups.values()) {
      totalDuplicateImages += group.length - 1; // -1 because we keep one
    }
    console.log(`📊 Total duplicate images to remove: ${totalDuplicateImages}\n`);

    let deletedCount = 0;
    let keptCount = 0;
    let errorCount = 0;

    // Process each duplicate group
    for (const [key, group] of duplicateGroups.entries()) {
      // Find which ones are used
      const usedInGroup = group.filter(img => usedPublicIds.has(img.public_id));
      const unusedInGroup = group.filter(img => !usedPublicIds.has(img.public_id));
      
      // Sort by timestamp (keep the newest one - most recent upload)
      group.sort((a, b) => {
        if (a.parsed && b.parsed && a.parsed.timestamp && b.parsed.timestamp) {
          return parseInt(b.parsed.timestamp) - parseInt(a.parsed.timestamp); // Newest first
        }
        // Fallback to creation date
        const aTime = new Date(a.created_at).getTime();
        const bTime = new Date(b.created_at).getTime();
        return bTime - aTime; // Newest first
      });
      
      const firstImg = group[0];
      const parsed = firstImg.parsed;
      
      if (usedInGroup.length > 0) {
        // Keep the newest used one, delete others
        const toKeep = usedInGroup[0];
        const toDelete = [...usedInGroup.slice(1), ...unusedInGroup];
        
        console.log(`\n📸 Duplicate group: ${key}`);
        if (parsed) {
          if (parsed.type === 'product') {
            console.log(`   Product ID: ${parsed.productId}, Image Index: ${parsed.imageIndex}`);
          } else if (parsed.type === 'slideshow') {
            console.log(`   Slideshow Index: ${parsed.index}`);
          }
        }
        console.log(`   Total duplicates: ${group.length} images`);
        console.log(`   Dimensions: ${firstImg.width}x${firstImg.height}, Format: ${firstImg.format}, Size: ${Math.round(firstImg.bytes / 1024)}KB`);
        console.log(`   ✅ Keeping: ${toKeep.public_id} (used in database, newest)`);
        
        for (const img of toDelete) {
          const isUsed = usedInGroup.includes(img);
          console.log(`   🗑️  Deleting: ${img.public_id} (${isUsed ? 'duplicate used' : 'unused'})`);
          const deleted = await deleteCloudinaryImage(img.public_id);
          if (deleted) {
            deletedCount++;
          } else {
            errorCount++;
          }
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        keptCount++;
      } else {
        // None are used, keep the newest one, delete others
        const toKeep = group[0];
        const toDelete = group.slice(1);
        
        console.log(`\n📸 Duplicate group: ${key}`);
        if (parsed) {
          if (parsed.type === 'product') {
            console.log(`   Product ID: ${parsed.productId}, Image Index: ${parsed.imageIndex}`);
          } else if (parsed.type === 'slideshow') {
            console.log(`   Slideshow Index: ${parsed.index}`);
          }
        }
        console.log(`   Total duplicates: ${group.length} images (all unused)`);
        console.log(`   Dimensions: ${firstImg.width}x${firstImg.height}, Format: ${firstImg.format}, Size: ${Math.round(firstImg.bytes / 1024)}KB`);
        console.log(`   ✅ Keeping: ${toKeep.public_id} (newest)`);
        
        for (const img of toDelete) {
          console.log(`   🗑️  Deleting: ${img.public_id} (unused duplicate)`);
          const deleted = await deleteCloudinaryImage(img.public_id);
          if (deleted) {
            deletedCount++;
          } else {
            errorCount++;
          }
          await new Promise(resolve => setTimeout(resolve, 200));
        }
        keptCount++;
      }
    }

    // Also check for completely unused images (not duplicates, but not in database)
    console.log('\n🔍 Checking for completely unused images...');
    const allPublicIds = new Set(allImages.map(img => img.public_id));
    const unusedImages = allImages.filter(img => !usedPublicIds.has(img.public_id));
    const unusedNonDuplicates = unusedImages.filter(img => {
      // Check if this is part of a duplicate group
      for (const [url, group] of duplicateGroups.entries()) {
        if (group.some(g => g.public_id === img.public_id)) {
          return false; // Already handled in duplicate cleanup
        }
      }
      return true;
    });

    if (unusedNonDuplicates.length > 0) {
      console.log(`⚠️  Found ${unusedNonDuplicates.length} completely unused images (not in database)`);
      console.log('   These are likely orphaned images. Do you want to delete them?');
      console.log('   (Skipping for safety - you can manually review and delete if needed)');
      console.log('   To delete unused images, modify this script or use Cloudinary dashboard\n');
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 CLEANUP SUMMARY');
    console.log('='.repeat(60));
    console.log(`📸 Total images in Cloudinary: ${allImages.length}`);
    console.log(`✅ Images used in database: ${usedPublicIds.size}`);
    console.log(`🔄 Duplicate groups found: ${duplicateGroups.size}`);
    if (duplicateGroups.size > 0) {
      let totalDupes = 0;
      for (const group of duplicateGroups.values()) {
        totalDupes += group.length - 1;
      }
      console.log(`📊 Total duplicate images: ${totalDupes}`);
    }
    console.log(`🗑️  Duplicate images deleted: ${deletedCount}`);
    console.log(`✅ Unique images kept: ${keptCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    if (unusedNonDuplicates.length > 0) {
      console.log(`⚠️  Unused non-duplicate images: ${unusedNonDuplicates.length} (not deleted)`);
      console.log(`   💡 Tip: These might be old images. Review in Cloudinary dashboard.`);
    }
    console.log('='.repeat(60));

    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('\n✅ Cleanup completed!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Cleanup failed:', error);
    console.error('Error details:', error.message);
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      // Ignore disconnect errors
    }
    process.exit(1);
  }
}

// Run cleanup
cleanupDuplicates();

