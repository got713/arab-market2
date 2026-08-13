'use client';

import React, { useState } from 'react';
import { Settings, Save, RefreshCw } from 'lucide-react';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Store settings state
  const [storeName, setStoreName] = useState('Arab Market LLC');
  const [supportEmail, setSupportEmail] = useState('support@arabmarket.com');
  const [supportPhone, setSupportPhone] = useState('+1 (800) 555-0100');
  const [address, setAddress] = useState('1200 Industrial Blvd, Suite A, Brooklyn, NY 11231');
  const [currency, setCurrency] = useState('USD');
  const [allowGuestCheckout, setAllowGuestCheckout] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg('');
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg('Global configurations updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }, 600);
  };

  return (
    <div className="max-w-xl mx-auto space-y-6 fade-in text-xs">
      
      <div className="bg-white border border-light-border rounded-xl shadow-xs p-5 sm:p-6 space-y-4">
        <h3 className="font-bold text-sm text-primary uppercase tracking-wider border-b border-light-border pb-3 flex items-center gap-1.5">
          <Settings className="w-4.5 h-4.5 text-gold" />
          <span>Global Configurations Settings</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Store Name</label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Support Email Desk</label>
              <input
                type="email"
                required
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Support Phone</label>
              <input
                type="text"
                required
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 font-semibold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase">Distribution Address</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 font-semibold"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase">Currency Base</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 font-semibold bg-white"
              >
                <option value="USD">USD ($) - US Dollar</option>
                <option value="EGP">EGP (ج.م) - Egyptian Pound</option>
                <option value="AED">AED (د.إ) - UAE Dirham</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="guestcheckout"
                checked={allowGuestCheckout}
                onChange={(e) => setAllowGuestCheckout(e.target.checked)}
                className="w-4 h-4 text-primary accent-primary rounded"
              />
              <label htmlFor="guestcheckout" className="text-xs font-semibold text-dark">
                Allow Guest Checkout
              </label>
            </div>
          </div>

          {successMsg && <p className="text-xs text-green-700 font-bold">{successMsg}</p>}

          <div className="flex justify-end pt-4 border-t border-light-border">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-primary hover:bg-primary-dark text-cream font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition-all duration-150"
            >
              {loading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Save className="w-3.5 h-3.5 text-gold" />
                  <span>Save Configuration Settings</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
