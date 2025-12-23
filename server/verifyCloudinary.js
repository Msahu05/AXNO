/**
 * Verification Script: Check Cloudinary Migration Status
 * 
 * This script checks:
 * 1. How many products have Cloudinary URLs
 * 2. How many products still have base64 images
 * 3. Sample product data to verify structure
 * 
 * Usage:
 *   node verifyCloudinary.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { isCloudinaryUrl } from './cloudinaryService.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

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

const Product = mongoose.model('Product', productSchema);

async function verifyCloudinary() {
  try {
    console.log('🔍 Verifying Cloudinary Migration Status...\n');
    
    // Set timeout to prevent hanging
    const timeout = setTimeout(() => {
      console.error('❌ Script is taking too long. There might be an issue.');
      console.error('   Try checking your MongoDB connection or product count.');
      process.exit(1);
    }, 60000); // 60 second timeout

    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required');
    }

    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all products with progress - use projection to avoid loading large base64 data
    console.log('🔍 Fetching products from database...');
    console.log('   (This may take a moment if you have many products with large images)...');
    
    // First, just count products
    const productCount = await Product.countDocuments({});
    console.log(`📦 Total products in database: ${productCount}\n`);
    
    if (productCount === 0) {
      console.log('⚠️  No products found in database.');
      clearTimeout(timeout);
      await mongoose.disconnect();
      process.exit(0);
    }
    
    // Use aggregation to check for data without loading full base64 strings
    // This is much faster for large images
    console.log('📊 Analyzing products (this may take a moment)...\n');
    
    const products = await Product.aggregate([
      {
        $project: {
          name: 1,
          gallery: {
            $map: {
              input: '$gallery',
              as: 'img',
              in: {
                url: '$$img.url',
                hasData: { $cond: [{ $gt: [{ $strLenCP: { $ifNull: ['$$img.data', ''] } }, 0] }, true, false] },
                dataLength: { $strLenCP: { $ifNull: ['$$img.data', ''] } },
                mimeType: '$$img.mimeType',
                isMain: '$$img.isMain',
                order: '$$img.order'
              }
            }
          }
        }
      }
    ]);
    
    console.log(`✅ Analyzed ${products.length} products\n`);

    let productsWithCloudinary = 0;
    let productsWithBase64 = 0;
    let productsWithLocalFiles = 0;
    let productsWithNoImages = 0;
    let totalCloudinaryImages = 0;
    let totalBase64Images = 0;
    let totalLocalFiles = 0;

    const sampleProducts = [];

    // Analyze each product
    console.log('📊 Analyzing products...');
    let processed = 0;
    for (const product of products) {
      processed++;
      if (processed % 10 === 0) {
        process.stdout.write(`\r   Processed ${processed}/${products.length} products...`);
      }
      if (!product.gallery || product.gallery.length === 0) {
        productsWithNoImages++;
        continue;
      }

      let hasCloudinary = false;
      let hasBase64 = false;
      let hasLocalFiles = false;
      let cloudinaryCount = 0;
      let base64Count = 0;
      let localFileCount = 0;

      for (const img of product.gallery) {
        if (img.url && isCloudinaryUrl(img.url)) {
          hasCloudinary = true;
          cloudinaryCount++;
          totalCloudinaryImages++;
        }
        // Check if has data using the hasData flag from aggregation
        if (img.hasData || (img.dataLength && img.dataLength > 0)) {
          hasBase64 = true;
          base64Count++;
          totalBase64Images++;
        }
        if (img.url && (img.url.startsWith('/uploads/') || (!img.url.startsWith('http://') && !img.url.startsWith('https://') && !img.url.startsWith('data:')))) {
          hasLocalFiles = true;
          localFileCount++;
        }
      }

      if (hasCloudinary) {
        productsWithCloudinary++;
      }
      if (hasBase64) {
        productsWithBase64++;
      }
      if (hasLocalFiles) {
        productsWithLocalFiles++;
      }

      // Collect sample products for display
      if (sampleProducts.length < 3) {
        if (hasCloudinary || hasBase64) {
          sampleProducts.push({
            name: product.name,
            id: product._id.toString(),
            gallery: product.gallery.map(img => ({
              hasUrl: !!img.url,
              isCloudinary: img.url ? isCloudinaryUrl(img.url) : false,
              isLocalFile: img.url ? (img.url.startsWith('/uploads/') || (!img.url.startsWith('http://') && !img.url.startsWith('https://') && !img.url.startsWith('data:'))) : false,
              hasBase64: !!(img.hasData || (img.dataLength && img.dataLength > 0)),
              urlPreview: img.url ? (img.url.substring(0, 60) + '...') : 'No URL',
              base64Size: img.dataLength ? `${Math.round(img.dataLength / 1024)}KB` : 'N/A'
            }))
          });
        }
      }
    }

    // Print summary
    console.log('='.repeat(60));
    console.log('📊 MIGRATION STATUS SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Products with Cloudinary URLs: ${productsWithCloudinary}`);
    console.log(`⚠️  Products with base64 images: ${productsWithBase64}`);
    console.log(`📁 Products with local file paths: ${productsWithLocalFiles}`);
    console.log(`📭 Products with no images: ${productsWithNoImages}`);
    console.log(`\n📸 Total Cloudinary images: ${totalCloudinaryImages}`);
    console.log(`💾 Total base64 images: ${totalBase64Images}`);
    console.log(`📁 Total local file paths: ${totalLocalFiles}`);
    console.log('='.repeat(60));

    // Migration progress
    const totalProductsWithImages = products.length - productsWithNoImages;
    if (totalProductsWithImages > 0) {
      const migrationProgress = ((productsWithCloudinary / totalProductsWithImages) * 100).toFixed(1);
      console.log(`\n📈 Migration Progress: ${migrationProgress}%`);
      console.log(`   (${productsWithCloudinary} of ${totalProductsWithImages} products migrated)`);
    }

    // Show sample products
    if (sampleProducts.length > 0) {
      console.log('\n' + '='.repeat(60));
      console.log('📋 SAMPLE PRODUCT DATA');
      console.log('='.repeat(60));
      sampleProducts.forEach((product, index) => {
        console.log(`\n${index + 1}. ${product.name} (ID: ${product.id.substring(0, 8)}...)`);
        product.gallery.forEach((img, imgIndex) => {
          console.log(`   Image ${imgIndex + 1}:`);
          console.log(`      - Has URL: ${img.hasUrl ? '✅' : '❌'}`);
          console.log(`      - Is Cloudinary: ${img.isCloudinary ? '✅ YES' : '❌ NO'}`);
          console.log(`      - Is Local File: ${img.isLocalFile ? '⚠️  YES (needs migration)' : '✅ NO'}`);
          console.log(`      - Has base64: ${img.hasBase64 ? '⚠️  YES (' + img.base64Size + ')' : '✅ NO'}`);
          if (img.url) {
            console.log(`      - URL: ${img.urlPreview}`);
          }
        });
      });
    }

    // Recommendations
    console.log('\n' + '='.repeat(60));
    console.log('💡 RECOMMENDATIONS');
    console.log('='.repeat(60));
    if (productsWithBase64 > 0 || productsWithLocalFiles > 0) {
      const totalNeedsMigration = productsWithBase64 + productsWithLocalFiles;
      console.log(`⚠️  You still have ${totalNeedsMigration} products that need migration:`);
      if (productsWithBase64 > 0) {
        console.log(`   - ${productsWithBase64} products with base64 images`);
      }
      if (productsWithLocalFiles > 0) {
        console.log(`   - ${productsWithLocalFiles} products with local file paths`);
      }
      console.log('   Run the migration script to upload them to Cloudinary:');
      console.log('   → npm run migrate:cloudinary');
    } else if (productsWithCloudinary > 0) {
      console.log('✅ All products are using Cloudinary! Migration complete.');
    } else {
      console.log('ℹ️  No products with images found.');
    }

    // Clear timeout
    clearTimeout(timeout);
    
    // Close connection
    await mongoose.disconnect();
    console.log('\n✅ Verification complete!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Verification failed:', error);
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

// Run verification
verifyCloudinary();

