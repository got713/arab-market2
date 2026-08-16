'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { useLocaleStore } from '@/store/locale-store';
import Logo from '@/components/ui/logo';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ClipboardList, 
  Users, 
  Warehouse, 
  Ticket, 
  BarChart3, 
  Settings, 
  LogOut, 
  ArrowLeft,
  Lock,
  UserCheck,
  Menu,
  X,
  Bell,
  FolderTree,
  ChevronDown,
  Store,
  MessageSquare,
  CreditCard
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useLocaleStore();
  const { user, isAdmin, isAuthenticated, logout } = useAuthStore();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Flat Admin Navigation matching high-fidelity layout
  const navItems = [
    { label: locale === 'ar' ? 'لوحة التحكم' : 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: locale === 'ar' ? 'المنتجات' : 'Products', path: '/admin/products', icon: ShoppingBag },
    { label: locale === 'ar' ? 'الأقسام' : 'Categories', path: '/admin/categories', icon: FolderTree },
    { label: locale === 'ar' ? 'الطلبات' : 'Orders', path: '/admin/orders', icon: ClipboardList },
    { label: locale === 'ar' ? 'العملاء' : 'Customers', path: '/admin/customers', icon: Users },
    { label: locale === 'ar' ? 'المخزون' : 'Inventory', path: '/admin/inventory', icon: Warehouse },
    { label: locale === 'ar' ? 'الكوبونات' : 'Coupons', path: '/admin/coupons', icon: Ticket },
    { label: locale === 'ar' ? 'التحليلات' : 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: locale === 'ar' ? 'إعدادات الدفع' : 'Payment Settings', path: '/admin/payment-settings', icon: CreditCard },
    { label: locale === 'ar' ? 'التقييمات' : 'Reviews', path: '/admin/settings?tab=reviews', icon: MessageSquare },
    { label: locale === 'ar' ? 'الإشعارات' : 'Notifications', path: '/admin/settings?tab=notifications', icon: Bell },
    { label: locale === 'ar' ? 'الإعدادات' : 'Settings', path: '/admin/settings', icon: Settings },
  ];

  // Hydration safety check
  if (!mounted) {
    return <div className="min-h-screen bg-[#FAF7F0] flex items-center justify-center font-cairo">Loading dashboard...</div>;
  }

  // Protection screen
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 fade-in" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-md w-full bg-white border border-light-border shadow-lg rounded-2xl p-6 sm:p-8 space-y-6 text-center">
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto border border-red-100">
            <Lock className="w-6 h-6" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-dark font-cairo">
              {locale === 'ar' ? 'غير مسموح بالدخول كمسؤول' : 'Admin Access Denied'}
            </h1>
            <p className="text-xs text-gray-500 max-w-sm mx-auto leading-normal">
              {locale === 'ar' 
                ? 'يجب تسجيل الدخول بصلاحيات المسؤول لتصفح لوحة التحكم الخاصة بمتجر عرب ماركت.'
                : 'You must be authenticated with administrator privileges to inspect the Arab Market back office dashboard.'}
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <Link
              href="/account?redirect=/admin"
              className="w-full py-2.5 bg-primary hover:bg-primary-light text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
            >
              <UserCheck className="w-4 h-4 text-gold" />
              <span>{locale === 'ar' ? 'تسجيل الدخول بحساب المسؤول' : 'Sign In as Administrator'}</span>
            </Link>

            <Link
              href="/"
              className="w-full py-2.5 border border-light-border hover:bg-[#FAF7F0] text-primary rounded-lg text-xs font-bold block text-center transition-colors flex items-center justify-center gap-1.5 min-h-[44px]"
            >
              <ArrowLeft className="w-4 h-4 text-gold" />
              <span>{locale === 'ar' ? 'العودة للمتجر الإلكتروني' : 'Return to Storefront'}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <div className="flex min-h-screen bg-[#FAF7F0] text-dark overflow-hidden font-sans" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Sidebar Navigation — Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-primary text-white shrink-0 border-r border-primary-dark/40 rtl:border-r-0 rtl:border-l">
        <div className="p-5 border-b border-primary-dark/40 flex items-center justify-between bg-primary-dark/25">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-gold/10 flex items-center justify-center shrink-0">
              <span className="text-gold font-black text-sm">A</span>
            </div>
            <div className="text-left rtl:text-right">
              <strong className="block text-xs font-black uppercase text-gold leading-none tracking-wider">Arab Market</strong>
              <span className="block text-[8px] font-bold text-white/50 tracking-widest leading-none mt-1">ADMIN PANEL</span>
            </div>
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.path || (item.path !== '/admin' && pathname?.startsWith(item.path));
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? 'bg-gold text-primary font-black shadow-xs'
                    : 'text-white/80 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${active ? 'text-primary' : 'text-gold'}`} />
                <span className="font-cairo leading-none">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card footer */}
        <div className="p-4 border-t border-primary-dark/40 bg-primary-dark/20 relative">
          <div className="flex items-center justify-between gap-3 p-1.5 rounded-xl">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-gold text-primary flex items-center justify-center font-bold text-sm shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div className="text-xs truncate min-w-0">
                <strong className="block font-bold text-white truncate font-cairo">
                  {user?.name || (locale === 'ar' ? 'أحمد الأدمن' : 'Ahmed Admin')}
                </strong>
                <span className="block text-[10px] text-white/50 truncate font-semibold">Super Admin</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-white/60 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
              title="Logout"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Admin Header top navbar */}
        <header className="bg-white border-b border-light-border px-6 py-4 flex items-center justify-between z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 lg:hidden text-dark hover:text-primary transition-colors rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-base sm:text-lg font-black text-primary font-cairo">
              {navItems.find((n) => n.path === pathname || (n.path !== '/admin' && pathname?.startsWith(n.path)))?.label || (locale === 'ar' ? 'بوابة الإدارة' : 'Admin Portal')}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Language switcher */}
            <button
              onClick={() => router.push('/')}
              className="px-3 py-1.5 bg-[#FAF7F0] hover:bg-white text-primary border border-light-border rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs font-cairo"
            >
              <Store className="w-3.5 h-3.5 text-gold flex-shrink-0" />
              <span className="hidden sm:inline">{locale === 'ar' ? 'عرض المتجر' : 'View Store'}</span>
            </button>
          </div>
        </header>

        {/* Page Inner Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[#FAF7F0]/40">
          {children}
        </main>
      </div>

      {/* Mobile Drawer Sidebar Navigation */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden fade-in">
          {/* Backdrop overlay */}
          <div 
            onClick={() => setSidebarOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-xs"
          />

          <aside className="relative flex flex-col w-64 bg-primary text-white z-10 animate-fadeIn h-full">
            <div className="p-4 border-b border-primary-dark/40 flex items-center justify-between bg-primary-dark/25">
              <Logo light={true} variant="full" />
              <button 
                onClick={() => setSidebarOpen(false)}
                className="text-white hover:text-gold min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto no-scrollbar">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.path || (item.path !== '/admin' && pathname?.startsWith(item.path));
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all min-h-[44px] ${
                      active
                        ? 'bg-gold text-primary font-black shadow-xs'
                        : 'text-white/80 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-primary' : 'text-gold'}`} />
                    <span className="font-cairo">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-primary-dark/40 bg-primary-dark/25 space-y-2">
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  handleLogout();
                }}
                className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 min-h-[44px]"
              >
                <LogOut className="w-4 h-4" />
                <span>{locale === 'ar' ? 'تسجيل الخروج' : 'Logout'}</span>
              </button>
            </div>
          </aside>
        </div>
      )}

    </div>
  );
}
