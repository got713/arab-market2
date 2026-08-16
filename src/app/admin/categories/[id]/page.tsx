'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Category, Subcategory, Product } from '@/types';
import { CategoryService } from '@/services/categories';
import { ProductService } from '@/services/products';
import { useLocaleStore } from '@/store/locale-store';
import { 
  ArrowLeft, 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  ToggleLeft, 
  ToggleRight, 
  FolderTree, 
  Tag, 
  ShoppingBag,
  Eye,
  EyeOff,
  BarChart3
} from 'lucide-react';
import Link from 'next/link';

export default function CategoryManageDetail() {
  const params = useParams();
  const router = useRouter();
  const { locale } = useLocaleStore();
  const isAr = locale === 'ar';
  const categoryId = (params?.id as string) || '';

  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Subcategory modal state
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subcategory | null>(null);
  const [subOriginalSlug, setSubOriginalSlug] = useState('');
  const [subError, setSubError] = useState('');

  // Subcategory form fields
  const [subName, setSubName] = useState('');
  const [subArabicName, setSubArabicName] = useState('');
  const [subImage, setSubImage] = useState('');
  const [subDescription, setSubDescription] = useState('');
  const [subSlug, setSubSlug] = useState('');
  const [subActive, setSubActive] = useState(true);
  const [subDisplayOrder, setSubDisplayOrder] = useState(0);

  const loadCategoryDetails = async () => {
    if (!categoryId) return;
    setLoading(true);
    try {
      const cat = await CategoryService.getCategoryById(categoryId);
      setCategory(cat);
      if (cat) {
        const allProds = await ProductService.getProducts(true);
        // Filter products belonging to this category slug or id
        const filteredProds = allProds.filter(
          (p) => p.category?.toLowerCase() === cat.slug.toLowerCase() || p.categoryId === cat.id
        );
        setProducts(filteredProds);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategoryDetails();
  }, [categoryId]);

  const handleOpenAddSub = () => {
    setEditingSub(null);
    setSubOriginalSlug('');
    setSubName('');
    setSubArabicName('');
    setSubImage('');
    setSubDescription('');
    setSubSlug('');
    setSubActive(true);
    setSubDisplayOrder((category?.subcategories?.length || 0) * 10);
    setSubError('');
    setIsSubModalOpen(true);
  };

  const handleOpenEditSub = (sub: Subcategory) => {
    setEditingSub(sub);
    setSubOriginalSlug(sub.slug);
    setSubName(sub.name);
    setSubArabicName(sub.arabicName);
    setSubImage(sub.image || '');
    setSubDescription(sub.description || '');
    setSubSlug(sub.slug);
    setSubActive(sub.active !== false);
    setSubDisplayOrder(sub.displayOrder ?? 0);
    setSubError('');
    setIsSubModalOpen(true);
  };

  const handleToggleSubActive = async (sub: Subcategory) => {
    if (!category) return;
    try {
      const updated = { ...sub, active: sub.active === false ? true : false };
      await CategoryService.updateSubcategory(category.id, sub.slug, updated);
      loadCategoryDetails();
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    }
  };

  const handleDeleteSub = async (sub: Subcategory) => {
    if (!category) return;
    const confirmText = isAr
      ? `هل أنت متأكد من حذف القسم الفرعي "${sub.arabicName}"؟`
      : `Are you sure you want to delete subcategory "${sub.name}"?`;
    
    if (confirm(confirmText)) {
      try {
        await CategoryService.deleteSubcategory(category.id, sub.slug);
        loadCategoryDetails();
      } catch (err: any) {
        alert(err.message || 'Error deleting subcategory');
      }
    }
  };

  const handleSubSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return;
    setSubError('');

    const payload = {
      name: subName,
      arabicName: subArabicName,
      image: subImage || undefined,
      description: subDescription || undefined,
      slug: subSlug.trim() || subName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      active: subActive,
      displayOrder: Number(subDisplayOrder),
    };

    try {
      if (editingSub) {
        await CategoryService.updateSubcategory(category.id, subOriginalSlug, payload);
      } else {
        await CategoryService.createSubcategory(category.id, payload);
      }
      setIsSubModalOpen(false);
      loadCategoryDetails();
    } catch (err: any) {
      setSubError(err.message || 'Error saving subcategory');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        <p className="text-xs text-gray-500 mt-3 font-cairo">Loading details...</p>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="text-center py-16 bg-white border border-light-border rounded-xl font-cairo space-y-4">
        <FolderTree className="w-12 h-12 text-gray-300 mx-auto" />
        <h2 className="text-lg font-bold text-dark">Category not found</h2>
        <button onClick={() => router.push('/admin/categories')} className="bg-primary text-cream px-4 py-2 rounded-lg text-xs font-bold">
          Back to Categories
        </button>
      </div>
    );
  }

  // Sorted subcategories
  const sortedSubs = [...(category.subcategories || [])].sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

  return (
    <div className="space-y-6 fade-in" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Header breadcrumb & info */}
      <div className="border-b border-light-border pb-4 space-y-3">
        <Link href="/admin/categories" className="inline-flex items-center gap-1.5 text-xs text-primary font-bold hover:underline font-cairo">
          <ArrowLeft className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
          <span>{isAr ? 'العودة لقائمة الأقسام' : 'Back to Categories'}</span>
        </Link>
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-dark font-cairo">
              {isAr ? category.arabicName : category.name}
            </h1>
            <p className="text-xs text-muted-text font-cairo max-w-2xl">
              {isAr ? category.arabicDescription || category.description : category.description}
            </p>
          </div>
          <div className="flex items-center gap-2 font-cairo">
            <button
              onClick={() => router.push('/admin/products')}
              className="px-3.5 py-1.5 border border-primary text-primary hover:bg-primary/5 font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAr ? 'إضافة منتج' : 'Add Product'}</span>
            </button>
            <button
              onClick={handleOpenAddSub}
              className="px-3.5 py-1.5 bg-primary hover:bg-primary-dark text-cream font-bold text-xs rounded-lg transition-colors flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isAr ? 'قسم فرعي جديد' : 'Add Subcategory'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-cairo">
        <div className="bg-white border border-light-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block uppercase font-bold">{isAr ? 'المنتجات المدرجة' : 'Assigned Products'}</span>
            <strong className="text-lg text-dark font-bold font-mono">{products.length}</strong>
          </div>
        </div>
        <div className="bg-white border border-light-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center text-gold">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block uppercase font-bold">{isAr ? 'الأقسام الفرعية' : 'Subcategories'}</span>
            <strong className="text-lg text-dark font-bold font-mono">{category.subcategories?.length || 0}</strong>
          </div>
        </div>
        <div className="bg-white border border-light-border rounded-xl p-4 flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center text-green-700">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-gray-400 block uppercase font-bold">{isAr ? 'الوضع الحالي للقسم' : 'Category Status'}</span>
            <strong className={`text-xs block font-bold uppercase ${category.active !== false ? 'text-green-700' : 'text-red-650'}`}>
              {category.active !== false ? (isAr ? 'نشط ومتاح للعملاء' : 'Active / Public') : (isAr ? 'معطل / مخفي' : 'Inactive / Hidden')}
            </strong>
          </div>
        </div>
      </div>

      {/* Subcategories & Products split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-cairo">
        
        {/* Left Side: Subcategories list (Col 1) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between border-b border-light-border pb-2">
            <h3 className="font-bold text-sm text-dark flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-gold" />
              <span>{isAr ? 'الأقسام الفرعية' : 'Subcategories'}</span>
            </h3>
            <button onClick={handleOpenAddSub} className="text-xs text-primary font-bold hover:underline">
              {isAr ? '+ إضافة' : '+ Add'}
            </button>
          </div>

          {sortedSubs.length === 0 ? (
            <div className="p-6 bg-white border border-light-border rounded-xl text-center">
              <p className="text-xs text-gray-500">{isAr ? 'لا توجد أقسام فرعية مضافة' : 'No subcategories added yet.'}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {sortedSubs.map((sub) => (
                <div key={sub.slug} className="bg-white border border-light-border rounded-xl p-3 flex items-center justify-between hover:shadow-xs transition-shadow">
                  <div className="space-y-0.5">
                    <strong className="text-xs text-dark font-semibold">
                      {isAr ? sub.arabicName : sub.name}
                    </strong>
                    <span className="text-[9px] text-gray-400 block font-mono">{sub.slug} · {isAr ? 'ترتيب' : 'Order'}: {sub.displayOrder}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleSubActive(sub)}
                      className={`p-1 rounded-full border transition-all ${
                        sub.active !== false
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-red-50 text-red-650 border-red-200'
                      }`}
                      title={sub.active !== false ? 'Deactivate' : 'Activate'}
                    >
                      {sub.active !== false ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleOpenEditSub(sub)}
                      className="p-1 text-gray-500 hover:text-primary border border-gray-200 rounded"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSub(sub)}
                      className="p-1 text-red-650 hover:bg-red-50 border border-red-100 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Products in category (Col 2 & 3) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border-b border-light-border pb-2">
            <h3 className="font-bold text-sm text-dark flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-primary" />
              <span>{isAr ? 'منتجات هذا القسم' : 'Products in this Category'}</span>
            </h3>
          </div>

          {products.length === 0 ? (
            <div className="p-8 bg-white border border-light-border rounded-xl text-center">
              <p className="text-xs text-gray-500">{isAr ? 'لا توجد منتجات مضافة لهذا القسم بعد' : 'No products belong to this category.'}</p>
            </div>
          ) : (
            <div className="bg-white border border-light-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left rtl:text-right border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-light-border text-gray-500 font-bold uppercase tracking-wider text-[9px] uppercase">
                      <th className="p-3">{isAr ? 'المنتج' : 'Product'}</th>
                      <th className="p-3">{isAr ? 'القسم الفرعي' : 'Subcategory'}</th>
                      <th className="p-3">{isAr ? 'المخزون' : 'Stock'}</th>
                      <th className="p-3">{isAr ? 'السعر' : 'Price'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-light-border text-[11px]">
                    {products.map((p) => {
                      const subcat = category.subcategories?.find((s) => s.slug === p.subcategoryId);
                      return (
                        <tr key={p.id} className="hover:bg-cream/10">
                          <td className="p-3 font-semibold text-dark flex items-center gap-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={p.images[0]} alt={p.name} className="w-8 h-8 object-cover rounded border border-light-border bg-gray-50" />
                            <div>
                              <span className="block font-bold">{isAr ? p.arabicName : p.name}</span>
                              <span className="text-[9px] text-gray-400 block font-mono">{p.brand} · {p.weight}</span>
                            </div>
                          </td>
                          <td className="p-3 text-gray-500">
                            {subcat ? (isAr ? subcat.arabicName : subcat.name) : <span className="text-gray-300">—</span>}
                          </td>
                          <td className="p-3 font-mono font-semibold">
                            {p.stock === 0 ? <span className="text-red-650 font-bold">OUT</span> : p.stock}
                          </td>
                          <td className="p-3 font-bold text-primary">
                            ${p.purchaseOptions.single.price}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Subcategory Edit/Create Modal Dialog */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs fade-in overflow-y-auto">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-light-border overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-light-border bg-cream">
              <span className="font-bold text-sm text-primary uppercase tracking-wider font-cairo">
                {editingSub ? (isAr ? 'تعديل قسم فرعي' : 'Edit Subcategory') : (isAr ? 'إضافة قسم فرعي' : 'Add Subcategory')}
              </span>
              <button onClick={() => setIsSubModalOpen(false)} className="text-gray-400 hover:text-dark">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubSubmit} className="p-6 space-y-4 font-cairo" dir={isAr ? 'rtl' : 'ltr'}>
              
              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">English Name *</label>
                  <input
                    type="text"
                    required
                    value={subName}
                    onChange={(e) => setSubName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-primary font-sans"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">الاسم بالعربية *</label>
                  <input
                    type="text"
                    required
                    value={subArabicName}
                    onChange={(e) => setSubArabicName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Slug & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Slug (Optional)</label>
                  <input
                    type="text"
                    placeholder={subName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                    value={subSlug}
                    onChange={(e) => setSubSlug(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Display Order</label>
                  <input
                    type="number"
                    value={subDisplayOrder}
                    onChange={(e) => setSubDisplayOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none"
                  />
                </div>
              </div>

              {/* Sub Image URL (Optional) */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Image URL (Optional)</label>
                <input
                  type="text"
                  value={subImage}
                  onChange={(e) => setSubImage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">Description / Notes</label>
                <textarea
                  rows={2}
                  value={subDescription}
                  onChange={(e) => setSubDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-2 p-2 bg-cream/35 border border-light-border rounded-lg">
                <button
                  type="button"
                  onClick={() => setSubActive(!subActive)}
                  className={`flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                    subActive
                      ? 'bg-primary text-cream border-primary'
                      : 'bg-white text-gray-500 border-gray-300'
                  }`}
                >
                  {subActive
                    ? <><ToggleRight className="w-4 h-4" />{isAr ? 'نشط ومتاح' : 'Active'}</>
                    : <><ToggleLeft className="w-4 h-4" />{isAr ? 'معطل ومخفي' : 'Inactive'}</>}
                </button>
                <span className="text-[10px] text-gray-400">{isAr ? 'تأثير الإخفاء ينطبق على الأقسام والبحث' : 'Hiding affects store filtering'}</span>
              </div>

              {/* Error Box */}
              {subError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-semibold">
                  {subError}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-light-border">
                <button
                  type="button"
                  onClick={() => setIsSubModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-500 rounded-lg hover:bg-gray-50 font-semibold"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary-dark text-cream rounded-lg font-bold shadow-sm"
                >
                  {editingSub ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'إضافة' : 'Create')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
