'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/services/db';
import { Customer } from '@/types';
import { formatPrice } from '@/lib/utils';
import { Users, UserCheck, ShieldAlert, Award } from 'lucide-react';

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Load customers
  const loadCustomers = () => {
    setLoading(true);
    try {
      const list = db.getCustomers();
      setCustomers(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleToggleStatus = (cust: Customer) => {
    const updated = { ...cust, status: cust.status === 'Active' ? 'Inactive' : 'Active' as any };
    const list = customers.map((c) => (c.id === cust.id ? updated : c));
    db.saveCustomers(list);
    setCustomers(list);
  };

  // Compute LTV benchmarks
  const totalLTV = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgLTV = customers.length > 0 ? (totalLTV / customers.length) : 0;
  const topCustomer = customers.length > 0 
    ? [...customers].sort((a, b) => b.totalSpent - a.totalSpent)[0]
    : null;

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      
      {/* Benchmarks grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-light-border p-4 rounded-xl shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Average LTV</span>
            <strong className="text-lg font-bold text-dark">{formatPrice(avgLTV)}</strong>
          </div>
          <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
            <Users className="w-5 h-5 text-gold" />
          </div>
        </div>

        <div className="bg-white border border-light-border p-4 rounded-xl shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Total Customer Spend</span>
            <strong className="text-lg font-bold text-dark">{formatPrice(totalLTV)}</strong>
          </div>
          <div className="p-2.5 bg-green-50 text-green-700 rounded-lg">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-light-border p-4 rounded-xl shadow-xs flex items-center justify-between">
          <div className="space-y-0.5">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">V.I.P. Customer</span>
            <strong className="text-base font-bold text-dark truncate block max-w-[150px]">{topCustomer?.name || 'N/A'}</strong>
            <span className="text-[9px] text-green-700 font-bold block">{topCustomer ? formatPrice(topCustomer.totalSpent) : ''} spent</span>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-lg">
            <Award className="w-5 h-5 text-gold" />
          </div>
        </div>
      </div>

      {/* Customers List Table */}
      <div className="bg-white border border-light-border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-light-border text-gray-500 font-bold uppercase tracking-wider">
                <th className="p-4">Customer</th>
                <th className="p-4">Total Orders</th>
                <th className="p-4">Lifetime Spent (LTV)</th>
                <th className="p-4">Last Purchase Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border">
              {customers.map((cust) => (
                <tr key={cust.id} className="hover:bg-cream/10 transition-colors">
                  {/* Info */}
                  <td className="p-4">
                    <strong className="block font-semibold text-dark text-[13px]">{cust.name}</strong>
                    <span className="text-[10px] text-gray-400">{cust.email}</span>
                  </td>

                  {/* Orders */}
                  <td className="p-4 font-semibold text-dark">{cust.ordersCount} orders</td>

                  {/* Spent */}
                  <td className="p-4 font-bold text-primary text-sm">{formatPrice(cust.totalSpent)}</td>

                  {/* Last order date */}
                  <td className="p-4 font-medium text-gray-500">{cust.lastOrderDate}</td>

                  {/* Status */}
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                      cust.status === 'Active'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-150 text-red-750'
                    }`}>
                      {cust.status}
                    </span>
                  </td>

                  {/* Active Toggle */}
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggleStatus(cust)}
                      className="px-3 py-1 border border-gray-300 hover:bg-gray-50 rounded-lg font-bold text-[10px] transition-all"
                    >
                      {cust.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
