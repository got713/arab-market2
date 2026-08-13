import { Product, Order, Customer, Coupon } from '../types';
import { products as initialProducts, mockCoupons as initialCoupons } from '../data/products';
import { seedOrders as initialOrders } from '../data/orders';
import { seedCustomers as initialCustomers } from '../data/customers';

// Safe check for browser environment
const isClient = typeof window !== 'undefined';

const KEYS = {
  PRODUCTS: 'arab_market_products',
  ORDERS: 'arab_market_orders',
  CUSTOMERS: 'arab_market_customers',
  COUPONS: 'arab_market_coupons',
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
  },

  getProducts: (): Product[] => {
    if (!isClient) return initialProducts;
    db.init();
    const data = localStorage.getItem(KEYS.PRODUCTS);
    return data ? JSON.parse(data) : initialProducts;
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
  }
};
