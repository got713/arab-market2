'use client';

import React from 'react';
import { useLocaleStore } from '@/store/locale-store';
import { Sparkles, HeartHandshake, ShieldCheck, Truck } from 'lucide-react';

export default function AboutPage() {
  const { t, locale } = useLocaleStore();

  return (
    <div className="fade-in">
      {/* Hero Banner */}
      <section className="bg-primary text-cream py-16 lg:py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/95 to-primary/70 z-10" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=1200&auto=format&fit=crop"
          alt="Middle Eastern Spices"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 z-20 text-center space-y-4">
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight">
            {locale === 'ar' ? 'عرب ماركت — حكايتنا' : 'Our Story — Arab Market'}
          </h1>
          <p className="text-sm sm:text-lg text-cream/80 max-w-2xl mx-auto font-light leading-relaxed">
            {locale === 'ar' 
              ? 'نربط العائلات العربية والشرق أوسطية في أمريكا بنكهات أوطانهم الأصلية، بكل سهولة وسرعة.' 
              : 'Bringing the authentic flavors and ingredients of the Arab world and Middle East directly to your kitchen in America.'}
          </p>
        </div>
      </section>

      {/* Main Narrative */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4 text-sm text-gray-600 leading-relaxed">
            <h2 className="text-xl sm:text-2xl font-bold text-dark">
              {locale === 'ar' ? 'تقريب الطعم العربي لأوطاننا البديلة' : 'Flavors of the Arab World, Closer to Home'}
            </h2>
            <p>
              Founded in 2026, **Arab Market** was born from a simple longing: the search for true Egyptian Molokhia, authentic Lebanese Tahini, and Saudi dates that taste of home, right here in the United States.
            </p>
            <p>
              We understand that food is more than just sustenance; it is culture, tradition, and a direct link to our roots. Our platform sources directly from local farmers and heritage manufacturers in Egypt, the Levant, the Gulf, and North Africa.
            </p>
            <p>
              We prioritize an American online shopping experience—clean, transparent, and lightning-fast—so you can order your daily pantry essentials, frozen specialities, and sweet treats in seconds.
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden aspect-video md:aspect-square bg-cream/10 border border-light-border relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop" 
              alt="Grocery selection" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Pillars / Values Grid */}
        <div className="pt-12 border-t border-light-border space-y-6">
          <h2 className="text-center font-bold text-xl sm:text-2xl text-dark">
            Why Shop With Arab Market?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 border border-light-border rounded-xl text-center space-y-3 bg-cream/10">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-bold text-sm text-dark">Authentic & Halal</h3>
              <p className="text-xs text-gray-500 leading-normal">
                Every single item in our catalog is 100% Halal certified and sourced from authentic Middle Eastern manufacturers.
              </p>
            </div>

            <div className="p-5 border border-light-border rounded-xl text-center space-y-3 bg-cream/10">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                <Truck className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-bold text-sm text-dark">Nationwide Delivery</h3>
              <p className="text-xs text-gray-500 leading-normal">
                Equipped with custom insulation packages, we deliver frozen foods and pantry goods safely to any ZIP code in the United States.
              </p>
            </div>

            <div className="p-5 border border-light-border rounded-xl text-center space-y-3 bg-cream/10">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary mx-auto flex items-center justify-center">
                <HeartHandshake className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-bold text-sm text-dark">Wholesale Sizing</h3>
              <p className="text-xs text-gray-500 leading-normal">
                Need single units for dinner or cases for your restaurant business? Select between single, pack, and case pricing configurations.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
