'use client';

import React, { useState } from 'react';
import { useCartStore } from '@/store/cart-store';
import { useLocaleStore } from '@/store/locale-store';
import { formatPrice } from '@/lib/utils';
import { X, MapPin } from 'lucide-react';

interface ZipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ZipModal({ isOpen, onClose }: ZipModalProps) {
  const t = useLocaleStore((state) => state.t);
  const { shippingZip, checkZip, isZipChecked, isDeliveryAvailable, resetZip, standardRate, expressRate } = useCartStore();
  const [zipInput, setZipInput] = useState(shippingZip);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!/^\d{5}$/.test(zipInput)) {
      setError(t('zip.placeholder'));
      return;
    }

    checkZip(zipInput);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs fade-in">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-light-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-light-border bg-cream">
          <div className="flex items-center gap-2 text-primary font-semibold">
            <MapPin className="w-5 h-5 text-gold" />
            <span>{t('zip.title')}</span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="zip" className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
                {t('checkout.zip')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="zip"
                  maxLength={5}
                  value={zipInput}
                  onChange={(e) => setZipInput(e.target.value.replace(/\D/g, ''))}
                  placeholder={t('zip.placeholder')}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-base"
                />
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-primary text-cream font-medium rounded-lg hover:bg-primary-dark transition-colors"
                >
                  {t('zip.check')}
                </button>
              </div>
              {error && <p className="text-red-600 text-sm mt-1.5">{error}</p>}
            </div>
          </form>

          {/* Results */}
          {isZipChecked && (
            <div className="mt-6 p-4 rounded-lg bg-gray-50 border border-gray-200">
              {isDeliveryAvailable ? (
                <div className="space-y-3">
                  <p className="text-green-700 font-medium text-sm flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
                    {t('zip.available')} (<strong>{shippingZip}</strong>)
                  </p>
                  <div className="text-xs text-gray-600 space-y-1.5 pt-2 border-t border-gray-200">
                    <div className="flex justify-between">
                      <span>{t('zip.standard')}</span>
                      <strong>{formatPrice(standardRate)}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('zip.express')}</span>
                      <strong>{formatPrice(expressRate)}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-red-700 text-sm font-medium">
                    {t('zip.unavailable')}
                  </p>
                  <button
                    onClick={() => {
                      resetZip();
                      setZipInput('');
                    }}
                    className="text-primary hover:underline text-xs font-semibold"
                  >
                    Change ZIP Code
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
