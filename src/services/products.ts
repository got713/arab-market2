import { Product } from '../types';
import { db } from './db';

const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

export const ProductService = {
  getProducts: async (includeInactive = false): Promise<Product[]> => {
    await delay();
    const list = db.getProducts();
    return includeInactive ? list : list.filter((p) => p.active !== false);
  },

  getProductById: async (id: string): Promise<Product | null> => {
    await delay();
    const list = db.getProducts();
    return list.find((p) => p.id === id) || null;
  },

  getProductBySlug: async (slug: string): Promise<Product | null> => {
    await delay();
    const list = db.getProducts();
    return list.find((p) => p.slug === slug && p.active !== false) || null;
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    await delay();
    const list = db.getProducts();
    return list.filter((p) => p.featured && p.active !== false);
  },

  getBestSellers: async (): Promise<Product[]> => {
    await delay();
    const list = db.getProducts();
    return list.filter((p) => p.bestSeller && p.active !== false);
  },

  getProductsByCategory: async (categorySlug: string): Promise<Product[]> => {
    await delay();
    const list = db.getProducts();
    return list.filter(
      (p) => p.category.toLowerCase() === categorySlug.toLowerCase() && p.active !== false
    );
  },

  searchProducts: async (query: string): Promise<Product[]> => {
    await delay();
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const list = db.getProducts();
    return list.filter(
      (p) =>
        p.active !== false &&
        (p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.country.toLowerCase().includes(q) ||
          p.arabicName.includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)))
    );
  },

  createProduct: async (product: Omit<Product, 'id'>): Promise<Product> => {
    await delay();
    const list = db.getProducts();
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
    };
    list.unshift(newProduct);
    db.saveProducts(list);
    return newProduct;
  },

  updateProduct: async (product: Product): Promise<Product> => {
    await delay();
    const list = db.getProducts();
    const index = list.findIndex((p) => p.id === product.id);
    if (index === -1) throw new Error('Product not found');
    list[index] = product;
    db.saveProducts(list);
    return product;
  },

  deleteProduct: async (id: string): Promise<boolean> => {
    await delay();
    const list = db.getProducts();
    const filtered = list.filter((p) => p.id !== id);
    if (filtered.length === list.length) return false;
    db.saveProducts(filtered);
    return true;
  },
};
