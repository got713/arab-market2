import { Coupon } from '../types';
import { ApiClient } from '../lib/api-client';

export const CouponService = {
  getCoupons: async (locale: 'en' | 'ar' = 'en'): Promise<Coupon[]> => {
    try {
      const res = await ApiClient.get<any[]>('/admin/coupons', undefined, locale);
      return res.map(c => CouponService.formatCoupon(c));
    } catch (err) {
      return [];
    }
  },

  validateCoupon: async (code: string, subtotal: number, locale: 'en' | 'ar' = 'en'): Promise<{
    valid: boolean;
    coupon: Coupon | null;
    // The server's actual calculated discount for the given subtotal — use
    // this for any customer-facing "you saved $X" message. Never derive that
    // number from coupon.value/type client-side; that's only for the live
    // cart-summary line, which the backend independently recomputes and
    // enforces again at checkout (see OrderController::store).
    discountAmount: number;
    error?: string;
  }> => {
    try {
      const res = await ApiClient.post<any>('/coupons/validate', {
        code,
        order_subtotal: subtotal
      }, undefined, locale);

      if (res.valid) {
        return {
          valid: true,
          coupon: {
            code: res.code,
            type: res.type,
            value: res.value,
            minOrder: res.min_order_amount ?? 0,
            expires: '', // handled backend
            maxUsage: 9999,
            usageCount: 0,
            active: true
          },
          discountAmount: Number(res.discount_amount) || 0,
        };
      }
      return { valid: false, coupon: null, discountAmount: 0, error: res.message };
    } catch (err: any) {
      return { valid: false, coupon: null, discountAmount: 0, error: err.message || 'Invalid coupon.' };
    }
  },

  createCoupon: async (coupon: Coupon, locale: 'en' | 'ar' = 'en'): Promise<Coupon> => {
    const payload = {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      min_order_amount: coupon.minOrder,
      max_usages: coupon.maxUsage,
      active: coupon.active,
      expires_at: coupon.expires ? `${coupon.expires} 23:59:59` : null
    };

    const res = await ApiClient.post<any>('/admin/coupons', payload, undefined, locale);
    return CouponService.formatCoupon(res);
  },

  deleteCoupon: async (code: string, locale: 'en' | 'ar' = 'en'): Promise<boolean> => {
    try {
      const coupons = await ApiClient.get<any[]>('/admin/coupons', undefined, locale);
      const found = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
      if (!found) return false;
      
      await ApiClient.delete(`/admin/coupons/${found.id}`, undefined, locale);
      return true;
    } catch (err) {
      return false;
    }
  },

  incrementCouponUsage: async (code: string): Promise<boolean> => {
    // Handled automatically on the Laravel backend when order is placed.
    return true;
  },

  formatCoupon: (c: any): Coupon => {
    return {
      code: c.code,
      type: c.type,
      value: (floatOrNum => Number(floatOrNum))(c.value),
      minOrder: (floatOrNum => Number(floatOrNum))(c.min_order_amount),
      expires: c.expires_at ? c.expires_at.split('T')[0] : '',
      maxUsage: c.max_usages ?? 999,
      usageCount: c.usage_count ?? 0,
      active: Boolean(c.active)
    };
  }
};
