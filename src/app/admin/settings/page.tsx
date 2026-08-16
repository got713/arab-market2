'use client';

import React, { useState, useEffect } from 'react';
import { useLocaleStore } from '@/store/locale-store';
import { SettingsService, StoreSettings } from '@/services/settings';
import { getErrorMessage } from '@/lib/utils';
import { Settings, Save, RefreshCw, AlertTriangle } from 'lucide-react';

export default function AdminSettingsPage() {
  const { locale } = useLocaleStore();

  const [form, setForm] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const load = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const settings = await SettingsService.getSettings(locale);
      setForm(settings);
    } catch (err: unknown) {
      setLoadError(getErrorMessage(err, 'Failed to load settings.'));
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
      // Persist to the backend, then use exactly what the server saved (not
      // the local form state) as the new source of truth — a refresh should
      // always show what's actually in the database.
      const saved = await SettingsService.updateSettings(form, locale);
      setForm(saved);
      setSuccessMsg(locale === 'ar' ? 'تم تحديث الإعدادات بنجاح!' : 'Settings updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: unknown) {
      setSaveError(getErrorMessage(err, locale === 'ar' ? 'فشل حفظ الإعدادات.' : 'Failed to save settings.'));
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
        <p className="text-sm text-red-600 font-semibold">{loadError || 'Settings unavailable.'}</p>
        <button onClick={load} className="text-xs font-bold text-primary hover:underline">
          {locale === 'ar' ? 'إعادة المحاولة' : 'Try again'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6 fade-in text-xs" dir={locale === 'ar' ? 'rtl' : 'ltr'}>

      <div className="bg-white border border-light-border rounded-xl shadow-xs p-5 sm:p-6 space-y-4">
        <h3 className="font-bold text-sm text-primary uppercase tracking-wider border-b border-light-border pb-3 flex items-center gap-1.5">
          <Settings className="w-4.5 h-4.5 text-gold" />
          <span>{locale === 'ar' ? 'إعدادات النظام العامة للمتجر' : 'Global Store Settings'}</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">
              {locale === 'ar' ? 'اسم المتجر' : 'Store Name'}
            </label>
            <input
              type="text"
              required
              value={form.store_name}
              onChange={(e) => setForm({ ...form, store_name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">
                {locale === 'ar' ? 'البريد الإلكتروني للدعم الفني' : 'Support Email'}
              </label>
              <input
                type="email"
                required
                value={form.support_email}
                onChange={(e) => setForm({ ...form, support_email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">
                {locale === 'ar' ? 'رقم الهاتف للدعم' : 'Support Phone'}
              </label>
              <input
                type="text"
                required
                value={form.support_phone}
                onChange={(e) => setForm({ ...form, support_phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 font-semibold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">
              {locale === 'ar' ? 'عنوان مركز التوزيع الرئيسي' : 'Distribution Address'}
            </label>
            <input
              type="text"
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">
                {locale === 'ar' ? 'العملة الأساسية للنظام' : 'Base Currency'}
              </label>
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value as StoreSettings['currency'] })}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 font-semibold bg-white"
              >
                <option value="USD">{locale === 'ar' ? 'دولار أمريكي ($) - USD' : 'USD ($) - US Dollar'}</option>
                <option value="EGP">{locale === 'ar' ? 'جنيه مصري (ج.م) - EGP' : 'EGP (ج.م) - Egyptian Pound'}</option>
                <option value="AED">{locale === 'ar' ? 'درهم إماراتي (د.إ) - AED' : 'AED (د.إ) - UAE Dirham'}</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="guestcheckout"
                checked={form.allow_guest_checkout}
                onChange={(e) => setForm({ ...form, allow_guest_checkout: e.target.checked })}
                className="w-4 h-4 text-primary accent-primary rounded"
              />
              <label htmlFor="guestcheckout" className="text-xs font-semibold text-dark select-none">
                {locale === 'ar' ? 'السماح للزوار بالشراء بدون حساب' : 'Allow Guest Checkout'}
              </label>
            </div>
          </div>

          {successMsg && <p className="text-xs text-green-700 font-bold">{successMsg}</p>}
          {saveError && <p className="text-xs text-red-600 font-bold">{saveError}</p>}

          <div className="flex justify-end pt-4 border-t border-light-border">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-cream font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all duration-150 disabled:opacity-60"
            >
              {saving ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-gold" />
                  <span>{locale === 'ar' ? 'حفظ كافة الإعدادات' : 'Save Settings'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
