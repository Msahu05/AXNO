# How to Add Products to Looklyn

## Quick Guide

### Step 1: Open the Products File
Open `src/data/products.js` in your code editor.

### Step 2: Add Your Product

You can add products in two ways:

#### Method 1: Add to Manual Products Array (Recommended)

At the bottom of the file, you'll find a `manualProducts` array. Add your product there:

```javascript
{
  id: "unique-product-id",           // REQUIRED: Unique identifier (e.g., "men-hoodie-001")
  name: "Your Product Name",         // REQUIRED: Product name
  category: "Hoodie",                // REQUIRED: "Hoodie", "T-Shirt", or "Sweatshirt"
  audience: "men",                   // REQUIRED: "men", "women", or "kids"
  price: 1099,                       // REQUIRED: Current price (number)
  original: 1999,                    // REQUIRED: Original price (number)
  accent: "linear-gradient(135deg,#ffe1f7,#d3b0ff)", // Optional: Color gradient
  gallery: [                         // REQUIRED: Array of image URLs
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg",
    "https://example.com/image3.jpg",
  ],
}
```

#### Method 2: Use Auto-Detection (Name-Based)

If your product name contains keywords, you can use the `addProduct()` helper function:

```javascript
addProduct({
  name: "Men's Premium Hoodie",      // Name with keywords
  price: 1099,
  original: 1999,
  gallery: ["url1", "url2", "url3"],
  accent: "linear-gradient(135deg,#ffe1f7,#d3b0ff)", // Optional
});
```

**Auto-Detection Keywords:**
- **Category Detection:**
  - Contains "Hoodie" or "hoodie" → Category: "Hoodie"
  - Contains "T-Shirt", "Tee", "tee", "tshirt" → Category: "T-Shirt"
  - Contains "Sweatshirt" or "sweatshirt" → Category: "Sweatshirt"

- **Audience Detection:**
  - Contains "Men", "men", "Men's", "men's" → Audience: "men"
  - Contains "Women", "women", "Women's", "women's" → Audience: "women"
  - Contains "Kids", "kids", "Kid's", "kid's", "Children" → Audience: "kids"

### Step 3: Save and Refresh

After adding your product, save the file. The product will automatically appear on the website!

---

## Examples

### Example 1: Men's Hoodie
```javascript
{
  id: "men-hoodie-custom-001",
  name: "Men's Premium Black Hoodie",
  category: "Hoodie",
  audience: "men",
  price: 1299,
  original: 2199,
  accent: "linear-gradient(135deg,#000000,#333333)",
  gallery: [
    "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1516251193007-45ef944ab0c6?auto=format&fit=crop&w=1000&q=80",
  ],
}
```

### Example 2: Women's T-Shirt (Using Auto-Detection)
```javascript
addProduct({
  name: "Women's Floral Print Tee",
  price: 699,
  original: 1199,
  gallery: [
    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=80",
  ],
});
```

### Example 3: Kids Sweatshirt
```javascript
{
  id: "kids-sweatshirt-001",
  name: "Kids Colorful Sweatshirt",
  category: "Sweatshirt",
  audience: "kids",
  price: 899,
  original: 1599,
  accent: "linear-gradient(135deg,#ffe5d4,#ffc2ac)",
  gallery: [
    "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1000&q=80",
  ],
}
```

---

## Removing Products

To remove a product, simply delete its entry from the `manualProducts` array or remove it from the template arrays.

---

## Important Notes

1. **ID Must Be Unique**: Each product must have a unique `id`. Use a format like `"men-hoodie-001"` or `"women-tee-001"`.

2. **Category Values**: Must be exactly one of:
   - `"Hoodie"`
   - `"T-Shirt"`
   - `"Sweatshirt"`

3. **Audience Values**: Must be exactly one of:
   - `"men"`
   - `"women"`
   - `"kids"`

4. **Image URLs**: You can use:
   - **Local images** (stored in your project) - See "Adding Local Images" section below
   - Unsplash URLs (like the examples)
   - Your own hosted images
   - Any publicly accessible image URL

5. **Price Format**: Use numbers only (no currency symbols or commas)

---

## Adding Local Images (Your Own Photos)

### Step 1: Store Your Images

**Recommended Location:** `public/products/` folder

1. Copy your product images to the `public/products/` folder
2. Use descriptive filenames like:
   - `men-hoodie-black-001.jpg`
   - `women-tee-floral-001.jpg`
   - `kids-sweatshirt-colorful-001.jpg`

**Example folder structure:**
```
public/
  products/
    men-hoodie-black-001.jpg
    men-hoodie-black-002.jpg
    women-tee-floral-001.jpg
    kids-sweatshirt-colorful-001.jpg
```

### Step 2: Reference Images in Your Product

Use the path starting with `/products/` (the `/` represents the public folder root):

```javascript
{
  id: "men-hoodie-001",
  name: "Men's Premium Black Hoodie",
  category: "Hoodie",
  audience: "men",
  price: 1299,
  original: 2199,
  gallery: [
    "/products/men-hoodie-black-001.jpg",  // Local image
    "/products/men-hoodie-black-002.jpg",  // Local image
    "/products/men-hoodie-black-003.jpg",  // Local image
  ],
}
```

### Important Notes for Local Images:

- ✅ **Path format**: Always start with `/products/` (not `public/products/`)
- ✅ **File types**: Supports `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`
- ✅ **File size**: Keep images under 2MB for best performance
- ✅ **Image dimensions**: Recommended 1000x1000px or larger (square format works best)
- ✅ **After adding images**: Refresh your browser to see them

### Alternative: Using `src/assets` Folder

You can also store images in `src/assets/products/` but you'll need to import them:

1. Create folder: `src/assets/products/`
2. Add your images there
3. Import and use:

```javascript
// At the top of products.js
import productImage1 from '@/assets/products/men-hoodie-001.jpg';
import productImage2 from '@/assets/products/men-hoodie-002.jpg';

// Then in your product:
{
  id: "men-hoodie-001",
  name: "Men's Premium Black Hoodie",
  category: "Hoodie",
  audience: "men",
  price: 1299,
  original: 2199,
  gallery: [
    productImage1,  // Imported image
    productImage2,  // Imported image
  ],
}
```

**Recommendation:** Use `public/products/` folder (easier, no imports needed!)

---

## Where Products Appear

- **Home Page**: Products appear in their respective category sections (Hoodies, T-Shirts, Sweatshirts)
- **Category Pages**: Filtered by category and audience
- **Product Page**: Individual product details
- **Search**: If you implement search functionality

---

## Need Help?

If you're unsure about any field, check the existing products in the file for reference!

