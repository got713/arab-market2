'use client';

import React, { useState } from 'react';
import { useLocaleStore } from '@/store/locale-store';
import { useCartStore } from '@/store/cart-store';
import { Truck, MapPin, Inbox, HelpCircle } from 'lucide-react';

export default function ShippingPage() {
  const { t, locale } = useLocaleStore();
  const { checkZip, isZipChecked, isDeliveryAvailable, shippingZip, resetZip } = useCartStore();
  const [zipInput, setZipInput] = useState(shippingZip || '');
  const [error, setError] = useState('');

  const handleZipCheck = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!/^\d{5}$/.test(zipInput)) {
      setError(t('zip.placeholder'));
      return;
    }

    checkZip(zipInput);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 sm:py-16 fade-in space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <Truck className="w-12 h-12 text-gold mx-auto" />
        <h1 className="text-2xl sm:text-4xl font-bold text-dark">Shipping & Delivery</h1>
        <p className="text-xs sm:text-sm text-muted-text">
          Insulated dry-ice packaging, flat rates, and delivery speeds across the United States.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left Column: ZIP checker */}
        <div className="bg-cream/35 border border-light-border p-6 rounded-xl space-y-4">
          <h3 className="font-bold text-sm text-primary uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-4.5 h-4.5 text-gold" />
            <span>Check Your Area</span>
          </h3>
          <p className="text-xs text-gray-500">
            Verify if shipping is supported in your state.
          </p>
          <form onSubmit={handleZipCheck} className="space-y-3">
            <input
              type="text"
              maxLength={5}
              value={zipInput}
              onChange={(e) => setZipInput(e.target.value.replace(/\D/g, ''))}
              placeholder={t('zip.placeholder')}
              className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
            <button
              type="submit"
              className="w-full py-2 bg-primary text-cream text-xs font-bold rounded-lg hover:bg-primary-dark transition-colors"
            >
              Check Availability
            </button>
          </form>

          {error && <p className="text-xs text-red-650 font-semibold">{error}</p>}

          {isZipChecked && (
            <div className="p-3 bg-white border border-light-border rounded-lg text-xs">
              {isDeliveryAvailable ? (
                <div className="space-y-1">
                  <span className="text-green-700 font-bold">✓ Delivery Available</span>
                  <p className="text-gray-500 text-[10px]">Your area qualifies for dry-ice shipping.</p>
                </div>
              ) : (
                <div className="space-y-1">
                  <span className="text-red-600 font-bold">✕ Delivery Unavailable</span>
                  <p className="text-gray-500 text-[10px]">We cannot deliver cold goods to this zip code.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Columns: Shipping policies details */}
        <div className="md:col-span-2 space-y-6 text-sm text-gray-600 leading-relaxed">
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-dark">Temperature-Controlled Grocery Shipping</h2>
            <p>
              To ensure that products arrive fresh, we pack perishable items (frozen foods, dairy, cheeses) inside custom insulated boxes with dry ice blocks. Perishables are shipped exclusively via **Express Delivery** to guarantees arrivals within 48 hours.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-dark">Shipping Rates & Timelines</h2>
            <table className="w-full border-collapse text-xs border border-light-border text-left rtl:text-right">
              <thead>
                <tr className="bg-gray-50 border-b border-light-border font-bold">
                  <th className="p-3">Method</th>
                  <th className="p-3">Timeline</th>
                  <th className="p-3">Rate</th>
                  <th className="p-3">Threshold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border">
                <tr>
                  <td className="p-3 font-semibold">Standard Shipping</td>
                  <td className="p-3">3–5 Business Days</td>
                  <td className="p-3">$7.99</td>
                  <td className="p-3 text-green-700 font-bold">FREE on orders &ge; $50</td>
                </tr>
                <tr>
                  <td className="p-3 font-semibold">Express Delivery</td>
                  <td className="p-3">1–2 Business Days</td>
                  <td className="p-3">$14.99</td>
                  <td className="p-3">Flat Rate</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-dark">Order Dispatch Cutoffs</h2>
            <p>
              Orders placed before **2:00 PM EST** Monday through Thursday are packed and dispatched from our Brooklyn distribution hub the very same day. Perishable orders placed on Friday, Saturday, or Sunday are dispatched on Monday to prevent courier warehouse delays over the weekend.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
