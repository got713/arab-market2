'use client';

import React from 'react';
import { useLocaleStore } from '@/store/locale-store';
import { BarChart3, TrendingUp } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const { locale } = useLocaleStore();

  // Mock performance metrics
  const categoriesPerformance = [
    { name: locale === 'ar' ? 'البقالة والأغذية الجافة' : 'Pantry & Groceries', percentage: 40, sales: '$19,568' },
    { name: locale === 'ar' ? 'الأغذية المجمدة' : 'Frozen Foods', percentage: 32, sales: '$15,654' },
    { name: locale === 'ar' ? 'الحلويات والتسالي' : 'Sweets & Snacks', percentage: 14, sales: '$6,848' },
    { name: locale === 'ar' ? 'البهارات والأعشاب' : 'Spices & Herbs', percentage: 8, sales: '$3,913' },
    { name: locale === 'ar' ? 'المشروبات والعصائر' : 'Beverages', percentage: 6, sales: '$2,937' },
  ];

  const countriesPerformance = [
    { country: locale === 'ar' ? 'مصر 🇪🇬' : 'Egypt 🇪🇬', share: 42 },
    { country: locale === 'ar' ? 'لبنان 🇱🇧' : 'Lebanon 🇱🇧', share: 28 },
    { country: locale === 'ar' ? 'فلسطين 🇵🇸' : 'Palestine 🇵🇸', share: 15 },
    { country: locale === 'ar' ? 'الأردن 🇯🇴' : 'Jordan 🇯🇴', share: 8 },
    { country: locale === 'ar' ? 'المملكة العربية السعودية 🇸🇦' : 'Saudi Arabia 🇸🇦', share: 7 },
  ];

  return (
    <div className="space-y-8 fade-in text-xs" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-light-border p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
            {locale === 'ar' ? 'متوسط المبيعات اليومية' : 'Average Daily Sales'}
          </span>
          <strong className="text-lg text-dark">$1,580.40</strong>
          <span className="text-[10px] text-green-600 block pt-0.5 font-semibold">
            {locale === 'ar' ? '▲ +4.2% مقارنة بالأسبوع الماضي' : '▲ +4.2% since last week'}
          </span>
        </div>
        <div className="bg-white border border-light-border p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
            {locale === 'ar' ? 'معدل التحويل (Conversion Rate)' : 'Conversion Rate'}
          </span>
          <strong className="text-lg text-dark">3.48%</strong>
          <span className="text-[10px] text-green-600 block pt-0.5 font-semibold">
            {locale === 'ar' ? '▲ +0.5% زيادة بمعدل التحويل' : '▲ +0.5% conversion increase'}
          </span>
        </div>
        <div className="bg-white border border-light-border p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
            {locale === 'ar' ? 'متوسط قيمة العميل (LTV)' : 'Customer LTV (Average)'}
          </span>
          <strong className="text-lg text-dark">$54.80</strong>
          <span className="text-[10px] text-gray-500 block pt-0.5">
            {locale === 'ar' ? 'محسوبة بناء على 892 حساباً' : 'Calculated over 892 accounts'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Sales Distribution */}
        <div className="bg-white border border-light-border p-5 rounded-xl shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-primary uppercase tracking-wider border-b border-light-border pb-3 flex items-center gap-1.5">
            <BarChart3 className="w-4.5 h-4.5 text-gold" />
            <span>{locale === 'ar' ? 'المبيعات حسب الفئة والأقسام' : 'Sales by Category'}</span>
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

        {/* Countries share */}
        <div className="bg-white border border-light-border p-5 rounded-xl shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-primary uppercase tracking-wider border-b border-light-border pb-3 flex items-center gap-1.5">
            <TrendingUp className="w-4.5 h-4.5 text-gold" />
            <span>{locale === 'ar' ? 'حصة المبيعات حسب بلد المنشأ' : 'Country Sourcing Share'}</span>
          </h3>

          <div className="space-y-4">
            {countriesPerformance.map((c, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-dark">{c.country}</span>
                  <span className="text-gray-500 font-semibold">
                    {c.share}% {locale === 'ar' ? 'من حجم المبيعات' : 'sales volume'}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full h-2 bg-gray-150 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gold rounded-full" 
                    style={{ width: `${c.share}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
