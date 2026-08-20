'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Product, Category } from '@/types';
import { ProductService } from '@/services/products';
import { CategoryService } from '@/services/categories';
import { useLocaleStore } from '@/store/locale-store';
import ProductCard from '@/components/products/product-card';
import { SlidersHorizontal, ArrowUpDown, RefreshCw, Check, LayoutGrid, List } from 'lucide-react';
import { translateCountry } from '@/lib/utils';

export const dynamic = 'force-dynamic';

function ShopContent() {
  const { t, locale } = useLocaleStore();
  const searchParams = useSearchParams();
  const isAr = locale === 'ar';
  
  // State for products
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<string | null>(null);
  const [onlyHalal, setOnlyHalal] = useState(false);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [filterBy, setFilterBy] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const [categoriesList, setCategoriesList] = useState<Category[]>([]);

  // Pagination (client-side, over the already-loaded/filtered set)
  const PRODUCTS_PER_PAGE = 24;
  const [currentPage, setCurrentPage] = useState(1);

  // Load products & categories on mount.
  // per_page is set high so the whole catalog loads in one request instead of
  // the backend's default 12-per-page — the shop page paginates client-side.
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [prodsList, catsList] = await Promise.all([
          ProductService.getProducts(true, { per_page: 1000 }),
          CategoryService.getCategories(false), // only active
        ]);
        setAllProducts(prodsList);
        setCategoriesList(catsList);
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
    const filterParam = searchParams?.get('filter');
    if (filterParam) {
      setFilterBy(filterParam);
    } else {
      setFilterBy(null);
    }

    const tagParam = searchParams?.get('tag');
    if (tagParam) {
      setSelectedTag(tagParam);
    } else {
      setSelectedTag(null);
    }
  }, [searchParams]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...allProducts];

    // Filter by category
    if (selectedCategories.length > 0) {
      result = result.filter((p) => selectedCategories.includes(p.category));
    }

    // Filter by subcategory (drill-down within a selected category)
    if (selectedSubcategory) {
      result = result.filter((p) => String(p.subcategoryId ?? '') === selectedSubcategory);
    }

    // Filter by tag
    if (selectedTag) {
      const tagLower = selectedTag.toLowerCase();
      result = result.filter(
        (p) =>
          (p.tags && p.tags.some((t) => t.toLowerCase() === tagLower)) ||
          p.name.toLowerCase().includes(tagLower) ||
          p.description.toLowerCase().includes(tagLower) ||
          p.country.toLowerCase().includes(tagLower) ||
          tagLower.includes(p.country.toLowerCase())
      );
    }

    // Filter by Brand
    if (selectedBrands.length > 0) {
      result = result.filter((p) => selectedBrands.includes(p.brand));
    }

    // Filter by Origin
    if (selectedOrigins.length > 0) {
      result = result.filter((p) => selectedOrigins.includes(p.country));
    }

    // Filter by Price Range
    if (priceRange === 'under-5') {
      result = result.filter((p) => p.purchaseOptions.single.price < 5);
    } else if (priceRange === '5-to-15') {
      result = result.filter((p) => p.purchaseOptions.single.price >= 5 && p.purchaseOptions.single.price <= 15);
    } else if (priceRange === 'over-15') {
      result = result.filter((p) => p.purchaseOptions.single.price > 15);
    }

    // Filter by Deals / Bestsellers from URL
    if (filterBy === 'deals') {
      result = result.filter((p) => p.featured);
    } else if (filterBy === 'bestseller') {
      result = result.filter((p) => p.bestSeller);
    }

    // Filter by Halal
    if (onlyHalal) {
      result = result.filter((p) => {
        const halalCategories = ['frozen-foods', 'canned-foods', 'rice-pasta-grains', 'dairy-eggs', 'coffee-tea-drinks', 'nuts-seeds-snacks', 'sweets-biscuits', 'oils-spices-sauces'];
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
      result.sort((a, b) => b.id.localeCompare(a.id));
    }

    setFilteredProducts(result);
  }, [allProducts, selectedCategories, selectedSubcategory, selectedBrands, selectedOrigins, priceRange, filterBy, onlyHalal, onlyInStock, sortBy, selectedTag]);

  // Reset to page 1 whenever the visible result set changes (new filters/sort)
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredProducts.length, selectedCategories, selectedSubcategory, selectedBrands, selectedOrigins, priceRange, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => {
      const next = prev.includes(cat) ? prev.filter((c) => c !== cat) : [cat]; // single-select filter mimicking screenshot layout category path
      return next;
    });
    setSelectedSubcategory(null);
    setExpandedCategory((prev) => (prev === cat ? null : cat));
  };

  const toggleSubcategory = (categorySlug: string, subId: string) => {
    setSelectedCategories([categorySlug]);
    setSelectedSubcategory((prev) => (prev === subId ? null : subId));
  };

  const handleResetFilters = () => {
    setSelectedCategories([]);
    setSelectedSubcategory(null);
    setExpandedCategory(null);
    setSelectedBrands([]);
    setSelectedOrigins([]);
    setPriceRange(null);
    setOnlyHalal(false);
    setOnlyInStock(false);
    setSortBy('relevance');
  };

  // Distinct list helper computations
  const brandsList = Array.from(new Set(allProducts.map((p) => p.brand))).filter(Boolean).sort();
  
  // Category products counts calculator
  const getCategoryCount = (slug: string) => {
    return allProducts.filter((p) => p.category === slug).length;
  };

  // Brand products counts calculator
  const getBrandCount = (br: string) => {
    return allProducts.filter((p) => p.brand === br).length;
  };

  // Subcategory products counts calculator
  const getSubcategoryCount = (subId: string) => {
    return allProducts.filter((p) => String(p.subcategoryId ?? '') === subId).length;
  };

  const currentCategoryName = selectedCategories.length > 0 
    ? categoriesList.find((c) => c.slug === selectedCategories[0])
      ? isAr 
        ? categoriesList.find((c) => c.slug === selectedCategories[0])?.arabicName 
        : categoriesList.find((c) => c.slug === selectedCategories[0])?.name
      : (isAr ? 'الأقسام' : 'Groceries')
    : (isAr ? 'البقالة العامة' : 'Groceries');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in text-dark" dir={isAr ? 'rtl' : 'ltr'}>
      
      {/* Breadcrumbs */}
      <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">
        <Link href="/" className="hover:text-primary transition-colors">{isAr ? 'الرئيسية' : 'Home'}</Link>
        <span className="mx-2 font-light">/</span>
        <span className="text-gold font-black">{currentCategoryName}</span>
      </div>

      {/* Title block */}
      <div className="border-b border-light-border pb-5 mb-8">
        <h1 className="text-2xl sm:text-4xl font-black text-primary font-cairo leading-none">{currentCategoryName}</h1>
        <p className="text-xs sm:text-sm text-muted-text mt-2 font-medium">
          {locale === 'ar' 
            ? `تسوق من تشكيلتنا المختارة من البقالة والمستلزمات الطازجة والمميزة.` 
            : `Shop from our wide selection of authentic groceries and pantry essentials.`}
        </p>
      </div>

      {/* Grid container */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters - Desktop */}
        <div className="lg:block space-y-6">
          <div className="flex items-center justify-between border-b border-light-border pb-3">
            <h3 className="font-bold text-sm text-primary flex items-center gap-1.5 uppercase tracking-wide">
              <SlidersHorizontal className="w-4 h-4 text-gold" />
              <span>{t('shop.filters')}</span>
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs text-accent font-bold hover:underline"
            >
              {t('shop.clear')}
            </button>
          </div>

          {/* Categories filter */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 select-none">
              {t('shop.filter.category')}
            </h4>
            <div className="space-y-1.5">
              {categoriesList.map((cat) => {
                const active = selectedCategories.includes(cat.slug);
                const count = getCategoryCount(cat.slug);
                const isExpanded = expandedCategory === cat.slug;
                const subs = (cat.subcategories || []) as Array<{ id?: string | number; slug: string; name: string; arabicName: string }>;
                return (
                  <div key={cat.slug}>
                    <button
                      onClick={() => toggleCategory(cat.slug)}
                      className={`w-full flex items-center justify-between text-xs px-3 py-2.5 rounded-xl text-left rtl:text-right transition-colors ${
                        active
                          ? 'bg-primary text-white font-bold shadow-2xs'
                          : 'text-gray-650 hover:bg-primary/5 font-medium'
                      }`}
                    >
                      <span className="font-cairo">{locale === 'ar' ? cat.arabicName : cat.name}</span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-mono ${active ? 'bg-white/10 text-white' : 'bg-gray-100 text-gray-500 font-bold'}`}>
                        {count}
                      </span>
                    </button>

                    {isExpanded && subs.length > 0 && (
                      <div className="mt-1 ms-3 ps-3 border-s-2 border-light-border space-y-1">
                        {subs.map((sub) => {
                          const subId = String(sub.id ?? sub.slug);
                          const subCount = getSubcategoryCount(subId);
                          const subActive = selectedSubcategory === subId;
                          if (subCount === 0) return null;
                          return (
                            <button
                              key={sub.slug}
                              onClick={() => toggleSubcategory(cat.slug, subId)}
                              className={`w-full flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-lg text-left rtl:text-right transition-colors ${
                                subActive
                                  ? 'bg-gold/20 text-primary font-bold'
                                  : 'text-gray-500 hover:bg-primary/5 font-medium'
                              }`}
                            >
                              <span className="font-cairo">{locale === 'ar' ? sub.arabicName : sub.name}</span>
                              <span className="text-[10px] text-gray-400 font-mono">{subCount}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Price Filter */}
          <div className="pt-5 border-t border-light-border/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 select-none">
              {locale === 'ar' ? 'السعر' : 'Price Range'}
            </h4>
            <div className="space-y-2 text-xs text-gray-600 font-semibold">
              {(['all', 'under-5', '5-to-15', 'over-15'] as const).map((range) => (
                <label key={range} className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="radio"
                    name="price-range"
                    checked={priceRange === (range === 'all' ? null : range)}
                    onChange={() => setPriceRange(range === 'all' ? null : range)}
                    className="text-primary focus:ring-primary/20 accent-primary w-4 h-4 border-gray-300"
                  />
                  <span>
                    {range === 'all' && (locale === 'ar' ? 'جميع الأسعار' : 'All Prices')}
                    {range === 'under-5' && (locale === 'ar' ? 'أقل من $5' : 'Under $5')}
                    {range === '5-to-15' && (locale === 'ar' ? '$5 إلى $15' : '$5 to $15')}
                    {range === 'over-15' && (locale === 'ar' ? 'أكثر من $15' : 'Over $15')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Brand Filter */}
          <div className="pt-5 border-t border-light-border/60">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 select-none">
              {locale === 'ar' ? 'العلامة التجارية' : 'Brand'}
            </h4>
            <div className="space-y-2 text-xs text-gray-600 font-semibold max-h-48 overflow-y-auto pr-1">
              {brandsList.map((brand) => {
                const count = getBrandCount(brand);
                return (
                  <label key={brand} className="flex items-center justify-between cursor-pointer select-none">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand)}
                        onChange={() => {
                          setSelectedBrands(prev => 
                            prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
                          );
                        }}
                        className="rounded border-gray-300 text-primary focus:ring-primary/20 accent-primary w-4 h-4"
                      />
                      <span>{brand}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold font-mono">{count}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Certification / Stock checklist */}
          <div className="pt-5 border-t border-light-border/60 space-y-3 font-semibold">
            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyHalal}
                onChange={(e) => setOnlyHalal(e.target.checked)}
                className="w-4 h-4 rounded-md border-gray-300 text-primary focus:ring-primary/20 accent-primary"
              />
              <span className="text-xs text-dark">{t('shop.filter.halal')}</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={onlyInStock}
                onChange={(e) => setOnlyInStock(e.target.checked)}
                className="w-4 h-4 rounded-md border-gray-300 text-primary focus:ring-primary/20 accent-primary"
              />
              <span className="text-xs text-dark">{t('shop.filter.instock')}</span>
            </label>
          </div>
        </div>

        {/* Products Grid & Sorting */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Sorting controls */}
          <div className="flex items-center justify-between gap-4 bg-[#FAF7F0] border border-light-border p-3.5 rounded-xl">
            <div className="text-xs text-muted-text font-bold">
              {locale === 'ar' ? (
                <span>وجدت <strong>{filteredProducts.length}</strong> منتجاً</span>
              ) : (
                <span>Showing <strong>{filteredProducts.length}</strong> products</span>
              )}
            </div>

            <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
              
              {/* Grid / List layout switcher toggler */}
              <div className="hidden sm:flex items-center border border-light-border rounded-lg overflow-hidden bg-white shrink-0">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-all ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-gray-400 hover:text-primary'}`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-all ${viewMode === 'list' ? 'bg-primary text-white' : 'text-gray-400 hover:text-primary'}`}
                  title="List View"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Sort By Dropdown */}
              <div className="flex items-center gap-1.5">
                <span className="text-muted-text">{t('shop.sort')}</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-light-border rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-bold"
                >
                  <option value="relevance">{t('shop.sort.relevance')}</option>
                  <option value="price_asc">{t('shop.sort.price_asc')}</option>
                  <option value="price_desc">{t('shop.sort.price_desc')}</option>
                  <option value="rating">{t('shop.sort.rating')}</option>
                  <option value="newest">{t('shop.sort.newest')}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid View */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse bg-gray-50 border border-light-border rounded-xl h-80" />
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
                  {paginatedProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {paginatedProducts.map((product) => (
                    <div key={product.id} className="w-full">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              )}

              {/* Pagination bar */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 pt-4">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 rounded-lg text-xs font-bold border border-light-border text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/5 transition-colors"
                  >
                    {isAr ? 'السابق' : 'Prev'}
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((page) => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
                    .map((page, idx, arr) => (
                      <React.Fragment key={page}>
                        {idx > 0 && arr[idx - 1] !== page - 1 && (
                          <span className="px-1 text-gray-300 text-xs">…</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(page)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                            page === currentPage
                              ? 'bg-primary text-white'
                              : 'border border-light-border text-gray-500 hover:bg-primary/5'
                          }`}
                        >
                          {page}
                        </button>
                      </React.Fragment>
                    ))}

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 rounded-lg text-xs font-bold border border-light-border text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/5 transition-colors"
                  >
                    {isAr ? 'التالي' : 'Next'}
                  </button>
                </div>
              )}
            </>
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
