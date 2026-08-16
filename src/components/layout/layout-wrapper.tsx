'use client';

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from './header';
import Footer from './footer';
import MobileNav from './mobile-nav';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');
  const fetchServerCart = useCartStore((state) => state.fetchServerCart);
  const fetchServerWishlist = useWishlistStore((state) => state.fetchServerWishlist);

  useEffect(() => {
    fetchServerCart();
    fetchServerWishlist();
  }, []);

  if (isAdminRoute) {
    return <div className="min-h-screen bg-gray-50 flex flex-col">{children}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-1 flex flex-col pb-16 md:pb-0">{children}</main>
      <Footer />
      <MobileNav />
    </div>
  );
}
