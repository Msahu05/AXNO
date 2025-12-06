import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/axno';

// Product Schema (same as in index.js)
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, required: true, enum: ['Hoodie', 'T-Shirt', 'Sweatshirt'] },
  audience: { type: String, required: true, enum: ['men', 'women', 'kids'] },
  price: { type: Number, required: true },
  originalPrice: { type: Number, required: true },
  accent: { type: String, default: 'linear-gradient(135deg,#5c3d8a,#7a5bff)' },
  gallery: [{
    url: { type: String, required: true },
    isMain: { type: Boolean, default: false },
    order: { type: Number, default: 0 }
  }],
  colorOptions: [{
    name: { type: String, required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    hexCode: { type: String, default: '' }
  }],
  sizes: { type: [String], default: ['S', 'M', 'L', 'XL'] },
  stock: { type: Number, default: 100 },
  isActive: { type: Boolean, default: true },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);

// Sample products data
const sampleProducts = [
  // Men's Hoodies
  {
    name: "Men's Premium Black Hoodie",
    description: "Premium quality black hoodie with soft fleece lining",
    category: "Hoodie",
    audience: "men",
    price: 1299,
    originalPrice: 2199,
    accent: "linear-gradient(135deg,#000000,#333333)",
    gallery: [
      { url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=80", isMain: true, order: 0 },
      { url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1000&q=80", isMain: false, order: 1 }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: 50,
    tags: ['hoodie', 'black', 'premium']
  },
  {
    name: "Men's Navy Blue Hoodie",
    description: "Classic navy blue hoodie perfect for everyday wear",
    category: "Hoodie",
    audience: "men",
    price: 1199,
    originalPrice: 1999,
    accent: "linear-gradient(135deg,#1e3a8a,#3b82f6)",
    gallery: [
      { url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1000&q=80", isMain: true, order: 0 }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 40,
    tags: ['hoodie', 'navy', 'classic']
  },
  // Men's T-Shirts
  {
    name: "Men's White Classic T-Shirt",
    description: "Essential white t-shirt with premium cotton",
    category: "T-Shirt",
    audience: "men",
    price: 599,
    originalPrice: 999,
    accent: "linear-gradient(135deg,#ffffff,#f3f4f6)",
    gallery: [
      { url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=80", isMain: true, order: 0 }
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    stock: 100,
    tags: ['tshirt', 'white', 'classic']
  },
  {
    name: "Men's Black Graphic T-Shirt",
    description: "Stylish black t-shirt with modern design",
    category: "T-Shirt",
    audience: "men",
    price: 799,
    originalPrice: 1299,
    accent: "linear-gradient(135deg,#000000,#1f2937)",
    gallery: [
      { url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=80", isMain: true, order: 0 }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 60,
    tags: ['tshirt', 'black', 'graphic']
  },
  // Women's Hoodies
  {
    name: "Women's Pink Hoodie",
    description: "Soft pink hoodie with comfortable fit",
    category: "Hoodie",
    audience: "women",
    price: 1299,
    originalPrice: 2199,
    accent: "linear-gradient(135deg,#fce7f3,#f9a8d4)",
    gallery: [
      { url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80", isMain: true, order: 0 }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 45,
    tags: ['hoodie', 'pink', 'women']
  },
  {
    name: "Women's Grey Oversized Hoodie",
    description: "Comfortable oversized grey hoodie",
    category: "Hoodie",
    audience: "women",
    price: 1399,
    originalPrice: 2299,
    accent: "linear-gradient(135deg,#9ca3af,#6b7280)",
    gallery: [
      { url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80", isMain: true, order: 0 }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 35,
    tags: ['hoodie', 'grey', 'oversized']
  },
  // Women's T-Shirts
  {
    name: "Women's White Crop T-Shirt",
    description: "Trendy white crop top t-shirt",
    category: "T-Shirt",
    audience: "women",
    price: 699,
    originalPrice: 1199,
    accent: "linear-gradient(135deg,#ffffff,#f9fafb)",
    gallery: [
      { url: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1000&q=80", isMain: true, order: 0 }
    ],
    sizes: ['S', 'M', 'L'],
    stock: 55,
    tags: ['tshirt', 'white', 'crop']
  },
  // Kids Hoodies
  {
    name: "Kids' Blue Hoodie",
    description: "Fun blue hoodie for kids",
    category: "Hoodie",
    audience: "kids",
    price: 899,
    originalPrice: 1499,
    accent: "linear-gradient(135deg,#3b82f6,#60a5fa)",
    gallery: [
      { url: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1000&q=80", isMain: true, order: 0 }
    ],
    sizes: ['S', 'M', 'L'],
    stock: 30,
    tags: ['hoodie', 'blue', 'kids']
  },
  // Sweatshirts
  {
    name: "Men's Grey Sweatshirt",
    description: "Comfortable grey sweatshirt for men",
    category: "Sweatshirt",
    audience: "men",
    price: 1099,
    originalPrice: 1899,
    accent: "linear-gradient(135deg,#6b7280,#9ca3af)",
    gallery: [
      { url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1000&q=80", isMain: true, order: 0 }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 50,
    tags: ['sweatshirt', 'grey', 'men']
  },
  {
    name: "Women's Beige Sweatshirt",
    description: "Elegant beige sweatshirt for women",
    category: "Sweatshirt",
    audience: "women",
    price: 1199,
    originalPrice: 1999,
    accent: "linear-gradient(135deg,#f5f5dc,#e5e5d0)",
    gallery: [
      { url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=80", isMain: true, order: 0 }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    stock: 40,
    tags: ['sweatshirt', 'beige', 'women']
  }
];

async function seedProducts() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing products
    console.log('🗑️  Clearing existing products...');
    await Product.deleteMany({});
    console.log('✅ Cleared existing products');

    // Insert sample products
    console.log('📦 Inserting products...');
    const insertedProducts = await Product.insertMany(sampleProducts);
    console.log(`✅ Successfully inserted ${insertedProducts.length} products`);

    console.log('\n📊 Products Summary:');
    const categories = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    categories.forEach(cat => {
      console.log(`   ${cat._id}: ${cat.count} products`);
    });

    const audiences = await Product.aggregate([
      { $group: { _id: '$audience', count: { $sum: 1 } } }
    ]);
    audiences.forEach(aud => {
      console.log(`   ${aud._id}: ${aud.count} products`);
    });

    console.log('\n✨ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedProducts();


