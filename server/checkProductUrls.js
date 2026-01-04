/**
 * Check all product image URLs in database and verify if they are valid/expired
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';

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

/**
 * Check if a URL is accessible (not expired/404)
 */
function checkUrl(url) {
  return new Promise((resolve) => {
    if (!url || typeof url !== 'string') {
      resolve({ valid: false, error: 'Invalid URL' });
      return;
    }

    // Skip data URLs (base64 images)
    if (url.startsWith('data:')) {
      resolve({ valid: true, type: 'data-url' });
      return;
    }

    // Skip local paths
    if (url.startsWith('/') && !url.startsWith('http')) {
      resolve({ valid: true, type: 'local-path', note: 'Local path - cannot verify remotely' });
      return;
    }

    // Only check HTTP/HTTPS URLs
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      resolve({ valid: false, error: 'Not a valid HTTP/HTTPS URL' });
      return;
    }

    const client = url.startsWith('https://') ? https : http;
    const timeout = 10000; // 10 second timeout

    const request = client.get(url, (response) => {
      const statusCode = response.statusCode;
      
      // Clean up
      response.destroy();
      
      if (statusCode >= 200 && statusCode < 400) {
        resolve({ 
          valid: true, 
          statusCode,
          type: 'cloudinary' 
        });
      } else if (statusCode === 404) {
        resolve({ 
          valid: false, 
          error: '404 Not Found',
          statusCode 
        });
      } else {
        resolve({ 
          valid: false, 
          error: `HTTP ${statusCode}`,
          statusCode 
        });
      }
    });

    request.on('error', (error) => {
      resolve({ 
        valid: false, 
        error: error.message || 'Network error' 
      });
    });

    request.on('timeout', () => {
      request.destroy();
      resolve({ 
        valid: false, 
        error: 'Request timeout' 
      });
    });

    request.setTimeout(timeout);
  });
}

async function checkAllProductUrls() {
  try {
    console.log('🔍 Checking all product image URLs in database...\n');

    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required');
    }

    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Count products
    const productCount = await Product.countDocuments({});
    console.log(`📦 Total products in database: ${productCount}\n`);

    if (productCount === 0) {
      console.log('⚠️  No products found in database.');
      await mongoose.disconnect();
      process.exit(0);
    }

    // Fetch all products (only gallery URLs, not base64 data)
    console.log('📊 Fetching products...');
    const products = await Product.find({}, { 
      name: 1, 
      'gallery.url': 1, 
      'gallery.data': 1,
      'gallery.mimeType': 1,
      _id: 1 
    }).lean();

    console.log(`✅ Fetched ${products.length} products\n`);

    // Statistics
    let totalUrls = 0;
    let validUrls = 0;
    let invalidUrls = 0;
    let dataUrls = 0;
    let localPaths = 0;
    let productsWithIssues = [];
    let productsWithNoImages = [];

    console.log('🔍 Checking URLs (this may take a while)...\n');
    console.log('='.repeat(80));

    // Check each product
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const productId = product._id.toString();
      const productName = product.name || 'Unnamed Product';
      
      console.log(`\n[${i + 1}/${products.length}] ${productName} (ID: ${productId.substring(0, 8)}...)`);

      if (!product.gallery || product.gallery.length === 0) {
        console.log('  ⚠️  No gallery images found');
        productsWithNoImages.push({
          id: productId,
          name: productName
        });
        continue;
      }

      let productHasIssues = false;
      const imageIssues = [];

      // Check each image in gallery
      for (let j = 0; j < product.gallery.length; j++) {
        const img = product.gallery[j];
        let imageUrl = null;
        let imageType = 'unknown';

        // Determine image source
        if (img.url && img.url.trim() && !img.url.includes('data:;base64,=')) {
          imageUrl = img.url.trim();
          imageType = 'url';
        } else if (img.data && img.data.trim() && img.data !== 'data:;base64,=') {
          imageUrl = `data:${img.mimeType || 'image/jpeg'};base64,${img.data.substring(0, 50)}...`;
          imageType = 'base64';
          dataUrls++;
          console.log(`  ✅ Image ${j + 1}: Base64 data (${Math.round(img.data.length / 1024)}KB)`);
          continue; // Skip checking base64 URLs
        } else {
          imageUrl = null;
          imageType = 'empty';
        }

        if (!imageUrl) {
          console.log(`  ⚠️  Image ${j + 1}: Empty or invalid`);
          imageIssues.push({ index: j + 1, error: 'Empty or invalid URL/data' });
          productHasIssues = true;
          invalidUrls++;
          continue;
        }

        // Check if it's a local path
        if (imageUrl.startsWith('/') && !imageUrl.startsWith('http')) {
          localPaths++;
          console.log(`  📁 Image ${j + 1}: Local path - ${imageUrl}`);
          totalUrls++;
          continue;
        }

        // Check HTTP/HTTPS URLs
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
          totalUrls++;
          process.stdout.write(`  🔍 Image ${j + 1}: Checking ${imageUrl.substring(0, 60)}... `);
          
          const result = await checkUrl(imageUrl);
          
          if (result.valid) {
            validUrls++;
            console.log(`✅ Valid (${result.statusCode || 'OK'})`);
          } else {
            invalidUrls++;
            productHasIssues = true;
            console.log(`❌ Invalid: ${result.error}`);
            imageIssues.push({ 
              index: j + 1, 
              url: imageUrl, 
              error: result.error 
            });
          }

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 200));
        } else {
          console.log(`  ⚠️  Image ${j + 1}: Unknown format - ${imageUrl.substring(0, 50)}`);
          invalidUrls++;
          productHasIssues = true;
        }
      }

      if (productHasIssues) {
        productsWithIssues.push({
          id: productId,
          name: productName,
          issues: imageIssues
        });
      }
    }

    // Print summary
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Products: ${products.length}`);
    console.log(`Products with no images: ${productsWithNoImages.length}`);
    console.log(`Products with invalid URLs: ${productsWithIssues.length}`);
    console.log(`\nImage Statistics:`);
    console.log(`  Total URLs checked: ${totalUrls}`);
    console.log(`  ✅ Valid URLs: ${validUrls}`);
    console.log(`  ❌ Invalid URLs: ${invalidUrls}`);
    console.log(`  📦 Base64 images: ${dataUrls}`);
    console.log(`  📁 Local paths: ${localPaths}`);

    // List products with issues
    if (productsWithIssues.length > 0) {
      console.log('\n\n❌ PRODUCTS WITH INVALID URLS:');
      console.log('='.repeat(80));
      productsWithIssues.forEach((product, idx) => {
        console.log(`\n${idx + 1}. ${product.name} (ID: ${product.id.substring(0, 8)}...)`);
        product.issues.forEach(issue => {
          if (issue.url) {
            console.log(`   Image ${issue.index}: ${issue.url.substring(0, 70)}...`);
            console.log(`   Error: ${issue.error}`);
          } else {
            console.log(`   Image ${issue.index}: ${issue.error}`);
          }
        });
      });
    }

    // List products with no images
    if (productsWithNoImages.length > 0) {
      console.log('\n\n⚠️  PRODUCTS WITH NO IMAGES:');
      console.log('='.repeat(80));
      productsWithNoImages.forEach((product, idx) => {
        console.log(`${idx + 1}. ${product.name} (ID: ${product.id.substring(0, 8)}...)`);
      });
    }

    console.log('\n✅ Check complete!\n');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAllProductUrls();

