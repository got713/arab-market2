import { ApiClient } from '../lib/api-client';

export interface ShippingRate {
  id: string;
  name: string;
  arabicName: string;
  price: number;
  minDays: number;
  maxDays: number;
}

export const ShippingService = {
  checkAvailability: async (zip: string, locale: 'en' | 'ar' = 'en'): Promise<{
    available: boolean;
    rates: ShippingRate[];
  }> => {
    try {
      const isValid = /^\d{5}$/.test(zip);
      if (!isValid) {
        return { available: false, rates: [] };
      }

      const res = await ApiClient.post<any>('/checkout/shipping-rates', { zip }, undefined, locale);
      const rates = res.rates || [];

      if (rates.length === 0) {
        return { available: false, rates: [] };
      }

      const formatted = rates.map((r: any) => ({
        id: r.id,
        name: r.name,
        arabicName: r.name_ar || r.name,
        price: Number(r.cost),
        minDays: r.estimated_days,
        maxDays: r.estimated_days + 1,
      }));

      return {
        available: true,
        rates: formatted,
      };
    } catch (err) {
      return { available: false, rates: [] };
    }
  },
};
