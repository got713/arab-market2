'use client';

import React, { useState, useEffect } from 'react';
import { Coupon } from '@/types';
import { CouponService } from '@/services/coupons';
import { useLocaleStore } from '@/store/locale-store';
import { formatPrice } from '@/lib/utils';
import { Plus, Trash2, X, Ticket } from 'lucide-react';

export default function AdminCouponsPage() {
  const { locale } = useLocaleStore();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(10);
  const [minOrder, setMinOrder] = useState(30);
  const [maxUsage, setMaxUsage] = useState(500);
  const [expires, setExpires] = useState('2026-12-31');

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const list = await CouponService.getCoupons();
      setCoupons(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleOpenAddModal = () => {
    setCode('');
    setDiscountPercent(10);
    setMinOrder(30);
    setMaxUsage(500);
    setExpires('2026-12-31');
    setIsModalOpen(true);
  };

  const handleDelete = async (codeToDelete: string) => {
    if (confirm(`Are you sure you want to delete coupon ${codeToDelete}?`)) {
      try {
        await CouponService.deleteCoupon(codeToDelete);
        loadCoupons();
      } catch (err) {
        alert('Error deleting coupon');
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    try {
      await CouponService.createCoupon({
        code: code.trim().toUpperCase(),
        discountPercent: Number(discountPercent),
        minOrder: Number(minOrder),
        usageCount: 0,
        maxUsage: Number(maxUsage),
        expires,
      });
      setIsModalOpen(false);
      loadCoupons();
    } catch (err: any) {
      alert(err.message || 'Error creating coupon');
    }
  };

  return (
    <div className="space-y-6 fade-in" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Title & Actions */}
      <div className="flex justify-between items-center border-b border-light-border pb-4">
        <div className="text-xs text-gray-500 font-medium">
          {locale === 'ar' ? 'كوبونات الخصم النشطة: ' : 'Active promotions: '}
          <strong>{coupons.length} {locale === 'ar' ? 'كود خصم' : 'coupon codes'}</strong>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-primary text-cream hover:bg-primary-dark font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>{locale === 'ar' ? 'إنشاء كود خصم جديد' : 'Create Coupon Code'}</span>
        </button>
      </div>

      {/* Coupons Table */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : (
        <div className="bg-white border border-light-border rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-light-border text-gray-500 font-bold uppercase tracking-wider">
                  <th className="p-4">{locale === 'ar' ? 'كود الخصم' : 'Coupon Code'}</th>
                  <th className="p-4">{locale === 'ar' ? 'نسبة الخصم' : 'Discount Percent'}</th>
                  <th className="p-4">{locale === 'ar' ? 'الحد الأدنى للطلب' : 'Minimum Order'}</th>
                  <th className="p-4">{locale === 'ar' ? 'مرات الاستخدام' : 'Usage Counts'}</th>
                  <th className="p-4">{locale === 'ar' ? 'تاريخ انتهاء الصلاحية' : 'Expiration Date'}</th>
                  <th className="p-4">{locale === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="p-4 text-right">{locale === 'ar' ? 'حذف' : 'Delete'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border">
                {coupons.map((c) => {
                  const today = new Date().toISOString().split('T')[0];
                  const isExpired = c.expires < today;
                  const isLimitReached = c.usageCount >= c.maxUsage;
                  const isValid = !isExpired && !isLimitReached;

                  return (
                    <tr key={c.code} className="hover:bg-cream/10 transition-colors">
                      {/* Code */}
                      <td className="p-4 font-bold text-primary font-mono text-sm uppercase flex items-center gap-1.5">
                        <Ticket className="w-4.5 h-4.5 text-gold flex-shrink-0" />
                        <span>{c.code}</span>
                      </td>

                      {/* Percent */}
                      <td className="p-4 font-bold text-dark text-sm">
                        {c.discountPercent}% {locale === 'ar' ? 'خصم' : 'OFF'}
                      </td>

                      {/* Min order */}
                      <td className="p-4 font-semibold text-gray-600">
                        {formatPrice(c.minOrder, locale)}
                      </td>

                      {/* Usage */}
                      <td className="p-4 font-semibold text-dark">
                        {c.usageCount} / {c.maxUsage} {locale === 'ar' ? 'استخدام' : 'uses'}
                      </td>

                      {/* Expiration */}
                      <td className="p-4 font-medium text-gray-500">{c.expires}</td>

                      {/* Status */}
                      <td className="p-4">
                        {isValid ? (
                          <span className="inline-block bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase">
                            {locale === 'ar' ? 'نشط' : 'Active'}
                          </span>
                        ) : isExpired ? (
                          <span className="inline-block bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase">
                            {locale === 'ar' ? 'منتهي' : 'Expired'}
                          </span>
                        ) : (
                          <span className="inline-block bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase">
                            {locale === 'ar' ? 'اكتمل الحد' : 'Limit met'}
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDelete(c.code)}
                          className="p-1.5 text-red-650 hover:bg-red-50 border border-red-100 rounded-md transition-colors inline-block"
                        >
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

      {/* Add Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs fade-in">
          <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-light-border overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-light-border bg-cream" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
              <span className="font-bold text-sm text-primary uppercase tracking-wider">
                {locale === 'ar' ? 'إنشاء كود خصم جديد' : 'Create Promo Coupon'}
              </span>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-dark">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 text-xs" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase">
                  {locale === 'ar' ? 'كود الخصم *' : 'Coupon Code *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EXTRA15"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none uppercase font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">
                    {locale === 'ar' ? 'نسبة الخصم (%) *' : 'Discount Percent (%) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={100}
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">
                    {locale === 'ar' ? 'الحد الأدنى للطلب ($) *' : 'Minimum Order ($) *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={minOrder}
                    onChange={(e) => setMinOrder(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">
                    {locale === 'ar' ? 'سقف الاستخدام *' : 'Usage Quota Limit *'}
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={maxUsage}
                    onChange={(e) => setMaxUsage(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">
                    {locale === 'ar' ? 'تاريخ انتهاء الصلاحية *' : 'Expires (YYYY-MM-DD) *'}
                  </label>
                  <input
                    type="date"
                    required
                    value={expires}
                    onChange={(e) => setExpires(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-light-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-500 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary hover:bg-primary-dark text-cream font-bold rounded-lg shadow-sm transition-colors"
                >
                  {locale === 'ar' ? 'إنشاء الكوبون' : 'Create Code'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
