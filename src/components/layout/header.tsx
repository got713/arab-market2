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
import { Category } from '@/types';
import { CategoryService } from '@/services/categories';
import { 
  Search, 
  MapPin, 
  User, 
  Heart, 
  ShoppingCart, 
  Globe, 
  ChevronDown, 
  TrendingUp,
  Store,
  Home,
  LogOut,
  HelpCircle,
  Menu,
  X,
  Package
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  
  const suggestRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const catDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch dynamic categories on mount
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const list = await CategoryService.getCategories(false);
        setCategoriesList(list);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCats();
  }, []);

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

    const timer = setTimeout(fetchSuggestions, 150);
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
      if (catDropdownRef.current && !catDropdownRef.current.contains(event.target as Node)) {
        setIsCategoriesDropdownOpen(false);
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

  const syncCartWithServer = useCartStore((state) => state.syncCartWithServer);

  // Demo Login utility
  const handleQuickLogin = async (role: 'customer' | 'admin') => {
    try {
      if (role === 'admin') {
        await loginAdmin();
        await syncCartWithServer();
        router.push('/admin');
      } else {
        await loginCustomer();
        await syncCartWithServer();
        router.push('/account');
      }
    } catch (err) {
      console.error(err);
    }
    setIsAccountMenuOpen(false);
  };

  const loginAdmin = useAuthStore((state) => state.loginAdmin);

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-light-border shadow-xs">
      
      {/* 1. TOP UTILITY BAR (Desktop Only) */}
      <div className="hidden md:block bg-[#FAF7F0] border-b border-light-border/60 py-1.5 text-xs text-dark/85">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-1.5 hover:text-primary font-bold transition-colors font-cairo"
            >
              <Globe className="w-3.5 h-3.5 text-gold" />
              <span>{locale === 'en' ? 'العربية' : 'English'}</span>
            </button>
            <span className="text-light-border font-light">|</span>
            <button
              onClick={() => setIsZipOpen(true)}
              className="flex items-center gap-1 hover:text-primary transition-colors font-semibold"
            >
              <MapPin className="w-3.5 h-3.5 text-gold" />
              <span>
                {isZipChecked && isDeliveryAvailable ? `${t('header.zip_code')}: ${shippingZip}` : t('header.enter_zip')}
              </span>
            </button>
          </div>
          <div className="flex items-center gap-4 font-bold">
            <Link href="/track-order" className="hover:text-primary transition-colors">
              {locale === 'ar' ? 'تتبع الطلب' : 'Track Order'}
            </Link>
            <span className="text-light-border font-light">|</span>
            <Link href="/faq" className="hover:text-primary transition-colors flex items-center gap-1">
              <HelpCircle className="w-3.5 h-3.5 text-gold" />
              <span>{locale === 'ar' ? 'مساعدة' : 'Help'}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. MAIN HEADER */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        
        {/* Left: Hamburger menu for mobile + Logo */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 text-dark hover:text-primary transition-colors rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link href="/" className="flex-shrink-0">
            <Logo />
          </Link>
        </div>

        {/* Center: Large Prominent Search Bar (Desktop Only) */}
        <div ref={suggestRef} className="hidden md:flex flex-1 max-w-xl lg:max-w-2xl relative">
          <form onSubmit={handleSearchSubmit} className="w-full flex">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder={locale === 'ar' ? 'ابحث عن مواد البقالة، مقرمشات، شاي، توابل...' : 'Search for groceries, snacks, tea, spices...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 rounded-l-xl border border-light-border bg-[#FAF7F0] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-cairo rtl:pr-4 rtl:pl-10 rtl:rounded-r-xl rtl:rounded-l-none"
              />
              <Search className="absolute right-3.5 top-3.5 w-4 h-4 text-muted-text pointer-events-none rtl:left-3.5 rtl:right-auto" />
            </div>
            <button
              type="submit"
              className="bg-primary hover:bg-primary-light text-white px-6 rounded-r-xl font-cairo font-bold text-sm transition-colors duration-150 py-2.5 rtl:rounded-r-none rtl:rounded-l-xl shrink-0"
            >
              {locale === 'ar' ? 'بحث' : 'Search'}
            </button>
          </form>

          {/* Search Suggestions Dropdown */}
          {isSuggestOpen && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-light-border rounded-xl shadow-lg overflow-hidden z-50 animate-fadeIn">
              <div className="p-2.5 bg-[#FAF7F0] border-b border-light-border text-xs text-gray-500 font-bold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-gold" />
                <span>{locale === 'ar' ? 'اقتراحات البحث' : 'Suggested Products'}</span>
              </div>
              <div className="divide-y divide-gray-100">
                {suggestions.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleSuggestionClick(product.slug)}
                    className="w-full px-4 py-3 text-left rtl:text-right hover:bg-cream/40 flex items-center justify-between text-sm transition-colors"
                  >
                    <div>
                      <span className="font-bold text-dark block">
                        {locale === 'ar' ? product.arabicName : product.name}
                      </span>
                      <span className="text-xs text-muted-text">{product.brand} • {product.weight}</span>
                    </div>
                    <span className="text-primary font-bold text-xs bg-[#FAF7F0] px-2.5 py-1 rounded-md border border-light-border">
                      ${product.purchaseOptions.single.price}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Actions (Account, Wishlist, Cart) */}
        <div className="flex items-center gap-1 sm:gap-4 md:gap-5">
          
          {/* Account Dropdown */}
          <div ref={accountRef} className="relative">
            <button
              onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
              className="flex items-center gap-1.5 text-dark hover:text-primary transition-colors py-2 px-1 rounded-lg min-h-[44px] min-w-[44px] justify-center"
            >
              <User className="w-5 h-5 flex-shrink-0 text-dark/95" />
              <span className="hidden lg:inline text-xs font-bold font-cairo">
                {isAuthenticated ? (user?.name.split(' ')[0]) : t('header.account')}
              </span>
              <ChevronDown className="w-3 h-3 text-gray-400 hidden lg:inline" />
            </button>

            {isAccountMenuOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-64 bg-white border border-light-border rounded-xl shadow-lg py-0 z-50 overflow-hidden animate-fadeIn rtl:left-0 rtl:right-auto">
                {isAuthenticated ? (
                  <>
                    <div className="px-4 py-3.5 bg-[#FAF7F0] border-b border-light-border/80 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[10px] text-muted-text font-bold uppercase tracking-wider">
                          {t('account.welcome')}
                        </span>
                        <strong className="block text-xs font-bold text-dark truncate font-cairo mt-0.5">
                          {user?.name}
                        </strong>
                        <span className="block text-[9px] text-gray-400 truncate mt-0.5">
                          {user?.email}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-1.5 space-y-0.5">
                      {isAdmin ? (
                        <Link
                          href="/admin"
                          onClick={() => setIsAccountMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-primary hover:bg-[#FAF7F0] rounded-lg transition-colors"
                        >
                          <Store className="w-4 h-4 text-gold flex-shrink-0" />
                          <span className="font-cairo font-bold">{t('nav.admin')}</span>
                        </Link>
                      ) : (
                        <Link
                          href="/account"
                          onClick={() => setIsAccountMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold text-dark hover:bg-[#FAF7F0] rounded-lg transition-colors"
                        >
                          <User className="w-4 h-4 text-gold flex-shrink-0" />
                          <span className="font-cairo font-bold">{t('account.title')}</span>
                        </Link>
                      )}
                    </div>
                    
                    <div className="border-t border-light-border/60 p-1.5">
                      <button
                        onClick={() => {
                          logout();
                          setIsAccountMenuOpen(false);
                          router.push('/');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-650 hover:bg-red-50/50 rounded-lg transition-colors text-left rtl:text-right"
                      >
                        <LogOut className="w-4 h-4 flex-shrink-0" />
                        <span className="font-cairo">{t('account.logout')}</span>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="px-4 py-3 bg-[#FAF7F0] border-b border-light-border text-center">
                      <span className="block text-[10px] text-muted-text font-bold uppercase tracking-wider mb-2">
                        {locale === 'ar' ? 'دخول سريع تجريبي' : 'Demo Quick Logins'}
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleQuickLogin('customer')}
                          className="bg-primary hover:bg-primary-light text-white px-2 py-2 text-xs font-bold rounded-lg transition-colors font-cairo shadow-xs"
                        >
                          {locale === 'ar' ? 'حساب عميل' : 'Customer'}
                        </button>
                        <button
                          onClick={() => handleQuickLogin('admin')}
                          className="bg-gold hover:bg-gold-light text-dark px-2 py-2 text-xs font-bold rounded-lg transition-colors font-cairo shadow-xs"
                        >
                          {locale === 'ar' ? 'حساب مسؤول' : 'Admin'}
                        </button>
                      </div>
                    </div>
                    <div className="p-1.5">
                      <Link
                        href="/account"
                        onClick={() => setIsAccountMenuOpen(false)}
                        className="flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-bold text-dark hover:bg-[#FAF7F0] rounded-lg transition-colors text-center"
                      >
                        <User className="w-4 h-4 text-gold" />
                        <span className="font-cairo">
                          {locale === 'ar' ? 'الذهاب لصفحة الدخول' : 'Go to Login Page'}
                        </span>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* Wishlist Link (Desktop Only) */}
          <Link
            href="/wishlist"
            className="relative p-2 text-dark hover:text-primary transition-colors hidden md:flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg"
            title={t('header.wishlist')}
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute top-1 right-1 bg-gold text-dark font-bold text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Link */}
          <Link
            href="/cart"
            className="relative p-2 text-dark hover:text-primary transition-colors flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg"
            title={t('header.cart')}
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 bg-primary text-white font-bold text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white">
                {cartCount}
              </span>
            )}
          </Link>
          
          {/* Language Switcher (Mobile Only) */}
          <button
            onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
            className="md:hidden flex min-h-[44px] min-w-[44px] items-center justify-center text-xs font-bold text-primary"
          >
            {locale === 'en' ? 'العربية' : 'EN'}
          </button>
        </div>
      </div>

      {/* 3. MOBILE SEARCH BAR CONTAINER (Mobile Only) */}
      <div className="px-4 py-2 bg-white border-t border-light-border/60 md:hidden relative">
        <form onSubmit={handleSearchSubmit} className="w-full flex">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={locale === 'ar' ? 'ابحث عن منتجات...' : 'Search groceries...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-9 py-2 rounded-lg border border-light-border bg-[#FAF7F0] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-cairo rtl:pr-3 rtl:pl-9"
            />
            <Search className="absolute right-3 top-2.5 w-3.5 h-3.5 text-muted-text pointer-events-none rtl:left-3/4 rtl:right-auto" />
          </div>
          <button
            type="submit"
            className="bg-primary hover:bg-primary-light text-white px-4 rounded-lg font-semibold text-xs ml-1.5 rtl:mr-1.5 rtl:ml-0 transition-colors shrink-0"
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
                    <span className="font-bold text-dark block">
                      {locale === 'ar' ? product.arabicName : product.name}
                    </span>
                    <span className="text-[10px] text-muted-text">{product.brand} • {product.weight}</span>
                  </div>
                  <span className="text-primary font-bold text-[10px] bg-[#FAF7F0] px-2 py-0.5 rounded-md border border-light-border">
                    ${product.purchaseOptions.single.price}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 4. SUB-NAVIGATION BAR (Desktop Only) */}
      <div className="hidden md:block bg-white border-t border-light-border/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center py-2.5 text-xs font-bold tracking-wide gap-8 whitespace-nowrap overflow-x-auto no-scrollbar">
          
          {/* Categories Dropdown Filter */}
          <div ref={catDropdownRef} className="relative">
            <button
              onClick={() => setIsCategoriesDropdownOpen(!isCategoriesDropdownOpen)}
              className="flex items-center gap-1.5 text-primary hover:text-gold transition-colors font-bold uppercase tracking-wider"
            >
              <Package className="w-4 h-4 text-gold shrink-0" />
              <span>{locale === 'ar' ? 'تسوق بالأقسام' : 'Shop by Category'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>
            
            {isCategoriesDropdownOpen && (
              <div className="absolute top-full ltr:left-0 rtl:right-0 mt-2 bg-white border border-light-border rounded-xl shadow-xl p-4 w-56 z-50 animate-fadeIn">
                {categoriesList.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/category/${cat.slug}`}
                    onClick={() => setIsCategoriesDropdownOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-xs font-bold text-dark hover:bg-[#FAF7F0] hover:text-primary transition-colors text-left rtl:text-right"
                  >
                    {locale === 'ar' ? cat.arabicName : cat.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Regular nav pages links */}
          <Link href="/" className="text-dark hover:text-primary transition-colors">
            {t('nav.home')}
          </Link>
          <Link href="/shop" className="text-dark hover:text-primary transition-colors">
            {t('nav.shop')}
          </Link>
          <Link href="/shop?filter=bestseller" className="text-dark hover:text-primary transition-colors">
            {t('nav.bestsellers')}
          </Link>
          <Link href="/shop?sort=newest" className="text-dark hover:text-primary transition-colors">
            {locale === 'ar' ? 'وصلنا حديثاً' : 'New Arrivals'}
          </Link>
          <Link href="/shop?tag=Egyptian" className="text-dark hover:text-primary transition-colors font-bold text-accent">
            {locale === 'ar' ? 'المفضلة المصرية' : 'Egyptian Favorites 🇪🇬'}
          </Link>
        </div>
      </div>

      <ZipModal isOpen={isZipOpen} onClose={() => setIsZipOpen(false)} />

      {/* 5. MOBILE DRAWER SIDEBAR NAVIGATION OVERLAY */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden fade-in">
          {/* Backdrop overlay */}
          <div 
            onClick={() => setIsMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
          />

          <aside className="relative flex flex-col w-72 bg-white text-dark z-10 animate-fadeIn h-full overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-light-border flex items-center justify-between bg-[#FAF7F0]">
              <Logo />
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-dark hover:text-primary min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Drawer Menu Links */}
            <nav className="flex-1 p-4 space-y-4 overflow-y-auto no-scrollbar">
              <div className="space-y-1.5">
                <span className="block px-2 text-[9px] font-bold text-gray-400 uppercase tracking-wider select-none font-cairo">
                  {locale === 'ar' ? 'الصفحات الرئيسية' : 'Main Pages'}
                </span>
                <div className="flex flex-col gap-0.5">
                  <Link
                    href="/"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-bold text-dark hover:bg-[#FAF7F0] transition-all min-h-[44px]"
                  >
                    <Home className="w-4.5 h-4.5 text-gold shrink-0" />
                    <span>{t('nav.home')}</span>
                  </Link>
                  <Link
                    href="/shop"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-bold text-dark hover:bg-[#FAF7F0] transition-all min-h-[44px]"
                  >
                    <Search className="w-4.5 h-4.5 text-gold shrink-0" />
                    <span>{t('nav.shop')}</span>
                  </Link>
                  <Link
                    href="/shop?filter=bestseller"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-bold text-dark hover:bg-[#FAF7F0] transition-all min-h-[44px]"
                  >
                    <TrendingUp className="w-4.5 h-4.5 text-gold shrink-0" />
                    <span>{t('nav.bestsellers')}</span>
                  </Link>
                  <Link
                    href="/shop?tag=Egyptian"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-bold text-accent hover:bg-[#FAF7F0] transition-all min-h-[44px]"
                  >
                    <span className="w-4.5 text-center text-sm">🇪🇬</span>
                    <span>{locale === 'ar' ? 'المفضلة المصرية' : 'Egyptian Favorites'}</span>
                  </Link>
                </div>
              </div>

              {/* Categories list in Mobile drawer */}
              <div className="space-y-1.5 pt-4 border-t border-light-border/60">
                <span className="block px-2 text-[9px] font-bold text-gray-400 uppercase tracking-wider select-none font-cairo">
                  {locale === 'ar' ? 'تسوق بالأقسام' : 'Shop Categories'}
                </span>
                <div className="flex flex-col gap-0.5">
                  {categoriesList.map((cat) => (
                    <Link
                      key={cat.slug}
                      href={`/category/${cat.slug}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 py-3 rounded-lg text-xs font-bold text-dark hover:bg-[#FAF7F0] transition-all min-h-[44px]"
                    >
                      {locale === 'ar' ? cat.arabicName : cat.name}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Extras */}
              <div className="space-y-1.5 pt-4 border-t border-light-border/60">
                <div className="flex flex-col gap-0.5">
                  <Link
                    href="/track-order"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-lg text-xs font-bold text-gray-600 hover:bg-[#FAF7F0] min-h-[44px]"
                  >
                    <span>{locale === 'ar' ? 'تتبع شحنتك' : 'Track Your Shipment'}</span>
                  </Link>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsZipOpen(true);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-xs font-bold text-gray-600 hover:bg-[#FAF7F0] text-left rtl:text-right min-h-[44px]"
                  >
                    <span>{locale === 'ar' ? 'تغيير الرمز البريدي' : 'Change Zip Code'}</span>
                  </button>
                </div>
              </div>
            </nav>

            {/* Mobile Drawer Logout/Login */}
            <div className="p-4 border-t border-light-border bg-[#FAF7F0] space-y-2">
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                    router.push('/');
                  }}
                  className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-650 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{locale === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>
                </button>
              ) : (
                <Link
                  href="/account"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full py-3 bg-primary hover:bg-primary-light text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 min-h-[44px]"
                >
                  <User className="w-4 h-4 text-gold" />
                  <span>{locale === 'ar' ? 'تسجيل الدخول' : 'Login / Register'}</span>
                </Link>
              )}
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
