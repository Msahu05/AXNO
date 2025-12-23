/**
 * Quick test to check MongoDB connection and product count
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const productSchema = new mongoose.Schema({
  name: String,
  gallery: Array
}, { collection: 'products' });

const Product = mongoose.model('Product', productSchema);

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    console.log('Counting products...');
    const count = await Product.countDocuments({});
    console.log(`✅ Found ${count} products`);
    
    if (count > 0) {
      console.log('\nChecking first product...');
      const firstProduct = await Product.findOne({}, { name: 1, 'gallery.url': 1, 'gallery.data': 1 }).lean();
      if (firstProduct) {
        console.log(`Product: ${firstProduct.name}`);
        console.log(`Gallery items: ${firstProduct.gallery?.length || 0}`);
        if (firstProduct.gallery && firstProduct.gallery.length > 0) {
          const firstImg = firstProduct.gallery[0];
          console.log(`First image has URL: ${!!firstImg.url}`);
          console.log(`First image has data: ${!!(firstImg.data && firstImg.data.length > 0)}`);
          if (firstImg.data) {
            console.log(`Base64 size: ${Math.round(firstImg.data.length / 1024)}KB`);
          }
        }
      }
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Test complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testConnection();

