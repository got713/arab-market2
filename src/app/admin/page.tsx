'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ApiClient } from '@/lib/api-client';
import { OrderService } from '@/services/orders';
import { AnalyticsService, AnalyticsSummary } from '@/services/analytics';
import { useAuthStore } from '@/store/auth-store';
import { Order } from '@/types';
import { formatPrice, formatDate, getErrorMessage } from '@/lib/utils';
import { useLocaleStore } from '@/store/locale-store';
import {
  Users,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Eye,
  DollarSign,
  Package,
} from 'lucide-react';

interface LowStockRow {
  id: number;
  name: string;
  arabicName: string;
  stock: number;
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#D9B56D',
  processing: '#B85C38',
  shipped: '#17324D',
  delivered: '#16A34A',
  cancelled: '#9CA3AF',
};

export default function AdminDashboardPage() {
  const { locale } = useLocaleStore();
  const isAr = locale === 'ar';
  const { user } = useAuthStore();

  const [orders, setOrders] = useState<Order[]>([]);
  const [lowStock, setLowStock] = useState<LowStockRow[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [summary, oList, inventoryRes] = await Promise.all([
        AnalyticsService.getSummary('30d', locale),
        OrderService.getOrders(undefined, locale),
        ApiClient.get<{ data: LowStockRow[] }>('/admin/inventory', { params: { status: 'low_stock' } }, locale),
      ]);
      setAnalytics(summary);
      setOrders(oList);
      setLowStock(inventoryRes.data || []);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load live admin dashboard statistics.'));
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="text-center py-20 space-y-3">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
        <p className="text-sm text-red-600 font-semibold">{error || 'No dashboard data available.'}</p>
        <button onClick={loadDashboardData} className="text-xs font-bold text-primary hover:underline">
          {isAr ? 'إعادة المحاولة' : 'Try again'}
        </button>
      </div>
    );
  }

  const maxTrend = Math.max(1, ...analytics.salesTrend.map((p) => p.total));

  const statusEntries: [string, number][] = [
    ['pending', analytics.orders.byStatus.pending],
    ['processing', analytics.orders.byStatus.processing],
    ['shipped', analytics.orders.byStatus.shipped],
    ['delivered', analytics.orders.byStatus.delivered],
    ['cancelled', analytics.orders.byStatus.cancelled],
  ];
  const statusTotal = statusEntries.reduce((sum, [, v]) => sum + v, 0);

  // Classic "r=15.915" trick: circumference ≈ 100, so percentages can be used
  // directly as stroke-dasharray values. Segments are built with a running
  // offset so they tile around the circle without overlapping.
  let cumulative = 0;
  const donutSegments = statusEntries.map(([status, count]) => {
    const pct = statusTotal > 0 ? (count / statusTotal) * 100 : 0;
    const segment = { status, count, pct, offset: -cumulative };
    cumulative += pct;
    return segment;
  });

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-6 fade-in text-dark" dir={isAr ? 'rtl' : 'ltr'}>

      {/* 1. HEADER ROW */}
      <div className="flex items-center justify-between border-b border-light-border/60 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-primary font-cairo leading-none">
            {isAr ? 'لوحة القيادة والمؤشرات' : 'Dashboard'}
          </h2>
          <p className="text-xs text-muted-text mt-1.5 font-medium font-cairo">
            {isAr ? `أهلاً بك مجدداً، ${user?.name || ''}!` : `Welcome back, ${user?.name || 'Admin'}!`}
          </p>
        </div>
      </div>

      {/* 2. METRICS CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">

        {/* Sales (last 30 days) */}
        <div className="bg-white border border-light-border rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider block">
              {isAr ? 'المبيعات (آخر 30 يوم)' : 'Sales (Last 30 Days)'}
            </span>
            <strong className="text-2xl font-black text-primary font-mono block leading-none">
              {formatPrice(analytics.sales.rangeTotal, locale)}
            </strong>
            <span className={`text-[10px] font-bold flex items-center gap-0.5 leading-none ${analytics.sales.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-3 h-3 shrink-0 ${analytics.sales.growth < 0 ? 'rotate-180' : ''}`} />
              <span>{isAr ? `${analytics.sales.growth}% مقابل الفترة السابقة` : `${analytics.sales.growth}% vs previous period`}</span>
            </span>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary/5 text-primary flex items-center justify-center shrink-0">
            <DollarSign className="w-4.5 h-4.5 text-primary" />
          </div>
        </div>

        {/* Orders (last 30 days) */}
        <div className="bg-white border border-light-border rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider block">
              {isAr ? 'الطلبات (آخر 30 يوم)' : 'Orders (Last 30 Days)'}
            </span>
            <strong className="text-2xl font-black text-primary font-mono block leading-none">
              {analytics.orders.rangeTotal.toLocaleString()}
            </strong>
            <span className={`text-[10px] font-bold flex items-center gap-0.5 leading-none ${analytics.orders.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className={`w-3 h-3 shrink-0 ${analytics.orders.growth < 0 ? 'rotate-180' : ''}`} />
              <span>{isAr ? `${analytics.orders.growth}% مقابل الفترة السابقة` : `${analytics.orders.growth}% vs previous period`}</span>
            </span>
          </div>
          <div className="w-9 h-9 rounded-full bg-accent/5 text-accent flex items-center justify-center shrink-0">
            <ShoppingCart className="w-4.5 h-4.5 text-accent" />
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white border border-light-border rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider block">
              {isAr ? 'إجمالي العملاء' : 'Total Customers'}
            </span>
            <strong className="text-2xl font-black text-primary font-mono block leading-none">
              {analytics.customers.total.toLocaleString()}
            </strong>
            <span className="text-[10px] text-green-600 font-bold flex items-center gap-0.5 leading-none">
              <Users className="w-3 h-3 shrink-0" />
              <span>{isAr ? `${analytics.customers.new} جديد هذا الشهر` : `${analytics.customers.new} new this period`}</span>
            </span>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary/5 text-primary flex items-center justify-center shrink-0">
            <Users className="w-4.5 h-4.5 text-primary" />
          </div>
        </div>

        {/* Low Stock Items */}
        <div className="bg-white border border-light-border rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-muted-text uppercase tracking-wider block">
              {isAr ? 'منتجات منخفضة المخزون' : 'Low Stock Items'}
            </span>
            <strong className="text-2xl font-black text-primary font-mono block leading-none">
              {analytics.lowStock.count}
            </strong>
            <Link
              href="/admin/inventory"
              className="text-[10px] text-accent font-bold hover:underline block leading-none"
            >
              {isAr ? 'عرض المنتجات >' : 'View items >'}
            </Link>
          </div>
          <div className="w-9 h-9 rounded-full bg-gold/10 text-gold flex items-center justify-center shrink-0">
            <Package className="w-4.5 h-4.5 text-gold" />
          </div>
        </div>
      </div>

      {/* 3. CHARTS ROW (Sales Trend, Order Status, Recent Activity) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Sales Trend Chart — real daily totals, last 30 days */}
        <div className="lg:col-span-6 bg-white border border-light-border rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-light-border/60 pb-3">
            <h3 className="font-bold text-sm text-primary uppercase tracking-wider font-cairo">
              {isAr ? 'مخطط المبيعات (آخر 30 يوم)' : 'Sales Trend (Last 30 Days)'}
            </h3>
          </div>

          {analytics.salesTrend.every((p) => p.total === 0) ? (
            <p className="text-xs text-gray-400 text-center py-10">
              {isAr ? 'لا توجد مبيعات مدفوعة بعد.' : 'No paid sales yet.'}
            </p>
          ) : (
            <div className="flex items-end gap-1 h-40 bg-[#FAF7F0]/40 rounded-xl border border-light-border/60 p-3">
              {analytics.salesTrend.map((point, idx) => (
                <div
                  key={idx}
                  className="flex-1 min-w-[3px] bg-primary/80 hover:bg-primary rounded-t transition-colors"
                  style={{ height: `${Math.max(2, (point.total / maxTrend) * 100)}%` }}
                  title={`${point.label}: ${formatPrice(point.total, locale)}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Order Status Donut Chart — real counts, last 30 days */}
        <div className="lg:col-span-3 bg-white border border-light-border rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="border-b border-light-border/60 pb-3">
            <h3 className="font-bold text-sm text-primary uppercase tracking-wider font-cairo">
              {isAr ? 'حالة الطلبات' : 'Order Status'}
            </h3>
          </div>

          <div className="relative flex items-center justify-center py-4">
            <svg width="120" height="120" viewBox="0 0 42 42" className="transform -rotate-90">
              <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#EBE6DA" strokeWidth="4.2" />
              {donutSegments.filter((s) => s.pct > 0).map((s) => (
                <circle
                  key={s.status}
                  cx="21" cy="21" r="15.915" fill="transparent"
                  stroke={STATUS_COLORS[s.status]}
                  strokeWidth="4.5"
                  strokeDasharray={`${s.pct} ${100 - s.pct}`}
                  strokeDashoffset={s.offset}
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <strong className="text-sm font-black text-primary leading-none">{statusTotal.toLocaleString()}</strong>
              <span className="text-[8px] text-muted-text font-bold uppercase tracking-wider mt-1">
                {isAr ? 'إجمالي الطلبات' : 'Total Orders'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-gray-500 pt-2 border-t border-light-border/60">
            {statusEntries.map(([status, count]) => (
              <div key={status} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full block shrink-0" style={{ backgroundColor: STATUS_COLORS[status] }} />
                <span className="capitalize">{status}: {count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity — derived from real recent orders + real low-stock count */}
        <div className="lg:col-span-3 bg-white border border-light-border rounded-2xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="border-b border-light-border/60 pb-3">
            <h3 className="font-bold text-sm text-primary uppercase tracking-wider font-cairo">
              {isAr ? 'أحدث النشاطات' : 'Recent Activity'}
            </h3>
          </div>

          <div className="flex-1 divide-y divide-gray-150/70 text-xs py-1">
            {recentOrders.length === 0 && analytics.lowStock.count === 0 ? (
              <p className="text-gray-400 text-center py-6">{isAr ? 'لا يوجد نشاط بعد.' : 'No activity yet.'}</p>
            ) : (
              <>
                {recentOrders.slice(0, 3).map((o) => (
                  <div key={o.id} className="py-2.5 flex gap-2">
                    <span className="w-2 h-2 mt-1 rounded-full bg-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-dark truncate">
                        {isAr ? `طلب جديد ${o.id}` : `New order ${o.id} received`}
                      </p>
                      <span className="text-[9px] text-gray-400 font-semibold block mt-0.5">{formatDate(o.date, locale)}</span>
                    </div>
                  </div>
                ))}
                {analytics.lowStock.count > 0 && (
                  <div className="py-2.5 flex gap-2">
                    <span className="w-2 h-2 mt-1 rounded-full bg-gold shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-dark truncate">
                        {isAr ? `تنبيه مخزون منخفض لـ ${analytics.lowStock.count} منتج` : `Low stock alert for ${analytics.lowStock.count} product${analytics.lowStock.count === 1 ? '' : 's'}`}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <Link href="/admin/orders" className="text-[10px] text-accent font-bold hover:underline text-center block pt-2 border-t border-light-border/60">
            {isAr ? 'عرض كل الطلبات >' : 'View all orders >'}
          </Link>
        </div>

      </div>

      {/* 4. RECENT ORDERS + TOP SELLING PRODUCTS + LOW STOCK ITEMS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Recent Orders Table — real orders */}
        <div className="lg:col-span-6 bg-white border border-light-border rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex justify-between items-center border-b border-light-border/60 pb-3">
            <h3 className="font-bold text-sm text-primary uppercase tracking-wider font-cairo">
              {isAr ? 'الطلبات الأخيرة' : 'Recent Orders'}
            </h3>
            <Link
              href="/admin/orders"
              className="text-xs text-primary hover:text-gold font-bold flex items-center gap-0.5 font-cairo"
            >
              <span>{isAr ? 'عرض الكل' : 'View all'}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-10">{isAr ? 'لا توجد طلبات بعد.' : 'No orders yet.'}</p>
          ) : (
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF7F0] border-b border-light-border text-gray-500 font-bold font-cairo">
                    <th className="p-3">{isAr ? 'رقم الطلب' : 'Order ID'}</th>
                    <th className="p-3">{isAr ? 'العميل' : 'Customer'}</th>
                    <th className="p-3">{isAr ? 'التاريخ' : 'Date'}</th>
                    <th className="p-3">{isAr ? 'الإجمالي' : 'Total'}</th>
                    <th className="p-3">{isAr ? 'الحالة' : 'Status'}</th>
                    <th className="p-3 text-right">{isAr ? 'إجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#FAF7F0]/30 transition-colors">
                      <td className="p-3 font-semibold text-primary font-mono">{order.id}</td>
                      <td className="p-3 text-dark font-bold font-cairo">{order.customer.name}</td>
                      <td className="p-3 text-gray-500 font-medium whitespace-nowrap">{formatDate(order.date, locale)}</td>
                      <td className="p-3 font-bold text-dark">{formatPrice(order.total, locale)}</td>
                      <td className="p-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider font-cairo ${
                          order.status === 'Delivered'
                            ? 'bg-green-150 text-green-700'
                            : order.status === 'Pending'
                            ? 'bg-gold/20 text-dark'
                            : order.status === 'Processing'
                            ? 'bg-accent/10 text-accent'
                            : 'bg-primary/10 text-primary'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <Link href={`/admin/orders?id=${order.id}`} className="inline-flex p-1.5 bg-[#FAF7F0] border border-light-border text-primary hover:text-gold rounded-lg transition-colors">
                          <Eye className="w-3.5 h-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Top Selling Products — real, from analytics */}
        <div className="lg:col-span-3 bg-white border border-light-border rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex justify-between items-center border-b border-light-border/60 pb-3">
            <h3 className="font-bold text-sm text-primary uppercase tracking-wider font-cairo">
              {isAr ? 'المنتجات الأكثر مبيعاً' : 'Top Selling Products'}
            </h3>
            <Link href="/admin/products" className="text-xs text-primary hover:text-gold font-bold font-cairo">
              {isAr ? 'الكل' : 'View all'}
            </Link>
          </div>

          {analytics.products.bestSelling.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-10">{isAr ? 'لا توجد مبيعات بعد.' : 'No sales yet.'}</p>
          ) : (
            <div className="space-y-3.5 text-xs font-semibold">
              {analytics.products.bestSelling.map((prod, idx) => (
                <div key={prod.id} className="flex items-center justify-between gap-3 p-1 rounded-xl">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-gray-400 font-bold shrink-0">{idx + 1}</span>
                    <div className="min-w-0">
                      <strong className="block text-dark font-bold font-cairo truncate">{isAr ? prod.arabicName || prod.name : prod.name}</strong>
                      <span className="block text-[9px] text-gray-450 font-semibold">{prod.sales} {isAr ? 'مباع' : 'sold'}</span>
                    </div>
                  </div>
                  <span className="font-bold text-primary shrink-0 font-mono">{formatPrice(prod.revenue, locale)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Items List — real, from inventory */}
        <div className="lg:col-span-3 bg-white border border-light-border rounded-2xl p-5 shadow-2xs space-y-4">
          <div className="flex justify-between items-center border-b border-light-border/60 pb-3">
            <h3 className="font-bold text-sm text-primary uppercase tracking-wider font-cairo flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-accent" />
              <span>{isAr ? 'تنبيهات المخزون' : 'Low Stock Items'}</span>
            </h3>
            <Link href="/admin/inventory" className="text-xs text-primary hover:text-gold font-bold font-cairo">
              {isAr ? 'الكل' : 'View all'}
            </Link>
          </div>

          {lowStock.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-10">{isAr ? 'لا توجد تنبيهات حالياً.' : 'No alerts right now.'}</p>
          ) : (
            <div className="space-y-3.5 text-xs font-semibold">
              {lowStock.slice(0, 5).map((prod) => (
                <div key={prod.id} className="flex items-center justify-between gap-3 p-1 rounded-xl">
                  <strong className="block text-dark font-bold font-cairo truncate min-w-0">{isAr ? prod.arabicName || prod.name : prod.name}</strong>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-red-50 text-red-700 shrink-0 font-mono">
                    {prod.stock}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
