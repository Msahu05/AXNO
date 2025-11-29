const buildGallery = (imageIds) =>
  imageIds.map((id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=80`);

const menTemplates = [
  {
    name: "Prism Panel Hoodie",
    category: "Hoodie",
    price: 1099,
    original: 1999,
    accent: "linear-gradient(135deg,#ffe1f7,#d3b0ff)",
    gallery: buildGallery([
      "photo-1524504388940-b1c1722653e1",
      "photo-1516251193007-45ef944ab0c6",
      "photo-1492447166138-50c3889fccb1",
      "photo-1475180098004-ca77a66827be",
      "photo-1503342250614-ca4407868a5b",
    ]),
  },
  {
    name: "Night Pulse Hoodie",
    category: "Hoodie",
    price: 1099,
    original: 1999,
    accent: "linear-gradient(135deg,#252525,#000)",
    gallery: buildGallery([
      "photo-1495107334309-fcf20504a5ab",
      "photo-1490481651871-ab68de25d43d",
      "photo-1487412720507-e7ab37603c6f",
      "photo-1441986300917-64674bd600d8",
      "photo-1503341455253-b2e723bb3dbb",
    ]),
  },
  {
    name: "Spectra Grid Hoodie",
    category: "Hoodie",
    price: 1099,
    original: 1999,
    accent: "linear-gradient(135deg,#c996ff,#7a5bff)",
    gallery: buildGallery([
      "photo-1491557345352-5929e343eb89",
      "photo-1519681393784-d120267933ba",
      "photo-1512436991641-6745cdb1723f",
      "photo-1524502397800-2eeaad7c3fe5",
      "photo-1441986300917-64674bd600d8",
    ]),
  },
  {
    name: "Chrome Circuit Hoodie",
    category: "Hoodie",
    price: 1099,
    original: 1999,
    accent: "linear-gradient(135deg,#3f4c6b,#606c88)",
    gallery: buildGallery([
      "photo-1503342250614-ca4407868a5b",
      "photo-1514996937319-344454492b37",
      "photo-1519681393784-d120267933ba",
      "photo-1503341455253-b2e723bb3dbb",
      "photo-1475180098004-ca77a66827be",
    ]),
  },
];

const womenTemplates = [
  {
    name: "Luminous Core Tee",
    category: "T-Shirt",
    price: 599,
    original: 1099,
    accent: "linear-gradient(135deg,#ffffff,#e1d8ff)",
    gallery: buildGallery([
      "photo-1521572163474-6864f9cf17ab",
      "photo-1503341455253-b2e723bb3dbb",
      "photo-1463107971871-fbac9ddb920f",
      "photo-1503342250614-ca4407868a5b",
      "photo-1503341455253-b2e723bb3dbb",
    ]),
  },
  {
    name: "Vanta Line Tee",
    category: "T-Shirt",
    price: 599,
    original: 1099,
    accent: "linear-gradient(135deg,#222831,#0b0f19)",
    gallery: buildGallery([
      "photo-1524504388940-b1c1722653e1",
      "photo-1521572163474-6864f9cf17ab",
      "photo-1514996937319-344454492b37",
      "photo-1512436991641-6745cdb1723f",
      "photo-1487412720507-e7ab37603c6f",
    ]),
  },
  {
    name: "Velvet Flux Tee",
    category: "T-Shirt",
    price: 599,
    original: 1099,
    accent: "linear-gradient(135deg,#ffdde1,#ee9ca7)",
    gallery: buildGallery([
      "photo-1487412720507-e7ab37603c6f",
      "photo-1503342250614-ca4407868a5b",
      "photo-1521572163474-6864f9cf17ab",
      "photo-1491557345352-5929e343eb89",
      "photo-1512436991641-6745cdb1723f",
    ]),
  },
  {
    name: "Lunar Bloom Tee",
    category: "T-Shirt",
    price: 599,
    original: 1099,
    accent: "linear-gradient(135deg,#d8bfd8,#b894d6)",
    gallery: buildGallery([
      "photo-1503341455253-b2e723bb3dbb",
      "photo-1487412720507-e7ab37603c6f",
      "photo-1463107971871-fbac9ddb920f",
      "photo-1519681393784-d120267933ba",
      "photo-1491557345352-5929e343eb89",
    ]),
  },
];

const kidsTemplates = [
  {
    name: "Neo Circuit Sweatshirt",
    category: "Sweatshirt",
    price: 999,
    original: 1799,
    accent: "linear-gradient(135deg,#ffe5d4,#ffc2ac)",
    gallery: buildGallery([
      "photo-1487412720507-e7ab37603c6f",
      "photo-1542291026-7eec264c27ff",
      "photo-1503341455253-b2e723bb3dbb",
      "photo-1491557345352-5929e343eb89",
      "photo-1503342250614-ca4407868a5b",
    ]),
  },
  {
    name: "Mono Sculpt Sweatshirt",
    category: "Sweatshirt",
    price: 999,
    original: 1799,
    accent: "linear-gradient(135deg,#dbe9ff,#7f9dff)",
    gallery: buildGallery([
      "photo-1434389677669-e08b4cac3105",
      "photo-1524504388940-b1c1722653e1",
      "photo-1512436991641-6745cdb1723f",
      "photo-1524502397800-2eeaad7c3fe5",
      "photo-1503342250614-ca4407868a5b",
    ]),
  },
  {
    name: "Nova Pop Sweatshirt",
    category: "Sweatshirt",
    price: 999,
    original: 1799,
    accent: "linear-gradient(135deg,#f6d365,#fda085)",
    gallery: buildGallery([
      "photo-1542291026-7eec264c27ff",
      "photo-1524504388940-b1c1722653e1",
      "photo-1503341455253-b2e723bb3dbb",
      "photo-1516251193007-45ef944ab0c6",
      "photo-1503342250614-ca4407868a5b",
    ]),
  },
  {
    name: "Pixel Bubbles Sweatshirt",
    category: "Sweatshirt",
    price: 999,
    original: 1799,
    accent: "linear-gradient(135deg,#c2ffd8,#465efb)",
    gallery: buildGallery([
      "photo-1507679799987-c73779587ccf",
      "photo-1521572163474-6864f9cf17ab",
      "photo-1491557345352-5929e343eb89",
      "photo-1503342250614-ca4407868a5b",
      "photo-1503341455253-b2e723bb3dbb",
    ]),
  },
];

const createProducts = (templates, count, audience) =>
  Array.from({ length: count }, (_, index) => {
    const template = templates[index % templates.length];
    const variant = (index + 1).toString().padStart(2, "0");
    return {
      id: `${audience}-${variant}`,
      audience,
      name: `${template.name} ${variant}`,
      category: template.category,
      price: template.price,
      original: template.original,
      accent: template.accent,
      gallery: template.gallery,
    };
  });

export const menProducts = createProducts(menTemplates, 20, "men");
export const womenProducts = createProducts(womenTemplates, 20, "women");
export const kidsProducts = createProducts(kidsTemplates, 20, "kids");

// Helper function to detect category from product name
const detectCategory = (name) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("hoodie")) return "Hoodie";
  if (lowerName.includes("sweatshirt")) return "Sweatshirt";
  if (lowerName.includes("t-shirt") || lowerName.includes("tee") || lowerName.includes("tshirt")) return "T-Shirt";
  return "Hoodie"; // Default fallback
};

// Helper function to detect audience from product name
const detectAudience = (name) => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("men") || lowerName.includes("men's")) return "men";
  if (lowerName.includes("women") || lowerName.includes("women's")) return "women";
  if (lowerName.includes("kids") || lowerName.includes("kid's") || lowerName.includes("children")) return "kids";
  return "men"; // Default fallback
};

// Helper function to generate unique ID
const generateId = (name, audience, category) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, "-").substring(0, 20);
  return `${audience}-${category.toLowerCase()}-${cleanName}-${timestamp}-${random}`;
};

// Manual products array - Add your custom products here!
// You can add products manually or use the addProduct() helper function below
const manualProducts = [
  // Example 1: Product with external image URL (Unsplash, etc.)
  // {
  //   id: "men-hoodie-custom-001",
  //   name: "Men's Premium Black Hoodie",
  //   category: "Hoodie",
  //   audience: "men",
  //   price: 1299,
  //   original: 2199,
  //   accent: "linear-gradient(135deg,#000000,#333333)",
  //   gallery: [
  //     "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1000&q=80",
  //   ],
  // },
  
  // Example 2: Product with LOCAL images (stored in public/products/ folder)
  // Step 1: Copy your images to public/products/ folder (e.g., men-hoodie-001.jpg)
  // Step 2: Reference them using /products/filename.jpg
  // {
  //   id: "men-hoodie-local-001",
  //   name: "Men's Custom Hoodie",
  //   category: "Hoodie",
  //   audience: "men",
  //   price: 1299,
  //   original: 2199,
  //   accent: "linear-gradient(135deg,#000000,#333333)",
  //   gallery: [
  //     "/products/men-hoodie-001.jpg",      // Local image from public/products/
  //     "/products/men-hoodie-002.jpg",      // Local image from public/products/
  //     "/products/men-hoodie-003.jpg",      // Local image from public/products/
  //   ],
  // },
];

// Helper function to add a product with auto-detection
// Usage: addProduct({ name: "Men's Premium Hoodie", price: 1099, original: 1999, gallery: [...] })
export const addProduct = (productData) => {
  const category = productData.category || detectCategory(productData.name);
  const audience = productData.audience || detectAudience(productData.name);
  const id = productData.id || generateId(productData.name, audience, category);
  
  const newProduct = {
    id,
    name: productData.name,
    category,
    audience,
    price: productData.price,
    original: productData.original,
    accent: productData.accent || "linear-gradient(135deg,#5c3d8a,#7a5bff)",
    gallery: productData.gallery || [],
  };
  
  manualProducts.push(newProduct);
  return newProduct;
};

// Combine all products
export const allProducts = [
  ...menProducts, 
  ...womenProducts, 
  ...kidsProducts,
  ...manualProducts
];

export const findProductById = (id) => allProducts.find((product) => product.id === id);

