'use client';

import React, { useState } from 'react';
import { useLocaleStore } from '@/store/locale-store';
import { Truck, MapPin, Save, RefreshCw } from 'lucide-react';

interface ZoneRule {
  id: string;
  name: string;
  arabicName: string;
  states: string;
  standardPrice: number;
  expressPrice: number;
  freeThreshold: number;
}

export default function AdminShippingPage() {
  const { locale } = useLocaleStore();
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Zone rules state
  const [zones, setZones] = useState<ZoneRule[]>([
    { id: 'zone-1', name: 'Northeast US (Hub Close)', arabicName: 'شمال شرق الولايات المتحدة (بالقرب من المركز)', states: 'NY, NJ, PA, MA, CT, RI', standardPrice: 7.99, expressPrice: 14.99, freeThreshold: 50 },
    { id: 'zone-2', name: 'Midwest & South US', arabicName: 'الغرب الأوسط والجنوب الأمريكي', states: 'IL, TX, FL, GA, OH, MI, NC', standardPrice: 8.99, expressPrice: 16.99, freeThreshold: 60 },
    { id: 'zone-3', name: 'West Coast US (Hub Far)', arabicName: 'الساحل الغربي للولايات المتحدة (بعيد عن المركز)', states: 'CA, WA, OR, NV, AZ, CO', standardPrice: 9.99, expressPrice: 19.99, freeThreshold: 75 },
  ]);

  const handlePriceChange = (id: string, type: 'standard' | 'express', val: string) => {
    const numeric = parseFloat(val) || 0;
    setZones((prev) =>
      prev.map((z) => {
        if (z.id === id) {
          return {
            ...z,
            [type === 'standard' ? 'standardPrice' : 'expressPrice']: numeric,
          };
        }
        return z;
      })
    );
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg(locale === 'ar' ? 'تم تحديث قواعد شحن المناطق بنجاح!' : 'Shipping zone rules updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 fade-in text-xs" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      
      {/* Policy banner */}
      <div className="bg-white border border-light-border p-4 rounded-xl flex items-start gap-3 text-gray-600">
        <Truck className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-dark block font-semibold">
            {locale === 'ar' ? 'دليل إدارة عمليات الشحن واللوجستيات' : 'Shipping Operations Manual'}
          </strong>
          <p>
            {locale === 'ar' 
              ? 'تُغلف المواد الطازجة والمجمدة بمواد عازلة وثلج جاف وتُشحن حصرياً عبر الشحن السريع (Express). تُشحن البضائع الجافة بالطرق القياسية عن طريق خدمات النقل التجاري المعتادة.' 
              : 'Perishables and frozen goods are packed in insulated dry ice container units and shipped exclusively via Express speeds. Standard methods are handled by commercial couriers.'}
          </p>
        </div>
      </div>

      {/* Rules list */}
      <div className="bg-white border border-light-border rounded-xl shadow-xs p-5 space-y-4">
        <h3 className="font-bold text-sm text-primary uppercase tracking-wider border-b border-light-border pb-3">
          {locale === 'ar' ? 'إدارة تسعير وتوزيع مناطق الشحن بالولايات المتحدة' : 'US Regional Logistics Zones'}
        </h3>

        <form onSubmit={handleSaveSettings} className="space-y-6">
          <div className="divide-y divide-gray-150 space-y-4">
            {zones.map((zone) => (
              <div key={zone.id} className="pt-4 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                {/* Info */}
                <div className="space-y-1 sm:col-span-1.5">
                  <strong className="text-sm font-bold text-dark block flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gold" />
                    <span>{locale === 'ar' ? zone.arabicName : zone.name}</span>
                  </strong>
                  <span className="text-[10px] text-gray-400 block max-w-xs">{zone.states}</span>
                </div>

                {/* Standard */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">
                    {locale === 'ar' ? 'سعر القياسي ($)' : 'Standard Rate ($)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={zone.standardPrice}
                    onChange={(e) => handlePriceChange(zone.id, 'standard', e.target.value)}
                    className="w-full px-2 py-1.5 rounded border border-gray-300 font-semibold"
                  />
                </div>

                {/* Express */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">
                    {locale === 'ar' ? 'سعر السريع ($)' : 'Express Rate ($)'}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={zone.expressPrice}
                    onChange={(e) => handlePriceChange(zone.id, 'express', e.target.value)}
                    className="w-full px-2 py-1.5 rounded border border-gray-300 font-semibold"
                  />
                </div>

                {/* Free threshold */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">
                    {locale === 'ar' ? 'الحد الشحن المجاني ($)' : 'Free threshold ($)'}
                  </label>
                  <input
                    type="number"
                    value={zone.freeThreshold}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setZones((prev) => prev.map((z) => (z.id === zone.id ? { ...z, freeThreshold: val } : z)));
                    }}
                    className="w-full px-2 py-1.5 rounded border border-gray-300 font-semibold"
                  />
                </div>
              </div>
            ))}
          </div>

          {successMsg && <p className="text-xs text-green-700 font-bold">{successMsg}</p>}

          <div className="flex justify-end pt-4 border-t border-light-border">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-cream font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-colors"
            >
              {loading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-gold" />
                  <span>{locale === 'ar' ? 'حفظ إعدادات المناطق' : 'Save Zone Rules'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
