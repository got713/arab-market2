'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  ChevronRight
} from 'lucide-react';

// Map icon names to Lucide icons
const iconMap: Record<string, React.ComponentType<any>> = {
  ShoppingBag,
  Snowflake,
  Coffee,
  Cookie,
  Flame,
  Home
};

export default function HomePage() {
  const router = useRouter();
  const { t, locale } = useLocaleStore();
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [homeSearchQuery, setHomeSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const bs = await ProductService.getBestSellers();
        const fp = await ProductService.getFeaturedProducts();
        const all = await ProductService.getProducts();
        
        setBestSellers(bs.slice(0, 8)); // Show up to 8 best sellers
        setFeaturedProducts(fp.slice(0, 4)); // Show 4 weekly deals
        setNewArrivals(all.slice(all.length - 4)); // Show 4 newest arrivals
      } catch (err) {
        console.error('Error loading products', err);
      } finally {
        setLoading(false);
      }
    };
    loadProducts();
  }, []);

  const handleHomeSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (homeSearchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(homeSearchQuery.trim())}`);
    }
  };

  return (
    <div className="fade-in">
      {/* 1. Hero Section */}
      <section className="relative bg-primary overflow-hidden py-16 lg:py-24">
        {/* Background Gradients & Accents */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/90 to-primary/60 z-10" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=1600&auto=format&fit=crop" 
          alt="Middle Eastern Groceries" 
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        
        {/* Decorative Gold Elements */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-gold/10 rounded-full filter blur-3xl" />
        <div className="absolute left-1/4 bottom-0 w-80 h-80 bg-gold/5 rounded-full filter blur-2xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20 text-cream">
          <div className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 bg-gold/20 border border-gold/45 px-3.5 py-1.5 rounded-full text-xs font-semibold text-gold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{locale === 'ar' ? 'التوصيل متوفر في جميع أنحاء الولايات المتحدة' : 'Delivery available across the USA'}</span>
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

      {/* 2. Prominent Search Section */}
      <section className="-mt-8 max-w-4xl mx-auto px-4 z-30 relative">
        <form onSubmit={handleHomeSearchSubmit} className="bg-white p-2 rounded-2xl shadow-xl border border-light-border flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={locale === 'ar' ? 'ما الذي تبحث عنه اليوم؟...' : 'Search groceries...'}
              value={homeSearchQuery}
              onChange={(e) => setHomeSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-0 text-sm sm:text-base text-dark placeholder-gray-400 font-medium rtl:pr-10 rtl:pl-4"
            />
            <ShoppingBag className="absolute left-3.5 top-3.5 w-5 h-5 text-gold rtl:right-3.5 rtl:left-auto" />
          </div>
          <button
            type="submit"
            className="bg-primary hover:bg-primary-dark text-cream px-6 sm:px-8 py-3 rounded-xl font-bold text-sm sm:text-base transition-colors shadow-md"
          >
            {locale === 'ar' ? 'بحث' : 'Search'}
          </button>
        </form>
      </section>

      {/* 3. Shop by Category */}
      <section id="categories-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-dark flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-gold" />
              <span>{locale === 'ar' ? 'تسوق حسب الأقسام' : 'Shop by Category'}</span>
            </h2>
            <p className="text-xs text-muted-text mt-1">
              {locale === 'ar' ? 'تصفح أقسام السوبر ماركت الرئيسية للمنتجات الشرق أوسطية' : 'Browse our primary grocery and supermarket categories'}
            </p>
          </div>
          <Link
            href="/shop"
            className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
          >
            <span>{locale === 'ar' ? 'عرض كل الأقسام ←' : 'View All Categories →'}</span>
          </Link>
        </div>

        {/* Scrollable list on mobile, grid on desktop */}
        <div className="flex overflow-x-auto gap-4 pb-3 sm:pb-0 sm:grid sm:grid-cols-3 lg:grid-cols-6 no-scrollbar snap-x">
          {categories.map((cat) => {
            const IconComponent = iconMap[cat.iconName] || ShoppingBag;
            return (
              <Link
                key={cat.slug}
                href={`/category/${cat.slug}`}
                className="snap-start flex-shrink-0 w-36 sm:w-auto bg-white border border-light-border rounded-xl p-4 text-center hover:border-gold hover:shadow-sm transition-all flex flex-col items-center justify-between min-h-[140px]"
              >
                <div className="w-11 h-11 rounded-full bg-cream border border-gold/15 flex items-center justify-center text-primary mb-3">
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-xs sm:text-sm text-dark line-clamp-1">
                    {locale === 'ar' ? cat.arabicName : cat.name}
                  </h3>
                </div>
                <span className="text-[10px] text-primary font-bold hover:text-gold mt-2">
                  {locale === 'ar' ? 'تسوق الآن' : 'Shop Now'}
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Best Sellers Section */}
      <section className="bg-cream/15 border-y border-light-border py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-dark flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-primary" />
                <span>{locale === 'ar' ? 'المنتجات الأكثر مبيعاً' : 'Best Sellers'}</span>
              </h2>
              <p className="text-xs text-muted-text mt-1">
                {locale === 'ar' ? 'المنتجات المفضلة والأكثر طلباً في الولايات المتحدة' : 'Top requested Middle Eastern grocery items across America'}
              </p>
            </div>
            <Link
              href="/shop?filter=bestseller"
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
            <div className="flex overflow-x-auto gap-4 pb-3 sm:pb-0 sm:grid sm:grid-cols-2 md:grid-cols-4 no-scrollbar snap-x">
              {bestSellers.map((product) => (
                <div key={product.id} className="snap-start flex-shrink-0 w-64 sm:w-auto">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-10">{t('shop.no_products')}</p>
          )}
        </div>
      </section>

      {/* 5. Weekly Deals Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-dark flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-gold" />
              <span>{locale === 'ar' ? 'عروض الأسبوع' : 'Weekly Deals'}</span>
            </h2>
            <p className="text-xs text-muted-text mt-1">
              {locale === 'ar' ? 'خصومات تصل إلى 20% على منتجات مختارة هذا الأسبوع' : 'Save up to 20% on these select weekly favorites'}
            </p>
          </div>
          <Link
            href="/shop?filter=deals"
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
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {featuredProducts.map((product) => {
              const originalPrice = product.purchaseOptions.single.price;
              const discountedPrice = parseFloat((originalPrice * 0.8).toFixed(2));
              const dealProduct = {
                ...product,
                purchaseOptions: {
                  ...product.purchaseOptions,
                  single: { ...product.purchaseOptions.single, price: discountedPrice }
                },
                oldPrice: originalPrice
              };
              return (
                <div key={product.id} className="relative group">
                  <div className="absolute top-3 left-3 bg-red-650 text-white font-extrabold text-[10px] uppercase tracking-wide px-2 py-0.5 rounded z-20 shadow-md">
                    20% OFF
                  </div>
                  <ProductCard product={dealProduct as any} />
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-10">{t('shop.no_products')}</p>
        )}
      </section>

      {/* 6. New Arrivals Section */}
      <section className="bg-cream/15 border-t border-light-border py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-dark flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-primary" />
                <span>{locale === 'ar' ? 'وصل حديثاً' : 'New Arrivals'}</span>
              </h2>
              <p className="text-xs text-muted-text mt-1">
                {locale === 'ar' ? 'أحدث الإضافات لمنتجات البقالة هذا الأسبوع' : 'Fresh additions to our Middle Eastern catalog'}
              </p>
            </div>
            <Link
              href="/shop?sort=newest"
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
          ) : newArrivals.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-10">{t('shop.no_products')}</p>
          )}
        </div>
      </section>

      {/* 7. Delivery / Shipping Information */}
      <section className="bg-primary text-cream py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left rtl:md:text-right">
            <h3 className="text-lg sm:text-xl font-bold text-gold">
              {locale === 'ar' ? 'تسوق إلكترونياً واحصل على طلباتك حتى باب المنزل.' : 'Shop online and get your groceries delivered.'}
            </h3>
            <p className="text-xs text-cream/70 font-medium">
              {locale === 'ar' ? 'شحن عادي بقيمة 7.99$ | شحن سريع بقيمة 14.99$' : 'Standard Delivery $7.99 | Express Delivery $14.99'}
            </p>
          </div>
          <Link
            href="/shipping"
            className="px-6 py-2.5 bg-gold hover:bg-gold-light text-dark font-bold text-xs rounded-lg transition-colors shadow-md"
          >
            {locale === 'ar' ? 'تفاصيل الشحن والتوصيل' : 'View Shipping Policy'}
          </Link>
        </div>
      </section>

      {/* 8. Why Arab Market */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-xl sm:text-2xl font-bold text-dark text-center mb-10">
          {locale === 'ar' ? 'لماذا تتسوق من عرب ماركت؟' : 'Why Shop at Arab Market?'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white border border-light-border rounded-xl p-5 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-cream mx-auto flex items-center justify-center text-primary">
              <ShoppingBag className="w-5 h-5 text-gold" />
            </div>
            <h3 className="font-bold text-sm text-dark">{locale === 'ar' ? 'تشكيلة واسعة' : 'Wide Selection'}</h3>
            <p className="text-xs text-muted-text">{locale === 'ar' ? 'جميع المواد الغذائية الشرق أوسطية في مكان واحد.' : 'Your favorite Middle Eastern grocer brands delivered together.'}</p>
          </div>
          
          <div className="bg-white border border-light-border rounded-xl p-5 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-cream mx-auto flex items-center justify-center text-primary">
              <ShieldCheck className="w-5 h-5 text-gold" />
            </div>
            <h3 className="font-bold text-sm text-dark">{locale === 'ar' ? 'منتجات حلال منتقاة' : 'Halal Selection'}</h3>
            <p className="text-xs text-muted-text">{locale === 'ar' ? 'منتجات مطابقة للشريعة الإسلامية ومصادر موثوقة.' : 'Carefully selected products conforming to halal standards.'}</p>
          </div>

          <div className="bg-white border border-light-border rounded-xl p-5 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-cream mx-auto flex items-center justify-center text-primary">
              <Truck className="w-5 h-5 text-gold" />
            </div>
            <h3 className="font-bold text-sm text-dark">{locale === 'ar' ? 'شحن لكل أمريكا' : 'USA Delivery'}</h3>
            <p className="text-xs text-muted-text">{locale === 'ar' ? 'شحن سريع ومباشر لباب منزلك في أي ولاية.' : 'Quick, flat rate shipping directly to your door anywhere in the US.'}</p>
          </div>

          <div className="bg-white border border-light-border rounded-xl p-5 text-center space-y-2">
            <div className="w-10 h-10 rounded-full bg-cream mx-auto flex items-center justify-center text-primary">
              <HeartHandshake className="w-5 h-5 text-gold" />
            </div>
            <h3 className="font-bold text-sm text-dark">{locale === 'ar' ? 'تسوق سهل' : 'Easy Shopping'}</h3>
            <p className="text-xs text-muted-text">{locale === 'ar' ? 'واجهة بسيطة تدعم اللغتين العربية والإنجليزية.' : 'Distraction-free e-commerce optimized for English & Arabic.'}</p>
          </div>
        </div>
      </section>

      {/* 9. Customer Reviews */}
      <section className="bg-cream/15 py-16 border-t border-light-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl font-bold text-dark text-center mb-10">
            {locale === 'ar' ? 'ماذا يقول عملاؤنا' : 'What Our Customers Say'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-light-border rounded-xl p-6 space-y-3">
              <div className="flex text-gold">★★★★★</div>
              <p className="text-xs text-muted-text italic">
                {locale === 'ar' ? '"أفضل موقع لشراء المنتجات العربية في أمريكا. التوصيل سريع والتعليب ممتاز جداً."' : '"Best place to buy Middle Eastern groceries in the US. Super fast shipping and excellent packaging."'}
              </p>
              <h4 className="font-bold text-xs text-dark">— Leila A., California</h4>
            </div>

            <div className="bg-white border border-light-border rounded-xl p-6 space-y-3">
              <div className="flex text-gold">★★★★★</div>
              <p className="text-xs text-muted-text italic">
                {locale === 'ar' ? '"أخيراً سوبر ماركت عربي يسهل الشراء منه باللغة الإنجليزية وتفاصيل واضحة للبراندات."' : '"Finally a Middle Eastern grocery store that makes it easy to shop with English translations and clear brands."'}
              </p>
              <h4 className="font-bold text-xs text-dark">— David M., Texas</h4>
            </div>

            <div className="bg-white border border-light-border rounded-xl p-6 space-y-3">
              <div className="flex text-gold">★★★★★</div>
              <p className="text-xs text-[11px] text-muted-text italic">
                {locale === 'ar' ? '"خيارات شراء المنتجات بالكرتونة أو بالربطة ممتازة جداً وموفرة للعائلات الكبيرة."' : '"The pack and case buying options are amazing and save so much money for larger families."'}
              </p>
              <h4 className="font-bold text-xs text-dark">— Tarik K., New York</h4>
            </div>
          </div>
        </div>
      </section>

      {/* 10. Promo banner */}
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
