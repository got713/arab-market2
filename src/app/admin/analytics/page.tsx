'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useLocaleStore } from '@/store/locale-store';
import { ApiClient } from '@/lib/api-client';
import { AnalyticsService, AnalyticsRange, AnalyticsSummary } from '@/services/analytics';
import { formatPrice, getErrorMessage } from '@/lib/utils';
import { BarChart3, TrendingUp, AlertTriangle, Users, ShoppingCart, DollarSign } from 'lucide-react';

interface LowStockRow {
  id: number;
  name: string;
  arabicName: string;
  stock: number;
}

const RANGES: { id: AnalyticsRange; label: string; labelAr: string }[] = [
  { id: '7d', label: '7 days', labelAr: '7 أيام' },
  { id: '30d', label: '30 days', labelAr: '30 يوم' },
  { id: '90d', label: '90 days', labelAr: '90 يوم' },
  { id: '12m', label: '12 months', labelAr: '12 شهر' },
];

export default function AdminAnalyticsPage() {
  const { locale } = useLocaleStore();
  const isAr = locale === 'ar';

  const [range, setRange] = useState<AnalyticsRange>('30d');
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [lowStockItems, setLowStockItems] = useState<LowStockRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [summary, inventoryRes] = await Promise.all([
        AnalyticsService.getSummary(range, locale),
        ApiClient.get<{ data: LowStockRow[] }>('/admin/inventory', { params: { status: 'low_stock' } }, locale),
      ]);
      setData(summary);
      setLowStockItems((inventoryRes.data || []).slice(0, 5));
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load analytics.'));
    } finally {
      setLoading(false);
    }
  }, [range, locale]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-20 space-y-3">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
        <p className="text-sm text-red-600 font-semibold">{error || 'No analytics data available.'}</p>
        <button onClick={load} className="text-xs font-bold text-primary hover:underline">
          {isAr ? 'إعادة المحاولة' : 'Try again'}
        </button>
      </div>
    );
  }

  const maxTrend = Math.max(1, ...data.salesTrend.map((p) => p.total));
  const statusEntries: [string, number][] = [
    ['pending', data.orders.byStatus.pending],
    ['processing', data.orders.byStatus.processing],
    ['shipped', data.orders.byStatus.shipped],
    ['delivered', data.orders.byStatus.delivered],
    ['cancelled', data.orders.byStatus.cancelled],
  ];
  const statusTotal = Math.max(1, statusEntries.reduce((sum, [, v]) => sum + v, 0));

  return (
    <div className="space-y-8 fade-in text-xs" dir={isAr ? 'rtl' : 'ltr'}>

      {/* Range selector */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-sm font-bold text-primary uppercase tracking-wider">
          {isAr ? 'التحليلات' : 'Analytics'}
        </h2>
        <div className="flex gap-1.5 bg-white border border-light-border rounded-lg p-1">
          {RANGES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRange(r.id)}
              className={`px-3 py-1.5 rounded-md font-bold transition-colors ${
                range === r.id ? 'bg-primary text-cream' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {isAr ? r.labelAr : r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview stats — scoped to the selected range */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white border border-light-border p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1 flex items-center gap-1">
            <DollarSign className="w-3 h-3 text-gold" />
            {isAr ? 'مبيعات الفترة المحددة' : 'Revenue (selected range)'}
          </span>
          <strong className="text-lg text-dark">{formatPrice(data.sales.rangeTotal, locale)}</strong>
          <span className={`text-[10px] block pt-0.5 font-semibold ${data.sales.growth >= 0 ? 'text-green-605' : 'text-red-600'}`}>
            {data.sales.growth >= 0 ? '▲' : '▼'} {Math.abs(data.sales.growth)}% {isAr ? 'مقابل الفترة السابقة' : 'vs previous period'}
          </span>
        </div>
        <div className="bg-white border border-light-border p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1 flex items-center gap-1">
            <ShoppingCart className="w-3 h-3 text-gold" />
            {isAr ? 'الطلبات في الفترة' : 'Orders (selected range)'}
          </span>
          <strong className="text-lg text-dark">{data.orders.rangeTotal.toLocaleString()}</strong>
          <span className={`text-[10px] block pt-0.5 font-semibold ${data.orders.growth >= 0 ? 'text-green-605' : 'text-red-600'}`}>
            {data.orders.growth >= 0 ? '▲' : '▼'} {Math.abs(data.orders.growth)}% {isAr ? 'مقابل الفترة السابقة' : 'vs previous period'}
          </span>
        </div>
        <div className="bg-white border border-light-border p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1 flex items-center gap-1">
            <Users className="w-3 h-3 text-gold" />
            {isAr ? 'عملاء جدد' : 'New Customers'}
          </span>
          <strong className="text-lg text-dark">{data.customers.new.toLocaleString()}</strong>
          <span className="text-[10px] text-gray-500 block pt-0.5">
            {data.customers.returning} {isAr ? 'عميل عائد في نفس الفترة' : 'returning in this period'}
          </span>
        </div>
        <div className="bg-white border border-light-border p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
            {isAr ? 'إجمالي المبيعات (كل الأوقات)' : 'All-Time Revenue'}
          </span>
          <strong className="text-lg text-dark">{formatPrice(data.sales.allTime, locale)}</strong>
          <span className="text-[10px] text-gray-500 block pt-0.5">
            {isAr ? `اليوم: ${formatPrice(data.sales.today, locale)}` : `Today: ${formatPrice(data.sales.today, locale)}`}
          </span>
        </div>
      </div>

      {/* Sales trend */}
      <div className="bg-white border border-light-border p-5 rounded-xl shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-primary uppercase tracking-wider border-b border-light-border pb-3 flex items-center gap-1.5">
          <TrendingUp className="w-4.5 h-4.5 text-gold" />
          <span>{isAr ? 'اتجاه المبيعات' : 'Sales Trend'}</span>
        </h3>
        {data.salesTrend.every((p) => p.total === 0) ? (
          <p className="text-gray-400 text-center py-6">{isAr ? 'لا توجد مبيعات مدفوعة في هذه الفترة بعد.' : 'No paid sales in this period yet.'}</p>
        ) : (
          <div className="flex items-end gap-1 h-32 overflow-x-auto no-scrollbar">
            {data.salesTrend.map((point, idx) => (
              <div key={idx} className="flex-1 min-w-[6px] flex flex-col items-center justify-end h-full group relative">
                <div
                  className="w-full bg-primary/80 hover:bg-primary rounded-t transition-colors"
                  style={{ height: `${Math.max(2, (point.total / maxTrend) * 100)}%` }}
                  title={`${point.label}: ${formatPrice(point.total, locale)}`}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Sales Distribution */}
        <div className="bg-white border border-light-border p-5 rounded-xl shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-primary uppercase tracking-wider border-b border-light-border pb-3 flex items-center gap-1.5">
            <BarChart3 className="w-4.5 h-4.5 text-gold" />
            <span>{isAr ? 'المبيعات حسب القسم' : 'Revenue by Category'}</span>
          </h3>

          {data.categoryBreakdown.length === 0 ? (
            <p className="text-gray-400 text-center py-6">{isAr ? 'لا توجد بيانات مبيعات لهذه الفترة.' : 'No sales data for this period.'}</p>
          ) : (
            <div className="space-y-4">
              {data.categoryBreakdown.map((cat, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-dark">{cat.name}</span>
                    <span className="text-gray-500 font-semibold">{formatPrice(cat.revenue, locale)} ({cat.percentage}%)</span>
                  </div>
                  <div className="w-full h-2 bg-gray-150 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${cat.percentage}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Selling Products */}
        <div className="bg-white border border-light-border p-5 rounded-xl shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-primary uppercase tracking-wider border-b border-light-border pb-3 flex items-center gap-1.5">
            <TrendingUp className="w-4.5 h-4.5 text-gold" />
            <span>{isAr ? 'المنتجات الأكثر مبيعاً' : 'Top Products'}</span>
          </h3>

          {data.products.bestSelling.length === 0 ? (
            <p className="text-gray-400 text-center py-6">{isAr ? 'لا توجد مبيعات لهذه الفترة.' : 'No sales for this period.'}</p>
          ) : (
            <div className="divide-y divide-light-border">
              {data.products.bestSelling.map((p) => (
                <div key={p.id} className="py-3 flex justify-between items-center first:pt-0 last:pb-0">
                  <div className="space-y-0.5">
                    <strong className="text-dark block font-semibold">{isAr ? p.arabicName || p.name : p.name}</strong>
                    <span className="text-[10px] text-gray-500">{p.sales} {isAr ? 'وحدة مباعة' : 'sold'}</span>
                  </div>
                  <strong className="text-primary font-bold">{formatPrice(p.revenue, locale)}</strong>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Alerts */}
        <div className="bg-white border border-light-border p-5 rounded-xl shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-primary uppercase tracking-wider border-b border-light-border pb-3 flex items-center gap-1.5">
            <AlertTriangle className="w-4.5 h-4.5 text-red-500" />
            <span>{isAr ? 'تنبيهات المخزون' : 'Stock Alerts'}</span>
          </h3>
          <div className="flex gap-4 text-[10px] font-bold text-gray-500 pb-2">
            <span>{isAr ? 'منخفض:' : 'Low stock:'} <strong className="text-dark">{data.lowStock.count}</strong></span>
            <span>{isAr ? 'نفد:' : 'Out of stock:'} <strong className="text-dark">{data.products.outOfStock}</strong></span>
          </div>
          {lowStockItems.length === 0 ? (
            <p className="text-gray-400 text-center py-6">{isAr ? 'لا توجد تنبيهات مخزون حالياً.' : 'No stock alerts right now.'}</p>
          ) : (
            <div className="divide-y divide-light-border">
              {lowStockItems.map((item) => (
                <div key={item.id} className="py-3 flex justify-between items-center first:pt-0 last:pb-0">
                  <span className="font-semibold text-dark">{isAr ? item.arabicName || item.name : item.name}</span>
                  <span className="bg-red-50 text-red-700 font-bold border border-red-200 px-2 py-0.5 rounded text-[10px]">
                    {item.stock} {isAr ? 'متبقي' : 'left'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order status distribution */}
        <div className="bg-white border border-light-border p-5 rounded-xl shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-primary uppercase tracking-wider border-b border-light-border pb-3 flex items-center gap-1.5">
            <ShoppingCart className="w-4.5 h-4.5 text-gold" />
            <span>{isAr ? 'حالة الطلبات في الفترة' : 'Order Status (selected range)'}</span>
          </h3>
          <div className="space-y-3">
            {statusEntries.map(([status, count]) => (
              <div key={status} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-dark capitalize">{status}</span>
                  <span className="text-gray-500 font-semibold">{count}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-150 rounded-full overflow-hidden">
                  <div className="h-full bg-accent rounded-full" style={{ width: `${(count / statusTotal) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
