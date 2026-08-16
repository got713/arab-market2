'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CustomerService } from '@/services/customers';
import { Customer, Order } from '@/types';
import { formatPrice, formatDate, getErrorMessage } from '@/lib/utils';
import { useLocaleStore } from '@/store/locale-store';
import { Users, Search, X, ChevronLeft, ChevronRight, AlertTriangle, PackageSearch } from 'lucide-react';

export default function AdminCustomersPage() {
  const { locale } = useLocaleStore();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [selected, setSelected] = useState<Customer | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  // Debounce the search box before it hits the API.
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);
    return () => clearTimeout(t);
  }, [searchInput]);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await CustomerService.getCustomers({
        search: search || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
        page,
      });
      setCustomers(res.customers);
      setLastPage(res.lastPage);
      setTotal(res.total);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load customers.'));
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleToggleStatus = async (cust: Customer) => {
    setTogglingId(cust.id);
    try {
      await CustomerService.setCustomerActive(cust.id, !cust.isActive);
      setCustomers((prev) => prev.map((c) => (c.id === cust.id ? { ...c, isActive: !c.isActive } : c)));
      if (selected?.id === cust.id) {
        setSelected((prev) => (prev ? { ...prev, isActive: !prev.isActive } : prev));
      }
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Failed to update customer status.'));
    } finally {
      setTogglingId(null);
    }
  };

  const openDetail = async (cust: Customer) => {
    setSelected(cust);
    setSelectedOrders([]);
    setLoadingDetail(true);
    try {
      const orders = await CustomerService.getCustomerOrders(cust.id);
      setSelectedOrders(orders);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="space-y-6 fade-in" dir={locale === 'ar' ? 'rtl' : 'ltr'}>

      {/* Header + filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
            <Users className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-dark">
              {locale === 'ar' ? 'العملاء' : 'Customers'}
            </h2>
            <span className="text-[11px] text-gray-400">
              {total} {locale === 'ar' ? 'عميل مسجل' : 'registered customers'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 rtl:left-auto rtl:right-3" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder={locale === 'ar' ? 'ابحث بالاسم أو البريد أو الهاتف...' : 'Search name, email, or phone...'}
              className="pl-9 rtl:pl-3 rtl:pr-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1); }}
            className="text-xs border border-gray-300 rounded-lg px-2.5 py-2 bg-white focus:outline-none"
          >
            <option value="all">{locale === 'ar' ? 'كل الحالات' : 'All statuses'}</option>
            <option value="active">{locale === 'ar' ? 'نشط' : 'Active'}</option>
            <option value="inactive">{locale === 'ar' ? 'معطل' : 'Inactive'}</option>
          </select>
        </div>
      </div>

      {/* Table / states */}
      <div className="bg-white border border-light-border rounded-xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : error ? (
          <div className="text-center py-16 space-y-3">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto" />
            <p className="text-xs text-red-600 font-semibold">{error}</p>
            <button onClick={loadCustomers} className="text-xs font-bold text-primary hover:underline">
              {locale === 'ar' ? 'إعادة المحاولة' : 'Try again'}
            </button>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-16 space-y-2">
            <PackageSearch className="w-10 h-10 text-gray-300 mx-auto" />
            <p className="text-sm text-gray-500 font-semibold">
              {locale === 'ar' ? 'لا يوجد عملاء مطابقون' : 'No customers found'}
            </p>
            {(search || statusFilter !== 'all') && (
              <p className="text-xs text-gray-400">
                {locale === 'ar' ? 'جرّب تعديل البحث أو الفلاتر.' : 'Try adjusting your search or filters.'}
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-light-border text-gray-500 font-bold uppercase tracking-wider">
                    <th className="p-4">{locale === 'ar' ? 'العميل' : 'Customer'}</th>
                    <th className="p-4">{locale === 'ar' ? 'عدد الطلبات' : 'Orders'}</th>
                    <th className="p-4">{locale === 'ar' ? 'إجمالي المدفوع' : 'Total Spent'}</th>
                    <th className="p-4">{locale === 'ar' ? 'تاريخ الانضمام' : 'Joined'}</th>
                    <th className="p-4">{locale === 'ar' ? 'الحالة' : 'Status'}</th>
                    <th className="p-4 text-right">{locale === 'ar' ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-border">
                  {customers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-cream/10 transition-colors">
                      <td className="p-4">
                        <button onClick={() => openDetail(cust)} className="text-left rtl:text-right">
                          <strong className="block font-semibold text-dark text-[13px] hover:text-primary hover:underline">{cust.name}</strong>
                          <span className="text-[10px] text-gray-400">{cust.email}</span>
                        </button>
                      </td>
                      <td className="p-4 font-semibold text-dark">
                        {cust.ordersCount} {locale === 'ar' ? 'طلبات' : 'orders'}
                      </td>
                      <td className="p-4 font-bold text-primary text-sm">{formatPrice(cust.totalSpent, locale)}</td>
                      <td className="p-4 font-medium text-gray-500">{formatDate(cust.createdAt, locale)}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          cust.isActive ? 'bg-green-100 text-green-700' : 'bg-red-150 text-red-750'
                        }`}>
                          {cust.isActive ? (locale === 'ar' ? 'نشط' : 'Active') : (locale === 'ar' ? 'معطل' : 'Inactive')}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(cust)}
                          disabled={togglingId === cust.id}
                          className="px-3 py-1 border border-gray-300 hover:bg-gray-50 rounded-lg font-bold text-[10px] transition-all disabled:opacity-50"
                        >
                          {togglingId === cust.id
                            ? '...'
                            : cust.isActive
                            ? (locale === 'ar' ? 'تعطيل الحساب' : 'Deactivate')
                            : (locale === 'ar' ? 'تفعيل الحساب' : 'Activate')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-light-border text-xs">
                <span className="text-gray-400">
                  {locale === 'ar' ? `صفحة ${page} من ${lastPage}` : `Page ${page} of ${lastPage}`}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                    disabled={page >= lastPage}
                    className="p-1.5 border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50"
                  >
                    <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelected(null)}>
          <div
            className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-base font-bold text-dark">{selected.name}</h3>
                <p className="text-xs text-gray-500">{selected.email}</p>
                {selected.phone && <p className="text-xs text-gray-500">{selected.phone}</p>}
              </div>
              <button onClick={() => setSelected(null)} className="p-1 text-gray-400 hover:text-dark">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-cream/30 rounded-lg p-3">
                <strong className="block text-sm font-bold text-primary">{selected.ordersCount}</strong>
                <span className="text-[10px] text-gray-400 uppercase font-bold">{locale === 'ar' ? 'الطلبات' : 'Orders'}</span>
              </div>
              <div className="bg-cream/30 rounded-lg p-3">
                <strong className="block text-sm font-bold text-primary">{formatPrice(selected.totalSpent, locale)}</strong>
                <span className="text-[10px] text-gray-400 uppercase font-bold">{locale === 'ar' ? 'إجمالي الإنفاق' : 'Total Spent'}</span>
              </div>
              <div className="bg-cream/30 rounded-lg p-3">
                <strong className="block text-sm font-bold text-primary">
                  {selected.lastOrderAt ? formatDate(selected.lastOrderAt, locale) : '—'}
                </strong>
                <span className="text-[10px] text-gray-400 uppercase font-bold">{locale === 'ar' ? 'آخر طلب' : 'Last Order'}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold text-primary uppercase tracking-wider border-b border-light-border pb-2 mb-3">
                {locale === 'ar' ? 'سجل الطلبات' : 'Order History'}
              </h4>
              {loadingDetail ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : selectedOrders.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">
                  {locale === 'ar' ? 'لا توجد طلبات بعد.' : 'No orders yet.'}
                </p>
              ) : (
                <div className="divide-y divide-light-border">
                  {selectedOrders.map((o) => (
                    <div key={o.id} className="py-2.5 flex justify-between items-center text-xs">
                      <div>
                        <strong className="block text-dark font-mono">{o.id}</strong>
                        <span className="text-[10px] text-gray-400">{formatDate(o.date, locale)}</span>
                      </div>
                      <div className="text-right rtl:text-left">
                        <strong className="block text-primary font-bold">{formatPrice(o.total, locale)}</strong>
                        <span className="text-[10px] text-gray-400">{o.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
