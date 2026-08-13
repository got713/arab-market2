import { Coupon } from '../types';
import { db } from './db';

const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

export const CouponService = {
  getCoupons: async (): Promise<Coupon[]> => {
    await delay();
    return db.getCoupons();
  },

  validateCoupon: async (code: string, subtotal: number): Promise<{
    valid: boolean;
    coupon: Coupon | null;
    error?: string;
  }> => {
    await delay(200);
    const coupons = db.getCoupons();
    const c = coupons.find((item) => item.code.toUpperCase() === code.trim().toUpperCase());

    if (!c) {
      return { valid: false, coupon: null, error: 'Coupon code not found.' };
    }

    // Check expiration date
    const today = new Date().toISOString().split('T')[0];
    if (c.expires < today) {
      return { valid: false, coupon: null, error: 'Coupon code has expired.' };
    }

    // Check usage limits
    if (c.usageCount >= c.maxUsage) {
      return { valid: false, coupon: null, error: 'Coupon code has reached its usage limit.' };
    }

    // Check minimum order limits
    if (subtotal < c.minOrder) {
      return {
        valid: false,
        coupon: null,
        error: `Minimum order of $${c.minOrder.toFixed(2)} is required to use this coupon.`,
      };
    }

    return { valid: true, coupon: c };
  },

  createCoupon: async (coupon: Coupon): Promise<Coupon> => {
    await delay();
    const coupons = db.getCoupons();
    // Check if duplicate
    const index = coupons.findIndex((c) => c.code.toUpperCase() === coupon.code.toUpperCase());
    if (index > -1) {
      throw new Error('Coupon code already exists.');
    }
    coupons.unshift(coupon);
    db.saveCoupons(coupons);
    return coupon;
  },

  deleteCoupon: async (code: string): Promise<boolean> => {
    await delay();
    const coupons = db.getCoupons();
    const filtered = coupons.filter((c) => c.code.toUpperCase() !== code.toUpperCase());
    if (filtered.length === coupons.length) return false;
    db.saveCoupons(filtered);
    return true;
  },

  incrementCouponUsage: async (code: string): Promise<boolean> => {
    const coupons = db.getCoupons();
    const index = coupons.findIndex((c) => c.code.toUpperCase() === code.toUpperCase());
    if (index === -1) return false;
    coupons[index].usageCount += 1;
    db.saveCoupons(coupons);
    return true;
  },
};
