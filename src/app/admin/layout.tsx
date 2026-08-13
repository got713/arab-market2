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
  Bell
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useLocaleStore();
  const { user, isAdmin, isAuthenticated, loginAdmin, logout } = useAuthStore();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Admin routes links configuration
  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: ShoppingBag },
    { label: 'Orders', path: '/admin/orders', icon: ClipboardList },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Inventory', path: '/admin/inventory', icon: Warehouse },
    { label: 'Coupons', path: '/admin/coupons', icon: Ticket },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  // Hydration safety check
  if (!mounted) {
    return <div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading dashboard...</div>;
  }

  // PROTECTION BYPASS SCREEN
  // If not logged in as admin, render a lock overlay preventing access
  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 fade-in">
        <div className="max-w-md w-full bg-white border border-light-border shadow-lg rounded-2xl p-6 sm:p-8 space-y-6 text-center">
          <div className="w-14 h-14 bg-red-50 text-red-650 rounded-full flex items-center justify-center mx-auto border border-red-150">
            <Lock className="w-6 h-6 text-red-600" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-xl font-bold text-dark">Admin Access Denied</h1>
            <p className="text-xs text-gray-500 max-w-sm mx-auto leading-normal">
              You must be authenticated with administrator privileges to inspect the Arab Market back office dashboard.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => {
                loginAdmin();
                router.refresh();
              }}
              className="w-full py-2.5 bg-primary text-cream rounded-lg text-xs font-bold hover:bg-primary-dark transition-colors flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>Demo Bypass: Login as Admin</span>
            </button>

            <Link
              href="/"
              className="w-full py-2.5 border border-primary/20 hover:bg-cream/10 text-primary rounded-lg text-xs font-bold block text-center transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Storefront</span>
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
    <div className="flex min-h-screen bg-gray-50 text-dark overflow-hidden font-sans">
      
      {/* Sidebar Navigation — Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-primary border-r border-primary-dark text-cream shrink-0">
        <div className="p-5 border-b border-primary-dark flex items-center justify-between">
          <Link href="/">
            <Logo light={true} variant="full" />
          </Link>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  active
                    ? 'bg-gold text-dark font-bold shadow-xs'
                    : 'text-cream/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card footer */}
        <div className="p-4 border-t border-primary-dark space-y-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gold flex items-center justify-center text-dark font-bold text-sm">
              AD
            </div>
            <div className="text-xs truncate">
              <strong className="block font-semibold text-white">Administrator</strong>
              <span className="text-[10px] text-cream/60">admin@arabmarket.com</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-cream/10 hover:bg-red-650 hover:text-white rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout Backoffice</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Admin Header top navbar */}
        <header className="bg-white border-b border-light-border px-4 py-4 flex items-center justify-between z-30 shadow-xs">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1 lg:hidden text-gray-500 hover:text-dark"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-dark">
              {navItems.find((n) => n.path === pathname)?.label || 'Admin Portal'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button className="relative p-1.5 text-gray-400 hover:text-dark">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-gold" />
            </button>
            
            {/* Storefront redirect */}
            <Link
              href="/"
              className="px-3.5 py-1.5 bg-cream hover:bg-white text-primary border border-primary/20 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Storefront</span>
            </Link>
          </div>
        </header>

        {/* Page Inner Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
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

          <aside className="relative flex flex-col w-64 bg-primary text-cream z-10 animate-fadeIn h-full">
            <div className="p-4 border-b border-primary-dark flex items-center justify-between">
              <Logo light={true} variant="full" />
              <button 
                onClick={() => setSidebarOpen(false)}
                className="text-cream hover:text-gold"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                      active
                        ? 'bg-gold text-dark font-bold'
                        : 'text-cream/80 hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-primary-dark space-y-3">
              <button
                onClick={handleLogout}
                className="w-full py-2 bg-cream/10 rounded-lg text-[10px] font-bold transition-all flex items-center justify-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

    </div>
  );
}
