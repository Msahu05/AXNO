/**
 * Report Script: List Duplicate Images with Usage Status
 * 
 * This script shows which duplicate images are safe to delete
 * and which ones are currently used in the database.
 * 
 * Usage:
 *   node reportCloudinaryDuplicates.js
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
 * Extract product ID and image index from public_id
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
      key: `product_${productMatch[1]}_${productMatch[2]}`
    };
  }
  
  // Slideshow images: slideshow_{timestamp}_{index}
  const slideshowMatch = publicId.match(/^slideshow_(\d+)_(\d+)$/);
  if (slideshowMatch) {
    return {
      type: 'slideshow',
      timestamp: slideshowMatch[1],
      index: slideshowMatch[2],
      key: `slideshow_${slideshowMatch[2]}`
    };
  }
  
  return null;
}

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
 * Group images by their public_id pattern
 */
function groupDuplicatesByPublicId(images) {
  const groups = new Map();
  
  for (const img of images) {
    const parsed = parsePublicId(img.public_id);
    
    if (parsed) {
      const key = parsed.key;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key).push({ ...img, parsed });
    }
  }
  
  // Return only groups with more than one image (duplicates)
  const duplicates = new Map();
  for (const [key, group] of groups.entries()) {
    if (group.length > 1) {
      duplicates.set(key, group);
    }
  }
  
  return duplicates;
}

async function reportDuplicates() {
  try {
    console.log('📊 Generating Cloudinary Duplicate Report...\n');

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
    const { usedPublicIds } = await getUsedCloudinaryUrls();
    console.log(`✅ Found ${usedPublicIds.size} unique images used in database\n`);

    // Group duplicates
    console.log('🔎 Identifying duplicates...\n');
    const duplicateGroups = groupDuplicatesByPublicId(allImages);
    console.log(`⚠️  Found ${duplicateGroups.size} sets of duplicate images\n`);

    if (duplicateGroups.size === 0) {
      console.log('✅ No duplicates found! All images are unique.\n');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Analyze duplicates
    const safeToDelete = [];
    const usedDuplicates = [];
    let totalDuplicates = 0;

    console.log('='.repeat(80));
    console.log('📋 DUPLICATE REPORT');
    console.log('='.repeat(80));

    for (const [key, group] of duplicateGroups.entries()) {
      // Sort by timestamp (newest first)
      group.sort((a, b) => {
        if (a.parsed && b.parsed && a.parsed.timestamp && b.parsed.timestamp) {
          return parseInt(b.parsed.timestamp) - parseInt(a.parsed.timestamp);
        }
        return 0;
      });

      const usedInGroup = group.filter(img => usedPublicIds.has(img.public_id));
      const unusedInGroup = group.filter(img => !usedPublicIds.has(img.public_id));
      
      const firstImg = group[0];
      const parsed = firstImg.parsed;

      console.log(`\n${'─'.repeat(80)}`);
      console.log(`📸 Duplicate Group: ${key}`);
      if (parsed) {
        if (parsed.type === 'product') {
          console.log(`   Product ID: ${parsed.productId}`);
          console.log(`   Image Index: ${parsed.imageIndex}`);
        } else if (parsed.type === 'slideshow') {
          console.log(`   Slideshow Index: ${parsed.index}`);
        }
      }
      console.log(`   Total duplicates: ${group.length} images`);
      console.log(`   Used in database: ${usedInGroup.length}`);
      console.log(`   Unused: ${unusedInGroup.length}`);

      // Show all images in group
      console.log(`\n   Images in this group:`);
      for (const img of group) {
        const isUsed = usedPublicIds.has(img.public_id);
        const isNewest = img === group[0];
        const status = isUsed ? '✅ USED' : '🗑️  UNUSED';
        const keep = isNewest && (isUsed || unusedInGroup.length === group.length) ? ' (KEEP - newest)' : '';
        console.log(`      ${status} ${img.public_id}${keep}`);
      }

      // Determine what's safe to delete
      if (usedInGroup.length > 0) {
        // Some are used - keep the newest used one, others can be deleted
        const newestUsed = usedInGroup[0];
        const toDelete = group.filter(img => img !== newestUsed);
        
        console.log(`\n   💡 Recommendation:`);
        console.log(`      ✅ KEEP: ${newestUsed.public_id} (newest, used in database)`);
        console.log(`      🗑️  SAFE TO DELETE (${toDelete.length} images):`);
        for (const img of toDelete) {
          const isUsed = usedInGroup.includes(img);
          safeToDelete.push({
            publicId: img.public_id,
            reason: isUsed ? 'duplicate of used image' : 'unused',
            group: key
          });
          console.log(`         - ${img.public_id} (${isUsed ? 'duplicate used' : 'unused'})`);
        }
        usedDuplicates.push({
          group: key,
          keep: newestUsed.public_id,
          delete: toDelete.map(img => img.public_id)
        });
        totalDuplicates += toDelete.length;
      } else {
        // None are used - keep newest, delete others
        const toKeep = group[0];
        const toDelete = group.slice(1);
        
        console.log(`\n   💡 Recommendation:`);
        console.log(`      ✅ KEEP: ${toKeep.public_id} (newest, unused but keep one)`);
        console.log(`      🗑️  SAFE TO DELETE (${toDelete.length} images):`);
        for (const img of toDelete) {
          safeToDelete.push({
            publicId: img.public_id,
            reason: 'unused duplicate',
            group: key
          });
          console.log(`         - ${img.public_id} (unused duplicate)`);
        }
        totalDuplicates += toDelete.length;
      }
    }

    // Summary
    console.log(`\n${'='.repeat(80)}`);
    console.log('📊 SUMMARY');
    console.log('='.repeat(80));
    console.log(`📸 Total images in Cloudinary: ${allImages.length}`);
    console.log(`✅ Images used in database: ${usedPublicIds.size}`);
    console.log(`🔄 Duplicate groups found: ${duplicateGroups.size}`);
    console.log(`🗑️  Total duplicates safe to delete: ${totalDuplicates}`);
    console.log(`✅ Images to keep: ${allImages.length - totalDuplicates}`);

    // List all safe to delete
    console.log(`\n${'='.repeat(80)}`);
    console.log('🗑️  SAFE TO DELETE LIST');
    console.log('='.repeat(80));
    console.log(`\nTotal: ${safeToDelete.length} images\n`);
    
    if (safeToDelete.length > 0) {
      console.log('Copy these public_ids to delete manually in Cloudinary dashboard:\n');
      for (const item of safeToDelete) {
        console.log(item.publicId);
      }
      
      console.log(`\n${'─'.repeat(80)}`);
      console.log('📝 Detailed list with reasons:\n');
      for (const item of safeToDelete) {
        console.log(`${item.publicId} - ${item.reason} (group: ${item.group})`);
      }
    }

    // Close MongoDB connection
    await mongoose.disconnect();
    console.log(`\n${'='.repeat(80)}`);
    console.log('✅ Report complete!');
    console.log('💡 Use the public_ids above to manually delete duplicates in Cloudinary dashboard');
    console.log('='.repeat(80));
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Report failed:', error);
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

// Run report
reportDuplicates();

