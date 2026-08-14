'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useLocaleStore } from '@/store/locale-store';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useAuthStore } from '@/store/auth-store';
import { ProductService } from '@/services/products';
import { Product } from '@/types';
import Logo from '../ui/logo';
import ZipModal from './zip-modal';
import { categories } from '@/data/categories';
import { 
  Search, 
  MapPin, 
  User, 
  Heart, 
  ShoppingCart, 
  Globe, 
  ChevronDown, 
  TrendingUp,
  Store
} from 'lucide-react';

export default function Header() {
  const router = useRouter();
  const { locale, setLocale, t } = useLocaleStore();
  const { items: cartItems, shippingZip, isZipChecked, isDeliveryAvailable } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const { user, isAdmin, isAuthenticated, loginCustomer, logout } = useAuthStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isSuggestOpen, setIsSuggestOpen] = useState(false);
  const [isZipOpen, setIsZipOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const suggestRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  // Cart total items count
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlistItems.length;

  // Handle Search Suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length > 1) {
        const results = await ProductService.searchProducts(searchQuery);
        setSuggestions(results.slice(0, 5));
        setIsSuggestOpen(results.length > 0);
      } else {
        setSuggestions([]);
        setIsSuggestOpen(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside handlers
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (suggestRef.current && !suggestRef.current.contains(event.target as Node)) {
        setIsSuggestOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSuggestOpen(false);
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (slug: string) => {
    setSearchQuery('');
    setIsSuggestOpen(false);
    router.push(`/product/${slug}`);
  };

  // Demo Login utility
  const handleQuickLogin = (role: 'customer' | 'admin') => {
    if (role === 'admin') {
      loginAdmin();
      router.push('/admin');
    } else {
      loginCustomer('ahmed.masri@gmail.com', 'Ahmed Al-Masri');
      router.push('/account');
    }
    setIsAccountMenuOpen(false);
  };

  // Extra admin login helper inside store
  const loginAdmin = useAuthStore((state) => state.loginAdmin);

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-xs border-b border-light-border">
      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link href="/" className="flex-shrink-0">
          <Logo />
        </Link>

        {/* Search Bar container */}
        <div ref={suggestRef} className="hidden md:flex flex-1 max-w-2xl relative">
          <form onSubmit={handleSearchSubmit} className="w-full flex">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={t('header.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 rounded-l-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm rtl:pr-4 rtl:pl-10"
              />
              <Search className="absolute right-3.5 top-3 w-4.5 h-4.5 text-gray-400 pointer-events-none rtl:left-3.5 rtl:right-auto" />
            </div>
            <button
              type="submit"
              className="bg-primary hover:bg-primary-dark text-cream px-6 rounded-r-full font-medium text-sm transition-colors duration-150 rtl:rounded-r-none rtl:rounded-l-full"
            >
              {locale === 'ar' ? 'بحث' : 'Search'}
            </button>
          </form>

          {/* Search Suggestions Dropdown */}
          {isSuggestOpen && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-light-border rounded-xl shadow-lg overflow-hidden z-50 animate-fadeIn">
              <div className="p-2 border-b border-light-border text-xs text-gray-500 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-gold" />
                <span>{locale === 'ar' ? 'اقتراحات المنتجات' : 'Suggested Products'}</span>
              </div>
              <div className="divide-y divide-gray-100">
                {suggestions.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSuggestionClick(product.slug)}
                    className="w-full px-4 py-2.5 text-left rtl:text-right hover:bg-cream/40 flex items-center justify-between text-sm transition-colors"
                  >
                    <div>
                      <span className="font-semibold text-dark block">
                        {locale === 'ar' ? product.arabicName : product.name}
                      </span>
                      <span className="text-xs text-muted-text">{product.brand} • {product.weight}</span>
                    </div>
                    <span className="text-primary font-semibold text-xs bg-cream/70 px-2.5 py-1 rounded-md border border-light-border">
                      ${product.purchaseOptions.single.price}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions (ZIP, Account, Wishlist, Cart, Lang) */}
        <div className="flex items-center gap-4 sm:gap-6">
          {/* ZIP code button */}
          <button
            onClick={() => setIsZipOpen(true)}
            className="flex items-center gap-1.5 text-xs sm:text-sm text-dark hover:text-primary transition-colors text-left"
          >
            <MapPin className="w-4.5 h-4.5 text-gold flex-shrink-0" />
            <div className="hidden sm:block">
              <span className="block text-[10px] uppercase text-muted-text font-semibold leading-none">
                {t('header.zip_code')}
              </span>
              <span className="font-medium text-xs">
                {isZipChecked && isDeliveryAvailable ? shippingZip : t('header.enter_zip')}
              </span>
            </div>
          </button>

          {/* Account Dropdown */}
          <div ref={accountRef} className="relative">
            <button
              onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              className="flex items-center gap-1 text-dark hover:text-primary transition-colors py-1"
            >
              <User className="w-4.5 h-4.5 flex-shrink-0" />
              <span className="hidden lg:inline text-sm font-medium">
                {isAuthenticated ? (user?.name.split(' ')[0]) : t('header.account')}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500 hidden lg:inline" />
            </button>

            {isAccountMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-light-border rounded-xl shadow-lg py-2 z-50 animate-fadeIn rtl:left-0 rtl:right-auto">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-2 border-b border-light-border">
                      <span className="block text-xs text-muted-text">{t('account.welcome')}</span>
                      <span className="block font-semibold text-dark truncate">{user?.name}</span>
                    </div>
                    {isAdmin ? (
                      <Link
                        href="/admin"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-primary hover:bg-cream/40"
                      >
                        <Store className="w-4 h-4 text-gold" />
                        <span>{t('nav.admin')}</span>
                      </Link>
                    ) : (
                      <Link
                        href="/account"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="block px-4 py-2.5 text-sm text-dark hover:bg-cream/40"
                      >
                        {t('account.title')}
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        setIsAccountMenuOpen(false);
                        router.push('/');
                      }}
                      className="w-full text-left rtl:text-right px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-light-border mt-1"
                    >
                      {t('account.logout')}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-2 border-b border-light-border text-center">
                      <span className="block text-xs text-muted-text mb-2">
                        {locale === 'ar' ? 'دخول سريع تجريبي' : 'Demo Quick Logins'}
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => handleQuickLogin('customer')}
                          className="bg-primary text-cream px-2 py-1.5 text-xs font-semibold rounded-md hover:bg-primary-dark transition-colors"
                        >
                          {locale === 'ar' ? 'عميل' : 'Customer'}
                        </button>
                        <button
                          onClick={() => handleQuickLogin('admin')}
                          className="bg-gold text-dark px-2 py-1.5 text-xs font-semibold rounded-md hover:bg-gold-light transition-colors"
                        >
                          {locale === 'ar' ? 'مسؤول' : 'Admin'}
                        </button>
                      </div>
                    </div>
                    <Link
                      href="/account"
                      onClick={() => setIsAccountMenuOpen(false)}
                      className="block px-4 py-2.5 text-sm text-dark hover:bg-cream/40"
                    >
                      {locale === 'ar' ? 'الذهاب لصفحة الدخول' : 'Go to Login Page'}
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Wishlist Link */}
          <Link
            href="/wishlist"
            className="relative p-1 text-dark hover:text-primary transition-colors"
            title={t('header.wishlist')}
          >
            <Heart className="w-4.5 h-4.5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1.5 bg-gold text-dark font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Link */}
          <Link
            href="/cart"
            className="relative p-1 text-dark hover:text-primary transition-colors"
            title={t('header.cart')}
          >
            <ShoppingCart className="w-4.5 h-4.5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1.5 bg-primary text-cream font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Language Switcher */}
          <button
            onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
            className="flex items-center gap-1.5 text-sm text-primary font-bold hover:text-gold transition-colors py-1 pl-1 border-l border-light-border rtl:border-l-0 rtl:border-r rtl:pr-1"
          >
            <Globe className="w-4 h-4" />
            <span>{locale === 'en' ? 'العربية' : 'EN'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="px-4 py-2.5 bg-white border-t border-light-border md:hidden relative">
        <form onSubmit={handleSearchSubmit} className="w-full flex">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={t('header.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 rounded-l-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs rtl:pr-4 rtl:pl-10"
            />
            <Search className="absolute right-3.5 top-2.5 w-4 h-4 text-gray-400 pointer-events-none rtl:left-3.5 rtl:right-auto" />
          </div>
          <button
            type="submit"
            className="bg-primary hover:bg-primary-dark text-cream px-4 rounded-r-full font-semibold text-xs transition-colors duration-150 rtl:rounded-r-none rtl:rounded-l-full"
          >
            {locale === 'ar' ? 'بحث' : 'Search'}
          </button>
        </form>

        {/* Mobile Suggestions Dropdown */}
        {isSuggestOpen && suggestions.length > 0 && (
          <div className="absolute left-4 right-4 top-full mt-1 bg-white border border-light-border rounded-xl shadow-lg overflow-hidden z-50">
            <div className="divide-y divide-gray-100">
              {suggestions.map((product) => (
                <button
                  key={product.id}
                  onClick={() => {
                    handleSuggestionClick(product.slug);
                    setIsSuggestOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left rtl:text-right hover:bg-cream/40 flex items-center justify-between text-xs transition-colors"
                >
                  <div>
                    <span className="font-semibold text-dark block">
                      {locale === 'ar' ? product.arabicName : product.name}
                    </span>
                    <span className="text-[10px] text-muted-text">{product.brand} • {product.weight}</span>
                  </div>
                  <span className="text-primary font-semibold text-[10px] bg-cream/70 px-2 py-0.5 rounded-md border border-light-border">
                    ${product.purchaseOptions.single.price}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sub navigation bar (Categories & Pages) */}
      <div className="bg-cream border-t border-light-border overflow-x-auto no-scrollbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between py-2 text-xs sm:text-sm font-semibold tracking-wide gap-6 whitespace-nowrap">
          <div className="flex items-center gap-4 sm:gap-6 relative">
            <Link href="/" className="text-dark hover:text-primary transition-colors">
              {t('nav.home')}
            </Link>
            {/* Shop with Mega Menu Toggle */}
            <div 
              className="relative"
              onMouseEnter={() => setIsMegaMenuOpen(true)}
              onMouseLeave={() => setIsMegaMenuOpen(false)}
            >
              <Link 
                href="/shop" 
                className="text-dark hover:text-primary transition-colors flex items-center gap-1 py-1 focus:outline-none"
                onClick={() => setIsMegaMenuOpen(false)}
              >
                <span>{t('nav.shop')}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              </Link>
              
              {/* Mega Menu Dropdown */}
              {isMegaMenuOpen && (
                <div 
                  className="absolute top-full ltr:left-0 rtl:right-0 ltr:right-auto rtl:left-auto z-50 bg-white border border-light-border rounded-xl shadow-xl p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 text-xs sm:text-sm mt-1 fade-in"
                  style={{ minWidth: '780px' }}
                >
                  {categories.map((cat) => (
                    <div key={cat.slug} className="space-y-2.5 whitespace-normal" style={{ minWidth: '110px' }}>
                      <Link
                        href={`/category/${cat.slug}`}
                        onClick={() => setIsMegaMenuOpen(false)}
                        className="font-bold text-primary hover:text-gold transition-colors block border-b border-light-border pb-1 text-xs"
                      >
                        {locale === 'ar' ? cat.arabicName : cat.name}
                      </Link>
                      <div className="flex flex-col gap-1 text-[10px] sm:text-[11px] text-gray-500 font-medium">
                        {cat.subcategories.map((sub) => (
                          <Link
                            key={sub.slug}
                            href={`/shop?category=${cat.slug}`}
                            onClick={() => setIsMegaMenuOpen(false)}
                            className="hover:text-primary transition-colors py-0.5"
                          >
                            {locale === 'ar' ? sub.arabicName : sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Link href="/shop?filter=deals" className="text-dark hover:text-primary transition-colors">
              {t('nav.deals')}
            </Link>
            <Link href="/shop?filter=bestseller" className="text-dark hover:text-primary transition-colors">
              {t('nav.bestsellers')}
            </Link>
            <Link href="/shop?sort=newest" className="text-dark hover:text-primary transition-colors">
              {t('nav.newarrivals')}
            </Link>
          </div>

          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-wider">
            <Link href="/track-order" className="text-gold hover:text-primary transition-colors">
              {t('nav.track')}
            </Link>
            <Link href="/about" className="text-gray-500 hover:text-primary transition-colors">
              {t('nav.about')}
            </Link>
          </div>
        </div>
      </div>

      <ZipModal isOpen={isZipOpen} onClose={() => setIsZipOpen(false)} />
    </header>
  );
}
