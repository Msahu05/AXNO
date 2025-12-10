import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Utility function to generate slug from product name
export function generateSlug(name: string): string {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Get product URL (uses slug if available, falls back to id)
export function getProductUrl(product: { slug?: string; id?: string; _id?: string }): string {
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