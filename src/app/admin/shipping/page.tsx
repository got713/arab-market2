'use client';

import React, { useState, useEffect } from 'react';
import { useLocaleStore } from '@/store/locale-store';
import { ShippingService, ShippingMethodConfig } from '@/services/shipping';
import { formatPrice, getErrorMessage } from '@/lib/utils';
import { Truck, Save, RefreshCw, AlertTriangle } from 'lucide-react';

export default function AdminShippingPage() {
  const { locale } = useLocaleStore();

  const [methods, setMethods] = useState<ShippingMethodConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [savingId, setSavingId] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [rowErrors, setRowErrors] = useState<Record<number, string>>({});

  const load = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const list = await ShippingService.getMethods(locale);
      setMethods(list);
    } catch (err: unknown) {
      setLoadError(getErrorMessage(err, 'Failed to load shipping methods.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateLocal = (id: number, patch: Partial<ShippingMethodConfig>) => {
    setMethods((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const handleSave = async (method: ShippingMethodConfig) => {
    setSavingId(method.id);
    setRowErrors((prev) => ({ ...prev, [method.id]: '' }));
    setSuccessMsg('');
    try {
      const saved = await ShippingService.updateMethod(method.id, {
        name: method.name,
        arabic_name: method.arabic_name,
        price: method.price,
        active: method.active,
      }, locale);
      updateLocal(method.id, saved);
      setSuccessMsg(locale === 'ar' ? 'تم تحديث سعر الشحن بنجاح!' : 'Shipping price updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      setRowErrors((prev) => ({ ...prev, [method.id]: getErrorMessage(err, 'Failed to save.') }));
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="text-center py-20 space-y-3">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
        <p className="text-sm text-red-600 font-semibold">{loadError}</p>
        <button onClick={load} className="text-xs font-bold text-primary hover:underline">
          {locale === 'ar' ? 'إعادة المحاولة' : 'Try again'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 fade-in text-xs" dir={locale === 'ar' ? 'rtl' : 'ltr'}>

      {/* Policy banner */}
      <div className="bg-white border border-light-border p-4 rounded-xl flex items-start gap-3 text-gray-600">
        <Truck className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-dark block font-semibold">
            {locale === 'ar' ? 'إعدادات الشحن' : 'Shipping Configuration'}
          </strong>
          <p>
            {locale === 'ar'
              ? 'الأسعار هنا هي المصدر الوحيد المعتمد لتكلفة الشحن المستخدمة أثناء الدفع — لا يمكن للعميل تجاوزها. تعطيل طريقة شحن يخفيها فوراً من صفحة الدفع.'
              : "These prices are the single source of truth for checkout — a customer can never override them. Disabling a method hides it from checkout immediately."}
          </p>
        </div>
      </div>

      {/* Methods list */}
      <div className="bg-white border border-light-border rounded-xl shadow-xs p-5 space-y-4">
        <h3 className="font-bold text-sm text-primary uppercase tracking-wider border-b border-light-border pb-3">
          {locale === 'ar' ? 'طرق الشحن' : 'Shipping Methods'}
        </h3>

        {successMsg && <p className="text-xs text-green-700 font-bold">{successMsg}</p>}

        <div className="divide-y divide-gray-150 space-y-4">
          {methods.map((method) => (
            <div key={method.id} className="pt-4 first:pt-0 grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-4 items-end">
              {/* Info */}
              <div className="space-y-1">
                <strong className="text-sm font-bold text-dark block">
                  {locale === 'ar' ? method.arabic_name : method.name}
                </strong>
                <span className="text-[10px] text-gray-400 block">
                  {locale === 'ar' ? 'الرمز:' : 'Code:'} {method.code} · {locale === 'ar' ? 'السعر الحالي:' : 'Current:'} {formatPrice(method.price, locale)}
                </span>
                {rowErrors[method.id] && <span className="text-[10px] text-red-600 font-semibold block">{rowErrors[method.id]}</span>}
              </div>

              {/* Price */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase block">
                  {locale === 'ar' ? 'السعر ($)' : 'Price ($)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={method.price}
                  onChange={(e) => updateLocal(method.id, { price: parseFloat(e.target.value) || 0 })}
                  className="w-28 px-2 py-1.5 rounded border border-gray-300 font-semibold"
                />
              </div>

              {/* Active toggle */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase block">
                  {locale === 'ar' ? 'مفعّل' : 'Active'}
                </label>
                <input
                  type="checkbox"
                  checked={method.active}
                  onChange={(e) => updateLocal(method.id, { active: e.target.checked })}
                  className="w-4 h-4 text-primary accent-primary rounded"
                />
              </div>

              {/* Save */}
              <button
                onClick={() => handleSave(method)}
                disabled={savingId === method.id}
                className="px-4 py-2 bg-primary hover:bg-primary-dark text-cream font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-60"
              >
                {savingId === method.id ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 text-gold" />
                    <span>{locale === 'ar' ? 'حفظ' : 'Save'}</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
