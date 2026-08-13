'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useLocaleStore } from '@/store/locale-store';
import { useCartStore } from '@/store/cart-store';
import { OrderService } from '@/services/orders';
import { Order, Product, CartItem } from '@/types';
import { formatDate, formatPrice } from '@/lib/utils';
import { 
  User, 
  ShoppingBag, 
  MapPin, 
  LogOut, 
  Lock, 
  RotateCcw,
  CheckCircle,
  Truck,
  ArrowRight,
  TrendingUp,
  Plus
} from 'lucide-react';

export default function AccountPage() {
  const router = useRouter();
  const { t, locale } = useLocaleStore();
  const { user, isAuthenticated, loginCustomer, loginAdmin, logout, updateProfile } = useAuthStore();
  const addToCart = useCartStore((state) => state.addToCart);

  // Form states
  const [emailInput, setEmailInput] = useState('ahmed.masri@gmail.com');
  const [passwordInput, setPasswordInput] = useState('password123');
  const [loginError, setLoginError] = useState('');
  
  // Profile edit states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // Orders list
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Sync profile editing fields
  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone);
      setAddress(user.address);
      setCity(user.city);
      setState(user.state);
      setZip(user.zip);
    }
  }, [user]);

  // Load customer orders
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      const loadOrders = async () => {
        setLoadingOrders(true);
        try {
          const list = await OrderService.getOrdersByCustomerEmail(user.email);
          setOrders(list);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingOrders(false);
        }
      };
      loadOrders();
    }
  }, [isAuthenticated, user?.email]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!emailInput.trim()) {
      setLoginError('Email is required.');
      return;
    }

    if (emailInput.toLowerCase() === 'admin@arabmarket.com') {
      loginAdmin();
      router.push('/admin');
    } else {
      loginCustomer(emailInput, emailInput.startsWith('ahmed') ? 'Ahmed Al-Masri' : 'Sarah Mansour');
    }
  };

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess('');
    updateProfile({
      name,
      phone,
      address,
      city,
      state,
      zip,
    });
    setProfileSuccess('Profile updated successfully!');
    setTimeout(() => setProfileSuccess(''), 3000);
  };

  const handleReorderItem = (product: Product, option: 'single' | 'pack' | 'case') => {
    addToCart(product, option, 1);
    router.push('/cart');
  };

  // Compile Buy Again Items list from orders
  // Flatten all products purchased across past orders (excluding duplicates)
  const getBuyAgainProducts = () => {
    const itemsMap = new Map<string, { product: Product; option: 'single' | 'pack' | 'case' }>();
    orders.forEach((o) => {
      o.items.forEach((item) => {
        const key = `${item.product.id}-${item.option}`;
        if (!itemsMap.has(key)) {
          itemsMap.set(key, { product: item.product, option: item.option });
        }
      });
    });
    return Array.from(itemsMap.values()).slice(0, 4);
  };

  const buyAgainItems = getBuyAgainProducts();

  // Logged OUT View: Render Login Form
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 sm:py-24 fade-in space-y-6">
        <div className="bg-white border border-light-border rounded-2xl p-6 sm:p-8 shadow-md space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold text-dark">{locale === 'ar' ? 'تسجيل الدخول' : 'Login to Arab Market'}</h1>
            <p className="text-xs text-gray-500">
              Access orders, manage shipping addresses, and buy items again instantly.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">{t('checkout.email')}</label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="customer@example.com or admin@arabmarket.com"
                className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Password</label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
              />
            </div>

            {loginError && <p className="text-xs text-red-600 font-semibold">{loginError}</p>}

            <button
              type="submit"
              className="w-full py-2.5 bg-primary hover:bg-primary-dark text-cream font-bold text-sm rounded-lg shadow-md transition-colors"
            >
              Sign In
            </button>
          </form>

          {/* Quick links wrapper */}
          <div className="border-t border-light-border pt-4 text-center">
            <span className="block text-xs text-gray-400 mb-2.5">Quick Demo Login Shortcuts</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  loginCustomer('ahmed.masri@gmail.com', 'Ahmed Al-Masri');
                }}
                className="px-3 py-2 bg-cream text-primary border border-primary/20 rounded-lg text-xs font-semibold hover:bg-white transition-colors"
              >
                Ahmed (Customer)
              </button>
              <button
                type="button"
                onClick={() => {
                  loginAdmin();
                  router.push('/admin');
                }}
                className="px-3 py-2 bg-gold/15 text-gold border border-gold/40 rounded-lg text-xs font-bold hover:bg-white transition-colors"
              >
                Admin Panel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Logged IN View: Customer Account Dashboard
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in space-y-10">
      
      {/* Welcome Title bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-light-border pb-5 gap-4">
        <div>
          <h1 className="text-2xl sm:text-4xl font-bold text-dark">{t('account.title')}</h1>
          <p className="text-xs sm:text-sm text-muted-text mt-1">
            {t('account.welcome')}, <strong>{user?.name}</strong> • Account level: Customer
          </p>
        </div>
        <button
          onClick={() => {
            logout();
            router.push('/');
          }}
          className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-50 transition-colors flex items-center gap-1"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>{t('account.logout')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left column: Profile management form */}
        <div className="bg-white border border-light-border rounded-xl p-5 sm:p-6 shadow-xs space-y-5">
          <h2 className="text-sm font-bold text-primary uppercase tracking-wider pb-2.5 border-b border-light-border flex items-center gap-1.5">
            <User className="w-4.5 h-4.5 text-gold" />
            <span>{t('account.profile')}</span>
          </h2>
          
          <form onSubmit={handleProfileSave} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Email Address</label>
              <input
                type="email"
                disabled
                value={user?.email}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-500 uppercase">Street Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase">City</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-gray-500 uppercase">ZIP</label>
                <input
                  type="text"
                  value={zip}
                  onChange={(e) => setZip(e.target.value)}
                  className="w-full px-2.5 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none"
                />
              </div>
            </div>

            {profileSuccess && <p className="text-xs text-green-700 font-semibold">{profileSuccess}</p>}

            <button
              type="submit"
              className="w-full py-2.5 bg-primary hover:bg-primary-dark text-cream text-xs font-bold rounded-lg transition-colors"
            >
              Save Profile Updates
            </button>
          </form>
        </div>

        {/* Right column: Orders list & Buy Again */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Order history list */}
          <div className="bg-white border border-light-border rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider pb-2.5 border-b border-light-border flex items-center gap-1.5">
              <ShoppingBag className="w-4.5 h-4.5 text-gold" />
              <span>{t('account.orders')}</span>
            </h2>

            {loadingOrders ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
              </div>
            ) : orders.length === 0 ? (
              <p className="text-xs text-gray-500 py-6 text-center">{t('account.no_orders')}</p>
            ) : (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 no-scrollbar">
                {orders.map((o) => (
                  <div 
                    key={o.id}
                    className="border border-light-border rounded-xl overflow-hidden hover:border-gold/30 transition-colors"
                  >
                    {/* Header info */}
                    <div className="bg-gray-50/70 p-3 text-xs flex flex-wrap justify-between items-center border-b border-light-border gap-2">
                      <div className="flex gap-4">
                        <span>ID: <strong>{o.id}</strong></span>
                        <span>Date: <strong>{formatDate(o.date, locale)}</strong></span>
                      </div>
                      <div className="flex gap-3 items-center">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase ${
                          o.status === 'Delivered' 
                            ? 'bg-green-100 text-green-700' 
                            : o.status === 'Cancelled' 
                            ? 'bg-red-100 text-red-700'
                            : 'bg-primary/10 text-primary'
                        }`}>
                          {o.status}
                        </span>
                        <Link 
                          href={`/track-order?id=${o.id}`}
                          className="text-primary hover:underline font-bold flex items-center gap-0.5 text-[10px]"
                        >
                          <span>Track</span>
                          <ArrowRight className="w-3 h-3 rtl:rotate-180" />
                        </Link>
                      </div>
                    </div>
                    {/* Items row details */}
                    <div className="p-4 space-y-2">
                      {o.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-xs">
                          <span className="text-dark font-medium leading-tight">
                            {locale === 'ar' ? item.product.arabicName : item.product.name}{' '}
                            <span className="text-[10px] text-gray-400 font-bold uppercase">({t(`prod.${item.option}`)})</span>
                          </span>
                          <span className="text-gray-500 font-semibold">{item.quantity} x {formatPrice(item.product.purchaseOptions[item.option].price, locale)}</span>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-gray-100 flex justify-between items-baseline text-xs">
                        <span className="text-gray-400 font-bold">Total Paid:</span>
                        <strong className="text-primary font-bold text-sm">{formatPrice(o.total, locale)}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buy it again quick order */}
          {isAuthenticated && buyAgainItems.length > 0 && (
            <div className="bg-white border border-light-border rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="space-y-1 border-b border-light-border pb-2.5">
                <h2 className="text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-1.5">
                  <RotateCcw className="w-4.5 h-4.5 text-gold" />
                  <span>{t('account.buy_again')}</span>
                </h2>
                <p className="text-[11px] text-gray-500">{t('account.buy_again_desc')}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {buyAgainItems.map((item, idx) => (
                  <div 
                    key={idx}
                    className="p-3 border border-light-border rounded-xl flex items-center justify-between gap-3 bg-cream/10"
                  >
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={item.product.images[0]} 
                        alt="" 
                        className="w-10 h-10 object-cover rounded-md border border-light-border bg-white"
                      />
                      <div className="text-xs">
                        <strong className="text-dark block leading-snug line-clamp-1">
                          {locale === 'ar' ? item.product.arabicName : item.product.name}
                        </strong>
                        <span className="text-[10px] text-gray-400 font-bold uppercase">{t(`prod.${item.option}`)} • {formatPrice(item.product.purchaseOptions[item.option].price, locale)}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleReorderItem(item.product, item.option)}
                      className="px-3 py-1.5 bg-primary text-cream text-[10px] font-bold rounded-lg hover:bg-primary-dark transition-colors flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Reorder</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
