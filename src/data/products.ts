export type Audience = "men" | "women" | "kids";

export interface Product {
  id: string;
  audience: Audience;
  name: string;
  category: string;
  price: number;
  original: number;
  accent: string;
  gallery: string[];
}

interface ProductTemplate {
  name: string;
  category: string;
  price: number;
  original: number;
  accent: string;
  gallery: string[];
}

const buildGallery = (imageIds: string[]) =>
  imageIds.map((id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1000&q=80`);

const menTemplates: ProductTemplate[] = [
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

const womenTemplates: ProductTemplate[] = [
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

const kidsTemplates: ProductTemplate[] = [
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

const createProducts = (templates: ProductTemplate[], count: number, audience: Audience): Product[] =>
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

export const allProducts: Product[] = [...menProducts, ...womenProducts, ...kidsProducts];

export const findProductById = (id: string) => allProducts.find((product) => product.id === id);

