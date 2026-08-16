'use client';

import React, { useState, useEffect } from 'react';
import { Category, Product } from '@/types';
import { CategoryService } from '@/services/categories';
import { ProductService } from '@/services/products';
import { useLocaleStore } from '@/store/locale-store';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  FolderTree, 
  Check, 
  Eye, 
  EyeOff, 
  Star, 
  Settings, 
  LayoutGrid, 
  ArrowUpDown,
  ShoppingBag,
  Snowflake,
  Coffee,
  Cookie,
  Flame,
  Home
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const iconOptions = ['ShoppingBag', 'Snowflake', 'Coffee', 'Cookie', 'Flame', 'Home'];

export default function AdminCategoriesPage() {
  const router = useRouter();
  const { locale } = useLocaleStore();
  const isAr = locale === 'ar';

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [arabicName, setArabicName] = useState('');
  const [description, setDescription] = useState('');
  const [arabicDescription, setArabicDescription] = useState('');
  const [image, setImage] = useState('');
  const [icon, setIcon] = useState('ShoppingBag');
  const [active, setActive] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [displayOrder, setDisplayOrder] = useState(0);
  const [slug, setSlug] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [cats, prods] = await Promise.all([
        CategoryService.getCategories(true), // Include inactive
        ProductService.getProducts(true),
      ]);
      setCategories(cats);
      setProducts(prods);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setName('');
    setArabicName('');
    setDescription('');
    setArabicDescription('');
    setImage('https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop');
    setIcon('ShoppingBag');
    setActive(true);
    setFeatured(false);
    setDisplayOrder(categories.length * 10);
    setSlug('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setArabicName(cat.arabicName);
    setDescription(cat.description);
    setArabicDescription(cat.arabicDescription || '');
    setImage(cat.image);
    setIcon(cat.icon || 'ShoppingBag');
    setActive(cat.active !== false);
    setFeatured(cat.featured === true);
    setDisplayOrder(cat.displayOrder ?? 0);
    setSlug(cat.slug);
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleToggleActive = async (cat: Category) => {
    try {
      const updated = { ...cat, active: cat.active === false ? true : false };
      await CategoryService.updateCategory(updated);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error updating status');
    }
  };

  const handleToggleFeatured = async (cat: Category) => {
    try {
      const updated = { ...cat, featured: cat.featured === true ? false : true };
      await CategoryService.updateCategory(updated);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Error updating featured');
    }
  };

  const handleDelete = async (cat: Category) => {
    const confirmText = isAr 
      ? `هل أنت متأكد من حذف قسم "${cat.arabicName}"؟`
      : `Are you sure you want to delete the category "${cat.name}"?`;
    
    if (confirm(confirmText)) {
      try {
        await CategoryService.deleteCategory(cat.id);
        loadData();
      } catch (err: any) {
        alert(err.message || 'Error deleting category');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const payload = {
      name,
      arabicName,
      description,
      arabicDescription,
      image,
      icon,
      active,
      featured,
      displayOrder: Number(displayOrder),
      slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    };

    try {
      if (editingCategory) {
        await CategoryService.updateCategory({
          ...payload,
          id: editingCategory.id,
          subcategories: editingCategory.subcategories,
        });
      } else {
        await CategoryService.createCategory(payload);
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error saving category');
    }
  };

  const getProductCount = (catSlug: string) => {
    return products.filter((p) => p.category?.toLowerCase() === catSlug.toLowerCase()).length;
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'ShoppingBag': return ShoppingBag;
      case 'Snowflake': return Snowflake;
      case 'Coffee': return Coffee;
      case 'Cookie': return Cookie;
      case 'Flame': return Flame;
      case 'Home': return Home;
      default: return FolderTree;
    }
  };

  return (
    <div className="space-y-6 fade-in" dir={isAr ? 'rtl' : 'ltr'}>
      {/* Title & Actions */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-light-border pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-dark font-cairo flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-primary" />
            <span>{isAr ? 'إدارة الأقسام' : 'Category Management'}</span>
          </h1>
          <p className="text-xs text-muted-text font-cairo">
            {isAr ? 'قم بإنشاء وتعديل الأقسام والأقسام الفرعية وترتيب عرضها' : 'Create, edit, and order categories and subcategories'}
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-primary text-cream hover:bg-primary-dark font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-colors font-cairo self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'إضافة قسم جديد' : 'Add Category'}</span>
        </button>
      </div>

      {/* Main Categories Table */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-16 bg-white border border-light-border rounded-xl">
          <FolderTree className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="font-bold text-sm text-dark mb-1 font-cairo">
            {isAr ? 'لا توجد أقسام بعد' : 'No Categories Found'}
          </h3>
          <p className="text-xs text-gray-500 mb-4 font-cairo">
            {isAr ? 'ابدأ بإضافة قسم جديد للمتجر الإلكتروني' : 'Create a category to get started.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-light-border rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left rtl:text-right border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-light-border text-gray-500 font-bold uppercase tracking-wider text-[10px] font-cairo">
                  <th className="p-4">{isAr ? 'القسم' : 'Category'}</th>
                  <th className="p-4">{isAr ? 'عدد الأقسام الفرعية' : 'Subcategories'}</th>
                  <th className="p-4">{isAr ? 'عدد المنتجات' : 'Products'}</th>
                  <th className="p-4">{isAr ? 'ترتيب العرض' : 'Order'}</th>
                  <th className="p-4">{isAr ? 'الظهور' : 'Status'}</th>
                  <th className="p-4">{isAr ? 'مميز' : 'Featured'}</th>
                  <th className="p-4 text-right rtl:text-left">{isAr ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border">
                {categories.map((cat) => {
                  const Icon = getIconComponent(cat.icon);
                  const prodCount = getProductCount(cat.slug);
                  const subCount = cat.subcategories?.length || 0;
                  return (
                    <tr key={cat.id} className="hover:bg-cream/10 transition-colors">
                      {/* Name / Icon */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gold-soft/40 border border-gold/15 flex items-center justify-center text-primary shrink-0">
                            <Icon className="w-5 h-5" />
                          </div>
                          <div>
                            <strong className="text-dark block font-semibold text-[13px] font-cairo">
                              {isAr ? cat.arabicName : cat.name}
                            </strong>
                            <span className="text-[10px] text-gray-400 block font-mono">{cat.slug}</span>
                          </div>
                        </div>
                      </td>

                      {/* Subcategory Count */}
                      <td className="p-4 font-semibold text-dark">
                        <span className="bg-gray-100 text-gray-700 font-bold px-2 py-0.5 rounded text-[10px]">
                          {subCount} {isAr ? 'فرعي' : 'subs'}
                        </span>
                      </td>

                      {/* Product Count */}
                      <td className="p-4 font-semibold text-dark">
                        <span className="bg-primary/10 text-primary font-bold px-2 py-0.5 rounded text-[10px]">
                          {prodCount} {isAr ? 'منتج' : 'products'}
                        </span>
                      </td>

                      {/* Display Order */}
                      <td className="p-4 text-dark font-mono font-bold">
                        {cat.displayOrder ?? 0}
                      </td>

                      {/* Active Status */}
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleActive(cat)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-cairo border transition-all flex items-center gap-1 ${
                            cat.active !== false
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : 'bg-red-50 text-red-650 border-red-200'
                          }`}
                        >
                          {cat.active !== false ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                          <span>{cat.active !== false ? (isAr ? 'نشط' : 'Active') : (isAr ? 'معطل' : 'Inactive')}</span>
                        </button>
                      </td>

                      {/* Featured status */}
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleFeatured(cat)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-cairo border transition-all flex items-center gap-1 ${
                            cat.featured === true
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-gray-50 text-gray-400 border-gray-200'
                          }`}
                        >
                          <Star className={`w-3 h-3 ${cat.featured === true ? 'fill-current' : ''}`} />
                          <span>{cat.featured === true ? (isAr ? 'مميز' : 'Featured') : (isAr ? 'عادي' : 'Standard')}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right rtl:text-left space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => router.push(`/admin/categories/${cat.id}`)}
                          className="px-2.5 py-1 bg-cream hover:bg-cream-dark text-primary border border-light-border rounded-lg text-[10px] font-bold transition-colors font-cairo"
                        >
                          {isAr ? 'إدارة' : 'Manage'}
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          className="p-1.5 text-gray-500 hover:text-primary border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                          title="Edit Category"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat)}
                          className="p-1.5 text-red-650 hover:bg-red-50 border border-red-100 rounded-md transition-colors"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Category Edit/Create Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs fade-in overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-light-border overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-light-border bg-cream">
              <span className="font-bold text-sm text-primary uppercase tracking-wider font-cairo">
                {editingCategory ? (isAr ? 'تعديل بيانات القسم' : 'Edit Category Details') : (isAr ? 'إضافة قسم جديد' : 'Add New Category')}
              </span>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-dark">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto no-scrollbar" dir={isAr ? 'rtl' : 'ltr'}>
              
              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase font-cairo">English Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-primary font-sans"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase font-cairo">الاسم بالعربية *</label>
                  <input
                    type="text"
                    required
                    value={arabicName}
                    onChange={(e) => setArabicName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:border-primary font-cairo"
                  />
                </div>
              </div>

              {/* Slug & Icon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase font-cairo">Slug (Optional)</label>
                  <input
                    type="text"
                    placeholder={name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase font-cairo">Icon</label>
                  <select
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none font-cairo"
                  >
                    {iconOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image URL */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase font-cairo">Image URL</label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none"
                />
              </div>

              {/* Descriptions */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase font-cairo">Description (EN)</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase font-cairo">الوصف بالعربية</label>
                  <textarea
                    rows={2}
                    value={arabicDescription}
                    onChange={(e) => setArabicDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none font-cairo"
                  />
                </div>
              </div>

              {/* Settings (Featured, Active, Order) */}
              <div className="grid grid-cols-3 gap-4 items-center bg-cream/35 p-3 rounded-lg border border-light-border">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-4 h-4 text-primary accent-primary rounded"
                  />
                  <span className="text-xs font-bold font-cairo text-dark">{isAr ? 'نشط' : 'Active'}</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 text-primary accent-primary rounded"
                  />
                  <span className="text-xs font-bold font-cairo text-dark">{isAr ? 'مميز' : 'Featured'}</span>
                </label>

                <div className="space-y-0.5">
                  <label className="text-[9px] font-bold text-gray-400 uppercase font-cairo">{isAr ? 'الترتيب' : 'Order'}</label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(Number(e.target.value))}
                    className="w-full px-2 py-1 text-xs rounded border border-gray-300 focus:outline-none"
                  />
                </div>
              </div>

              {/* Error Alert */}
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg font-cairo font-semibold">
                  {errorMsg}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2.5 pt-4 border-t border-light-border font-cairo">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-500 rounded-lg hover:bg-gray-50 font-semibold"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-primary-dark text-cream rounded-lg font-bold shadow-sm"
                >
                  {editingCategory ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : (isAr ? 'إضافة القسم' : 'Create Category')}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
