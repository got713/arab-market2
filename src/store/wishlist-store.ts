import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../types';
import { ApiClient } from '../lib/api-client';

interface WishlistState {
  items: Product[];
  toggleWishlist: (product: Product) => Promise<void>;
  hasItem: (productId: string) => boolean;
  clearWishlist: () => void;
  fetchServerWishlist: () => Promise<void>;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      fetchServerWishlist: async () => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('am_token') : null;
        if (!token) return;
        try {
          const items = await ApiClient.get<Product[]>('/wishlist');
          set({ items: Array.isArray(items) ? items : [] });
        } catch (err) {
          console.error('Failed to fetch wishlist:', err);
        }
      },

      toggleWishlist: async (product) => {
        const token = typeof window !== 'undefined' ? localStorage.getItem('am_token') : null;
        if (token) {
          try {
            await ApiClient.post('/wishlist', { product_id: product.id });
            await get().fetchServerWishlist();
          } catch (err) {
            console.error(err);
          }
          return;
        }

        // Guest toggle fallback
        const items = get().items;
        const exists = items.some((item) => item.id === product.id);
        if (exists) {
          set({ items: items.filter((item) => item.id !== product.id) });
        } else {
          set({ items: [...items, product] });
        }
      },

      hasItem: (productId) => {
        return get().items.some((item) => item.id === productId);
      },

      clearWishlist: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'arab-market-wishlist',
    }
  )
);
