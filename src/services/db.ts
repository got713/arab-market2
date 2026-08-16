import { Product, Order, Customer, Coupon, Category } from '../types';
import { products as initialProducts, mockCoupons as initialCoupons } from '../data/products';
import { seedOrders as initialOrders } from '../data/orders';
import { seedCustomers as initialCustomers } from '../data/customers';
import { categories as staticCategories } from '../data/categories';

// Safe check for browser environment
const isClient = typeof window !== 'undefined';

const KEYS = {
  PRODUCTS: 'arab_market_products',
  ORDERS: 'arab_market_orders',
  CUSTOMERS: 'arab_market_customers',
  COUPONS: 'arab_market_coupons',
  CATEGORIES: 'arab_market_categories',
};

export const db = {
  init: () => {
    if (!isClient) return;
    
    if (!localStorage.getItem(KEYS.PRODUCTS)) {
      localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(initialProducts));
    }
    if (!localStorage.getItem(KEYS.ORDERS)) {
      localStorage.setItem(KEYS.ORDERS, JSON.stringify(initialOrders));
    }
    if (!localStorage.getItem(KEYS.CUSTOMERS)) {
      localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(initialCustomers));
    }
    if (!localStorage.getItem(KEYS.COUPONS)) {
      localStorage.setItem(KEYS.COUPONS, JSON.stringify(initialCoupons));
    }
    if (!localStorage.getItem(KEYS.CATEGORIES)) {
      const seeded = staticCategories.map((c, cIdx) => ({
        ...c,
        active: true,
        featured: true,
        displayOrder: cIdx * 10,
        subcategories: (c.subcategories || []).map((s, sIdx) => ({
          ...s,
          active: true,
          displayOrder: sIdx * 10,
        })),
      }));
      localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(seeded));
    }
  },

  getProducts: (): Product[] => {
    if (!isClient) return initialProducts;
    db.init();
    const data = localStorage.getItem(KEYS.PRODUCTS);
    const products: Product[] = data ? JSON.parse(data) : initialProducts;
    // Migration: backfill enabled:true on purchaseOptions that don't have it yet
    return products.map((p) => ({
      ...p,
      purchaseOptions: {
        single: { ...p.purchaseOptions.single, enabled: p.purchaseOptions.single.enabled ?? true  },
        pack:   { ...p.purchaseOptions.pack,   enabled: p.purchaseOptions.pack.enabled   ?? true  },
        case:   { ...p.purchaseOptions.case,   enabled: p.purchaseOptions.case.enabled   ?? true  },
      },
    }));
  },

  saveProducts: (products: Product[]) => {
    if (!isClient) return;
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  },

  getOrders: (): Order[] => {
    if (!isClient) return initialOrders;
    db.init();
    const data = localStorage.getItem(KEYS.ORDERS);
    return data ? JSON.parse(data) : initialOrders;
  },

  saveOrders: (orders: Order[]) => {
    if (!isClient) return;
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
  },

  getCustomers: (): Customer[] => {
    if (!isClient) return initialCustomers;
    db.init();
    const data = localStorage.getItem(KEYS.CUSTOMERS);
    return data ? JSON.parse(data) : initialCustomers;
  },

  saveCustomers: (customers: Customer[]) => {
    if (!isClient) return;
    localStorage.setItem(KEYS.CUSTOMERS, JSON.stringify(customers));
  },

  getCoupons: (): Coupon[] => {
    if (!isClient) return initialCoupons;
    db.init();
    const data = localStorage.getItem(KEYS.COUPONS);
    return data ? JSON.parse(data) : initialCoupons;
  },

  saveCoupons: (coupons: Coupon[]) => {
    if (!isClient) return;
    localStorage.setItem(KEYS.COUPONS, JSON.stringify(coupons));
  },

  getCategories: (): Category[] => {
    if (!isClient) {
      return staticCategories.map((c, cIdx) => ({
        ...c,
        active: true,
        featured: true,
        displayOrder: cIdx * 10,
        subcategories: (c.subcategories || []).map((s, sIdx) => ({
          ...s,
          active: true,
          displayOrder: sIdx * 10,
        })),
      }));
    }
    db.init();
    const data = localStorage.getItem(KEYS.CATEGORIES);
    if (!data) return [];
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  saveCategories: (categories: Category[]) => {
    if (!isClient) return;
    localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories));
  }
};
