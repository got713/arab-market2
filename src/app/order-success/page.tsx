'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Order } from '@/types';
import { OrderService } from '@/services/orders';
import { useLocaleStore } from '@/store/locale-store';
import { formatDate, formatPrice, getPurchaseOptionLabel } from '@/lib/utils';
import { CheckCircle2, ChevronRight, ShoppingBag, Truck } from 'lucide-react';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useLocaleStore();
  const id = searchParams?.get('id') || '';
  const email = searchParams?.get('email') || '';

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id || !email) {
      setLoading(false);
      return;
    }
    const fetchOrder = async () => {
      try {
        const o = await OrderService.getOrderById(id, email);
        setOrder(o);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, email]);

  if (loading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-sm text-gray-500 mt-4">Retrieving order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-dark">Order details unavailable</h2>
        <p className="text-sm text-gray-500">We couldn't retrieve details for this session.</p>
        <Link href="/" className="bg-primary text-cream px-6 py-2.5 rounded-lg text-sm font-semibold inline-block">
          Go to Homepage
        </Link>
      </div>
    );
  }

  // Calculate estimated delivery dates
  // Assume 3-5 days standard, 1-2 days express
  const orderDate = new Date(order.date);
  const addDays = (d: Date, days: number) => {
    const result = new Date(d);
    result.setDate(result.getDate() + days);
    return result;
  };

  const isExpress = order.shipping > 0 && order.shipping === 14.99;
  const minDelivery = addDays(orderDate, isExpress ? 1 : 3);
  const maxDelivery = addDays(orderDate, isExpress ? 2 : 5);

  const deliveryEstString = `${formatDate(minDelivery.toISOString(), locale)} – ${formatDate(maxDelivery.toISOString(), locale)}`;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 fade-in space-y-8">
      {/* Success Banner */}
      <div className="text-center space-y-4">
        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto" />
        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold text-dark">
            {t('order.success.title')}
          </h1>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            {t('order.success.thank_you')}
          </p>
        </div>
      </div>

      {/* Summary box */}
      <div className="border border-light-border bg-white rounded-2xl overflow-hidden shadow-xs">
        {/* Header summary */}
        <div className="bg-cream/45 p-5 border-b border-light-border grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-gray-400 font-semibold block uppercase mb-1">{t('order.success.number')}</span>
            <strong className="text-dark text-sm">{order.id}</strong>
          </div>
          <div>
            <span className="text-gray-400 font-semibold block uppercase mb-1">Date</span>
            <strong className="text-dark text-sm">{formatDate(order.date, locale)}</strong>
          </div>
          <div>
            <span className="text-gray-400 font-semibold block uppercase mb-1">Payment Method</span>
            <strong className="text-dark text-sm leading-tight">{order.paymentMethod.replace('Credit Card ', '')}</strong>
          </div>
          <div>
            <span className="text-gray-400 font-semibold block uppercase mb-1">Status</span>
            <span className="inline-block bg-primary text-cream px-2.5 py-0.5 rounded-full font-semibold uppercase text-[10px]">
              {order.status}
            </span>
          </div>
        </div>

        {/* Invoice breakdown */}
        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-dark uppercase tracking-wider">Purchased Items</h3>
            <div className="divide-y divide-light-border">
              {order.items.map((item, idx) => (
                <div key={idx} className="py-3 flex justify-between items-center text-sm">
                  <div className="space-y-0.5">
                    <span className="font-bold text-dark block">
                      {locale === 'ar' ? item.product.arabicName : item.product.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {item.quantity} x {getPurchaseOptionLabel(item.product.purchaseOptions, item.option, locale, item.product.sellingUnit)}
                    </span>
                  </div>
                  <span className="font-bold text-primary">
                    {formatPrice(item.product.purchaseOptions[item.option].price * item.quantity, locale)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery speed estimate */}
          <div className="border-t border-light-border pt-4 flex gap-3 items-start text-xs bg-gray-50 p-4 rounded-xl">
            <Truck className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="text-gray-400 font-semibold uppercase block">{t('order.success.delivery_est')}</span>
              <strong className="text-dark text-sm">{deliveryEstString}</strong>
              <p className="text-[10px] text-gray-500">
                Shipping Address: {order.customer.address}, {order.customer.city}, {order.customer.state} {order.customer.zip}
              </p>
            </div>
          </div>

          {/* Price details totals */}
          <div className="border-t border-light-border pt-4 text-sm space-y-2 text-gray-600 max-w-sm ml-auto rtl:mr-auto rtl:ml-0">
            <div className="flex justify-between">
              <span>{t('cart.subtotal')}</span>
              <span className="font-semibold text-dark">{formatPrice(order.subtotal, locale)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-700 font-semibold">
                <span>Discount Applied</span>
                <span>-{formatPrice(order.discount, locale)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span className="font-semibold text-dark">
                {order.shipping === 0 ? 'FREE' : formatPrice(order.shipping, locale)}
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-2 border-t border-light-border font-bold text-base text-dark">
              <span>Total Charge</span>
              <span className="text-primary text-xl">{formatPrice(order.total, locale)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href={`/track-order?id=${order.id}&email=${encodeURIComponent(order.customer.email)}`}
          className="px-8 py-3.5 bg-primary hover:bg-primary-dark text-cream font-bold rounded-lg text-sm text-center shadow-md transition-colors"
        >
          {t('order.track_btn')}
        </Link>
        <Link
          href="/"
          className="px-8 py-3.5 border border-primary/20 hover:bg-cream/10 text-primary font-bold rounded-lg text-sm text-center transition-colors"
        >
          {t('cart.continue')}
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-xs text-gray-500 mt-4 font-semibold">Loading order details...</p>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
