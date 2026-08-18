'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Order } from '@/types';
import { OrderService } from '@/services/orders';
import { useLocaleStore } from '@/store/locale-store';
import { formatDate, formatPrice, getPurchaseOptionLabel } from '@/lib/utils';
import { 
  Search, 
  MapPin, 
  Truck, 
  Package, 
  CheckCircle2, 
  ClipboardList,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function TrackOrderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useLocaleStore();
  
  const queryId = searchParams?.get('id') || '';
  const queryEmail = searchParams?.get('email') || '';
  const [searchInput, setSearchInput] = useState(queryId);
  const [emailInput, setEmailInput] = useState(queryEmail);
  const [order, setOrder] = useState<Order | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleTrack = React.useCallback(async (idToTrack: string, emailToTrack: string) => {
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      // The backend now validates the email against the order's own
      // customer_email server-side and 404s on any mismatch (see
      // OrderController::track) — the order is never returned to begin
      // with unless the email is correct.
      const result = await OrderService.trackOrder(idToTrack, emailToTrack, locale);
      if (result) {
        setOrder(result);
      } else {
        setOrder(null);
        setError('No order found for that order number and email combination. Please check both and try again.');
      }
    } catch (err) {
      setError('An error occurred during order lookup.');
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    if (queryId && queryEmail) {
      handleTrack(queryId, queryEmail);
    }
  }, [queryId, queryEmail, handleTrack]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim() && emailInput.trim()) {
      router.push(`/track-order?id=${encodeURIComponent(searchInput.trim().toUpperCase())}&email=${encodeURIComponent(emailInput.trim())}`);
    }
  };

  // Map order statuses to step indexes
  // Statuses: 'Pending', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'
  const steps: { label: string; key: Order['status']; icon: React.ComponentType<any> }[] = [
    { label: t('order.status.pending'), key: 'Pending', icon: ClipboardList },
    { label: t('order.status.processing'), key: 'Processing', icon: Package },
    { label: t('order.status.shipped'), key: 'Shipped', icon: Truck },
    { label: t('order.status.out_for_delivery'), key: 'Out for Delivery', icon: MapPin },
    { label: t('order.status.delivered'), key: 'Delivered', icon: CheckCircle2 }
  ];

  const getActiveStepIndex = (status: Order['status']) => {
    if (status === 'Cancelled') return -1;
    return steps.findIndex((step) => step.key === status);
  };

  const activeIndex = order ? getActiveStepIndex(order.status) : -1;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 fade-in space-y-8">
      {/* Page Header */}
      <div className="text-center max-w-xl mx-auto space-y-3">
        <h1 className="text-2xl sm:text-4xl font-bold text-dark">{t('order.track.title')}</h1>
        <p className="text-xs sm:text-sm text-muted-text">
          {t('order.track.desc')}
        </p>
      </div>

      {/* Tracker search Form */}
      <div className="max-w-md mx-auto bg-white border border-light-border p-4 rounded-xl shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-2.5">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                required
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t('order.track.placeholder')}
                className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm uppercase font-semibold"
              />
              <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-primary text-cream text-xs font-bold rounded-lg hover:bg-primary-dark transition-colors"
            >
              {locale === 'ar' ? 'تتبع' : 'Track'}
            </button>
          </div>
          <input
            type="email"
            required
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
            placeholder={locale === 'ar' ? 'البريد الإلكتروني المستخدم في الطلب' : 'Email used on the order'}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
          />
          <p className="text-[10px] text-gray-400 px-0.5">
            {locale === 'ar'
              ? 'للحماية، نحتاج رقم الطلب والبريد الإلكتروني معاً لعرض تفاصيله.'
              : 'For your privacy, we need both the order number and the email used on it to show order details.'}
          </p>
        </form>
      </div>

      {/* Tracking Results Output */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-xs text-gray-500 mt-2">Checking tracking coordinates...</p>
        </div>
      ) : error ? (
        <div className="max-w-md mx-auto text-center p-6 bg-red-50 border border-red-200 rounded-xl space-y-3">
          <AlertTriangle className="w-10 h-10 text-red-600 mx-auto" />
          <h3 className="font-bold text-sm text-red-800">{locale === 'ar' ? 'خطأ في التتبع' : 'Order Not Found'}</h3>
          <p className="text-xs text-red-700 leading-normal">{error}</p>
        </div>
      ) : order ? (
        <div className="space-y-8">
          {/* Tracking Details Banner */}
          <div className="bg-white border border-light-border rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between border-b border-light-border pb-4 gap-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Order Code</span>
                <strong className="text-base text-dark">{order.id}</strong>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Tracking ID</span>
                <strong className="text-sm text-primary font-mono">{order.trackingNumber || 'N/A'}</strong>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-400 block mb-0.5">Estimated Delivery</span>
                <strong className="text-sm text-dark">
                  {order.status === 'Delivered' 
                    ? 'Delivered 🎉' 
                    : order.status === 'Cancelled' 
                    ? 'Cancelled ✕' 
                    : '3-5 Business Days'}
                </strong>
              </div>
            </div>

            {/* Visual Steps Timeline Progress bar */}
            {order.status === 'Cancelled' ? (
              <div className="p-4 bg-red-50 border border-red-150 text-red-700 rounded-xl text-center font-bold text-sm">
                ✕ This order has been cancelled. If you believe this was an error, please contact customer support.
              </div>
            ) : (
              <div className="py-6 px-2">
                {/* Process Bar container */}
                <div className="relative flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 w-full">
                  {/* Background progress track lines */}
                  <div className="hidden md:block absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-gray-200 z-0">
                    <div 
                      className="h-full bg-primary transition-all duration-500" 
                      style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
                    />
                  </div>

                  {/* Steps nodes */}
                  {steps.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isDone = idx <= activeIndex;
                    const isActive = idx === activeIndex;

                    return (
                      <div key={idx} className="relative z-10 flex flex-row md:flex-col items-center gap-3 md:gap-2 flex-1 w-full md:w-auto">
                        {/* Dot container */}
                        <div 
                          className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${
                            isActive
                              ? 'bg-gold border-gold text-dark ring-4 ring-gold/25'
                              : isDone
                              ? 'bg-primary border-primary text-cream'
                              : 'bg-white border-gray-300 text-gray-400'
                          }`}
                        >
                          <StepIcon className="w-4.5 h-4.5" />
                        </div>
                        
                        {/* Label */}
                        <div className="text-left md:text-center">
                          <span className={`block text-xs font-bold leading-tight ${isDone ? 'text-primary' : 'text-gray-400'}`}>
                            {step.label}
                          </span>
                          {isActive && (
                            <span className="text-[10px] text-gold font-semibold uppercase tracking-wider block animate-pulse">
                              {t('order.track.status')}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Items & Shipping summary grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            
            {/* Left: Shipping Destination */}
            <div className="bg-white border border-light-border rounded-xl p-5 space-y-3">
              <h3 className="font-bold text-sm text-primary uppercase tracking-wider border-b border-light-border pb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-gold" />
                <span>Shipping Location</span>
              </h3>
              <div className="text-xs space-y-1.5 text-gray-600">
                <strong className="text-dark block font-semibold">{order.customer.name}</strong>
                <p>{order.customer.address}</p>
                <p>{order.customer.city}, {order.customer.state} {order.customer.zip}</p>
                <p className="pt-1.5 border-t border-gray-100">Phone: {order.customer.phone}</p>
              </div>
            </div>

            {/* Middle: Items summary */}
            <div className="md:col-span-2 bg-white border border-light-border rounded-xl p-5 space-y-4">
              <h3 className="font-bold text-sm text-primary uppercase tracking-wider border-b border-light-border pb-2">
                Order Package Contents
              </h3>
              <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto no-scrollbar">
                {order.items.map((item, idx) => (
                  <div key={idx} className="py-2 flex justify-between text-xs items-center gap-2">
                    <div>
                      <span className="font-bold text-dark block">{locale === 'ar' ? item.product.arabicName : item.product.name}</span>
                      <span className="text-[10px] text-gray-500 uppercase">{item.quantity} x {getPurchaseOptionLabel(item.product.purchaseOptions, item.option, locale, item.product.sellingUnit)}</span>
                    </div>
                    <span className="font-semibold text-primary">{formatPrice(item.product.purchaseOptions[item.option].price * item.quantity, locale)}</span>
                  </div>
                ))}
              </div>
              <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline text-xs">
                <span className="text-gray-400 font-bold uppercase">Grand Total:</span>
                <strong className="text-sm text-primary font-bold">{formatPrice(order.total, locale)}</strong>
              </div>
            </div>

          </div>
        </div>
      ) : searched ? (
        <p className="text-center text-gray-500 py-10">Searching...</p>
      ) : (
        /* Prompt to search */
        <div className="text-center py-12 max-w-sm mx-auto space-y-3">
          <ClipboardList className="w-12 h-12 text-gray-300 mx-auto" />
          <p className="text-sm text-gray-500">
            Please enter your order number (e.g. <strong>AM-10482</strong>) and the email used on the order above to retrieve your shipping status.
          </p>
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-xs text-gray-500 mt-4 font-semibold">Loading tracker...</p>
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}
