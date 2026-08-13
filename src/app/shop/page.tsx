'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Product } from '@/types';
import { ProductService } from '@/services/products';
import { categories } from '@/data/categories';
import { useLocaleStore } from '@/store/locale-store';
import ProductCard from '@/components/products/product-card';
import { SlidersHorizontal, ArrowUpDown, RefreshCw, Check } from 'lucide-react';

export const dynamic = 'force-dynamic';

function ShopContent() {
  const { t, locale } = useLocaleStore();
  const searchParams = useSearchParams();
  
  // State for products
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [onlyHalal, setOnlyHalal] = useState(false);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');

  // Load products on mount
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const list = await ProductService.getProducts(true);
        setAllProducts(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Sync category filter from URL search query if exists
  useEffect(() => {
    const catParam = searchParams?.get('category');
    if (catParam) {
      setSelectedCategories([catParam]);
    }
    const sortParam = searchParams?.get('sort');
    if (sortParam) {
      setSortBy(sortParam);
    }
  }, [searchParams]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...allProducts];

    // Filter by category
    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }

    // Filter by country
    if (selectedCountries.length > 0) {
      result = result.filter((p) => selectedCountries.includes(p.country));
    }

    // Filter by Halal
    if (onlyHalal) {
      // For the demo, assume spices, groceries, sweets, and frozen are Halal
      result = result.filter((p) => {
        const halalCategories = ['spices', 'groceries', 'sweets', 'frozen', 'egyptian', 'levantine', 'gulf', 'maghreb'];
        return halalCategories.includes(p.category) || p.ingredients.toLowerCase().includes('halal') || p.name.toLowerCase().includes('halal');
      });
    }

    // Filter by stock
    if (onlyInStock) {
      result = result.filter((p) => p.stock > 0);
    }

    // Sorting
    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.purchaseOptions.single.price - b.purchaseOptions.single.price);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.purchaseOptions.single.price - a.purchaseOptions.single.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'newest') {
      // Seed IDs sorted as default
      result.sort((a, b) => b.id.localeCompare(a.id));
    }

    setFilteredProducts(result);
  }, [allProducts, selectedCategories, selectedCountries, onlyHalal, onlyInStock, sortBy]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const toggleCountry = (country: string) => {
    setSelectedCountries((prev) =>
      prev.includes(country) ? prev.filter((c) => c !== country) : [...prev, country]
    );
  };

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedCountries([]);
    setOnlyHalal(false);
    setOnlyInStock(false);
    setSortBy('relevance');
  };

  // Distinct countries lists in seed data
  const countriesList = ['Egypt', 'Lebanon', 'Palestine', 'Jordan', 'Syria', 'Saudi Arabia', 'Morocco'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in">
      {/* Title block */}
      <div className="border-b border-light-border pb-5 mb-8">
        <h1 className="text-2xl sm:text-4xl font-bold text-dark">{t('nav.shop')}</h1>
        <p className="text-xs sm:text-sm text-muted-text mt-1.5">
          {locale === 'ar' ? `نعرض لك ${filteredProducts.length} منتجاً ممتازاً` : `Showing ${filteredProducts.length} premium Middle Eastern items`}
        </p>
      </div>

      {/* Grid container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters - Desktop */}
        <div className="lg:block space-y-6">
          <div className="flex items-center justify-between border-b border-light-border pb-3">
            <h3 className="font-bold text-sm text-dark flex items-center gap-1.5 uppercase tracking-wide">
              <SlidersHorizontal className="w-4 h-4 text-gold" />
              <span>{t('shop.filters')}</span>
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs text-primary font-semibold hover:underline"
            >
              {t('shop.clear')}
            </button>
          </div>

          {/* Categories filter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
              {t('shop.filter.category')}
            </h4>
            <div className="space-y-2">
              {categories.map((cat) => (
                <button
                  key={cat.slug}
                  onClick={() => toggleCategory(cat.slug)}
                  className={`w-full flex items-center justify-between text-xs px-2.5 py-1.5 rounded-md text-left rtl:text-right transition-colors ${
                    selectedCategories.includes(cat.slug)
                      ? 'bg-cream text-primary font-bold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{locale === 'ar' ? cat.arabicName : cat.name}</span>
                  {selectedCategories.includes(cat.slug) && <Check className="w-3.5 h-3.5 text-primary" />}
                </button>
              ))}
            </div>
          </div>

          {/* Country filter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
              {t('shop.filter.country')}
            </h4>
            <div className="space-y-2">
              {countriesList.map((country) => (
                <button
                  key={country}
                  onClick={() => toggleCountry(country)}
                  className={`w-full flex items-center justify-between text-xs px-2.5 py-1.5 rounded-md text-left rtl:text-right transition-colors ${
                    selectedCountries.includes(country)
                      ? 'bg-cream text-primary font-bold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{country}</span>
                  {selectedCountries.includes(country) && <Check className="w-3.5 h-3.5 text-primary" />}
                </button>
              ))}
            </div>
          </div>

          {/* Certification / Stock checklist */}
          <div className="pt-4 border-t border-light-border space-y-3">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyHalal}
                onChange={(e) => setOnlyHalal(e.target.checked)}
                className="w-4 h-4 rounded-md border-gray-300 text-primary focus:ring-primary/20 accent-primary"
              />
              <span className="text-xs font-semibold text-dark">{t('shop.filter.halal')}</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="w-4 h-4 rounded-md border-gray-300 text-primary focus:ring-primary/20 accent-primary"
              />
              <span className="text-xs font-semibold text-dark">{t('shop.filter.instock')}</span>
            </label>
          </div>
        </div>

        {/* Products Grid & Sorting */}
        <div className="lg:col-span-3 space-y-6">
          {/* Sorting controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-cream/40 border border-light-border p-3.5 rounded-xl">
            <div className="text-xs text-muted-text">
              {locale === 'ar' ? (
                <span>وجدت <strong>{filteredProducts.length}</strong> منتجاً</span>
              ) : (
                <span>Found <strong>{filteredProducts.length}</strong> products</span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold">
              <span className="text-muted-text flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-gold" />
                <span>{t('shop.sort')}</span>
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-gray-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
              >
                <option value="relevance">{t('shop.sort.relevance')}</option>
                <option value="price_asc">{t('shop.sort.price_asc')}</option>
                <option value="price_desc">{t('shop.sort.price_desc')}</option>
                <option value="rating">{t('shop.sort.rating')}</option>
                <option value="newest">{t('shop.sort.newest')}</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-50 border border-light-border rounded-xl h-80" />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-cream/10 border border-dashed border-light-border rounded-2xl">
              <RefreshCw className="w-8 h-8 text-gray-300 mx-auto mb-3 animate-spin duration-3000" />
              <p className="text-sm text-gray-500 font-semibold mb-2">{t('shop.no_products')}</p>
              <button
                onClick={handleResetFilters}
                className="text-xs text-primary font-bold hover:underline"
              >
                Reset All Filters
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-xs text-gray-500 mt-4 font-semibold">Loading catalog...</p>
      </div>
    }>
      <ShopContent />
    </Suspense>
  );
}
