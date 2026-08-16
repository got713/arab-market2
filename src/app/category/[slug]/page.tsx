'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Product, Category } from '@/types';
import { ProductService } from '@/services/products';
import { CategoryService } from '@/services/categories';
import { useLocaleStore } from '@/store/locale-store';
import ProductCard from '@/components/products/product-card';
import { ArrowLeft, ChevronRight, LayoutGrid } from 'lucide-react';
import Link from 'next/link';

export default function CategoryPage() {
  const params = useParams();
  const router = useRouter();
  const { t, locale } = useLocaleStore();
  const slug = (params?.slug as string) || '';

  const [categoryInfo, setCategoryInfo] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    
    const loadCategoryData = async () => {
      setLoading(true);
      try {
        const cat = await CategoryService.getCategoryBySlug(slug);
        setCategoryInfo(cat || null);
        
        if (cat) {
          const list = await ProductService.getProductsByCategory(cat.slug);
          setProducts(list);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadCategoryData();
  }, [slug]);

  if (!categoryInfo && !loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-dark">Category not found</h2>
        <p className="text-sm text-gray-500">The category you are looking for does not exist.</p>
        <button
          onClick={() => router.push('/shop')}
          className="bg-primary text-cream px-6 py-2.5 rounded-lg text-sm font-semibold"
        >
          Go to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* Category Banner */}
      <section className="relative bg-primary overflow-hidden py-12 text-cream">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark/95 to-primary/70 z-10" />
        {categoryInfo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={categoryInfo.image}
            alt={categoryInfo.name}
            className="absolute inset-0 w-full h-full object-cover opacity-25"
          />
        )}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-20 space-y-3">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-xs text-cream/70 font-semibold mb-2">
            <Link href="/" className="hover:text-gold transition-colors">{t('nav.home')}</Link>
            <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
            <Link href="/shop" className="hover:text-gold transition-colors">{t('nav.shop')}</Link>
            <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
            <span className="text-gold">
              {categoryInfo ? (locale === 'ar' ? categoryInfo.arabicName : categoryInfo.name) : ''}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold">
            {categoryInfo ? (locale === 'ar' ? categoryInfo.arabicName : categoryInfo.name) : ''}
          </h1>
          <p className="text-xs sm:text-sm text-cream/80 max-w-xl leading-relaxed">
            {categoryInfo ? (locale === 'ar' ? categoryInfo.arabicDescription : categoryInfo.description) : ''}
          </p>
        </div>
      </section>

      {/* Subcategory Navigation */}
      {categoryInfo && categoryInfo.subcategories && categoryInfo.subcategories.length > 0 && (
        <div className="bg-cream/30 border-b border-light-border py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center gap-2.5 text-xs font-semibold text-gray-500">
            <span className="uppercase text-[10px] font-bold text-gray-400 tracking-wider">
              {locale === 'ar' ? 'الأقسام الفرعية:' : 'Subcategories:'}
            </span>
            {categoryInfo.subcategories.map((sub) => (
              <Link
                key={sub.slug}
                href={`/shop?category=${categoryInfo.slug}`}
                className="px-3.5 py-1.5 rounded-full border border-gray-300 hover:border-primary hover:text-primary transition-all text-xs bg-white"
              >
                {locale === 'ar' ? sub.arabicName : sub.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Product List */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-50 border border-light-border rounded-xl h-80" />
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="space-y-12">
            {/* Featured Products */}
            {products.filter((p) => p.featured).length > 0 && (
              <div className="space-y-4">
                <h2 className="text-base sm:text-lg font-bold text-dark flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-gold" />
                  <span>{locale === 'ar' ? 'المنتجات المميزة' : 'Featured Products'}</span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                  {products
                    .filter((p) => p.featured)
                    .slice(0, 4)
                    .map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                </div>
              </div>
            )}

            {/* All Products */}
            <div className="space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-dark flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-primary" />
                <span>{locale === 'ar' ? 'كل المنتجات' : 'All Products'}</span>
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-cream/10 border border-dashed border-light-border rounded-2xl max-w-md mx-auto">
            <LayoutGrid className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <h3 className="font-bold text-sm text-dark mb-1">
              {locale === 'ar' ? 'لا توجد منتجات حالياً' : 'No products available'}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              {locale === 'ar' ? 'لم يتم إضافة أي منتجات لهذا القسم بعد.' : 'No products have been added to this category yet.'}
            </p>
            <button
              onClick={() => router.push('/shop')}
              className="text-xs text-primary font-bold hover:underline"
            >
              Browse Other Categories
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
