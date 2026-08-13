'use client';

import React from 'react';
import Link from 'next/link';
import { useWishlistStore } from '@/store/wishlist-store';
import { useLocaleStore } from '@/store/locale-store';
import ProductCard from '@/components/products/product-card';
import { Heart, ShoppingBag } from 'lucide-react';

export default function WishlistPage() {
  const { t, locale } = useLocaleStore();
  const wishlistItems = useWishlistStore((state) => state.items);

  if (wishlistItems.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6 fade-in">
        <div className="w-16 h-16 rounded-full bg-cream mx-auto flex items-center justify-center text-primary border border-gold/20">
          <Heart className="w-8 h-8 text-gold" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-dark">{t('header.wishlist')}</h1>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            {locale === 'ar' ? 'لم تقم بحفظ أي منتجات في قائمتك المفضلة بعد.' : 'You haven\'t saved any items to your wishlist yet.'}
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-cream font-bold rounded-lg hover:bg-primary-dark transition-colors text-sm"
        >
          <span>{locale === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in space-y-8">
      <div className="border-b border-light-border pb-4 flex items-center justify-between">
        <h1 className="text-2xl sm:text-4xl font-bold text-dark">
          {t('header.wishlist')}
        </h1>
        <span className="text-xs text-muted-text">
          {locale === 'ar' ? `تحتوي قائمتك ${wishlistItems.length} منتجاً` : `You have ${wishlistItems.length} items saved`}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {wishlistItems.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
