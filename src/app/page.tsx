'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { ProductService } from '@/services/products';
import { categories } from '@/data/categories';
import { useLocaleStore } from '@/store/locale-store';
import ProductCard from '@/components/products/product-card';
import { 
  ShoppingBag, 
  Truck, 
  HeartHandshake, 
  ShieldCheck, 
  ArrowRight,
  Sparkles,
  Snowflake,
  Cookie,
  Coffee,
  Flame,
  Home,
  ChevronRight,
  Carrot,
  Milk,
  Beef,
  Utensils,
  Package,
  Wheat
} from 'lucide-react';

// Map icon names to Lucide icons
const iconMap: Record<string, React.ComponentType<any>> = {
  ShoppingBag,
  Snowflake,
  Carrot,
  Milk,
  Beef,
  Coffee,
  Cookie,
  Flame,
  Utensils,
  Package,
  Wheat,
  Home
};

export default function HomePage() {
  const { t, locale } = useLocaleStore();
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const bs = await ProductService.getBestSellers();
        const fp = await ProductService.getFeaturedProducts();
        setBestSellers(bs.slice(0, 4));
        setFeaturedProducts(fp.slice(0, 4));
      } catch (err) {
        console.error('Error loading products', err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  return (
    <div className="fade-in">
      {/* Hero Section */}
      <section className="relative bg-primary overflow-hidden py-20 lg:py-28">
        {/* Background Gradients & Accents */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/90 to-primary/60 z-10" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1600&auto=format&fit=crop" 
          alt="Middle Eastern Spices and Groceries" 
          className="absolute inset-0 w-full h-full object-cover opacity-35"
        />
        
        {/* Decorative Gold Elements */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-gold/10 rounded-full filter blur-3xl" />
        <div className="absolute left-1/4 bottom-0 w-80 h-80 bg-gold/5 rounded-full filter blur-2xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-25 text-cream">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 bg-gold/20 border border-gold/40 px-3.5 py-1.5 rounded-full text-xs font-semibold text-gold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{locale === 'ar' ? 'توصيل متاح لكل الولايات' : 'Shipping Nationwide Across the US'}</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight font-sans tracking-tight">
              {t('hero.title')}
            </h1>
            
            <p className="text-sm sm:text-lg text-cream/80 leading-relaxed font-sans font-light">
              {t('hero.subtitle')}
            </p>

            <div className="pt-4 flex flex-wrap gap-4">
              <Link
                href="/shop"
                className="px-8 py-3.5 bg-gold hover:bg-gold-light text-dark font-bold rounded-lg shadow-lg hover:shadow-xl transition-all duration-150 flex items-center gap-2"
              >
                <span>{t('hero.cta_shop')}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </Link>
              <a
                href="#categories-section"
                className="px-8 py-3.5 bg-white/10 hover:bg-white/20 border border-white/20 text-cream font-bold rounded-lg transition-all duration-150"
              >
                {t('hero.cta_categories')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Value Propositions */}
      <section className="bg-cream/40 border-b border-light-border py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-primary/10 text-primary rounded-xl flex-shrink-0">
              <Truck className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-dark uppercase">{locale === 'ar' ? 'شحن سريع' : 'Fast Shipping'}</h4>
              <p className="text-[11px] text-muted-text">{locale === 'ar' ? 'شحن لكل الولايات الأمريكية' : 'Across all US states'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-primary/10 text-primary rounded-xl flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-dark uppercase">{locale === 'ar' ? 'منتجات حلال 100%' : '100% Halal'}</h4>
              <p className="text-[11px] text-muted-text">{locale === 'ar' ? 'مصادر موثوقة ومضمونة' : 'Certified organic & authentic'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-primary/10 text-primary rounded-xl flex-shrink-0">
              <ShoppingBag className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-dark uppercase">{locale === 'ar' ? 'خيارات الجملة والتجزئة' : 'Wholesale Sizing'}</h4>
              <p className="text-[11px] text-muted-text">{locale === 'ar' ? 'شراء بالقطعة، الرابطة، أو الصندوق' : 'Buy single, packs, or cases'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-primary/10 text-primary rounded-xl flex-shrink-0">
              <HeartHandshake className="w-6 h-6 text-gold" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-dark uppercase">{locale === 'ar' ? 'أصالة الطعم العربي' : 'Middle Eastern Heart'}</h4>
              <p className="text-[11px] text-muted-text">{locale === 'ar' ? 'أشهر المنتجات والبراندات' : 'Connecting you to home'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section id="categories-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-dark">{t('nav.categories')}</h2>
            <p className="text-xs sm:text-sm text-muted-text mt-1">{locale === 'ar' ? 'تصفح تشكيلة واسعة من البقالة والأغذية الطازجة والمجمدة والمستلزمات اليومية' : 'Browse our premium selection of grocery, pantry, fresh, and frozen essentials'}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
          {categories.map((cat) => {
            const IconComponent = iconMap[cat.iconName] || ShoppingBag;
            return (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="group relative bg-white border border-light-border rounded-xl p-5 text-center hover:border-gold hover:shadow-md transition-all duration-300 flex flex-col items-center justify-between"
              >
                <div className="w-14 h-14 rounded-full bg-cream border border-gold/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-cream transition-all duration-300 mb-4">
                  <IconComponent className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-dark group-hover:text-primary transition-colors">
                    {locale === 'ar' ? cat.arabicName : cat.name}
                  </h3>
                  <p className="text-[10px] text-muted-text mt-1 line-clamp-2 px-1">
                    {locale === 'ar' ? cat.arabicDescription : cat.description}
                  </p>
                </div>
                <div className="mt-4 text-xs font-semibold text-primary group-hover:text-gold flex items-center gap-1">
                  <span>{locale === 'ar' ? 'عرض' : 'View'}</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="bg-cream/20 border-y border-light-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-dark">{locale === 'ar' ? 'المنتجات الأكثر مبيعاً' : 'Best Sellers'}</h2>
              <p className="text-xs sm:text-sm text-muted-text mt-1">{locale === 'ar' ? 'المنتجات المفضلة لدى عملائنا في الولايات المتحدة' : 'Top requested grocery essentials in America'}</p>
            </div>
            <Link
              href="/shop?sort=rating"
              className="text-primary hover:text-gold font-bold text-xs sm:text-sm flex items-center gap-1 transition-colors"
            >
              <span>{locale === 'ar' ? 'عرض الكل' : 'View All'}</span>
              <ArrowRight className="w-4 h-4 rtl:rotate-180" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="animate-pulse bg-white border border-light-border rounded-xl h-80" />
              ))}
            </div>
          ) : bestSellers.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {bestSellers.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-10">{t('shop.no_products')}</p>
          )}
        </div>
      </section>

      {/* Featured Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-dark">{locale === 'ar' ? 'منتجات مختارة' : 'Featured Products'}</h2>
            <p className="text-xs sm:text-sm text-muted-text mt-1">{locale === 'ar' ? 'أصناف مختارة نوصي بتجربتها هذا الأسبوع' : 'Handpicked organic selects for this week'}</p>
          </div>
          <Link
            href="/shop"
            className="text-primary hover:text-gold font-bold text-xs sm:text-sm flex items-center gap-1 transition-colors"
          >
            <span>{locale === 'ar' ? 'عرض الكل' : 'View All'}</span>
            <ArrowRight className="w-4 h-4 rtl:rotate-180" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-white border border-light-border rounded-xl h-80" />
            ))}
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-10">{t('shop.no_products')}</p>
        )}
      </section>

      {/* Promo banner */}
      <section className="bg-cream border-t border-light-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left rtl:md:text-right">
            <h3 className="text-xl sm:text-2xl font-bold text-primary">
              {locale === 'ar' ? 'استخدم كوبون WELCOME10 ووفر 10%' : 'Save 10% on your first order!'}
            </h3>
            <p className="text-xs sm:text-sm text-muted-text">
              {locale === 'ar' ? 'وفر 10% عند الشراء بمبلغ أكبر من 30 دولاراً.' : 'Get 10% off when you spend $30 or more. Enter code WELCOME10 at checkout.'}
            </p>
          </div>
          <div className="bg-white px-6 py-3.5 border-2 border-dashed border-gold text-primary font-bold text-sm tracking-wider rounded-lg select-all">
            WELCOME10
          </div>
        </div>
      </section>
    </div>
  );
}
