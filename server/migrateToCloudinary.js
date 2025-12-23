/**
 * Migration Script: Upload Base64 Images to Cloudinary
 * 
 * This script migrates existing base64 images stored in MongoDB to Cloudinary.
 * It will:
 * 1. Find all products with base64 images
 * 2. Upload each image to Cloudinary
 * 3. Replace base64 data with Cloudinary URLs
 * 4. Keep base64 as fallback during migration (optional)
 * 
 * Usage:
 *   node migrateToCloudinary.js
 * 
 * Environment Variables Required:
 *   - MONGODB_URI
 *   - CLOUDINARY_CLOUD_NAME
 *   - CLOUDINARY_API_KEY
 *   - CLOUDINARY_API_SECRET
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadBase64Image, uploadLocalFile, isCloudinaryUrl, isLocalFilePath } from './cloudinaryService.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// Product Schema (simplified for migration)
const productSchema = new mongoose.Schema({
  name: String,
  gallery: [{
    url: String,
    data: String, // Base64 image data
    mimeType: String,
    isMain: Boolean,
    order: Number
  }]
}, { collection: 'products' });

const Product = mongoose.model('Product', productSchema);

async function migrateToCloudinary() {
  try {
    console.log('🚀 Starting Cloudinary migration...\n');

    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required');
    }

    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Check Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary environment variables are required. Please check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET');
    }
    console.log('✅ Cloudinary configuration found\n');

    // Find all products - use aggregation to avoid loading huge base64 strings
    console.log('🔍 Fetching products from database...');
    console.log('   (This may take a moment if you have many products with large images)...');
    
    // First count products
    const productCount = await Product.countDocuments({});
    console.log(`📦 Found ${productCount} products to process\n`);
    
    if (productCount === 0) {
      console.log('⚠️  No products found in database.');
      await mongoose.disconnect();
      process.exit(0);
    }
    
    // Process products one at a time using cursor to avoid loading all large base64 at once
    console.log('📊 Processing products one at a time to avoid memory issues...\n');
    
    // First, count products that need migration (quick check without loading data)
    const needsMigrationCount = await Product.countDocuments({
      $or: [
        { 'gallery.data': { $exists: true, $ne: '', $ne: null } },
        { 'gallery.url': { $regex: '^/uploads/', $options: 'i' } }
      ]
    });
    
    console.log(`📤 Products that need migration: ${needsMigrationCount}`);
    console.log(`⏭️  Products to skip: ${productCount - needsMigrationCount}\n`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    let processedCount = 0;
    const startTime = Date.now();

    // Process products one at a time using cursor
    const cursor = Product.find({}).cursor();
    
    for await (const product of cursor) {
      processedCount++;
      const progress = `[${processedCount}/${productCount}]`;
      console.log(`\n${progress} Processing: ${product.name || product._id}`);

      if (!product.gallery || product.gallery.length === 0) {
        console.log('  ⏭️  No images to migrate');
        skippedCount++;
        continue;
      }

      let hasBase64Images = false;
      let hasLocalFiles = false;
      let hasCloudinaryImages = false;

      // Check if product has base64 images, local files, or already has Cloudinary URLs
      for (const img of product.gallery) {
        // Check for base64 data
        if (img.data && img.data.length > 0) {
          hasBase64Images = true;
        }
        if (img.url && isLocalFilePath(img.url)) {
          hasLocalFiles = true;
        }
        if (img.url && isCloudinaryUrl(img.url)) {
          hasCloudinaryImages = true;
        }
      }

      if (!hasBase64Images && !hasLocalFiles) {
        if (hasCloudinaryImages) {
          console.log('  ✅ Already using Cloudinary');
        } else {
          console.log('  ⏭️  No images to migrate');
        }
        skippedCount++;
        continue;
      }

      // Migrate images
      const updatedGallery = [];
      let imageUploaded = false;

      for (let j = 0; j < product.gallery.length; j++) {
        const img = product.gallery[j];

        // If already a Cloudinary URL, keep it
        if (img.url && isCloudinaryUrl(img.url)) {
          console.log(`  ✅ Image ${j + 1}: Already on Cloudinary`);
          updatedGallery.push({
            url: img.url,
            isMain: img.isMain || false,
            order: img.order || j
          });
          continue;
        }

        // If has base64 data, upload to Cloudinary
        if (img.data && img.data.length > 0) {
          try {
            const base64SizeKB = Math.round(img.data.length / 1024);
            console.log(`  📤 Uploading image ${j + 1} to Cloudinary (${base64SizeKB}KB)...`);
            const uploadStart = Date.now();
            
            const result = await uploadBase64Image(
              img.data,
              img.mimeType || 'image/jpeg',
              'looklyn/products',
              `product_${product._id}_${j}_${Date.now()}`
            );

            const uploadTime = ((Date.now() - uploadStart) / 1000).toFixed(1);
            updatedGallery.push({
              url: result.secure_url,
              isMain: img.isMain || (j === 0),
              order: img.order || j
            });

            console.log(`  ✅ Image ${j + 1}: Uploaded in ${uploadTime}s → ${result.secure_url.substring(0, 50)}...`);
            imageUploaded = true;

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (error) {
            console.error(`  ❌ Error uploading image ${j + 1}:`, error.message);
            console.error(`     Full error:`, error);
            // Keep the base64 as fallback
            updatedGallery.push({
              url: img.url || '',
              data: img.data,
              mimeType: img.mimeType || 'image/jpeg',
              isMain: img.isMain || false,
              order: img.order || j
            });
            errorCount++;
          }
        } 
        // If has local file path, upload to Cloudinary
        else if (img.url && isLocalFilePath(img.url)) {
          try {
            console.log(`  📤 Uploading local file ${j + 1} to Cloudinary: ${img.url}...`);
            const uploadStart = Date.now();
            
            const result = await uploadLocalFile(
              img.url,
              'looklyn/products',
              `product_${product._id}_${j}_${Date.now()}`
            );

            const uploadTime = ((Date.now() - uploadStart) / 1000).toFixed(1);
            updatedGallery.push({
              url: result.secure_url,
              isMain: img.isMain || (j === 0),
              order: img.order || j
            });

            console.log(`  ✅ Image ${j + 1}: Uploaded in ${uploadTime}s → ${result.secure_url.substring(0, 50)}...`);
            imageUploaded = true;

            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (error) {
            console.error(`  ❌ Error uploading local file ${j + 1}:`, error.message);
            console.error(`     Full error:`, error);
            // Keep the local path as fallback
            updatedGallery.push({
              url: img.url,
              isMain: img.isMain || false,
              order: img.order || j
            });
            errorCount++;
          }
        } 
        // Keep existing Cloudinary URL or other URLs
        else if (img.url) {
          updatedGallery.push({
            url: img.url,
            isMain: img.isMain || false,
            order: img.order || j
          });
        }
      }

      // Update product in database if images were uploaded
      if (imageUploaded) {
        try {
          await Product.findByIdAndUpdate(product._id, {
            $set: { gallery: updatedGallery }
          });
          console.log(`  ✅ Product updated in database`);
          migratedCount++;
        } catch (error) {
          console.error(`  ❌ Error updating product:`, error.message);
          errorCount++;
        }
      }
    }

    // Summary
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully migrated: ${migratedCount} products`);
    console.log(`⏭️  Skipped: ${skippedCount} products`);
    console.log(`❌ Errors: ${errorCount} products`);
    console.log(`📦 Total processed: ${processedCount} products`);
    console.log(`⏱️  Total time: ${totalTime} seconds`);
    console.log('='.repeat(60));

    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('\n✅ Migration completed!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    console.error('Stack trace:', error.stack);
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error('Error disconnecting from MongoDB:', disconnectError);
    }
    process.exit(1);
  }
}

// Run migration
migrateToCloudinary();

