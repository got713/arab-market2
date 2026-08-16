import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, Coupon } from '../types';
import { ApiClient } from '../lib/api-client';

interface CartState {
  items: CartItem[];
  appliedCoupon: Coupon | null;
  shippingOption: 'standard' | 'express';
  shippingZip: string;
  isZipChecked: boolean;
  isDeliveryAvailable: boolean;
  freeShippingThreshold: number;
  // Real, admin-configured prices fetched from /checkout/shipping-rates —
  // never hardcoded. Defaults here are only a pre-zip-check display fallback;
  // the backend is always what actually gets charged (see
  // OrderController::resolveShippingCost).
  standardRate: number;
  expressRate: number;
  
  addToCart: (product: Product, option: 'single' | 'pack' | 'case', quantity?: number) => Promise<void>;
  removeFromCart: (productId: string, option: 'single' | 'pack' | 'case') => Promise<void>;
  updateQuantity: (productId: string, option: 'single' | 'pack' | 'case', quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (coupon: Coupon | null) => void;
  setShippingOption: (option: 'standard' | 'express') => void;
  checkZip: (zip: string) => Promise<{ available: boolean; standardRate: number; expressRate: number }>;
  resetZip: () => void;
  fetchServerCart: () => Promise<void>;
  syncCartWithServer: () => Promise<void>;
  
  // Computations
  getSubtotal: () => number;
  getDiscountAmount: () => number;
  getShippingCost: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      appliedCoupon: null,
      shippingOption: 'standard',
      shippingZip: '',
      isZipChecked: false,
      isDeliveryAvailable: false,
      freeShippingThreshold: 50,
      standardRate: 7.99,
      expressRate: 14.99,

      fetchServerCart: async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('am_token') : null;
        if (!token) return;
        try {
          const res = await ApiClient.get<any>('/cart');
          if (res && Array.isArray(res.items)) {
            set({ items: res.items });
          }
        } catch (err) {
          console.error('Failed to fetch server cart:', err);
        }
      },

      syncCartWithServer: async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('am_token') : null;
        if (!token) return;
        const localItems = get().items;
        if (localItems.length === 0) {
          await get().fetchServerCart();
          return;
        }

        try {
          const payload = {
            items: localItems.map(item => ({
              product_id: item.product.id,
              option: item.option,
              quantity: item.quantity,
            }))
          };
          const res = await ApiClient.post<any>('/cart/sync', payload);
          if (res && Array.isArray(res.items)) {
            set({ items: res.items });
          }
        } catch (err) {
          console.error('Failed to sync cart:', err);
        }
      },

      addToCart: async (product, option, quantity = 1) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('am_token') : null;
        if (token) {
          try {
            const res = await ApiClient.post<any>('/cart/add', {
              product_id: product.id,
              option,
              quantity,
            });
            if (res && Array.isArray(res.items)) {
              set({ items: res.items });
            }
          } catch (err: any) {
            alert(err.message || 'Failed to add to cart.');
          }
          return;
        }

        // Guest local storage fallback
        const items = [...get().items];
        const existingIndex = items.findIndex(
          (item) => item.product.id === product.id && item.option === option
        );

        if (existingIndex > -1) {
          items[existingIndex].quantity += quantity;
        } else {
          items.push({ product, option, quantity });
        }

        set({ items });
      },

      removeFromCart: async (productId, option) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('am_token') : null;
        if (token) {
          try {
            // Find item.id from db cart
            const item = get().items.find(i => i.product.id === productId && i.option === option);
            if (item && item.id) {
              const res = await ApiClient.delete<any>(`/cart/items/${item.id}`);
              if (res && Array.isArray(res.items)) {
                set({ items: res.items });
              }
            }
          } catch (err) {
            console.error(err);
          }
          return;
        }

        // Guest filter
        const items = get().items.filter(
          (item) => !(item.product.id === productId && item.option === option)
        );
        set({ items });
      },

      updateQuantity: async (productId, option, quantity) => {
        if (quantity <= 0) {
          await get().removeFromCart(productId, option);
          return;
        }

        const token = typeof window !== 'undefined' ? localStorage.getItem('am_token') : null;
        if (token) {
          try {
            const item = get().items.find(i => i.product.id === productId && i.option === option);
            if (item && item.id) {
              const res = await ApiClient.put<any>(`/cart/items/${item.id}`, {
                quantity,
                option
              });
              if (res && Array.isArray(res.items)) {
                set({ items: res.items });
              }
            }
          } catch (err: any) {
            alert(err.message || 'Failed to update quantity.');
          }
          return;
        }

        // Guest local storage fallback
        const items = get().items.map((item) =>
          item.product.id === productId && item.option === option
            ? { ...item, quantity }
            : item
        );
        set({ items });
      },

      clearCart: async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('am_token') : null;
        if (token) {
          try {
            await ApiClient.post('/cart/clear');
          } catch (err) {
            console.error(err);
          }
        }
        set({ items: [], appliedCoupon: null, shippingOption: 'standard' });
      },

      applyCoupon: (coupon) => {
        set({ appliedCoupon: coupon });
      },

      setShippingOption: (shippingOption) => {
        set({ shippingOption });
      },

      checkZip: async (zip) => {
        const isValid = /^\d{5}$/.test(zip);
        if (!isValid) {
          set({ shippingZip: zip, isZipChecked: true, isDeliveryAvailable: false });
          return { available: false, standardRate: 0, expressRate: 0 };
        }

        try {
          const res = await ApiClient.post<any>('/checkout/shipping-rates', { zip });
          const rates = res.rates || [];
          const standard = Number(rates.find((r: any) => r.id === 'standard')?.cost ?? get().standardRate);
          const express = Number(rates.find((r: any) => r.id === 'express')?.cost ?? get().expressRate);

          set({
            shippingZip: zip,
            isZipChecked: true,
            isDeliveryAvailable: true,
            standardRate: standard,
            expressRate: express,
          });

          return {
            available: true,
            standardRate: standard,
            expressRate: express,
          };
        } catch (err) {
          set({ shippingZip: zip, isZipChecked: true, isDeliveryAvailable: false });
          return { available: false, standardRate: 0, expressRate: 0 };
        }
      },

      resetZip: () => {
        set({
          shippingZip: '',
          isZipChecked: false,
          isDeliveryAvailable: false,
        });
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => {
          const price = item.product.purchaseOptions[item.option].price;
          return sum + price * item.quantity;
        }, 0);
      },

      getDiscountAmount: () => {
        const subtotal = get().getSubtotal();
        const coupon = get().appliedCoupon;
        if (!coupon || subtotal < coupon.minOrder) return 0;
        if (coupon.type === 'fixed') {
          return Math.min(coupon.value ?? 0, subtotal);
        }
        const percent = coupon.discountPercent ?? coupon.value ?? 0;
        return (subtotal * percent) / 100;
      },

      getShippingCost: () => {
        const subtotal = get().getSubtotal();
        const subtotalAfterDiscount = subtotal - get().getDiscountAmount();
        
        if (subtotalAfterDiscount <= 0 || !get().isDeliveryAvailable) {
          return 0;
        }

        return get().shippingOption === 'express' ? get().expressRate : get().standardRate;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscountAmount();
        const shipping = get().getShippingCost();
        return Math.max(0, subtotal - discount + shipping);
      },
    }),
    {
      name: 'arab-market-cart',
    }
  )
);
