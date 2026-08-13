'use client';

import React from 'react';
import { BarChart3, TrendingUp, DollarSign, ShoppingBag } from 'lucide-react';

export default function AdminAnalyticsPage() {
  // Mock performance metrics
  const categoriesPerformance = [
    { name: 'Egyptian Foods', percentage: 40, sales: '$19,568' },
    { name: 'Levantine Specialties', percentage: 32, sales: '$15,654' },
    { name: 'Sweets & Desserts', percentage: 14, sales: '$6,848' },
    { name: 'Spices & Herbs', percentage: 8, sales: '$3,913' },
    { name: 'Beverages & Teas', percentage: 6, sales: '$2,937' },
  ];

  const countriesPerformance = [
    { country: 'Egypt 🇪🇬', share: 42 },
    { country: 'Lebanon 🇱🇧', share: 28 },
    { country: 'Palestine 🇵🇸', share: 15 },
    { country: 'Jordan 🇯🇴', share: 8 },
    { country: 'Saudi Arabia 🇸🇦', share: 7 },
  ];

  return (
    <div className="space-y-8 fade-in text-xs">
      
      {/* Overview stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white border border-light-border p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Average Daily Sales</span>
          <strong className="text-lg text-dark">$1,580.40</strong>
          <span className="text-[10px] text-green-600 block pt-0.5 font-semibold">▲ +4.2% since last week</span>
        </div>
        <div className="bg-white border border-light-border p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Conversion Rate</span>
          <strong className="text-lg text-dark">3.48%</strong>
          <span className="text-[10px] text-green-600 block pt-0.5 font-semibold">▲ +0.5% conversion increase</span>
        </div>
        <div className="bg-white border border-light-border p-4 rounded-xl shadow-xs">
          <span className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Customer LTV (Average)</span>
          <strong className="text-lg text-dark">$54.80</strong>
          <span className="text-[10px] text-gray-500 block pt-0.5">Calculated over 892 accounts</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Sales Distribution */}
        <div className="bg-white border border-light-border p-5 rounded-xl shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-primary uppercase tracking-wider border-b border-light-border pb-3 flex items-center gap-1.5">
            <BarChart3 className="w-4.5 h-4.5 text-gold" />
            <span>Sales by Category</span>
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
            <span>Country Sourcing Share</span>
          </h3>

          <div className="space-y-4">
            {countriesPerformance.map((c, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-dark">{c.country}</span>
                  <span className="text-gray-500 font-semibold">{c.share}% sales volume</span>
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
