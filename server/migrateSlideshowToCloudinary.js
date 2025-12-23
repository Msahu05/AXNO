/**
 * Migration Script: Upload Slideshow Base64 Images to Cloudinary
 * 
 * This script migrates existing base64 slideshow images to Cloudinary.
 * 
 * Usage:
 *   node migrateSlideshowToCloudinary.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadBase64Image, isCloudinaryUrl } from './cloudinaryService.js';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

// Slideshow Schema
const slideshowSchema = new mongoose.Schema({
  slideshow: [{
    image: String,
    redirectUrl: String,
    order: Number
  }]
}, { timestamps: true });

const Slideshow = mongoose.model('Slideshow', slideshowSchema);

async function migrateSlideshowToCloudinary() {
  try {
    console.log('🚀 Starting Slideshow Cloudinary migration...\n');

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

    // Find slideshow
    let slideshow = await Slideshow.findOne();
    if (!slideshow || !slideshow.slideshow || slideshow.slideshow.length === 0) {
      console.log('⚠️  No slideshow images found.');
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log(`📦 Found ${slideshow.slideshow.length} slideshow images\n`);

    let migratedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const startTime = Date.now();

    // Process each slideshow image
    const processedSlideshow = [];
    for (let i = 0; i < slideshow.slideshow.length; i++) {
      const slide = slideshow.slideshow[i];
      console.log(`\n[${i + 1}/${slideshow.slideshow.length}] Processing slideshow image ${i + 1}`);

      // If already a Cloudinary URL, keep it
      if (slide.image && isCloudinaryUrl(slide.image)) {
        console.log('  ✅ Already on Cloudinary');
        processedSlideshow.push(slide);
        skippedCount++;
        continue;
      }

      // If it's base64, upload to Cloudinary
      if (slide.image && (slide.image.startsWith('data:image/') || slide.image.length > 1000)) {
        try {
          console.log('  📤 Uploading to Cloudinary...');
          const uploadStart = Date.now();
          
          // Extract base64 data and mime type
          const base64Match = slide.image.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
          let result;
          
          if (base64Match) {
            result = await uploadBase64Image(
              base64Match[2],
              base64Match[1] || 'image/jpeg',
              'looklyn/slideshow',
              `slideshow_${Date.now()}_${i}`
            );
          } else {
            // Already base64 without data URI prefix
            result = await uploadBase64Image(
              slide.image,
              'image/jpeg',
              'looklyn/slideshow',
              `slideshow_${Date.now()}_${i}`
            );
          }

          const uploadTime = ((Date.now() - uploadStart) / 1000).toFixed(1);
          processedSlideshow.push({
            image: result.secure_url,
            redirectUrl: slide.redirectUrl || '/category/all',
            order: slide.order !== undefined ? slide.order : i
          });

          console.log(`  ✅ Uploaded in ${uploadTime}s → ${result.secure_url.substring(0, 50)}...`);
          migratedCount++;

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`  ❌ Error uploading:`, error.message);
          // Keep the base64 as fallback
          processedSlideshow.push(slide);
          errorCount++;
        }
      } else if (slide.image) {
        // Keep existing URL if it's not base64
        console.log('  ⏭️  Keeping existing URL');
        processedSlideshow.push(slide);
        skippedCount++;
      }
    }

    // Update slideshow in database
    if (migratedCount > 0) {
      slideshow.slideshow = processedSlideshow;
      await slideshow.save();
      console.log('\n  ✅ Slideshow updated in database');
    }

    // Summary
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('\n' + '='.repeat(60));
    console.log('📊 MIGRATION SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Successfully migrated: ${migratedCount} images`);
    console.log(`⏭️  Skipped: ${skippedCount} images`);
    console.log(`❌ Errors: ${errorCount} images`);
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
migrateSlideshowToCloudinary();

