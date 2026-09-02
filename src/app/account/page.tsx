'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useLocaleStore } from '@/store/locale-store';
import { useCartStore } from '@/store/cart-store';
import { OrderService } from '@/services/orders';
import { Order, Product, CartItem } from '@/types';
import { formatDate, formatPrice, getErrorMessage, getPurchaseOptionLabel } from '@/lib/utils';
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
  Plus,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

export default function AccountPage() {
  return (
    <Suspense fallback={null}>
      <AccountPageContent />
    </Suspense>
  );
}

// useSearchParams() requires a Suspense boundary around the component that
// calls it (Next.js App Router), hence the small wrapper above — the actual
// page content is unchanged aside from that.
function AccountPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useLocaleStore();
  const { user, isAdmin, isAuthenticated, loginWithCredentials, registerCustomer, logout, updateProfile } = useAuthStore();
  const addToCart = useCartStore((state) => state.addToCart);

  // Logged-out view mode
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Login form states
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Registration form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [regAcceptedTerms, setRegAcceptedTerms] = useState(false);
  const [regError, setRegError] = useState('');
  const [registering, setRegistering] = useState(false);

  // Profile edit states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  // Orders list
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Sync profile editing fields
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAddress(user.address || '');
      setCity(user.city || '');
      setState(user.state || '');
      setZip(user.zip || '');
    }
  }, [user]);

  // Load customer orders — the authenticated user's own, per their Sanctum
  // token, never trusted from a client-supplied email.
  useEffect(() => {
    if (isAuthenticated) {
      const loadOrders = async () => {
        setLoadingOrders(true);
        try {
          const list = await OrderService.getMyOrders();
          setOrders(list);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingOrders(false);
        }
      };
      loadOrders();
    }
  }, [isAuthenticated]);

  // Admin-access guard (admin/layout.tsx) sends unauthenticated/non-admin
  // visitors here as /account?redirect=/admin so they can sign in and then
  // continue on to the dashboard. That flow only worked for a FRESH login
  // submitted on this page (see handleLoginSubmit below) — an admin who was
  // already authenticated (persisted session) when they landed here just saw
  // the normal customer account view forever, with the redirect param never
  // consumed. Forward them on as soon as we know they're an authenticated
  // admin and a redirect target was requested.
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      const redirectTo = searchParams.get('redirect');
      if (redirectTo && redirectTo.startsWith('/')) {
        router.push(redirectTo);
      }
    }
  }, [isAuthenticated, isAdmin, searchParams, router]);

  const syncCartWithServer = useCartStore((state) => state.syncCartWithServer);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!emailInput || !passwordInput) {
      setLoginError(locale === 'ar' ? 'البريد الإلكتروني وكلمة المرور مطلوبان.' : 'Email and password are required.');
      return;
    }

    setLoggingIn(true);
    try {
      await loginWithCredentials(emailInput, passwordInput);
      await syncCartWithServer();

      // Read fresh state right after the login promise resolves rather than the
      // possibly-stale `isAdmin` captured when this component last rendered.
      if (useAuthStore.getState().isAdmin) {
        router.push('/admin');
      }
    } catch (err: any) {
      setLoginError(err.message || (locale === 'ar' ? 'فشل تسجيل الدخول، برجاء التحقق من البيانات.' : 'Login failed. Please check credentials.'));
    } finally {
      setLoggingIn(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName || !regEmail || !regPassword || !regPasswordConfirm) {
      setRegError(locale === 'ar' ? 'جميع الحقول المطلوبة يجب ملؤها.' : 'Please fill out all required fields.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(regEmail)) {
      setRegError(locale === 'ar' ? 'برجاء إدخال بريد إلكتروني صحيح.' : 'Please enter a valid email address.');
      return;
    }
    if (regPassword.length < 8) {
      setRegError(locale === 'ar' ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.' : 'Password must be at least 8 characters.');
      return;
    }
    if (regPassword !== regPasswordConfirm) {
      setRegError(locale === 'ar' ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.');
      return;
    }
    if (!regAcceptedTerms) {
      setRegError(locale === 'ar' ? 'يجب الموافقة على الشروط وسياسة الخصوصية.' : 'You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setRegistering(true);
    try {
      // registerCustomer hits the real /auth/register endpoint — the backend
      // always hardcodes role='customer' and is_active=true server-side (see
      // AuthController::register), so there is no client-controllable path to
      // register as anything but a normal customer. On success the store
      // already sets the real Sanctum token + user state (auto-login).
      await registerCustomer(regName, regEmail, regPassword, regPasswordConfirm, regPhone || undefined);
      await syncCartWithServer();
    } catch (err: any) {
      // Surface the specific field error (e.g. "already been taken") when the
      // backend's validator provides one, rather than a generic message.
      const fieldError = err?.errors?.email?.[0] || err?.errors?.password?.[0];
      setRegError(fieldError || err.message || (locale === 'ar' ? 'فشل إنشاء الحساب. برجاء المحاولة مرة أخرى.' : 'Registration failed. Please try again.'));
    } finally {
      setRegistering(false);
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSuccess('');
    setProfileError('');
    setSavingProfile(true);
    try {
      // Awaited: the success message now only appears once the backend has
      // actually confirmed the update, not on form submit itself.
      await updateProfile({ name, phone, address, city, state, zip });
      setProfileSuccess('Profile updated successfully!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err) {
      setProfileError(getErrorMessage(err, 'Failed to update profile. Please try again.'));
    } finally {
      setSavingProfile(false);
    }
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

  // Logged OUT View: Sign In / Create Account
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 sm:py-24 fade-in space-y-6">
        <div className="bg-white border border-light-border rounded-2xl p-6 sm:p-8 shadow-md space-y-6">

          {/* Mode tabs */}
          <div className="flex border border-gray-200 rounded-lg p-1 bg-gray-50">
            <button
              type="button"
              onClick={() => setAuthMode('login')}
              className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${
                authMode === 'login' ? 'bg-white text-primary shadow-xs' : 'text-gray-500'
              }`}
            >
              {locale === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2 text-xs font-bold rounded-md transition-colors ${
                authMode === 'register' ? 'bg-white text-primary shadow-xs' : 'text-gray-500'
              }`}
            >
              {locale === 'ar' ? 'إنشاء حساب' : 'Create Account'}
            </button>
          </div>

          {authMode === 'login' ? (
            <>
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-dark">{locale === 'ar' ? 'تسجيل الدخول' : 'Login to Arab Market'}</h1>
                <p className="text-xs text-gray-500">
                  {locale === 'ar' ? 'ادخل لعرض طلباتك وإدارة عناوينك وإعادة الطلب بسهولة.' : 'Access orders, manage shipping addresses, and buy items again instantly.'}
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
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-500 uppercase">{locale === 'ar' ? 'كلمة المرور' : 'Password'}</label>
                    <Link href="/forgot-password" className="text-[11px] font-bold text-primary hover:underline">
                      {locale === 'ar' ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                    </Link>
                  </div>
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
                  disabled={loggingIn}
                  className={`w-full py-2.5 text-cream font-bold text-sm rounded-lg shadow-md transition-colors flex items-center justify-center gap-1.5 ${
                    loggingIn ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'
                  }`}
                >
                  {loggingIn && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{loggingIn ? (locale === 'ar' ? 'جارٍ الدخول...' : 'Signing in...') : (locale === 'ar' ? 'تسجيل الدخول' : 'Sign In')}</span>
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold text-dark">{locale === 'ar' ? 'إنشاء حساب جديد' : 'Create Your Account'}</h1>
                <p className="text-xs text-gray-500">
                  {locale === 'ar' ? 'أنشئ حساباً لتتبع طلباتك وتسريع عملية الدفع في المرات القادمة.' : 'Create an account to track orders and check out faster next time.'}
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">{locale === 'ar' ? 'الاسم الكامل' : 'Full Name'}</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">{t('checkout.email')}</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">{locale === 'ar' ? 'رقم الهاتف (اختياري)' : 'Phone Number (optional)'}</label>
                  <input
                    type="tel"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+1 555 123 4567"
                    className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">{locale === 'ar' ? 'كلمة المرور' : 'Password'}</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-500 uppercase">{locale === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}</label>
                    <input
                      type="password"
                      required
                      minLength={8}
                      value={regPasswordConfirm}
                      onChange={(e) => setRegPasswordConfirm(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                    />
                  </div>
                </div>
                <p className="text-[10px] text-gray-400">
                  {locale === 'ar' ? 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.' : 'Password must be at least 8 characters.'}
                </p>

                <label className="flex items-start gap-2 cursor-pointer select-none pt-1">
                  <input
                    type="checkbox"
                    checked={regAcceptedTerms}
                    onChange={(e) => setRegAcceptedTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 accent-primary rounded shrink-0"
                  />
                  <span className="text-[11px] text-gray-500 leading-snug">
                    {locale === 'ar' ? 'أوافق على ' : 'I agree to the '}
                    <Link href="/terms" className="text-primary font-semibold hover:underline">{locale === 'ar' ? 'الشروط والأحكام' : 'Terms of Service'}</Link>
                    {locale === 'ar' ? ' و' : ' and '}
                    <Link href="/privacy" className="text-primary font-semibold hover:underline">{locale === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}</Link>
                  </span>
                </label>

                {regError && <p className="text-xs text-red-600 font-semibold">{regError}</p>}

                <button
                  type="submit"
                  disabled={registering}
                  className={`w-full py-2.5 text-cream font-bold text-sm rounded-lg shadow-md transition-colors flex items-center justify-center gap-1.5 ${
                    registering ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'
                  }`}
                >
                  {registering && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{registering ? (locale === 'ar' ? 'جارٍ الإنشاء...' : 'Creating account...') : (locale === 'ar' ? 'إنشاء الحساب' : 'Create Account')}</span>
                </button>
              </form>
            </>
          )}
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
            {t('account.welcome')}, <strong>{user?.name}</strong> • Account level: {isAdmin ? 'Administrator' : 'Customer'}
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
            {profileError && (
              <p className="text-xs text-red-600 font-semibold bg-red-50 border border-red-200 p-2.5 rounded-lg flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{profileError}</span>
              </p>
            )}

            <button
              type="submit"
              disabled={savingProfile}
              className={`w-full py-2.5 text-cream text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                savingProfile ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-primary-dark'
              }`}
            >
              {savingProfile && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              <span>{savingProfile ? 'Saving...' : 'Save Profile Updates'}</span>
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
                            <span className="text-[10px] text-gray-400 font-bold uppercase">({getPurchaseOptionLabel(item.product.purchaseOptions, item.option, locale, item.product.sellingUnit)})</span>
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
                        <span className="text-[10px] text-gray-400 font-bold uppercase">{getPurchaseOptionLabel(item.product.purchaseOptions, item.option, locale, item.product.sellingUnit)} • {formatPrice(item.product.purchaseOptions[item.option].price, locale)}</span>
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
