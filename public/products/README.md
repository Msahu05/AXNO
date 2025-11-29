# Product Images Folder

## 📁 How to Use This Folder

1. **Add your product images here**
   - Copy your product photos into this folder
   - Use descriptive filenames (e.g., `men-hoodie-black-001.jpg`)

2. **Reference them in products.js**
   - Use path: `/products/your-image.jpg`
   - Example: `/products/men-hoodie-black-001.jpg`

## 📝 Example

If you add an image called `women-tee-floral.jpg` here, reference it in your product like this:

```javascript
{
  id: "women-tee-001",
  name: "Women's Floral Print Tee",
  category: "T-Shirt",
  audience: "women",
  price: 699,
  original: 1199,
  gallery: [
    "/products/women-tee-floral.jpg",  // Reference your image here
  ],
}
```

## ✅ Best Practices

- **File naming**: Use descriptive names like `men-hoodie-black-001.jpg`
- **File size**: Keep images under 2MB
- **Image size**: Recommended 1000x1000px or larger
- **Formats**: `.jpg`, `.jpeg`, `.png`, `.webp` all work

## 📍 Folder Structure

```
public/
  products/
    ├── men-hoodie-black-001.jpg
    ├── men-hoodie-black-002.jpg
    ├── women-tee-floral-001.jpg
    └── kids-sweatshirt-colorful-001.jpg
```

