'use client';

import React from 'react';
import { useLocaleStore } from '@/store/locale-store';
import { BarChart3, TrendingUp, AlertTriangle, Clock } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const { locale } = useLocaleStore();

  // Mock performance metrics for the 6 new categories
  const categoriesPerformance = [
    { name: locale === 'ar' ? 'البقالة' : 'Groceries', percentage: 38, sales: '$18,520' },
    { name: locale === 'ar' ? 'المجمدات' : 'Frozen', percentage: 22, sales: '$10,728' },
    { name: locale === 'ar' ? 'المشروبات' : 'Drinks', percentage: 16, sales: '$7,801' },
    { name: locale === 'ar' ? 'الحلويات والتسالي' : 'Sweets & Snacks', percentage: 12, sales: '$5,851' },
    { name: locale === 'ar' ? 'التوابل والصلصات' : 'Spices & Sauces', percentage: 8, sales: '$3,900' },
    { name: locale === 'ar' ? 'مستلزمات المنزل' : 'Household', percentage: 4, sales: '$1,950' },
  ];

  const topProducts = [
    { name: locale === 'ar' ? 'قهوة تركية محمد أفندي بالهيل' : 'Mehmet Efendi Turkish Coffee with Cardamom', sales: '240 units', revenue: '$2,157' },
    { name: locale === 'ar' ? 'شاي سيلان أسود الوزة - فرط' : 'Al-Wazah Ceylon Black Tea - Loose Leaf', sales: '185 units', revenue: '$1,293' },
    { name: locale === 'ar' ? 'زعتر أخضر لبناني بالسمسم زياد' : 'Ziyad Lebanese Green Zaatar Thyme', sales: '142 units', revenue: '$992' },
    { name: locale === 'ar' ? 'زيت زيتون بكر ممتاز زياد' : 'Ziyad Extra Virgin Olive Oil Palestinian', sales: '98 units', revenue: '$1,469' },
  ];

  const lowStockItems = [
    { name: locale === 'ar' ? 'هريسة حارة تونسية منارة كاب بون' : 'Le Phare du Cap Bon Tunisian Harissa Paste', stock: 12 },
    { name: locale === 'ar' ? 'شراب رمان باربيكان (6 حبات)' : 'Barbican Pomegranate Malt Drink (6-Pack)', stock: 5 },
    { name: locale === 'ar' ? 'تمر مجهول جامبو كاليفورنيا' : 'California Jumbo Medjool Dates', stock: 3 },
  ];

  return (
    <div className="space-y-8 fade-in text-xs" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white border border-light-border p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
            {locale === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}
          </span>
          <strong className="text-lg text-dark">$50,750.00</strong>
          <span className="text-[10px] text-green-605 block pt-0.5 font-semibold">
            {locale === 'ar' ? '▲ +12.4% هذا الشهر' : '▲ +12.4% this month'}
          </span>
        </div>
        <div className="bg-white border border-light-border p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
            {locale === 'ar' ? 'إجمالي الطلبات' : 'Total Orders'}
          </span>
          <strong className="text-lg text-dark">793</strong>
          <span className="text-[10px] text-green-605 block pt-0.5 font-semibold">
            {locale === 'ar' ? '▲ +8.1% زيادة طلبات' : '▲ +8.1% order increase'}
          </span>
        </div>
        <div className="bg-white border border-light-border p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
            {locale === 'ar' ? 'متوسط قيمة الطلب (AOV)' : 'Average Order Value'}
          </span>
          <strong className="text-lg text-dark">$64.01</strong>
          <span className="text-[10px] text-gray-500 block pt-0.5">
            {locale === 'ar' ? 'محسوب بناء على كل طلبات المتجر' : 'Calculated over all store orders'}
          </span>
        </div>
        <div className="bg-white border border-light-border p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
            {locale === 'ar' ? 'معدل التحويل (Conversion)' : 'Conversion Rate'}
          </span>
          <strong className="text-lg text-dark">3.48%</strong>
          <span className="text-[10px] text-green-605 block pt-0.5 font-semibold">
            {locale === 'ar' ? '▲ +0.5% هذا الأسبوع' : '▲ +0.5% this week'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Sales Distribution */}
        <div className="bg-white border border-light-border p-5 rounded-xl shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-primary uppercase tracking-wider border-b border-light-border pb-3 flex items-center gap-1.5">
            <BarChart3 className="w-4.5 h-4.5 text-gold" />
            <span>{locale === 'ar' ? 'المبيعات حسب الأقسام الـ 6' : 'Best Selling Categories (6 Core)'}</span>
          </h3>

          <div className="space-y-4">
            {categoriesPerformance.map((cat, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-dark">{cat.name}</span>
                  <span className="text-gray-500 font-semibold">{cat.sales} ({cat.percentage}%)</span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-gray-150 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full" 
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white border border-light-border p-5 rounded-xl shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-primary uppercase tracking-wider border-b border-light-border pb-3 flex items-center gap-1.5">
            <TrendingUp className="w-4.5 h-4.5 text-gold" />
            <span>{locale === 'ar' ? 'المنتجات الأكثر مبيعاً' : 'Top Products'}</span>
          </h3>

          <div className="divide-y divide-light-border">
            {topProducts.map((p, idx) => (
              <div key={idx} className="py-3 flex justify-between items-center first:pt-0 last:pb-0">
                <div className="space-y-0.5">
                  <strong className="text-dark block font-semibold">{p.name}</strong>
                  <span className="text-[10px] text-gray-500">{p.sales} sold</span>
                </div>
                <strong className="text-primary font-bold">{p.revenue}</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inventory & Recent Order Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Alerts */}
        <div className="bg-white border border-light-border p-5 rounded-xl shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-primary uppercase tracking-wider border-b border-light-border pb-3 flex items-center gap-1.5">
            <AlertTriangle className="w-4.5 h-4.5 text-red-500" />
            <span>{locale === 'ar' ? 'تنبيهات انخفاض المخزون' : 'Low Stock Alerts'}</span>
          </h3>

          <div className="divide-y divide-light-border">
            {lowStockItems.map((item, idx) => (
              <div key={idx} className="py-3 flex justify-between items-center first:pt-0 last:pb-0">
                <span className="font-semibold text-dark">{item.name}</span>
                <span className="bg-red-50 text-red-700 font-bold border border-red-200 px-2 py-0.5 rounded text-[10px]">
                  {item.stock} items left
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* System Hearts/Averages */}
        <div className="bg-white border border-light-border p-5 rounded-xl shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-primary uppercase tracking-wider border-b border-light-border pb-3 flex items-center gap-1.5">
            <Clock className="w-4.5 h-4.5 text-gold" />
            <span>{locale === 'ar' ? 'نشاط المبيعات الأخير' : 'Recent Order Frequency'}</span>
          </h3>
          <p className="text-gray-500 leading-relaxed">
            {locale === 'ar' 
              ? 'متوسط معدل دخول الطلبات الجديدة هو طلب واحد كل 24 دقيقة. مستويات المخزون وعمليات المزامنة مع مستودع الولايات المتحدة تعمل بشكل طبيعي وبدون مشاكل.' 
              : 'Our average checkout processing rate is currently 1 new order every 24 minutes. US fulfillment warehouse synchronization is fully functional and operating within normal latency.'}
          </p>
        </div>
      </div>

    </div>
  );
}
