import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Utility function to generate slug from product name
export function generateSlug(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Get product URL (uses slug if available, falls back to id)
export function getProductUrl(product) {
  if (product.slug) {
    return `/product/${product.slug}`;
  }
  // Fallback to id if slug not available
  const productId = product.id || product._id;
  if (productId) {
    return `/product/${productId}`;
  }
  return '/';
}
