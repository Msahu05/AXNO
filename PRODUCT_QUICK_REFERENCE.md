# Product Quick Reference Card

## 🎯 How Filtering Works

Products are filtered by **TWO properties**:

1. **`category`** → Determines which section (Hoodies / T-Shirts / Sweatshirts)
2. **`audience`** → Determines which filter button (Men / Women / Kids)

---

## 📝 Adding a Product - Copy & Paste Template

```javascript
{
  id: "unique-id-here",              // Make it unique!
  name: "Your Product Name",
  category: "Hoodie",                // "Hoodie" | "T-Shirt" | "Sweatshirt"
  audience: "men",                   // "men" | "women" | "kids"
  price: 1099,                       // Current price (number)
  original: 1999,                    // Original price (number)
  accent: "linear-gradient(135deg,#ffe1f7,#d3b0ff)", // Optional: Color
  gallery: [                         // Array of image URLs
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg",
  ],
}
```

---

## 🔍 Auto-Detection from Name

If you use `addProduct()` function, it will auto-detect from the name:

### Category Detection
- Name contains **"Hoodie"** → Category: `"Hoodie"`
- Name contains **"T-Shirt"** or **"Tee"** → Category: `"T-Shirt"`
- Name contains **"Sweatshirt"** → Category: `"Sweatshirt"`

### Audience Detection
- Name contains **"Men"** or **"Men's"** → Audience: `"men"`
- Name contains **"Women"** or **"Women's"** → Audience: `"women"`
- Name contains **"Kids"** or **"Children"** → Audience: `"kids"`

### Example:
```javascript
addProduct({
  name: "Men's Premium Hoodie",  // Auto-detects: category="Hoodie", audience="men"
  price: 1099,
  original: 1999,
  gallery: ["url1", "url2"],
});
```

---

## 📍 Where to Add Products

**File:** `src/data/products.js`

**Location:** Add to the `manualProducts` array (around line 220)

---

## ✅ Valid Values

### Category (must be exact):
- `"Hoodie"`
- `"T-Shirt"`
- `"Sweatshirt"`

### Audience (must be exact):
- `"men"`
- `"women"`
- `"kids"`

---

## 🗑️ Removing Products

Simply delete the product object from the `manualProducts` array.

---

## 💡 Pro Tips

1. **Use descriptive IDs**: `"men-hoodie-001"` is better than `"product1"`
2. **Multiple images**: Add 3-5 images to the gallery array for best results
3. **Image URLs**: 
   - **Local images**: Store in `public/products/` and use `/products/filename.jpg`
   - **External URLs**: Use full URLs (https://...) - Unsplash works great!
4. **Test after adding**: Refresh your browser to see the new product

---

## 📸 Adding Your Own Photos

### Quick Steps:

1. **Copy your images** to `public/products/` folder
2. **Use the path** `/products/your-image.jpg` in the gallery array

### Example:
```javascript
{
  id: "men-hoodie-001",
  name: "Men's Premium Black Hoodie",
  category: "Hoodie",
  audience: "men",
  price: 1299,
  original: 2199,
  gallery: [
    "/products/men-hoodie-black-001.jpg",  // Your local image
    "/products/men-hoodie-black-002.jpg",  // Your local image
  ],
}
```

**Note:** Always start the path with `/products/` (not `public/products/`)

---

## 🎨 Example Products

### Men's Hoodie
```javascript
{
  id: "men-hoodie-001",
  name: "Men's Black Premium Hoodie",
  category: "Hoodie",
  audience: "men",
  price: 1299,
  original: 2199,
  gallery: ["https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1000"],
}
```

### Women's T-Shirt
```javascript
{
  id: "women-tee-001",
  name: "Women's Floral Print Tee",
  category: "T-Shirt",
  audience: "women",
  price: 699,
  original: 1199,
  gallery: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1000"],
}
```

### Kids Sweatshirt
```javascript
{
  id: "kids-sweatshirt-001",
  name: "Kids Colorful Sweatshirt",
  category: "Sweatshirt",
  audience: "kids",
  price: 899,
  original: 1599,
  gallery: ["https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1000"],
}
```

---

**Need more help?** Check `HOW_TO_ADD_PRODUCTS.md` for detailed instructions!

