'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { ProductService } from '@/services/products';
import { useLocaleStore } from '@/store/locale-store';
import { useCartStore } from '@/store/cart-store';
import { useAuthStore } from '@/store/auth-store';
import ProductCard from '@/components/products/product-card';
import { formatPrice } from '@/lib/utils';
import {
  ArrowRight,
  Search,
  Star,
  Sparkles,
  Truck,
  ShieldCheck,
  ShoppingBag,
  CheckCircle,
  ThumbsUp,
  Clock,
  Layers,
  Heart,
  Plus,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { locale, t } = useLocaleStore();
  const isAr = locale === 'ar';
  
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [egyptianFavorites, setEgyptianFavorites] = useState<Product[]>([]);
  const [buyAgainProducts, setBuyAgainProducts] = useState<Product[]>([]);
  const [carouselProducts, setCarouselProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [homeSearchQuery, setHomeSearchQuery] = useState('');
  const carouselRef = React.useRef<HTMLDivElement>(null);

  const { isAuthenticated, user } = useAuthStore();
  const { getSubtotal } = useCartStore();

  useEffect(() => {
    const loadHomeData = async () => {
      setLoading(true);
      try {
        const allProds = await ProductService.getProducts(true);

        // Shared helper: start from a curated/tagged subset and top it up
        // with random products (never repeating one already in the list)
        // until it reaches `count`. Used everywhere below that shows a grid
        // or strip of products, because a section that stops short of a
        // full row leaves a visibly empty gap on the right (a 6-item list
        // in a 4-column grid only fills 2 of the last row's 4 slots, etc.).
        // Depending on live admin tagging ("Featured"/"Best Seller"/tags) to
        // always hit the target count isn't reliable, so every section here
        // tops up with random products so it always renders full and never
        // looks sparse or broken — same fix already applied to the
        // scrolling marquee strips below.
        const freshShuffle = () =>
          allProds
            .map((p) => ({ p, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map((x) => x.p);

        const fillList = (tagged: Product[], count: number) => {
          const randomPool = freshShuffle();
          const ids = new Set(tagged.map((p) => p.id));
          const topUp = randomPool.filter((p) => !ids.has(p.id));
          return [...tagged, ...topUp].slice(0, count);
        };

        // 1. Best Sellers: Products marked as bestSeller, topped up to a
        // full 6 (divides evenly into every breakpoint's column count —
        // 2/3/6 — with no leftover empty cells) if fewer than 6 are
        // actually tagged.
        setBestSellers(fillList(allProds.filter((p) => p.bestSeller), 6));

        // 2. Egyptian Favorites: Tagged or Origin as Egypt, same top-up.
        setEgyptianFavorites(
          fillList(
            allProds.filter((p) => p.tags?.includes('Egyptian') || p.country?.toLowerCase() === 'egypt'),
            6
          )
        );

        // 3. Buy Again: Simulating prior orders loading
        if (isAuthenticated) {
          setBuyAgainProducts(allProds.slice(2, 6));
        }

        // 4. Product carousel: replaces the old two auto-scrolling marquee
        // strips with one arrow-controlled row. Same top-up logic (start
        // from featured/best-seller, fill the rest randomly) so it always
        // shows a full set of products regardless of admin tagging.
        const CAROUSEL_TARGET_COUNT = 16;
        setCarouselProducts(
          fillList(allProds.filter((p) => p.featured || p.bestSeller), CAROUSEL_TARGET_COUNT)
        );
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, [isAuthenticated]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (homeSearchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(homeSearchQuery.trim())}`);
    }
  };

  // Helper Skeleton component
  const Skeleton = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-5 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-3 bg-[#FAF7F0]/60 p-4 rounded-xl border border-light-border/40">
          <div className="bg-gray-200 aspect-square w-full rounded-lg" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
          <div className="h-4 bg-gray-200 rounded w-1/4" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="fade-in bg-white min-h-screen text-dark" dir={isAr ? 'rtl' : 'ltr'}>

      {/* 1. HERO SECTION */}
      <section className="relative bg-[#FAF7F0] border-b border-light-border/60 py-12 md:py-20 overflow-hidden">
        {/* Subtle background Egyptian patterns */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cpath d='M30 0L0 30l30 30 30-30z' fill='%23B85C38'/%3E%3C/svg%3E")`,
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 items-center gap-8 md:gap-12">
          <div className="space-y-6 text-center md:text-left rtl:md:text-right">
            <div className="inline-flex items-center gap-2 bg-primary/5 border border-primary/10 px-3.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse" />
              <span className="text-primary font-bold text-[10px] sm:text-xs tracking-wider font-cairo">
                {isAr ? 'توصيل موثوق لكافة الولايات الأمريكية' : 'RELIABLE DELIVERY ACROSS THE USA'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-primary leading-tight font-cairo">
              {isAr ? (
                <>
                  البقالة الشرق أوسطية المفضلة لديك،<br />
                  <span className="text-gold">تصلك حتى باب منزلك في أمريكا</span>
                </>
              ) : (
                <>
                  Your Favorite Middle Eastern Groceries,<br />
                  <span className="text-gold">Delivered Across the USA.</span>
                </>
              )}
            </h1>

            <p className="text-muted-text text-sm sm:text-base leading-relaxed max-w-md mx-auto md:mx-0 font-medium">
              {isAr
                ? 'تسوق البقالة اليومية، المفضلة المصرية، الحلويات، التوابل، الأغذية المجمدة والمزيد بأسعار ممتازة وتجربة تسوق مريحة.'
                : 'Shop everyday groceries, Egyptian favorites, sweets, spices, frozen foods and more. Premium quality with a simple shopping experience.'}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3.5 pt-2">
              <Link href="/shop" className="px-6 py-3 bg-primary hover:bg-primary-light text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2">
                <span>{isAr ? 'تسوق الآن' : 'Shop Now'}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </Link>
              <Link href="#categories-section" className="px-6 py-3 border border-light-border bg-white hover:bg-[#FAF7F0] text-dark text-xs sm:text-sm font-bold rounded-xl transition-all">
                {isAr ? 'تصفح الأقسام' : 'Browse Categories'}
              </Link>
            </div>
          </div>

          <div className="relative mx-auto max-w-md md:max-w-none flex justify-center w-full">
            <div className="w-full aspect-[4/3] rounded-2xl bg-white border border-light-border/80 shadow-lg overflow-hidden flex items-center justify-center relative p-1.5 bg-[#FAF7F0]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/hero-middle-eastern-groceries.jpg"
                alt="Middle Eastern Groceries Aisle"
                className="w-full h-full object-cover rounded-xl"
              />
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-xs border border-light-border/60 p-3.5 rounded-xl flex items-center justify-between gap-4 shadow-sm">
                <div>
                  <span className="block text-[10px] text-muted-text font-bold uppercase tracking-wider">Arab Market Selection</span>
                  <strong className="block text-xs text-primary font-bold mt-0.5">{isAr ? 'أرز، معلبات، شاي وتوابل أصلية' : 'Rice, Canned Goods, Tea & Pantry Staples'}</strong>
                </div>
                <span className="text-xs font-black text-gold font-mono">500+ {isAr ? 'منتج' : 'items'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PROMINENT SEARCH INPUT SECTION */}
      <section className="max-w-3xl mx-auto px-4 -mt-6 z-35 relative">
        <form
          onSubmit={handleSearch}
          className="bg-white rounded-2xl shadow-lg border border-light-border flex items-center gap-2 p-1.5"
        >
          <Search className="w-5 h-5 text-gold shrink-0 mx-2.5" />
          <input
            type="text"
            placeholder={isAr ? 'ما الذي تبحث عنه اليوم؟ ابحث عن بقالة، شاي، توابل...' : 'What are you looking for today? Search groceries, tea, spices...'}
            value={homeSearchQuery}
            onChange={(e) => setHomeSearchQuery(e.target.value)}
            className="flex-1 py-3 text-sm text-dark placeholder-muted-text focus:outline-none bg-transparent font-cairo font-semibold"
          />
          <button
            type="submit"
            className="bg-primary hover:bg-primary-light text-white text-xs px-5 py-3 rounded-xl shrink-0 font-bold font-cairo transition-colors"
          >
            {isAr ? 'بحث' : 'Search'}
          </button>
        </form>
      </section>

      {/* 2.5 PRODUCT CAROUSEL — replaces the old auto-scrolling CSS marquee.
          That approach (two duplicated tracks + a CSS keyframe animation)
          kept showing up empty in some cases with no clear single cause, and
          fighting it further wasn't worth it. This is a plain horizontal
          scroll container: nothing auto-plays, nothing depends on measuring
          "half the track width" — the user moves it themselves with the
          arrow buttons (native `scrollBy`), so if the product list ever
          renders empty it's simply because there are zero products, not a
          layout/animation edge case. */}
      {!loading && carouselProducts.length > 0 && (
        <section className="border-y border-light-border/60 bg-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm sm:text-base font-black text-primary font-cairo uppercase tracking-wide">
                {isAr ? 'تصفح تشكيلتنا الواسعة' : 'Browse Our Wide Selection'}
              </h2>
              <div className="flex items-center gap-2">
                <Link href="/shop" className="text-xs font-bold text-primary hover:text-gold flex items-center gap-0.5 shrink-0 mr-2 rtl:mr-0 rtl:ml-2">
                  <span>{isAr ? 'عرض كل المنتجات' : 'View All Products'}</span>
                  <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                </Link>
                <button
                  type="button"
                  aria-label={isAr ? 'السابق' : 'Previous'}
                  onClick={() => carouselRef.current?.scrollBy({ left: isAr ? 240 : -240, behavior: 'smooth' })}
                  className="w-8 h-8 rounded-full border border-light-border bg-white hover:bg-[#FAF7F0] hover:border-gold flex items-center justify-center transition-colors shrink-0"
                >
                  <ChevronLeft className="w-4 h-4 text-primary rtl:rotate-180" />
                </button>
                <button
                  type="button"
                  aria-label={isAr ? 'التالي' : 'Next'}
                  onClick={() => carouselRef.current?.scrollBy({ left: isAr ? -240 : 240, behavior: 'smooth' })}
                  className="w-8 h-8 rounded-full border border-light-border bg-white hover:bg-[#FAF7F0] hover:border-gold flex items-center justify-center transition-colors shrink-0"
                >
                  <ChevronRight className="w-4 h-4 text-primary rtl:rotate-180" />
                </button>
              </div>
            </div>

            <div
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {carouselProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/product/${product.slug}`}
                  className="group bg-white border border-light-border rounded-xl overflow-hidden hover:border-gold hover:shadow-md transition-all shrink-0 snap-start w-[140px] sm:w-[168px]"
                >
                  <div className="w-full aspect-square bg-[#FAF7F0]/40 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.images?.[0]}
                      alt={isAr ? product.arabicName : product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/300x300/FDF8F0/6B6355?text=No+Image';
                      }}
                    />
                  </div>
                  <div className="p-2.5">
                    <strong className="block text-xs text-dark font-bold font-cairo leading-tight line-clamp-1">
                      {isAr ? product.arabicName : product.name}
                    </strong>
                    <span className="block text-xs font-black text-primary mt-1">
                      {formatPrice(product.purchaseOptions?.single?.price ?? 0, locale)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. SHOP BY CATEGORY */}
      <section id="categories-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl sm:text-3xl font-black text-primary uppercase tracking-wide font-cairo">
            {isAr ? 'تسوق حسب القسم' : 'Shop by Category'}
          </h2>
          <p className="text-xs sm:text-sm text-muted-text font-medium">
            {isAr ? 'تصفح أقسام السوبرماركت المميزة لشراء احتياجاتك اليومية' : 'Browse our premium supermarket sections to stock your pantry'}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
          {[
            { id: 'frozen-foods',        en: 'Frozen Foods',           ar: 'المجمدات والمثلجات',       descEn: 'Vegetables & meals',  descAr: 'خضار ووجبات',       img: 'https://images.unsplash.com/photo-1622484964723-d1456419fcb0?auto=format&fit=crop&q=85&w=400' },
            { id: 'canned-foods',        en: 'Canned Foods',           ar: 'الأطعمة المعلبة',          descEn: 'Tuna, fava & hommos', descAr: 'تونة، فول وحمص',    img: 'https://images.unsplash.com/photo-1626607007733-d09228471d9f?auto=format&fit=crop&q=85&w=400' },
            { id: 'rice-pasta-grains',   en: 'Rice, Pasta & Grains',   ar: 'الأرز والمكرونة والحبوب',   descEn: 'Pasta, rice & grains', descAr: 'مكرونة، أرز وحبوب', img: 'https://images.unsplash.com/photo-1497802492746-aa584aa6ea22?auto=format&fit=crop&q=85&w=400' },
            { id: 'dairy-eggs',          en: 'Dairy & Eggs',           ar: 'الألبان والأجبان',         descEn: 'Cheese & butter',     descAr: 'أجبان وزبدة',       img: 'https://images.unsplash.com/photo-1631379578550-7038263db699?auto=format&fit=crop&q=85&w=400' },
            { id: 'coffee-tea-drinks',   en: 'Coffee, Tea & Drinks',   ar: 'الشاي والقهوة والمشروبات', descEn: 'Tea, coffee & juices', descAr: 'شاي، قهوة وعصائر',  img: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=85&w=400' },
            { id: 'nuts-seeds-snacks',   en: 'Nuts, Seeds & Snacks',   ar: 'المكسرات واللب والتسالي',  descEn: 'Nuts & crunchy snacks', descAr: 'مكسرات ومقرمشات', img: 'https://images.unsplash.com/photo-1525790428446-ad5140bdd234?auto=format&fit=crop&q=85&w=400' },
            { id: 'sweets-biscuits',     en: 'Sweets & Biscuits',      ar: 'الحلويات والبسكويت',       descEn: 'Chocolate & baklava', descAr: 'شوكولاتة وبقلاوة',  img: 'https://images.unsplash.com/photo-1625414502495-0c35143e32d3?auto=format&fit=crop&q=85&w=400' },
            { id: 'oils-spices-sauces',  en: 'Oils, Spices & Sauces',  ar: 'الزيوت والتوابل والصوصات', descEn: 'Herbs & oils',        descAr: 'أعشاب وزيوت',       img: 'https://images.unsplash.com/photo-1574484152510-903878da786c?auto=format&fit=crop&q=85&w=400' },
          ].map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.id}`}
              className="group bg-white border border-light-border hover:border-gold rounded-3xl p-4 flex flex-col items-center text-center transition-all shadow-xs hover:shadow-xl bg-white hover:-translate-y-1.5"
            >
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full shrink-0 mb-4 p-1 bg-gradient-to-br from-gold/40 via-light-border to-gold/10 group-hover:from-gold group-hover:to-primary/30 transition-colors">
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-[#FAF7F0]/40 flex items-center justify-center shadow-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cat.img} alt={cat.en} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>
              </div>
              <strong className="block text-sm text-primary font-bold group-hover:text-gold transition-colors font-cairo">
                {isAr ? cat.ar : cat.en}
              </strong>
              <span className="block text-[10px] text-muted-text font-medium mt-1 leading-normal">
                {isAr ? cat.descAr : cat.descEn}
              </span>
              <span className="text-[10px] font-bold text-primary group-hover:text-gold mt-3 inline-flex items-center gap-0.5 border-b border-transparent group-hover:border-gold">
                {isAr ? 'تسوق القسم' : 'Shop Now'}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. SHOP BY NEED */}
      <section className="bg-[#FAF7F0] border-y border-light-border/60 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-10">
            <h2 className="text-2xl sm:text-3xl font-black text-primary font-cairo">
              {isAr ? 'ما الذي تبحث عنه؟' : 'What are you shopping for?'}
            </h2>
            <p className="text-xs sm:text-sm text-muted-text font-medium">
              {isAr ? 'اختصارات سريعة للوصول إلى المنتجات الأكثر طلباً' : 'Quick shortcuts to access our most requested products'}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { labelEn: 'Everyday Groceries', labelAr: 'بقالة يومية',      link: '/shop?category=groceries' },
              { labelEn: 'Egyptian Favorites', labelAr: 'المفضلة المصرية',  link: '/shop?tag=Egyptian' },
              { labelEn: 'Coffee & Tea',       labelAr: 'قهوة وشاي',        link: '/shop?category=drinks' },
              { labelEn: 'Frozen Foods',       labelAr: 'مجمدات المطبخ',    link: '/shop?category=frozen' },
              { labelEn: 'Sweets & Snacks',    labelAr: 'مسليات ومقرمشات', link: '/shop?category=sweets-snacks' },
              { labelEn: 'Spices & Sauces',    labelAr: 'توابل المطبخ',      link: '/shop?category=spices-sauces' },
            ].map((item, idx) => (
              <Link
                key={idx}
                href={item.link}
                className="bg-white border border-light-border/80 hover:border-gold hover:bg-white rounded-xl p-4 text-center transition-all hover:shadow-sm flex items-center justify-center min-h-[64px]"
              >
                <strong className="text-xs text-primary font-bold font-cairo leading-tight">
                  {isAr ? item.labelAr : item.labelEn}
                </strong>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. EGYPTIAN FAVORITES — moved ahead of Best Sellers to match the
          recommended homepage hierarchy (Category -> Need -> Egyptian
          Favorites -> Best Sellers -> Weekly Specials -> Fast US Delivery ->
          Why Shop -> Reviews). This is presented as a curated collection, not
          a country-based storefront section — matches the business
          requirement that the site read as a modern American supermarket
          with Egyptian products as a strong curated collection. */}
      <section id="egyptian-favorites" className="bg-[#FAF7F0] border-y border-light-border/60 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="flex items-end justify-between mb-8 border-b border-light-border/60 pb-4">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-primary font-cairo flex items-center gap-1.5">
                <span>{isAr ? 'المفضلة المصرية 🇪🇬' : 'Egyptian Favorites 🇪🇬'}</span>
              </h2>
              <p className="text-xs text-muted-text font-medium">
                {isAr ? 'المنتجات المصرية الأكثر شعبية وطلباً في أمريكا' : 'Popular products from Egypt, loved by our community.'}
              </p>
            </div>
            <Link href="/shop?tag=Egyptian" className="text-xs font-bold text-primary hover:text-gold flex items-center gap-0.5">
              <span>{isAr ? 'كل المنتجات المصرية' : 'Explore Egyptian Products'}</span>
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </Link>
          </div>

          {loading ? <Skeleton /> : egyptianFavorites.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
              {egyptianFavorites.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-text py-10 font-cairo">{isAr ? 'لا توجد منتجات مصرية متوفرة حالياً' : 'No Egyptian products found.'}</p>
          )}
        </div>
      </section>

      {/* 6. BEST SELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8 border-b border-light-border/60 pb-4">
          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-black text-primary uppercase tracking-wide font-cairo">
              {isAr ? 'الأكثر مبيعاً' : 'Best Sellers'}
            </h2>
            <p className="text-xs text-muted-text font-medium">
              {isAr ? 'المنتجات الأكثر مبيعاً وتقييماً من قبل عائلاتنا' : 'Top selling products loved by our community'}
            </p>
          </div>
          <Link href="/shop?filter=bestseller" className="text-xs font-bold text-primary hover:text-gold flex items-center gap-0.5">
            <span>{isAr ? 'عرض الكل' : 'View All'}</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </Link>
        </div>

        {loading ? <Skeleton /> : bestSellers.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {bestSellers.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-text py-10 font-cairo">{t('shop.no_products')}</p>
        )}
      </section>

      {/* 7. WEEKLY SPECIALS & FAST US DELIVERY — was previously a 3-banner
          block that repeated an "Egyptian Favorites" banner redundant with
          section 5 above; that duplicate banner has been removed so this
          section maps 1:1 onto "Weekly Specials" + "Fast US Delivery" from
          the recommended homepage hierarchy instead of restating Egyptian
          Favorites a second time. */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Banner 1: Weekly Specials */}
          <div className="bg-white border border-light-border rounded-2xl p-6 flex flex-col justify-between shadow-xs h-64 relative overflow-hidden group">
            <div className="absolute inset-0 opacity-[0.03] bg-accent rounded-2xl" />
            <div className="space-y-3 z-10 relative">
              <span className="text-[10px] font-bold text-accent uppercase tracking-wider">Weekly Highlights</span>
              <h3 className="text-lg font-bold text-primary font-cairo">{isAr ? 'مختارات الأسبوع' : 'Weekly Specials'}</h3>
              <p className="text-xs text-muted-text font-medium max-w-[200px]">
                {isAr ? 'اكتشف أفضل خيارات المنتجات الأسبوعية المميزة.' : 'Discover this week\'s selected products.'}
              </p>
            </div>
            <div className="z-10 relative pt-4">
              <Link href="/shop?filter=featured" className="px-4 py-2.5 bg-primary hover:bg-primary-light text-white text-xs font-bold rounded-lg transition-colors inline-block">
                {isAr ? 'عرض المختارات' : 'Shop Deals'}
              </Link>
            </div>
          </div>

          {/* Banner 2: Fast US Delivery */}
          <div className="bg-white border border-light-border rounded-2xl p-6 flex flex-col justify-between shadow-xs h-64 relative overflow-hidden group">
            <div className="absolute inset-0 opacity-[0.03] bg-gold rounded-2xl" />
            <div className="space-y-3 z-10 relative">
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Reliable Shipping</span>
              <h3 className="text-lg font-bold text-primary font-cairo">{isAr ? 'توصيل سريع في أمريكا' : 'Fast US Delivery'}</h3>
              <p className="text-xs text-muted-text font-medium max-w-[200px]">
                {isAr ? 'شحن وتوصيل مريح لكافة الولايات الأمريكية.' : 'Convenient delivery across the USA.'}
              </p>
            </div>
            <div className="z-10 relative pt-4">
              <Link href="/shipping" className="px-4 py-2.5 border border-primary/20 hover:bg-[#FAF7F0] text-primary text-xs font-bold rounded-lg transition-colors inline-block">
                {isAr ? 'اقرأ المزيد' : 'Learn More'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 8. TRUST SECTION ("Why Shop at Arab Market?") */}
      <section className="bg-[#FAF7F0] border-t border-light-border/60 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-2 mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-primary font-cairo">
              {isAr ? 'لماذا تختار عرب ماركت؟' : 'Why Shop at Arab Market?'}
            </h2>
            <p className="text-xs sm:text-sm text-muted-text font-medium">
              {isAr ? 'نلتزم بتقديم أفضل جودة وأسهل تجربة لعملائنا في الولايات المتحدة' : 'We commit to providing top quality and a seamless shopping experience across the USA'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white border border-light-border rounded-2xl p-6 text-center space-y-3.5 shadow-2xs">
              <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary mx-auto">
                <ShoppingBag className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-bold text-sm text-primary font-cairo">{isAr ? 'تشكيلة منتجات واسعة' : 'Wide Product Selection'}</h3>
              <p className="text-xs text-muted-text leading-relaxed font-medium">
                {isAr ? 'نوفر كافة أنواع الأغذية والبقالة الشرق أوسطية والمصرية التي تبحث عنها.' : 'Find all the authentic Middle Eastern and Egyptian food brands you miss.'}
              </p>
            </div>

            <div className="bg-white border border-light-border rounded-2xl p-6 text-center space-y-3.5 shadow-2xs">
              <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary mx-auto">
                <Clock className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-bold text-sm text-primary font-cairo">{isAr ? 'طلب سهل عبر الإنترنت' : 'Easy Online Ordering'}</h3>
              <p className="text-xs text-muted-text leading-relaxed font-medium">
                {isAr ? 'واجهة بسيطة وواضحة تتيح لك العثور على المنتجات والشراء بضغطة زر.' : 'Find products instantly, add to your cart, and complete orders with zero hassle.'}
              </p>
            </div>

            <div className="bg-white border border-light-border rounded-2xl p-6 text-center space-y-3.5 shadow-2xs">
              <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary mx-auto">
                <ShieldCheck className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-bold text-sm text-primary font-cairo">{isAr ? 'دفع آمن بالكامل' : 'Secure Checkout'}</h3>
              <p className="text-xs text-muted-text leading-relaxed font-medium">
                {isAr ? 'خيارات دفع مشفرة وآمنة لحماية بياناتك الشخصية والمالية.' : '100% encrypted checkout with Stripe and card protection standards.'}
              </p>
            </div>

            <div className="bg-white border border-light-border rounded-2xl p-6 text-center space-y-3.5 shadow-2xs">
              <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary mx-auto">
                <Truck className="w-6 h-6 text-gold" />
              </div>
              <h3 className="font-bold text-sm text-primary font-cairo">{isAr ? 'شحن لكافة الولايات' : 'US Delivery'}</h3>
              <p className="text-xs text-muted-text leading-relaxed font-medium">
                {isAr ? 'نشحن طلبك مغلفاً بعناية مباشرة لعنوانك في أي ولاية أمريكية.' : 'Directly shipped to your doorstep, anywhere in the United States.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. CUSTOMER REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-primary font-cairo">
            {isAr ? 'آراء عملائنا' : 'What Our Customers Say'}
          </h2>
          <p className="text-xs sm:text-sm text-muted-text font-medium">
            {isAr ? 'نفخر بخدمة مجتمعاتنا وتقديم أفضل تجربة بقالة لهم' : 'Proudly serving Middle Eastern families and communities in the USA'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Amr S., New York', rating: 5, en: '"The best place to buy Egyptian groceries in New York. The Molokhia and Ful are fresh, and shipping is super fast!"', ar: '"أفضل مكان لشراء المنتجات المصرية في نيويورك. الملوخية والفول طازجة للغاية والشحن سريع جداً!"' },
            { name: 'Mariam H., California', rating: 5, en: '"Simple interface, very easy to buy with case and pack options. Highly recommend to anyone who wants authentic flavors!"', ar: '"واجهة تسوق بسيطة وسريعة للغاية خصوصاً خيارات الربطة والكرتون. أنصح به بشدة لكل من يحب الأطعمة الأصلية!"' },
            { name: 'Tarek A., Texas', rating: 5, en: '"Customer service is amazing, packaging is excellent. Finally, a reliable Middle Eastern grocery store in America."', ar: '"خدمة عملاء ممتازة وتغليف رائع. أخيرًا متجر منتجات عربية موثوق في أمريكا!"' },
          ].map((rev, idx) => (
            <div key={idx} className="bg-white border border-light-border rounded-2xl p-6 space-y-3.5 shadow-2xs">
              <div className="flex gap-0.5 text-gold text-sm">
                {Array.from({ length: rev.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <p className="text-xs sm:text-sm text-dark font-medium italic leading-relaxed font-cairo">
                {isAr ? rev.ar : rev.en}
              </p>
              <strong className="block text-[11px] font-bold text-gold uppercase tracking-wider">— {rev.name}</strong>
            </div>
          ))}
        </div>
      </section>

      {/* Spacer for mobile bottom nav */}
      <div className="h-16 md:hidden" />
    </div>
  );
}
