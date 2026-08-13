'use client';

import React, { useState } from 'react';
import { useLocaleStore } from '@/store/locale-store';
import { HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface FaqItem {
  q: string;
  a: string;
}

export default function FaqPage() {
  const { t, locale } = useLocaleStore();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqItems: FaqItem[] = [
    {
      q: 'Do you deliver frozen foods safely across the United States?',
      a: 'Yes! We ship all frozen foods (like Americana Molokhia or Falafels) in insulated temperature-controlled packages lined with dry ice or gel packs. This ensures your products remain frozen during their 3-5 days standard transit.'
    },
    {
      q: 'Are all products on Arab Market certified Halal?',
      a: 'Absolutely. Every grocery item, snack, and ingredient in our store is meticulously inspected and verified as 100% Halal. We clearly list all ingredients, allergen disclosures, and certifications on the product details page.'
    },
    {
      q: 'How does the Single / Pack / Case pricing work?',
      a: 'We offer tiered purchasing options. You can choose to buy a "Single" unit, a "Pack" (usually 6 units), or a "Case" (usually 12 units). Buying in packs or cases grants you instant bulk discounts (up to 15% off) which are highlighted during selection.'
    },
    {
      q: 'How can I get free shipping on my order?',
      a: 'We offer free Standard Shipping (3-5 business days) across America on all qualifying storefront orders of $50 or more (after coupon discounts are subtracted). For orders below $50, standard shipping is flat $7.99.'
    },
    {
      q: 'Can I track my shipment in real-time?',
      a: 'Yes. Once you complete your checkout, you will receive a mock order ID (e.g., AM-10482). You can enter this ID in the "Track Order" page to inspect the shipping timeline (Pending ➔ Processing ➔ Shipped ➔ Out for Delivery ➔ Delivered).'
    },
    {
      q: 'Do you offer commercial accounts for restaurants?',
      a: 'Yes. Restaurants and Middle Eastern bakeries can purchase cases in bulk. We are currently developing a wholesale commercial portal; in the meantime, you can purchase products by the case directly on the storefront.'
    }
  ];

  const toggleIndex = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 sm:py-16 fade-in space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <HelpCircle className="w-12 h-12 text-gold mx-auto" />
        <h1 className="text-2xl sm:text-4xl font-bold text-dark">{t('nav.faq')}</h1>
        <p className="text-xs sm:text-sm text-muted-text">
          Frequently asked questions about Arab Market online shopping, delivery logistics, and Halal certifications.
        </p>
      </div>

      {/* List */}
      <div className="space-y-4 pt-6">
        {faqItems.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div 
              key={idx}
              className="border border-light-border rounded-xl bg-white overflow-hidden shadow-xs hover:border-gold/30 transition-all duration-150"
            >
              <button
                onClick={() => toggleIndex(idx)}
                className="w-full px-5 py-4 text-left rtl:text-right font-bold text-sm text-dark flex items-center justify-between gap-4"
              >
                <span>{item.q}</span>
                {isOpen ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs text-gray-500 leading-relaxed border-t border-gray-50/60">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
