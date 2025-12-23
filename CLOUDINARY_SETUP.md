# Cloudinary Image Storage Setup Guide

This guide will help you set up Cloudinary for storing product images, which will significantly improve your site's performance by replacing base64 images stored in MongoDB with optimized cloud-hosted images.

## Why Cloudinary?

- **Faster Loading**: Images load directly from Cloudinary's CDN instead of being decoded from base64
- **Smaller Database**: Reduces MongoDB document size, making queries faster
- **Image Optimization**: Automatic image compression and format optimization
- **Better Performance**: CDN delivery ensures fast image loading worldwide

## Step 1: Create a Cloudinary Account

1. Go to [https://cloudinary.com/users/register/free](https://cloudinary.com/users/register/free)
2. Sign up for a free account (includes 25GB storage and 25GB bandwidth per month)
3. Verify your email address

## Step 2: Get Your Cloudinary Credentials

1. After logging in, go to your [Dashboard](https://console.cloudinary.com/)
2. Click on **Settings** (gear icon) in the top right
3. Go to **Product Environment Credentials** section
4. Copy the following values:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

## Step 3: Add Environment Variables

1. Open your `.env` file in the `server/` directory (or create one if it doesn't exist)
2. Add the following variables:

```env
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

3. Replace the placeholder values with your actual Cloudinary credentials

## Step 4: Deploy Environment Variables

### For Render (Backend)

1. Go to your Render dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Add the three Cloudinary environment variables:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
5. Save the changes (Render will automatically restart your service)

## Step 5: Migrate Existing Images (Optional but Recommended)

If you have existing products with base64 images, run the migration script to upload them to Cloudinary:

```bash
cd server
node migrateToCloudinary.js
```

This script will:
- Find all products with base64 images
- Upload each image to Cloudinary
- Replace base64 data with Cloudinary URLs
- Keep base64 as fallback if upload fails

**Note**: The migration script processes images one by one with a small delay to avoid rate limiting. For large catalogs, this may take some time.

## Step 6: Test the Integration

1. **Create a new product** through your admin panel
   - Upload images as usual
   - Images should now be stored on Cloudinary instead of MongoDB
   - Check the product in your database - you should see Cloudinary URLs instead of base64 data

2. **Verify image loading**
   - Visit your product pages
   - Images should load faster
   - Check browser DevTools Network tab - images should be loading from `res.cloudinary.com`

## How It Works

### New Products
- When you create or update a product with images, the backend:
  1. Receives base64 images from the frontend
  2. Uploads them to Cloudinary
  3. Stores only the Cloudinary URL in MongoDB
  4. Returns Cloudinary URLs to the frontend

### Existing Products
- Products with base64 images will continue to work (backward compatibility)
- You can migrate them using the migration script
- Or they'll be migrated automatically when you update the product

### Image Optimization
- Cloudinary automatically:
  - Optimizes image format (WebP when supported)
  - Compresses images
  - Resizes images based on device
  - Serves images via CDN

## Troubleshooting

### Images not uploading
- Check that all three environment variables are set correctly
- Verify your Cloudinary credentials in the dashboard
- Check server logs for error messages

### Migration script fails
- Ensure MongoDB connection is working
- Check that Cloudinary credentials are correct
- Verify you have sufficient Cloudinary quota (free tier: 25GB)

### Images not loading
- Check browser console for errors
- Verify Cloudinary URLs are being returned from the API
- Ensure CORS is configured correctly (Cloudinary handles this automatically)

## Cost Considerations

**Free Tier** (Perfect for most small to medium stores):
- 25GB storage
- 25GB bandwidth/month
- Unlimited transformations

**Paid Plans** start at $89/month for:
- 100GB storage
- 100GB bandwidth/month
- Priority support

For most e-commerce sites, the free tier is sufficient unless you have thousands of high-resolution product images.

## Next Steps

After setup:
1. ✅ Test creating a new product
2. ✅ Run migration script for existing products
3. ✅ Monitor image loading performance
4. ✅ Consider removing base64 data from old products after confirming Cloudinary works

## Support

If you encounter issues:
1. Check Cloudinary dashboard for upload statistics
2. Review server logs for error messages
3. Verify environment variables are set correctly
4. Test Cloudinary credentials using their API directly

---

**Note**: The migration script is safe to run multiple times - it will skip products that already have Cloudinary URLs.

