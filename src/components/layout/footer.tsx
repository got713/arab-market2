'use client';

import React from 'react';
import Link from 'next/link';
import Logo from '../ui/logo';
import { useLocaleStore } from '@/store/locale-store';
import { categories } from '@/data/categories';
import { ShieldCheck } from 'lucide-react';

export default function Footer() {
  const { locale, setLocale, t } = useLocaleStore();

  return (
    <footer className="bg-primary text-cream mt-auto border-t border-primary-dark">
      {/* Top Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Info Column */}
        <div className="space-y-4">
          <Logo light={true} />
          <p className="text-xs text-cream/70 leading-relaxed max-w-sm pt-2">
            {t('footer.shop_desc')}
          </p>
          <div className="flex items-center gap-3 pt-2">
            <a href="#" className="w-8 h-8 rounded-full bg-cream/10 flex items-center justify-center hover:bg-gold hover:text-dark transition-colors duration-150" aria-label="Facebook">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
              </svg>
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-cream/10 flex items-center justify-center hover:bg-gold hover:text-dark transition-colors duration-150" aria-label="Instagram">
              <svg className="w-4 h-4" stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" xmlns="http://www.w3.org/2000/svg">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-cream/10 flex items-center justify-center hover:bg-gold hover:text-dark transition-colors duration-150" aria-label="Twitter">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Shop Column */}
        <div>
          <h3 className="text-sm font-bold text-gold uppercase tracking-wider mb-4">
            {locale === 'ar' ? 'تسوق' : 'Shop'}
          </h3>
          <ul className="space-y-2 text-xs text-cream/80">
            <li>
              <Link href="/shop" className="hover:text-gold transition-colors">
                {locale === 'ar' ? 'كل المنتجات' : 'All Products'}
              </Link>
            </li>
            <li>
              <Link href="/#categories-section" className="hover:text-gold transition-colors">
                {locale === 'ar' ? 'تصفح الأقسام' : 'Categories'}
              </Link>
            </li>
            <li>
              <Link href="/shop?filter=deals" className="hover:text-gold transition-colors">
                {t('nav.deals')}
              </Link>
            </li>
            <li>
              <Link href="/shop?filter=bestseller" className="hover:text-gold transition-colors">
                {t('nav.bestsellers')}
              </Link>
            </li>
            <li>
              <Link href="/shop?sort=newest" className="hover:text-gold transition-colors">
                {t('nav.newarrivals')}
              </Link>
            </li>
          </ul>
        </div>

        {/* Customer Service Column */}
        <div>
          <h3 className="text-sm font-bold text-gold uppercase tracking-wider mb-4">
            {t('footer.customer_service')}
          </h3>
          <ul className="space-y-2 text-xs text-cream/80">
            <li>
              <Link href="/contact" className="hover:text-gold transition-colors">
                {t('nav.contact')}
              </Link>
            </li>
            <li>
              <Link href="/faq" className="hover:text-gold transition-colors">
                {t('nav.faq')}
              </Link>
            </li>
            <li>
              <Link href="/shipping" className="hover:text-gold transition-colors">
                {locale === 'ar' ? 'سياسات الشحن والتوصيل' : 'Shipping & Delivery'}
              </Link>
            </li>
            <li>
              <Link href="/track-order" className="hover:text-gold transition-colors">
                {t('nav.track')}
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal/Company Column */}
        <div>
          <h3 className="text-sm font-bold text-gold uppercase tracking-wider mb-4">
            {t('footer.company')}
          </h3>
          <ul className="space-y-2 text-xs text-cream/80">
            <li>
              <Link href="/about" className="hover:text-gold transition-colors">
                {t('nav.about')}
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-gold transition-colors">
                {t('footer.privacy')}
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-gold transition-colors">
                {t('footer.terms')}
              </Link>
            </li>
            <li className="pt-2">
              <button
                onClick={() => setLocale(locale === 'en' ? 'ar' : 'en')}
                className="text-gold font-bold hover:underline flex items-center gap-1.5"
              >
                <span>{locale === 'en' ? 'العربية (Arabic)' : 'English (AR)'}</span>
              </button>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Footer */}
      <div className="bg-primary-dark border-t border-primary/20 text-xs text-cream/60 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4.5 h-4.5 text-gold" />
            <span>© {new Date().getFullYear()} {t('footer.all_rights')}</span>
          </div>
          <div className="text-[10px] text-cream/40">
            {locale === 'ar' ? (
              <span>هذا الموقع مجرد عرض تجريبي لمنصة عرب ماركت لتجارة المنتجات الغذائية الشرق أوسطية في أمريكا.</span>
            ) : (
              <span>This website is a functional MVP demo for Arab Market grocery e-commerce operations in the US.</span>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
