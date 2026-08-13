'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocaleStore } from '@/store/locale-store';
import { useCartStore } from '@/store/cart-store';
import { Home, Grid, Search, ShoppingCart, User } from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();
  const t = useLocaleStore((state) => state.t);
  const cartItems = useCartStore((state) => state.items);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Helper to determine if link is active
  const isActive = (path: string) => {
    if (path === '/' && pathname !== '/') return false;
    return pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-light-border shadow-lg md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {/* Home */}
        <Link
          href="/"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isActive('/') ? 'text-primary font-bold' : 'text-gray-500 hover:text-primary'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-wide">{t('nav.home')}</span>
        </Link>

        {/* Categories / Shop */}
        <Link
          href="/shop"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isActive('/shop') || isActive('/category') ? 'text-primary font-bold' : 'text-gray-500 hover:text-primary'
          }`}
        >
          <Grid className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-wide">{t('nav.categories')}</span>
        </Link>

        {/* Search */}
        <Link
          href="/search"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isActive('/search') ? 'text-primary font-bold' : 'text-gray-500 hover:text-primary'
          }`}
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-wide">{locale === 'ar' ? 'بحث' : 'Search'}</span>
        </Link>
        
        {/* Cart */}
        <Link
          href="/cart"
          className={`flex flex-col items-center justify-center flex-1 py-1 relative transition-colors ${
            isActive('/cart') ? 'text-primary font-bold' : 'text-gray-500 hover:text-primary'
          }`}
        >
          <ShoppingCart className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-wide">{t('header.cart')}</span>
          {cartCount > 0 && (
            <span className="absolute top-1.5 right-1/2 translate-x-4 bg-primary text-cream font-bold text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-white">
              {cartCount}
            </span>
          )}
        </Link>

        {/* Account */}
        <Link
          href="/account"
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
            isActive('/account') || isActive('/admin') ? 'text-primary font-bold' : 'text-gray-500 hover:text-primary'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-wide">{t('header.account')}</span>
        </Link>
      </div>
    </nav>
  );
}

// Quick locale check helper since mobile nav is Client Component
const locale = typeof window !== 'undefined' ? document.documentElement.lang : 'en';
