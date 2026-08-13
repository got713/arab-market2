'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Product } from '@/types';
import { ProductService } from '@/services/products';
import { useLocaleStore } from '@/store/locale-store';
import ProductCard from '@/components/products/product-card';
import { Search, Frown, ShoppingBag } from 'lucide-react';

export const dynamic = 'force-dynamic';

function SearchContent() {
  const { t, locale } = useLocaleStore();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const query = searchParams?.get('q') || '';
  const [searchInput, setSearchInput] = useState(query);
  const [results, setResults] = useState<Product[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setSearchInput(query);
    const performSearch = async () => {
      setLoading(true);
      try {
        if (query.trim()) {
          const list = await ProductService.searchProducts(query);
          setResults(list);
          if (list.length === 0) {
            // Load some recommended items
            const bests = await ProductService.getBestSellers();
            setRecommendations(bests.slice(0, 4));
          }
        } else {
          // If empty query, show all products
          const list = await ProductService.getProducts();
          setResults(list.slice(0, 12));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    performSearch();
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
      {/* Search Header Form */}
      <div className="max-w-2xl mx-auto mb-10 text-center space-y-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-dark">
          {locale === 'ar' ? 'البحث عن المنتجات' : 'Search Products'}
        </h1>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={t('header.search')}
              className="w-full pl-4 pr-10 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-base rtl:pr-4 rtl:pl-10"
            />
            <Search className="absolute right-3.5 top-3.5 w-5 h-5 text-gray-400 pointer-events-none rtl:left-3.5 rtl:right-auto" />
          </div>
          <button
            type="submit"
            className="px-6 bg-primary text-cream font-bold rounded-lg hover:bg-primary-dark transition-colors duration-150"
          >
            {locale === 'ar' ? 'بحث' : 'Search'}
          </button>
        </form>
        {query && (
          <p className="text-xs text-muted-text">
            {locale === 'ar' ? (
              <span>نتائج البحث عن: "<strong>{query}</strong>"</span>
            ) : (
              <span>Search results for "<strong>{query}</strong>"</span>
            )}
          </p>
        )}
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-50 border border-light-border rounded-xl h-80" />
          ))}
        </div>
      ) : results.length > 0 ? (
        /* Results Grid */
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        /* No results state */
        <div className="space-y-12">
          <div className="text-center py-16 bg-cream/10 border border-dashed border-light-border rounded-2xl max-w-2xl mx-auto">
            <Frown className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-dark mb-1">
              {locale === 'ar' ? 'لم نجد أي نتائج' : 'No results found'}
            </h2>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              {locale === 'ar' 
                ? 'تأكد من كتابة اسم المنتج بشكل صحيح أو جرب كلمات بحث أخرى (مثل: ملوخية، طحينة، قهوة، تمر).' 
                : 'Double-check spelling or try broader search terms (like: Molokhia, Tahini, coffee, dates).'}
            </p>
          </div>

          {/* Recommendations list */}
          {recommendations.length > 0 && (
            <div className="space-y-6">
              <div className="border-b border-light-border pb-3 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-gold" />
                <h3 className="font-bold text-base text-dark">
                  {locale === 'ar' ? 'منتجات نقترحها لك' : 'Recommended for You'}
                </h3>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                {recommendations.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-xs text-gray-500 mt-4 font-semibold">Loading search results...</p>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
