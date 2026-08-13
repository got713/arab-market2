import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product, Coupon } from '../types';

interface CartState {
  items: CartItem[];
  appliedCoupon: Coupon | null;
  shippingOption: 'standard' | 'express';
  shippingZip: string;
  isZipChecked: boolean;
  isDeliveryAvailable: boolean;
  
  addToCart: (product: Product, option: 'single' | 'pack' | 'case', quantity?: number) => void;
  removeFromCart: (productId: string, option: 'single' | 'pack' | 'case') => void;
  updateQuantity: (productId: string, option: 'single' | 'pack' | 'case', quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (coupon: Coupon | null) => void;
  setShippingOption: (option: 'standard' | 'express') => void;
  checkZip: (zip: string) => { available: boolean; standardRate: number; expressRate: number };
  resetZip: () => void;
  
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

      addToCart: (product, option, quantity = 1) => {
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

      removeFromCart: (productId, option) => {
        const items = get().items.filter(
          (item) => !(item.product.id === productId && item.option === option)
        );
        set({ items });
      },

      updateQuantity: (productId, option, quantity) => {
        if (quantity <= 0) {
          get().removeFromCart(productId, option);
          return;
        }
        const items = get().items.map((item) =>
          item.product.id === productId && item.option === option
            ? { ...item, quantity }
            : item
        );
        set({ items });
      },

      clearCart: () => {
        set({ items: [], appliedCoupon: null, shippingOption: 'standard' });
      },

      applyCoupon: (coupon) => {
        set({ appliedCoupon: coupon });
      },

      setShippingOption: (shippingOption) => {
        set({ shippingOption });
      },

      checkZip: (zip) => {
        // Mock ZIP validation
        // Assume ZIP code starting with '0' (e.g. some eastern parts) or '99' might be unavailable, or just check length
        const isValid = /^\d{5}$/.test(zip);
        const isSupported = isValid && !zip.startsWith('00') && !zip.startsWith('999');

        set({
          shippingZip: zip,
          isZipChecked: true,
          isDeliveryAvailable: isSupported,
        });

        return {
          available: isSupported,
          standardRate: 7.99,
          expressRate: 14.99,
        };
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
        return (subtotal * coupon.discountPercent) / 100;
      },

      getShippingCost: () => {
        const subtotal = get().getSubtotal();
        // Free shipping for orders >= $50 (after discount)
        const subtotalAfterDiscount = subtotal - get().getDiscountAmount();
        
        if (subtotalAfterDiscount <= 0 || !get().isDeliveryAvailable) {
          return 0;
        }

        if (subtotalAfterDiscount >= 50 && get().shippingOption === 'standard') {
          return 0; // Free Standard shipping
        }

        return get().shippingOption === 'express' ? 14.99 : 7.99;
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
