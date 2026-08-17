'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Product, PurchaseOptions, Category, SellingUnit, ProductImageDetail } from '@/types';
import { ProductService, ProductImageService } from '@/services/products';
import { CategoryService } from '@/services/categories';
import { formatPrice, translateCountry } from '@/lib/utils';
import { useLocaleStore } from '@/store/locale-store';
import { Plus, Edit, Trash2, X, ToggleLeft, ToggleRight, Package, PackageCheck, Upload, Star, ArrowLeft, ArrowRight, ImageOff } from 'lucide-react';

// ── Default option labels ────────────────────────────────────────────────────
const DEFAULT_LABELS = {
  single: { en: 'Each',  ar: 'قطعة'  },
  pack:   { en: 'Pack',  ar: 'ربطة' },
  case:   { en: 'Case',  ar: 'كرتون' },
};

interface OptionState {
  enabled: boolean;
  label: string;
  labelAr: string;
  price: number;
  qty: number;
}

const defaultOption = (key: 'single' | 'pack' | 'case'): OptionState => ({
  enabled: key === 'single',        // single is always on by default
  label:   DEFAULT_LABELS[key].en,
  labelAr: DEFAULT_LABELS[key].ar,
  price:   key === 'single' ? 4.99 : key === 'pack' ? 26.99 : 49.99,
  qty:     key === 'single' ? 1    : key === 'pack' ? 6      : 12,
});

export default function AdminProductsPage() {
  const { locale, t } = useLocaleStore();
  const isAr = locale === 'ar';

  const [products, setProducts] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saveError, setSaveError] = useState('');
  const [deleteError, setDeleteError] = useState('');

  // ── Form fields ────────────────────────────────────────────────────────────
  const [name, setName]                         = useState('');
  const [arabicName, setArabicName]             = useState('');
  const [slug, setSlug]                         = useState('');
  const [brand, setBrand]                       = useState('');
  const [category, setCategory]                 = useState('');
  const [subcategory, setSubcategory]           = useState('');
  const [country, setCountry]                   = useState('Egypt');
  const [description, setDescription]           = useState('');
  const [arabicDescription, setArabicDescription] = useState('');
  const [sellingUnit, setSellingUnit]           = useState<SellingUnit>('piece');
  const [weight, setWeight]                     = useState('');
  const [ingredients, setIngredients]           = useState('');
  const [allergens, setAllergens]               = useState('');
  const [stock, setStock]                       = useState(100);
  const [featured, setFeatured]                 = useState(false);
  const [bestSeller, setBestSeller]             = useState(false);
  const [weeklyDeal, setWeeklyDeal]             = useState(false);
  const [sku, setSku]                           = useState('');

  // ── Purchase options state ─────────────────────────────────────────────────
  const [singleOpt, setSingleOpt] = useState<OptionState>(defaultOption('single'));
  const [packOpt,   setPackOpt]   = useState<OptionState>(defaultOption('pack'));
  const [caseOpt,   setCaseOpt]   = useState<OptionState>(defaultOption('case'));

  // ── Image management state (real uploads, independent lifecycle) ──────────
  const [productImages, setProductImages] = useState<ProductImageDetail[]>([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [allProds, allCats] = await Promise.all([
        // per_page set high so the admin list shows the whole catalog, not just
        // the backend's default 12-per-page.
        ProductService.getProducts(true, { per_page: 1000 }),
        CategoryService.getCategories(true),
      ]);
      setProducts(allProds);
      setCategoriesList(allCats);
    }
    catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadData(); }, []);

  // ── Helpers to load option state from an existing product ──────────────────
  const loadOpt = (key: 'single' | 'pack' | 'case', prod: Product): OptionState => {
    const o = prod.purchaseOptions?.[key];
    return {
      enabled: o ? (o.enabled ?? true) : false,
      label:   o?.label   ?? DEFAULT_LABELS[key].en,
      labelAr: o?.labelAr ?? DEFAULT_LABELS[key].ar,
      price:   o?.price   ?? (key === 'single' ? 4.99 : key === 'pack' ? 26.99 : 49.99),
      qty:     o?.quantity ?? (key === 'single' ? 1    : key === 'pack' ? 6      : 12),
    };
  };

  const resetForm = () => {
    setEditingProduct(null);
    setName(''); setArabicName(''); setSlug(''); setBrand('');
    setCategory(categoriesList[0]?.slug || 'groceries'); setSubcategory(''); setCountry('Egypt');
    setDescription(''); setArabicDescription('');
    setSellingUnit('piece');
    setWeight(''); setIngredients(''); setAllergens('');
    setStock(100); setFeatured(false); setBestSeller(false); setWeeklyDeal(false); setSku('');
    setSingleOpt(defaultOption('single'));
    setPackOpt(defaultOption('pack'));
    setCaseOpt(defaultOption('case'));
    setProductImages([]);
    setImageError('');
    setSaveError('');
  };

  const openAdd = () => { resetForm(); setIsModalOpen(true); };

  const openEdit = (prod: Product) => {
    resetForm();
    setEditingProduct(prod);
    setName(prod.name); setArabicName(prod.arabicName); setSlug(prod.slug);
    setBrand(prod.brand); setCategory(prod.category);
    setSubcategory(prod.subcategoryId || '');
    setCountry(prod.country); setDescription(prod.description);
    setArabicDescription(prod.arabicDescription);
    setSellingUnit(prod.sellingUnit || 'piece');
    setWeight(prod.weight);
    setIngredients(prod.ingredients); setAllergens(prod.allergens);
    setStock(prod.stock); setFeatured(prod.featured); setBestSeller(prod.bestSeller);
    setWeeklyDeal(prod.weeklyDeal === true); setSku(prod.sku || '');
    setSingleOpt(loadOpt('single', prod));
    setPackOpt(loadOpt('pack', prod));
    setCaseOpt(loadOpt('case', prod));
    setProductImages(prod.imageDetails || []);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (prod: Product) => {
    await ProductService.updateProduct({ ...prod, active: !prod.active });
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isAr ? 'هل أنت متأكد من حذف هذا المنتج؟' : 'Delete this product?')) return;
    setDeleteError('');
    try {
      await ProductService.deleteProduct(id);
      loadData();
    } catch (err: any) {
      // Most commonly: the backend refuses to hard-delete a product that
      // has real order history (see ProductController::destroy) — surface
      // that reason to the admin instead of failing silently, and point
      // them at Deactivate as the safe alternative.
      setDeleteError(err.message || (isAr ? 'فشل حذف المنتج.' : 'Failed to delete product.'));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');

    if (!singleOpt.enabled && !packOpt.enabled && !caseOpt.enabled) {
      setSaveError(isAr ? 'يجب تفعيل خيار واحد على الأقل للمنتج (قطعة، ربطة، أو كرتون).' : 'At least one purchase option (Each, Pack, or Case) must be enabled.');
      return;
    }

    const purchaseOptions: PurchaseOptions = {
      single: { enabled: singleOpt.enabled, price: singleOpt.price, quantity: 1,            label: singleOpt.label, labelAr: singleOpt.labelAr },
      pack:   { enabled: packOpt.enabled,   price: packOpt.price,   quantity: packOpt.qty,  label: packOpt.label,   labelAr: packOpt.labelAr   },
      case:   { enabled: caseOpt.enabled,   price: caseOpt.price,   quantity: caseOpt.qty,  label: caseOpt.label,   labelAr: caseOpt.labelAr   },
    };

    const catObj = categoriesList.find(c => c.slug === category);

    const payload: Omit<Product, 'id'> = {
      name, arabicName,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      brand, 
      category, 
      categoryId: catObj?.id || category, 
      subcategoryId: subcategory || undefined,
      country, origin: country, description, arabicDescription,
      images: editingProduct?.images ?? [],
      sellingUnit,
      rating: editingProduct?.rating ?? 4.5,
      reviews: editingProduct?.reviews ?? [],
      weight, ingredients, allergens,
      purchaseOptions,
      price: singleOpt.price,
      packPrice: packOpt.price,
      casePrice: caseOpt.price,
      stock, inventory: stock, 
      featured, bestSeller, weeklyDeal, sku: sku || undefined,
      active: editingProduct ? editingProduct.active : true,
    };

    try {
      if (editingProduct) {
        await ProductService.updateProduct({ ...payload, id: editingProduct.id });
        setIsModalOpen(false);
      } else {
        // Images are uploaded via a separate endpoint that requires a real
        // product id, so a brand-new product switches into edit mode after
        // creation instead of closing — the admin can then upload images
        // right away without having to re-open the product.
        const created = await ProductService.createProduct(payload);
        setEditingProduct(created);
        setProductImages(created.imageDetails || []);
      }
      loadData();
    } catch (err: any) {
      setSaveError(err.message || 'Error saving product');
    }
  };

  // ── Image management handlers ──────────────────────────────────────────────
  const handleImageFilesSelected = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || !editingProduct) return;
    setImageError('');
    setImageUploading(true);
    try {
      const updated = await ProductImageService.upload(editingProduct.id, Array.from(fileList));
      setProductImages(updated);
    } catch (err: any) {
      setImageError(err.message || (isAr ? 'فشل رفع الصورة' : 'Failed to upload image(s)'));
    } finally {
      setImageUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSetPrimaryImage = async (imageId: number) => {
    if (!editingProduct) return;
    setImageError('');
    try {
      const updated = await ProductImageService.setPrimary(editingProduct.id, imageId);
      setProductImages(updated);
    } catch (err: any) {
      setImageError(err.message || (isAr ? 'فشل تحديث الصورة الرئيسية' : 'Failed to set primary image'));
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!editingProduct) return;
    if (!confirm(isAr ? 'هل تريد حذف هذه الصورة؟' : 'Delete this image?')) return;
    setImageError('');
    try {
      const updated = await ProductImageService.remove(editingProduct.id, imageId);
      setProductImages(updated);
    } catch (err: any) {
      setImageError(err.message || (isAr ? 'فشل حذف الصورة' : 'Failed to delete image'));
    }
  };

  const handleMoveImage = async (index: number, direction: -1 | 1) => {
    if (!editingProduct) return;
    const target = index + direction;
    if (target < 0 || target >= productImages.length) return;
    const reordered = [...productImages];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setProductImages(reordered);
    try {
      const updated = await ProductImageService.reorder(editingProduct.id, reordered.map((img) => img.id));
      setProductImages(updated);
    } catch (err: any) {
      setImageError(err.message || (isAr ? 'فشل إعادة الترتيب' : 'Failed to reorder images'));
      setProductImages(productImages); // revert optimistic reorder on failure
    }
  };

  // ── Option Card Component (reusable for pack & case) ──────────────────────
  const OptionCard = ({
    optKey, opt, setOpt, required = false,
  }: {
    optKey: 'single' | 'pack' | 'case';
    opt: OptionState;
    setOpt: (o: OptionState) => void;
    required?: boolean;
  }) => {
    const isSingle = optKey === 'single';
    return (
      <div className={`border rounded-xl p-4 space-y-3 transition-all ${
        opt.enabled ? 'border-primary/30 bg-green-50/40' : 'border-gray-200 bg-gray-50 opacity-60'
      }`}>
        {/* Header with toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PackageCheck className={`w-4 h-4 ${opt.enabled ? 'text-primary' : 'text-gray-400'}`} />
            <span className="text-xs font-bold text-dark uppercase tracking-wide">
              {isAr ? DEFAULT_LABELS[optKey].ar : DEFAULT_LABELS[optKey].en}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setOpt({ ...opt, enabled: !opt.enabled })}
            className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
              opt.enabled
                ? 'bg-primary text-cream border-primary'
                : 'bg-white text-gray-500 border-gray-300'
            }`}
          >
            {opt.enabled
              ? <><ToggleRight className="w-3.5 h-3.5" />{isAr ? 'مفعّل' : 'Enabled'}</>
              : <><ToggleLeft  className="w-3.5 h-3.5" />{isAr ? 'معطّل' : 'Disabled'}</>}
          </button>
        </div>

        {/* Fields — shown always but disabled if off */}
        <div className="grid grid-cols-2 gap-2">
          {/* Custom label EN */}
          <div className="space-y-0.5">
            <label className="text-[9px] font-bold text-gray-400 uppercase">
              {isAr ? 'الاسم (EN)' : 'Label (EN)'}
            </label>
            <input
              type="text"
              disabled={!opt.enabled}
              value={opt.label}
              placeholder={DEFAULT_LABELS[optKey].en}
              onChange={(e) => setOpt({ ...opt, label: e.target.value })}
              className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>
          {/* Custom label AR */}
          <div className="space-y-0.5">
            <label className="text-[9px] font-bold text-gray-400 uppercase">
              {isAr ? 'الاسم (AR)' : 'Label (AR)'}
            </label>
            <input
              type="text"
              disabled={!opt.enabled}
              value={opt.labelAr}
              placeholder={DEFAULT_LABELS[optKey].ar}
              onChange={(e) => setOpt({ ...opt, labelAr: e.target.value })}
              dir="rtl"
              className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>
          {/* Price */}
          <div className="space-y-0.5">
            <label className="text-[9px] font-bold text-gray-400 uppercase">
              {isAr ? 'السعر ($)' : 'Price ($)'}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              disabled={!opt.enabled}
              value={opt.price}
              onChange={(e) => setOpt({ ...opt, price: Number(e.target.value) })}
              className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
            />
          </div>
          {/* Qty (hidden for single) */}
          {!isSingle && (
            <div className="space-y-0.5">
              <label className="text-[9px] font-bold text-gray-400 uppercase">
                {isAr ? 'الكمية' : 'Qty per unit'}
              </label>
              <input
                type="number"
                min="1"
                disabled={!opt.enabled}
                value={opt.qty}
                onChange={(e) => setOpt({ ...opt, qty: Number(e.target.value) })}
                className="w-full px-2 py-1.5 text-xs rounded-lg border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
              />
            </div>
          )}
        </div>
      </div>
    );
  };

  // Find subcategories for selected Category
  const selectedCatObj = categoriesList.find((c) => c.slug === category);
  const subcategoriesList = selectedCatObj?.subcategories || [];

  return (
    <div className="space-y-6 fade-in" dir={isAr ? 'rtl' : 'ltr'}>

      {deleteError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-700 font-semibold flex items-start justify-between gap-3">
          <span>{deleteError}</span>
          <button onClick={() => setDeleteError('')} className="text-red-400 hover:text-red-600 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex justify-between items-center border-b border-light-border pb-4">
        <div className="text-xs text-gray-500 font-medium font-cairo">
          {isAr ? 'إجمالي المنتجات في الكتالوج: ' : 'Total in catalog: '}
          <strong>{products.length}</strong>
        </div>
        <button
          onClick={openAdd}
          className="px-4 py-2 bg-primary text-cream hover:bg-primary-dark font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-sm transition-colors font-cairo"
        >
          <Plus className="w-4 h-4" />
          {isAr ? 'إضافة منتج' : 'Add Product'}
        </button>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        </div>
      ) : (
        <div className="bg-white border border-light-border rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left rtl:text-right border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-light-border text-gray-500 font-bold uppercase tracking-wider text-[10px] font-cairo">
                  <th className="p-4">{isAr ? 'المنتج' : 'Product'}</th>
                  <th className="p-4">{isAr ? 'الماركة' : 'Brand'}</th>
                  <th className="p-4">{isAr ? 'القسم' : 'Category'}</th>
                  <th className="p-4">{isAr ? 'خيارات الشراء' : 'Buy Options'}</th>
                  <th className="p-4">{isAr ? 'سعر القطعة' : 'Unit Price'}</th>
                  <th className="p-4">{isAr ? 'المخزون' : 'Stock'}</th>
                  <th className="p-4">{isAr ? 'الحالة' : 'Status'}</th>
                  <th className="p-4 text-right rtl:text-left">{isAr ? 'إجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border">
                {products.map((prod) => {
                  const opts = prod.purchaseOptions;
                  // Category lookup
                  const catObj = categoriesList.find(c => c.slug === prod.category || c.id === prod.categoryId);
                  const catName = catObj ? (isAr ? catObj.arabicName : catObj.name) : prod.category;
                  
                  return (
                    <tr key={prod.id} className="hover:bg-cream/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={prod.images[0]} alt={prod.name} className="w-10 h-10 object-cover rounded-lg border border-light-border bg-gray-50 shrink-0" />
                          <div>
                            <strong className="text-dark block text-[13px] font-semibold font-cairo">
                              {isAr ? prod.arabicName : prod.name}
                            </strong>
                            <span className="text-[10px] text-gray-400 font-mono">{prod.weight} · {prod.id} {prod.sku && `· SKU: ${prod.sku}`}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-dark">{prod.brand}</span>
                        <span className="block text-[10px] text-gray-400">{translateCountry(prod.country, locale)}</span>
                      </td>
                      <td className="p-4 font-semibold text-gray-600 text-[11px] font-cairo">
                        {catName}
                      </td>

                      {/* Buy Options badges */}
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {(['single', 'pack', 'case'] as const).map((key) => {
                            const o = opts[key];
                            const on = o && o.enabled !== false;
                            const lbl = isAr
                              ? (o?.labelAr || DEFAULT_LABELS[key].ar)
                              : (o?.label   || DEFAULT_LABELS[key].en);
                            return (
                              <span
                                key={key}
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  on
                                    ? 'bg-green-50 text-green-700 border-green-200'
                                    : 'bg-gray-100 text-gray-400 border-gray-200 line-through'
                                }`}
                              >
                                {lbl}
                              </span>
                            );
                          })}
                        </div>
                      </td>

                      <td className="p-4 font-bold text-primary">
                        {formatPrice(opts.single.price, locale)}
                      </td>
                      <td className="p-4 font-semibold text-dark">
                        {prod.stock === 0
                          ? <span className="text-red-650 font-bold">{isAr ? 'نفد' : 'Out'}</span>
                          : <span>{prod.stock} {isAr ? 'وحدة' : 'units'}</span>}
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleStatus(prod)}
                          className={`px-3 py-1 rounded-full text-[10px] font-bold border font-cairo transition-all ${
                            prod.active !== false
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-red-50 text-red-650 border-red-200'
                          }`}
                        >
                          {prod.active !== false ? (isAr ? 'نشط' : 'Active') : (isAr ? 'معطّل' : 'Off')}
                        </button>
                      </td>
                      <td className="p-4 text-right rtl:text-left space-x-1">
                        <button onClick={() => openEdit(prod)} className="p-1.5 text-gray-500 hover:text-primary border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(prod.id)} className="p-1.5 text-red-500 hover:bg-red-50 border border-red-100 rounded-md transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── MODAL ─────────────────────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/60 backdrop-blur-sm fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-light-border my-8">

            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-light-border bg-cream rounded-t-2xl">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                <span className="font-bold text-sm text-dark font-cairo">
                  {editingProduct
                    ? (isAr ? 'تعديل المنتج' : 'Edit Product')
                    : (isAr ? 'إضافة منتج جديد' : 'Add New Product')}
                </span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-dark transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-5 max-h-[85vh] overflow-y-auto no-scrollbar font-cairo">

              {/* Names */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Name (EN) *</label>
                  <input required value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-primary font-sans" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">الاسم (AR) *</label>
                  <input required dir="rtl" value={arabicName} onChange={(e) => setArabicName(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:border-primary" />
                </div>
              </div>

              {/* Brand, Category, Subcategory, Origin */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Brand *</label>
                  <input required value={brand} onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Category *</label>
                  <select value={category} onChange={(e) => { setCategory(e.target.value); setSubcategory(''); }}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white">
                    {categoriesList.map((c) => <option key={c.slug} value={c.slug}>{isAr ? c.arabicName : c.name}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Subcategory</label>
                  <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white">
                    <option value="">None</option>
                    {subcategoriesList.map((s) => (
                      <option key={s.slug} value={s.slug}>{isAr ? s.arabicName : s.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Origin</label>
                  <input value={country} onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300" />
                </div>
              </div>

              {/* SKU, Weight & Selling Unit */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">SKU / Item Code</label>
                  <input value={sku} placeholder="e.g. ME-GROC-102" onChange={(e) => setSku(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 font-mono" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Weight / Size *</label>
                  <input required value={weight} placeholder="e.g. 450g or 1 Liter" onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">
                    {isAr ? 'وحدة البيع *' : 'Selling Unit *'}
                  </label>
                  <select value={sellingUnit} onChange={(e) => setSellingUnit(e.target.value as SellingUnit)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white">
                    <option value="piece">{isAr ? 'حبة (Piece)' : 'Piece'}</option>
                    <option value="carton">{isAr ? 'كرتونة (Carton)' : 'Carton'}</option>
                  </select>
                </div>
              </div>

              {/* Descriptions */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Description (EN)</label>
                  <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">الوصف (AR)</label>
                  <textarea rows={2} dir="rtl" value={arabicDescription} onChange={(e) => setArabicDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300" />
                </div>
              </div>

              {/* ── PRODUCT IMAGES ──────────────────────────────────────────── */}
              <div className="border-t border-light-border pt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-primary" />
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
                    {isAr ? 'صور المنتج' : 'Product Images'}
                  </h4>
                </div>

                {!editingProduct ? (
                  <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    {isAr
                      ? 'احفظ بيانات المنتج أولاً، ثم يمكنك رفع الصور.'
                      : 'Save the product details first — you can then upload images.'}
                  </p>
                ) : (
                  <>
                    <p className="text-[10px] text-muted-text">
                      {isAr
                        ? 'JPG, PNG أو WebP فقط، بحد أقصى 5 ميجابايت لكل صورة. أول صورة تُرفع تصبح الصورة الرئيسية تلقائياً.'
                        : 'JPG, PNG, or WebP only, max 5MB each. The first image uploaded becomes primary automatically.'}
                    </p>

                    {productImages.length > 0 && (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                        {productImages.map((img, idx) => (
                          <div key={img.id} className={`relative border rounded-xl overflow-hidden group ${img.isMain ? 'border-primary ring-1 ring-primary/30' : 'border-gray-200'}`}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={img.url} alt="" className="w-full h-20 object-cover bg-gray-50" />
                            {img.isMain && (
                              <span className="absolute top-1 left-1 rtl:left-auto rtl:right-1 bg-primary text-cream text-[8px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-current" />
                                {isAr ? 'رئيسية' : 'Primary'}
                              </span>
                            )}
                            <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 py-1">
                              <button type="button" onClick={() => handleMoveImage(idx, -1)} disabled={idx === 0}
                                className="p-1 text-white disabled:opacity-30" title={isAr ? 'تحريك لليسار' : 'Move left'}>
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                              {!img.isMain && (
                                <button type="button" onClick={() => handleSetPrimaryImage(img.id)}
                                  className="p-1 text-white" title={isAr ? 'تعيين كرئيسية' : 'Set as primary'}>
                                  <Star className="w-3 h-3" />
                                </button>
                              )}
                              <button type="button" onClick={() => handleDeleteImage(img.id)}
                                className="p-1 text-red-300 hover:text-red-400" title={isAr ? 'حذف' : 'Delete'}>
                                <Trash2 className="w-3 h-3" />
                              </button>
                              <button type="button" onClick={() => handleMoveImage(idx, 1)} disabled={idx === productImages.length - 1}
                                className="p-1 text-white disabled:opacity-30" title={isAr ? 'تحريك لليمين' : 'Move right'}>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {productImages.length === 0 && (
                      <div className="flex items-center gap-2 text-[11px] text-gray-400 border border-dashed border-gray-300 rounded-lg px-3 py-3">
                        <ImageOff className="w-4 h-4" />
                        {isAr ? 'لا توجد صور بعد — سيتم عرض صورة افتراضية للعملاء.' : 'No images yet — customers will see a placeholder image.'}
                      </div>
                    )}

                    <div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        disabled={imageUploading}
                        onChange={(e) => handleImageFilesSelected(e.target.files)}
                        className="w-full text-xs file:mr-3 rtl:file:ml-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-primary file:text-cream file:text-xs file:font-bold file:cursor-pointer hover:file:bg-primary-dark disabled:opacity-50"
                      />
                      {imageUploading && (
                        <span className="text-[10px] text-gray-400">{isAr ? 'جاري الرفع...' : 'Uploading...'}</span>
                      )}
                    </div>

                    {imageError && (
                      <p className="text-[11px] text-red-600 font-semibold">{imageError}</p>
                    )}
                  </>
                )}
              </div>

              {/* Ingredients & Allergens */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Allergens</label>
                  <input value={allergens} onChange={(e) => setAllergens(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Ingredients</label>
                  <input value={ingredients} onChange={(e) => setIngredients(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300" />
                </div>
              </div>

              {/* ── PURCHASE OPTIONS ──────────────────────────────────────── */}
              <div className="border-t border-light-border pt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-primary" />
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
                    {isAr ? 'خيارات الشراء والتسعير' : 'Purchase Options & Pricing'}
                  </h4>
                </div>
                <p className="text-[10px] text-muted-text">
                  {isAr
                    ? 'حدد الخيارات المتاحة للعملاء لكل منتج (قطعة، ربطة، كرتون). يجب تفعيل خيار واحد على الأقل.'
                    : 'Set options available to customers. At least one option must be enabled (Each, Pack, or Case).'}
                </p>

                <OptionCard optKey="single" opt={singleOpt} setOpt={setSingleOpt} />
                <OptionCard optKey="pack"   opt={packOpt}   setOpt={setPackOpt} />
                <OptionCard optKey="case"   opt={caseOpt}   setOpt={setCaseOpt} />
              </div>

              {/* Stock & Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Stock Qty *</label>
                  <input type="number" required value={stock} onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300" />
                </div>
                <label className="flex items-center gap-2 cursor-pointer pt-4 select-none">
                  <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 accent-primary rounded" />
                  <span className="text-xs font-semibold text-dark">{isAr ? 'مميّز' : 'Featured'}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer pt-4 select-none">
                  <input type="checkbox" checked={bestSeller} onChange={(e) => setBestSeller(e.target.checked)}
                    className="w-4 h-4 accent-primary rounded" />
                  <span className="text-xs font-semibold text-dark">{isAr ? 'الأكثر مبيعاً' : 'Best Seller'}</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer pt-4 select-none">
                  <input type="checkbox" checked={weeklyDeal} onChange={(e) => setWeeklyDeal(e.target.checked)}
                    className="w-4 h-4 accent-primary rounded" />
                  <span className="text-xs font-semibold text-dark">{isAr ? 'عروض الأسبوع' : 'Weekly Deal'}</span>
                </label>
              </div>

              {/* Error */}
              {saveError && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-xs text-red-600 font-semibold">
                  {saveError}
                </div>
              )}

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-light-border">
                <button type="button" onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-500 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors">
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button type="submit"
                  className="px-6 py-2 bg-primary hover:bg-primary-dark text-cream font-bold rounded-lg text-sm shadow-sm transition-colors">
                  {editingProduct ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'إضافة المنتج' : 'Create Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
