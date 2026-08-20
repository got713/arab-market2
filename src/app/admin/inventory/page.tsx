'use client';

import React, { useState, useEffect } from 'react';
import { Product, Category } from '@/types';
import { ProductService } from '@/services/products';
import { CategoryService } from '@/services/categories';
import { useLocaleStore } from '@/store/locale-store';
import { translateCountry } from '@/lib/utils';
import { ShieldAlert, CheckCircle, RefreshCw, ChevronDown, ChevronRight, Layers, Search } from 'lucide-react';

export default function AdminInventoryPage() {
  const { locale } = useLocaleStore();
  const isAr = locale === 'ar';
  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Stock update inputs map
  const [stockInputs, setStockInputs] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Search + category collapse state
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedCats, setCollapsedCats] = useState<Record<string, boolean>>({});

  const loadInventory = async () => {
    setLoading(true);
    try {
      const [list, cats] = await Promise.all([
        ProductService.getProducts(true, { per_page: 1000 }),
        CategoryService.getCategories(true),
      ]);

      // Show items closest to running out first.
      const sorted = [...list].sort((a, b) => a.stock - b.stock);
      setProducts(sorted);
      setCategoriesList(cats);

      // Initialize inputs map
      const inputs: Record<string, string> = {};
      sorted.forEach((p) => {
        inputs[p.id] = String(p.stock);
      });
      setStockInputs(inputs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleStockInputChange = (productId: string, val: string) => {
    setStockInputs((prev) => ({
      ...prev,
      [productId]: val.replace(/\D/g, '')
    }));
  };

  const handleSaveStock = async (prod: Product) => {
    const rawVal = stockInputs[prod.id];
    if (!rawVal) return;

    setUpdatingId(prod.id);
    try {
      const updatedProduct = { ...prod, stock: Number(rawVal) };
      await ProductService.updateProduct(updatedProduct);

      // Reload list to sync
      const list = await ProductService.getProducts(true, { per_page: 1000 });
      const sorted = [...list].sort((a, b) => a.stock - b.stock);
      setProducts(sorted);
    } catch (err) {
      alert('Error updating stock');
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleCategoryOpen = (slug: string) => {
    setCollapsedCats((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  // Compile totals
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock < 15).length;

  // Search filter
  const q = searchQuery.trim().toLowerCase();
  const searchFilteredProducts = q
    ? products.filter((p) => {
        const idStr = String(p.id).toLowerCase();
        return (
          p.name?.toLowerCase().includes(q) ||
          p.arabicName?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          idStr.includes(q)
        );
      })
    : products;

  // Group by category (order already sorted by stock ascending, preserved within each group)
  const productGroups = categoriesList
    .map((cat) => ({
      cat,
      items: searchFilteredProducts.filter(
        (p) => p.category === cat.slug || p.categoryId === cat.id
      ),
    }))
    .filter((g) => g.items.length > 0);

  const groupedIds = new Set(productGroups.flatMap((g) => g.items.map((p) => p.id)));
  const uncategorizedItems = searchFilteredProducts.filter((p) => !groupedIds.has(p.id));

  const isCategoryOpen = (slug: string) => {
    if (q) return true; // auto-expand while searching
    return !collapsedCats[slug];
  };

  const renderProductRow = (p: Product) => {
    const isOutOfStock = p.stock === 0;
    const isLowStock = p.stock > 0 && p.stock < 15;
    const inputVal = stockInputs[p.id] || '';

    return (
      <tr key={p.id} className="hover:bg-cream/10 transition-colors">
        {/* Item */}
        <td className="p-4 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={p.images[0]}
            alt=""
            className="w-10 h-10 object-cover rounded-md border border-light-border"
          />
          <div className="space-y-0.5">
            <strong className="text-dark block font-semibold text-[13px]">
              {locale === 'ar' ? p.arabicName : p.name}
            </strong>
            <span className="text-[10px] text-gray-400 font-medium font-mono">{p.id}</span>
          </div>
        </td>

        {/* Brand */}
        <td className="p-4">
          <span className="block font-semibold text-dark">{p.brand}</span>
          <span className="text-[10px] text-gray-400">{translateCountry(p.country, locale)}</span>
        </td>

        {/* Alert status badge */}
        <td className="p-4">
          {isOutOfStock ? (
            <span className="inline-block bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase">
              {locale === 'ar' ? 'نفد من المخزن' : 'Out of stock'}
            </span>
          ) : isLowStock ? (
            <span className="inline-block bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase">
              {locale === 'ar' ? 'مخزون منخفض' : 'Low Stock'}
            </span>
          ) : (
            <span className="inline-block bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase">
              {locale === 'ar' ? 'سليم' : 'Healthy'}
            </span>
          )}
        </td>

        {/* Weight */}
        <td className="p-4 font-semibold text-gray-500">{p.weight}</td>

        {/* Update Input box */}
        <td className="p-4">
          <div className="flex gap-2 max-w-[120px]">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => handleStockInputChange(p.id, e.target.value)}
              className="w-20 px-2 py-1 rounded border border-gray-300 focus:outline-none focus:border-primary text-center font-bold"
            />
          </div>
        </td>

        {/* Save Action */}
        <td className="p-4 text-right">
          <button
            onClick={() => handleSaveStock(p)}
            disabled={updatingId === p.id}
            className="px-3.5 py-1.5 bg-primary text-cream hover:bg-primary-dark rounded-md font-bold text-[10px] transition-colors flex items-center justify-center gap-1 ml-auto rtl:mr-auto rtl:ml-0"
          >
            {updatingId === p.id ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <span>{locale === 'ar' ? 'تحديث' : 'Update'}</span>
            )}
          </button>
        </td>
      </tr>
    );
  };

  const renderSectionHeader = (key: string, label: string, count: number, open: boolean, muted = false) => (
    <tr
      key={`header-${key}`}
      onClick={() => toggleCategoryOpen(key)}
      className={`cursor-pointer select-none border-y border-light-border ${muted ? 'bg-gray-50' : 'bg-cream/30'} hover:bg-cream/50 transition-colors`}
    >
      <td colSpan={6} className="p-3 px-4">
        <div className="flex items-center gap-2">
          {open ? (
            <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
          )}
          <Layers className="w-3.5 h-3.5 text-primary" />
          <span className="font-bold text-dark text-[12px]">{label}</span>
          <span className="text-[10px] text-gray-400 font-semibold">
            ({count} {locale === 'ar' ? 'منتج' : 'items'})
          </span>
        </div>
      </td>
    </tr>
  );

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in" dir={locale === 'ar' ? 'rtl' : 'ltr'}>

      {/* Alert KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-red-50 border border-red-150 p-4 rounded-xl shadow-xs flex items-center justify-between text-red-700">
          <div>
            <span className="text-[10px] uppercase font-bold text-red-500 block mb-0.5">
              {locale === 'ar' ? 'منفد من المخزن' : 'Out of Stock'}
            </span>
            <strong className="text-2xl font-bold">{outOfStockCount} {locale === 'ar' ? 'منتج' : 'items'}</strong>
          </div>
          <div className="p-2.5 bg-red-100 rounded-lg">
            <ShieldAlert className="w-5 h-5 text-red-650" />
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-xs flex items-center justify-between text-amber-700">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-500 block mb-0.5">
              {locale === 'ar' ? 'تنبيهات انخفاض المخزون' : 'Low stock warnings'}
            </span>
            <strong className="text-2xl font-bold">{lowStockCount} {locale === 'ar' ? 'منتج' : 'items'}</strong>
          </div>
          <div className="p-2.5 bg-amber-100 rounded-lg">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 p-4 rounded-xl shadow-xs flex items-center justify-between text-green-700">
          <div>
            <span className="text-[10px] uppercase font-bold text-green-500 block mb-0.5">
              {locale === 'ar' ? 'مستويات مخزون سليمة' : 'Healthy Stock Count'}
            </span>
            <strong className="text-2xl font-bold">
              {products.length - outOfStockCount - lowStockCount} {locale === 'ar' ? 'منتج' : 'items'}
            </strong>
          </div>
          <div className="p-2.5 bg-green-100 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
        </div>
      </div>

      {/* Search bar */}
      <div className="bg-white border border-light-border rounded-xl shadow-xs p-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-gray-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={locale === 'ar' ? 'ابحث بالاسم، الماركة، أو الكود...' : 'Search by name, brand, or SKU...'}
          className="w-full text-xs focus:outline-none"
        />
        {q && (
          <span className="text-[10px] text-gray-400 font-semibold shrink-0">
            {searchFilteredProducts.length} {locale === 'ar' ? 'نتيجة' : 'matches'}
          </span>
        )}
      </div>

      {/* Inventory table */}
      <div className="bg-white border border-light-border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-light-border text-gray-500 font-bold uppercase tracking-wider">
                <th className="p-4">{locale === 'ar' ? 'تفاصيل المنتج' : 'Product details'}</th>
                <th className="p-4">{locale === 'ar' ? 'الماركة / بلد المنشأ' : 'Supplier / Brand'}</th>
                <th className="p-4">{locale === 'ar' ? 'حالة التنبيه' : 'Status Alert'}</th>
                <th className="p-4">{locale === 'ar' ? 'وزن القطعة' : 'Unit Weight'}</th>
                <th className="p-4">{locale === 'ar' ? 'تعديل كمية المخزن' : 'Manage Stock (Units)'}</th>
                <th className="p-4 text-right">{locale === 'ar' ? 'حفظ سريع' : 'Quick Save'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border">
              {productGroups.map(({ cat, items }) => {
                const open = isCategoryOpen(cat.slug);
                const label = isAr ? cat.arabicName : cat.name;
                return (
                  <React.Fragment key={cat.slug}>
                    {renderSectionHeader(cat.slug, label, items.length, open)}
                    {open && items.map(renderProductRow)}
                  </React.Fragment>
                );
              })}

              {uncategorizedItems.length > 0 && (
                <React.Fragment>
                  {renderSectionHeader(
                    '__uncategorized',
                    locale === 'ar' ? 'غير مصنف' : 'Uncategorized',
                    uncategorizedItems.length,
                    isCategoryOpen('__uncategorized'),
                    true
                  )}
                  {isCategoryOpen('__uncategorized') && uncategorizedItems.map(renderProductRow)}
                </React.Fragment>
              )}

              {searchFilteredProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-gray-400 font-semibold text-[12px]">
                    {locale === 'ar' ? 'لا توجد منتجات مطابقة' : 'No matching products'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
