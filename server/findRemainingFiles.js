/**
 * Find Remaining Files Script
 * 
 * This script checks for any remaining files/images that are still stored locally
 * or as base64 instead of Cloudinary URLs.
 * 
 * Usage:
 *   node findRemainingFiles.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { isCloudinaryUrl, isLocalFilePath } from './cloudinaryService.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// Schemas
const productSchema = new mongoose.Schema({
  name: String,
  gallery: [{
    url: String,
    data: String,
    mimeType: String
  }]
}, { collection: 'products' });

const slideshowSchema = new mongoose.Schema({
  slideshow: [{
    image: String
  }]
}, { timestamps: true });

const orderSchema = new mongoose.Schema({
  orderId: String,
  items: [{
    image: String
  }],
  customDesign: {
    files: [String]
  }
}, { collection: 'orders' });

const reviewSchema = new mongoose.Schema({
  attachments: [{
    url: String
  }]
}, { collection: 'reviews' });

const Product = mongoose.model('Product', productSchema);
const Slideshow = mongoose.model('Slideshow', slideshowSchema);
const Order = mongoose.model('Order', orderSchema);
const Review = mongoose.model('Review', reviewSchema);

async function findRemainingFiles() {
  try {
    console.log('🔍 Scanning for remaining files/images...\n');

    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required');
    }

    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const issues = {
      products: { base64: [], localFiles: [] },
      slideshow: { base64: [], localFiles: [] },
      orders: { localFiles: [] },
      reviews: { localFiles: [] }
    };

    // Check Products
    console.log('📦 Checking products...');
    const products = await Product.find({}).lean();
    for (const product of products) {
      if (product.gallery && Array.isArray(product.gallery)) {
        for (const img of product.gallery) {
          if (img.data && img.data.length > 0) {
            issues.products.base64.push({
              productId: product._id,
              productName: product.name,
              imageIndex: product.gallery.indexOf(img)
            });
          }
          if (img.url && isLocalFilePath(img.url)) {
            issues.products.localFiles.push({
              productId: product._id,
              productName: product.name,
              url: img.url
            });
          }
        }
      }
    }
    console.log(`   Found ${issues.products.base64.length} base64 images`);
    console.log(`   Found ${issues.products.localFiles.length} local file paths\n`);

    // Check Slideshow
    console.log('🎠 Checking slideshow...');
    const slideshow = await Slideshow.findOne().lean();
    if (slideshow && slideshow.slideshow) {
      for (const slide of slideshow.slideshow) {
        if (slide.image) {
          if (slide.image.startsWith('data:image/') || slide.image.length > 1000) {
            issues.slideshow.base64.push({
              order: slide.order,
              image: slide.image.substring(0, 50) + '...'
            });
          }
          if (isLocalFilePath(slide.image)) {
            issues.slideshow.localFiles.push({
              order: slide.order,
              url: slide.image
            });
          }
        }
      }
    }
    console.log(`   Found ${issues.slideshow.base64.length} base64 images`);
    console.log(`   Found ${issues.slideshow.localFiles.length} local file paths\n`);

    // Check Orders
    console.log('📋 Checking orders...');
    const orders = await Order.find({}).lean();
    for (const order of orders) {
      // Check order items images
      if (order.items && Array.isArray(order.items)) {
        for (const item of order.items) {
          if (item.image && isLocalFilePath(item.image)) {
            issues.orders.localFiles.push({
              orderId: order.orderId,
              itemName: item.name,
              url: item.image
            });
          }
        }
      }
      // Check custom design files
      if (order.customDesign && order.customDesign.files && Array.isArray(order.customDesign.files)) {
        for (const fileUrl of order.customDesign.files) {
          if (isLocalFilePath(fileUrl)) {
            issues.orders.localFiles.push({
              orderId: order.orderId,
              type: 'design file',
              url: fileUrl
            });
          }
        }
      }
    }
    console.log(`   Found ${issues.orders.localFiles.length} local file paths\n`);

    // Check Reviews
    console.log('⭐ Checking reviews...');
    const reviews = await Review.find({}).lean();
    for (const review of reviews) {
      if (review.attachments && Array.isArray(review.attachments)) {
        for (const attachment of review.attachments) {
          if (attachment.url && isLocalFilePath(attachment.url)) {
            issues.reviews.localFiles.push({
              reviewId: review._id,
              productId: review.productId,
              url: attachment.url
            });
          }
        }
      }
    }
    console.log(`   Found ${issues.reviews.localFiles.length} local file paths\n`);

    // Summary
    const totalBase64 = issues.products.base64.length + issues.slideshow.base64.length;
    const totalLocalFiles = issues.products.localFiles.length + issues.slideshow.localFiles.length + 
                           issues.orders.localFiles.length + issues.reviews.localFiles.length;

    console.log('='.repeat(60));
    console.log('📊 SCAN SUMMARY');
    console.log('='.repeat(60));
    console.log(`📦 Products:`);
    console.log(`   - Base64 images: ${issues.products.base64.length}`);
    console.log(`   - Local file paths: ${issues.products.localFiles.length}`);
    console.log(`🎠 Slideshow:`);
    console.log(`   - Base64 images: ${issues.slideshow.base64.length}`);
    console.log(`   - Local file paths: ${issues.slideshow.localFiles.length}`);
    console.log(`📋 Orders:`);
    console.log(`   - Local file paths: ${issues.orders.localFiles.length}`);
    console.log(`⭐ Reviews:`);
    console.log(`   - Local file paths: ${issues.reviews.localFiles.length}`);
    console.log('='.repeat(60));
    console.log(`\n📊 TOTAL:`);
    console.log(`   Base64 images: ${totalBase64}`);
    console.log(`   Local file paths: ${totalLocalFiles}`);
    console.log(`   Total issues: ${totalBase64 + totalLocalFiles}`);

    // Show details if any issues found
    if (totalBase64 > 0 || totalLocalFiles > 0) {
      console.log('\n' + '='.repeat(60));
      console.log('📋 DETAILED LIST');
      console.log('='.repeat(60));

      if (issues.products.base64.length > 0) {
        console.log('\n📦 Products with base64 images:');
        issues.products.base64.slice(0, 10).forEach(issue => {
          console.log(`   - ${issue.productName} (ID: ${issue.productId})`);
        });
        if (issues.products.base64.length > 10) {
          console.log(`   ... and ${issues.products.base64.length - 10} more`);
        }
      }

      if (issues.products.localFiles.length > 0) {
        console.log('\n📦 Products with local file paths:');
        issues.products.localFiles.slice(0, 10).forEach(issue => {
          console.log(`   - ${issue.productName}: ${issue.url}`);
        });
        if (issues.products.localFiles.length > 10) {
          console.log(`   ... and ${issues.products.localFiles.length - 10} more`);
        }
      }

      if (issues.slideshow.base64.length > 0) {
        console.log('\n🎠 Slideshow with base64 images:');
        issues.slideshow.base64.forEach(issue => {
          console.log(`   - Order ${issue.order}`);
        });
      }

      if (issues.slideshow.localFiles.length > 0) {
        console.log('\n🎠 Slideshow with local file paths:');
        issues.slideshow.localFiles.forEach(issue => {
          console.log(`   - Order ${issue.order}: ${issue.url}`);
        });
      }

      if (issues.orders.localFiles.length > 0) {
        console.log('\n📋 Orders with local file paths:');
        issues.orders.localFiles.slice(0, 10).forEach(issue => {
          console.log(`   - Order ${issue.orderId}: ${issue.url}`);
        });
        if (issues.orders.localFiles.length > 10) {
          console.log(`   ... and ${issues.orders.localFiles.length - 10} more`);
        }
      }

      if (issues.reviews.localFiles.length > 0) {
        console.log('\n⭐ Reviews with local file paths:');
        issues.reviews.localFiles.slice(0, 10).forEach(issue => {
          console.log(`   - Review ${issue.reviewId}: ${issue.url}`);
        });
        if (issues.reviews.localFiles.length > 10) {
          console.log(`   ... and ${issues.reviews.localFiles.length - 10} more`);
        }
      }

      console.log('\n' + '='.repeat(60));
      console.log('💡 RECOMMENDATIONS');
      console.log('='.repeat(60));
      if (issues.products.base64.length > 0) {
        console.log('   Run: npm run migrate:cloudinary');
      }
      if (issues.slideshow.base64.length > 0) {
        console.log('   Run: npm run migrate:slideshow');
      }
      if (issues.orders.localFiles.length > 0 || issues.reviews.localFiles.length > 0) {
        console.log('   Run: npm run migrate:userfiles');
      }
    } else {
      console.log('\n✅ All files are using Cloudinary! No migration needed.');
    }

    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('\n✅ Scan complete!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Scan failed:', error);
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

// Run scan
findRemainingFiles();

