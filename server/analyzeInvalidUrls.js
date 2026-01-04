/**
 * Analyze why product URLs became invalid - check if images exist in Cloudinary
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import https from 'https';
import http from 'http';

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

const Product = mongoose.model('Product', productSchema);

/**
 * Extract public ID from Cloudinary URL
 */
function extractPublicIdFromUrl(url) {
  if (!url || typeof url !== 'string') return null;
  
  // Cloudinary URL pattern: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
  if (match) {
    return match[1];
  }
  return null;
}

/**
 * Check if image exists in Cloudinary
 */
async function checkCloudinaryImage(publicId) {
  try {
    const result = await cloudinary.api.resource(publicId);
    return { exists: true, result };
  } catch (error) {
    if (error.http_code === 404) {
      return { exists: false, error: 'Not found in Cloudinary' };
    }
    return { exists: false, error: error.message };
  }
}

/**
 * Check URL accessibility
 */
function checkUrl(url) {
  return new Promise((resolve) => {
    if (!url || typeof url !== 'string' || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      resolve({ accessible: false, error: 'Invalid URL format' });
      return;
    }

    const client = url.startsWith('https://') ? https : http;
    const timeout = 5000;

    const request = client.get(url, (response) => {
      response.destroy();
      resolve({ 
        accessible: response.statusCode >= 200 && response.statusCode < 400,
        statusCode: response.statusCode 
      });
    });

    request.on('error', (error) => {
      resolve({ accessible: false, error: error.message });
    });

    request.on('timeout', () => {
      request.destroy();
      resolve({ accessible: false, error: 'Timeout' });
    });

    request.setTimeout(timeout);
  });
}

async function analyzeInvalidUrls() {
  try {
    console.log('🔍 Analyzing invalid product URLs...\n');

    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required');
    }

    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Fetch all products
    const products = await Product.find({}, { 
      name: 1, 
      'gallery.url': 1,
      _id: 1 
    }).lean();

    console.log(`📦 Found ${products.length} products\n`);
    console.log('🔍 Checking URLs and Cloudinary status...\n');
    console.log('='.repeat(80));

    const invalidUrls = [];
    const reasons = {
      notInCloudinary: [],
      accessibleButNotInCloudinary: [],
      uploadFailed: [],
      deleted: [],
      unknown: []
    };

    for (const product of products) {
      if (!product.gallery || product.gallery.length === 0) continue;

      for (let i = 0; i < product.gallery.length; i++) {
        const img = product.gallery[i];
        if (!img.url || !img.url.includes('cloudinary.com')) continue;

        const publicId = extractPublicIdFromUrl(img.url);
        if (!publicId) continue;

        // Check URL accessibility
        const urlCheck = await checkUrl(img.url);
        
        if (!urlCheck.accessible) {
          // Check if image exists in Cloudinary
          const cloudinaryCheck = await checkCloudinaryImage(publicId);
          
          const issue = {
            productId: product._id.toString(),
            productName: product.name,
            imageIndex: i + 1,
            url: img.url,
            publicId: publicId,
            urlStatus: urlCheck.statusCode || urlCheck.error,
            cloudinaryExists: cloudinaryCheck.exists
          };

          invalidUrls.push(issue);

          // Categorize the issue
          if (!cloudinaryCheck.exists) {
            if (urlCheck.statusCode === 404) {
              reasons.deleted.push(issue);
              console.log(`❌ ${product.name} - Image ${i + 1}: Deleted from Cloudinary (404)`);
            } else {
              reasons.notInCloudinary.push(issue);
              console.log(`⚠️  ${product.name} - Image ${i + 1}: Not in Cloudinary`);
            }
          } else {
            reasons.unknown.push(issue);
            console.log(`❓ ${product.name} - Image ${i + 1}: In Cloudinary but URL not accessible`);
          }

          // Small delay
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }

    // Print summary
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 ANALYSIS SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total invalid URLs: ${invalidUrls.length}`);
    console.log(`\nCategorized by reason:`);
    console.log(`  🗑️  Deleted from Cloudinary (404): ${reasons.deleted.length}`);
    console.log(`  ⚠️  Not found in Cloudinary: ${reasons.notInCloudinary.length}`);
    console.log(`  ❓ In Cloudinary but URL not accessible: ${reasons.unknown.length}`);

    // Detailed breakdown
    if (reasons.deleted.length > 0) {
      console.log('\n\n🗑️  DELETED FROM CLOUDINARY (404):');
      console.log('='.repeat(80));
      reasons.deleted.forEach((issue, idx) => {
        console.log(`\n${idx + 1}. ${issue.productName}`);
        console.log(`   Product ID: ${issue.productId}`);
        console.log(`   Image Index: ${issue.imageIndex}`);
        console.log(`   Public ID: ${issue.publicId}`);
        console.log(`   URL: ${issue.url.substring(0, 80)}...`);
        console.log(`   Reason: Image was deleted from Cloudinary (404)`);
      });
    }

    if (reasons.notInCloudinary.length > 0) {
      console.log('\n\n⚠️  NOT FOUND IN CLOUDINARY:');
      console.log('='.repeat(80));
      reasons.notInCloudinary.forEach((issue, idx) => {
        console.log(`\n${idx + 1}. ${issue.productName}`);
        console.log(`   Product ID: ${issue.productId}`);
        console.log(`   Image Index: ${issue.imageIndex}`);
        console.log(`   Public ID: ${issue.publicId}`);
        console.log(`   URL: ${issue.url.substring(0, 80)}...`);
        console.log(`   Reason: Image never existed in Cloudinary or was permanently deleted`);
      });
    }

    // Possible causes
    console.log('\n\n💡 POSSIBLE CAUSES:');
    console.log('='.repeat(80));
    console.log('1. Images were deleted during cleanup operations');
    console.log('2. Images were manually deleted from Cloudinary dashboard');
    console.log('3. Upload failed but URL was saved to database');
    console.log('4. Images were overwritten with same public_id');
    console.log('5. Cloudinary account settings changed (storage limits, etc.)');
    console.log('6. Images were moved/renamed in Cloudinary');

    console.log('\n\n✅ Analysis complete!\n');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

analyzeInvalidUrls();

