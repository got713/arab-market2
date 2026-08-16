'use client';

import React, { useState, useEffect } from 'react';
import { useLocaleStore } from '@/store/locale-store';
import { PaymentSettingsService, PaymentSettings } from '@/services/payment-settings';
import { getErrorMessage } from '@/lib/utils';
import { CreditCard, Save, AlertTriangle, ShieldCheck, Truck, CheckCircle2, Clock } from 'lucide-react';

export default function AdminPaymentSettingsPage() {
  const { locale } = useLocaleStore();
  const isAr = locale === 'ar';

  const [form, setForm] = useState<PaymentSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const load = async () => {
    setLoading(true);
    setLoadError('');
    try {
      setForm(await PaymentSettingsService.getSettings(locale));
    } catch (err: unknown) {
      setLoadError(getErrorMessage(err, isAr ? 'فشل تحميل إعدادات الدفع.' : 'Failed to load payment settings.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setSaveError('');
    setSuccessMsg('');
    try {
      // As elsewhere in admin: only trust what the backend actually
      // persisted, never assume the local form state was saved as-is.
      const saved = await PaymentSettingsService.updateSettings(form, locale);
      setForm(saved);
      setSuccessMsg(isAr ? 'تم حفظ إعدادات الدفع بنجاح!' : 'Payment settings saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      setSaveError(getErrorMessage(err, isAr ? 'فشل حفظ إعدادات الدفع.' : 'Failed to save payment settings.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (loadError || !form) {
    return (
      <div className="text-center py-20 space-y-3">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
        <p className="text-sm text-red-600 font-semibold">{loadError || 'Payment settings unavailable.'}</p>
        <button onClick={load} className="text-xs font-bold text-primary hover:underline">
          {isAr ? 'إعادة المحاولة' : 'Try again'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 fade-in text-xs" dir={isAr ? 'rtl' : 'ltr'}>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-2.5">
        <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-800 leading-relaxed">
          {isAr
            ? 'لا يتم تخزين أي مفاتيح دفع سرية هنا أو إرسالها إلى المتصفح مطلقاً — بيانات الاعتماد الحقيقية تُضبط فقط على الخادم. هذه الصفحة تتحكم في الإعدادات الهيكلية فقط (تفعيل/تعطيل، وضع الاختبار/الإنتاج).'
            : 'No secret payment keys are ever stored here or sent to the browser — real credentials are configured on the server only. This page controls structural settings only (enable/disable, test/live mode).'}
        </p>
      </div>

      <div className="bg-white border border-light-border rounded-xl shadow-xs p-5 sm:p-6 space-y-4">
        <h3 className="font-bold text-sm text-primary uppercase tracking-wider border-b border-light-border pb-3 flex items-center gap-1.5">
          <CreditCard className="w-4.5 h-4.5 text-gold" />
          <span>{isAr ? 'بوابات الدفع' : 'Payment Gateways'}</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Stripe */}
          <div className={`border rounded-xl p-4 space-y-2 ${form.stripeEnabled ? 'border-primary/30 bg-green-50/40' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                <span className="font-bold text-dark">{isAr ? 'سترايب (بطاقات ائتمان)' : 'Stripe (Credit / Debit Cards)'}</span>
                <span className="flex items-center gap-1 text-[9px] font-bold text-green-700 bg-green-100 px-1.5 py-0.5 rounded-full">
                  <CheckCircle2 className="w-2.5 h-2.5" /> {isAr ? 'متصل' : 'Connected'}
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.stripeEnabled}
                  onChange={(e) => setForm({ ...form, stripeEnabled: e.target.checked })}
                  className="w-4 h-4 accent-primary rounded"
                />
                <span className="font-semibold">{isAr ? 'مفعّل' : 'Enabled'}</span>
              </label>
            </div>
            <p className="text-[10px] text-muted-text">
              {isAr
                ? 'المعالجة الفعلية للدفع الحالية تعمل عبر Stripe. مفاتيح الإنتاج/الاختبار تُضبط على الخادم فقط.'
                : 'Live payment processing currently runs through Stripe. Test/live keys are configured on the server only.'}
            </p>

            <div className="pt-1">
              <label className="text-[9px] font-bold text-gray-400 uppercase block mb-1">
                {isAr ? 'الوضع (تسمية فقط)' : 'Mode (label only)'}
              </label>
              <select
                value={form.mode}
                onChange={(e) => setForm({ ...form, mode: e.target.value as 'test' | 'live' })}
                className="px-3 py-1.5 text-xs rounded-lg border border-gray-300 bg-white"
              >
                <option value="test">{isAr ? 'اختبار (Test)' : 'Test'}</option>
                <option value="live">{isAr ? 'إنتاج (Live)' : 'Live'}</option>
              </select>
              <p className="text-[9px] text-gray-400 mt-1">
                {isAr
                  ? 'هذا يسجّل النية فقط ولا يُبدّل مفاتيح Stripe تلقائياً — التبديل الفعلي يتم عبر متغيرات البيئة على الخادم عند النشر.'
                  : 'This records intent only and does not automatically rotate Stripe keys — actual switching happens via server environment variables at deploy time.'}
              </p>
            </div>
          </div>

          {/* Cash on Delivery */}
          <div className={`border rounded-xl p-4 space-y-2 ${form.codEnabled ? 'border-primary/30 bg-green-50/40' : 'border-gray-200 bg-gray-50'}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-primary" />
                <span className="font-bold text-dark">{isAr ? 'الدفع عند الاستلام' : 'Cash on Delivery'}</span>
                <span className="flex items-center gap-1 text-[9px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-full">
                  <Clock className="w-2.5 h-2.5" /> {isAr ? 'غير مفعّل في السلة بعد' : 'Not yet wired into checkout'}
                </span>
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.codEnabled}
                  onChange={(e) => setForm({ ...form, codEnabled: e.target.checked })}
                  className="w-4 h-4 accent-primary rounded"
                />
                <span className="font-semibold">{isAr ? 'مفعّل' : 'Enabled'}</span>
              </label>
            </div>
            <p className="text-[10px] text-muted-text">
              {isAr
                ? 'هذا الخيار يسجّل الإعداد المطلوب فقط. عرضه كخيار فعلي أثناء الدفع يتطلب تعديل تدفق السداد — وهو تغيير متعمد أُجّل خارج هذه المرحلة.'
                : 'This toggle only records the desired configuration. Actually offering it as a checkout option requires a checkout-flow change, which was deliberately deferred beyond this phase — see the Phase 4 report.'}
            </p>
          </div>

          {/* Active gateway (preparatory) */}
          <div className="space-y-1 pt-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">
              {isAr ? 'بوابة الدفع النشطة (تحضيري)' : 'Active Gateway (preparatory)'}
            </label>
            <select
              value={form.activeGateway}
              onChange={(e) => setForm({ ...form, activeGateway: e.target.value })}
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 bg-white"
            >
              {form.availableGateways.map((g) => (
                <option key={g} value={g} disabled={!form.connectedGateways.includes(g)}>
                  {g === 'stripe' ? 'Stripe' : g === 'paymob' ? `Paymob (${isAr ? 'غير متصل بعد' : 'not connected yet'})` : g}
                </option>
              ))}
            </select>
            <p className="text-[9px] text-gray-400">
              {isAr
                ? 'مُعدّة لدعم بوابات إضافية (مثل Paymob) لاحقاً دون إعادة كتابة السداد الحالي.'
                : 'Prepared so additional gateways (like Paymob) can be added later without rewriting the current checkout.'}
            </p>
          </div>

          {saveError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-red-600 font-semibold">
              {saveError}
            </div>
          )}
          {successMsg && (
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-green-700 font-semibold">
              {successMsg}
            </div>
          )}

          <div className="flex justify-end pt-2 border-t border-light-border">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-primary hover:bg-primary-dark disabled:opacity-60 text-cream font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? (isAr ? 'جارٍ الحفظ...' : 'Saving...') : (isAr ? 'حفظ الإعدادات' : 'Save Settings')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
