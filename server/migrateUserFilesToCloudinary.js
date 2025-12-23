/**
 * Migration Script: Upload User Files to Cloudinary
 * 
 * This script migrates:
 * 1. Custom design files from orders
 * 2. Review attachments
 * 3. Any other user-uploaded files stored locally
 * 
 * Usage:
 *   node migrateUserFilesToCloudinary.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { uploadLocalFile, isCloudinaryUrl, isLocalFilePath } from './cloudinaryService.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// Schemas
const orderSchema = new mongoose.Schema({
  orderId: String,
  customDesign: {
    files: [String]
  }
}, { collection: 'orders' });

const reviewSchema = new mongoose.Schema({
  attachments: [{
    type: String,
    url: String,
    name: String
  }]
}, { collection: 'reviews' });

const Order = mongoose.model('Order', orderSchema);
const Review = mongoose.model('Review', reviewSchema);

async function migrateUserFiles() {
  try {
    console.log('🚀 Starting User Files Cloudinary migration...\n');

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

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const startTime = Date.now();

    // Migrate Order Design Files
    console.log('📦 Migrating order design files...');
    const orders = await Order.find({ 'customDesign.files': { $exists: true, $ne: [] } }).lean();
    console.log(`   Found ${orders.length} orders with design files\n`);

    for (const order of orders) {
      if (!order.customDesign || !order.customDesign.files || order.customDesign.files.length === 0) {
        continue;
      }

      const updatedFiles = [];
      let orderUpdated = false;

      for (const fileUrl of order.customDesign.files) {
        // Skip if already Cloudinary URL
        if (isCloudinaryUrl(fileUrl)) {
          updatedFiles.push(fileUrl);
          continue;
        }

        // Skip if not a local file path
        if (!isLocalFilePath(fileUrl)) {
          updatedFiles.push(fileUrl);
          continue;
        }

        // Upload to Cloudinary
        try {
          console.log(`   📤 Uploading: ${fileUrl}...`);
          const result = await uploadLocalFile(
            fileUrl,
            'looklyn/design-files',
            `design_${order.orderId || order._id}_${Date.now()}_${Math.random().toString(36).substring(7)}`
          );
          updatedFiles.push(result.secure_url);
          orderUpdated = true;
          migratedCount++;
          console.log(`   ✅ Uploaded: ${result.secure_url.substring(0, 50)}...`);
          
          // Small delay
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error(`   ❌ Error uploading ${fileUrl}:`, error.message);
          // Keep original URL if upload fails
          updatedFiles.push(fileUrl);
          errorCount++;
        }
      }

      // Update order if files were migrated
      if (orderUpdated) {
        await Order.findByIdAndUpdate(order._id, {
          $set: { 'customDesign.files': updatedFiles }
        });
        console.log(`   ✅ Updated order ${order.orderId || order._id}\n`);
      }
    }

    // Migrate Review Attachments
    console.log('📝 Migrating review attachments...');
    const reviews = await Review.find({ attachments: { $exists: true, $ne: [] } }).lean();
    console.log(`   Found ${reviews.length} reviews with attachments\n`);

    for (const review of reviews) {
      if (!review.attachments || review.attachments.length === 0) {
        continue;
      }

      const updatedAttachments = [];
      let reviewUpdated = false;

      for (const attachment of review.attachments) {
        if (!attachment.url) {
          updatedAttachments.push(attachment);
          continue;
        }

        // Skip if already Cloudinary URL
        if (isCloudinaryUrl(attachment.url)) {
          updatedAttachments.push(attachment);
          continue;
        }

        // Skip if not a local file path
        if (!isLocalFilePath(attachment.url)) {
          updatedAttachments.push(attachment);
          continue;
        }

        // Upload to Cloudinary
        try {
          console.log(`   📤 Uploading: ${attachment.url}...`);
          const result = await uploadLocalFile(
            attachment.url,
            'looklyn/reviews',
            `review_${review._id}_${Date.now()}_${Math.random().toString(36).substring(7)}`
          );
          updatedAttachments.push({
            ...attachment,
            url: result.secure_url
          });
          reviewUpdated = true;
          migratedCount++;
          console.log(`   ✅ Uploaded: ${result.secure_url.substring(0, 50)}...`);
          
          // Small delay
          await new Promise(resolve => setTimeout(resolve, 300));
        } catch (error) {
          console.error(`   ❌ Error uploading ${attachment.url}:`, error.message);
          // Keep original attachment if upload fails
          updatedAttachments.push(attachment);
          errorCount++;
        }
      }

      // Update review if attachments were migrated
      if (reviewUpdated) {
        await Review.findByIdAndUpdate(review._id, {
          $set: { attachments: updatedAttachments }
        });
        console.log(`   ✅ Updated review ${review._id}\n`);
      }
    }

    // Summary
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully migrated: ${migratedCount} files`);
    console.log(`⏭️  Skipped: ${skippedCount} files`);
    console.log(`❌ Errors: ${errorCount} files`);
    console.log(`⏱️  Total time: ${totalTime} seconds`);
    console.log('='.repeat(60));

    // Close MongoDB connection
    await mongoose.disconnect();
    console.log('\n✅ Migration completed!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
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

// Run migration
migrateUserFiles();

