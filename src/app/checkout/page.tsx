'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Elements } from '@stripe/react-stripe-js';
import { useCartStore } from '@/store/cart-store';
import { useLocaleStore } from '@/store/locale-store';
import { useAuthStore } from '@/store/auth-store';
import { formatPrice, getPurchaseOptionLabel } from '@/lib/utils';
import { PaymentService, getStripe } from '@/services/payments';
import { OrderService } from '@/services/orders';
import StripePaymentForm from '@/components/checkout/stripe-payment-form';
import { Lock, ShoppingBag, CreditCard, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { Order } from '@/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { t, locale } = useLocaleStore();
  const { user } = useAuthStore();
  const {
    items,
    shippingOption,
    setShippingOption,
    getSubtotal,
    getDiscountAmount,
    getShippingCost,
    getTotal,
    clearCart,
    shippingZip,
    appliedCoupon,
    standardRate,
    expressRate,
    getShippingRateId,
    checkZip,
  } = useCartStore();

  // Redirect to cart if empty — but not once an order has already been placed
  // and we're just waiting on payment confirmation (cart may already be cleared
  // by then, and we don't want to bounce the user off the payment step).
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'payment'>('details');

  useEffect(() => {
    if (items.length === 0 && checkoutStep === 'details') {
      router.push('/cart');
    }
  }, [items, router, checkoutStep]);

  // Contact Info states
  const [firstName, setFirstName] = useState(user?.name.split(' ')[0] || '');
  const [lastName, setLastName] = useState(user?.name.split(' ')[1] || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Shipping Address states
  const [address, setAddress] = useState(user?.address || '');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState(user?.city || '');
  const [state, setState] = useState(user?.state || '');
  const [zip, setZip] = useState(shippingZip || user?.zip || '');

  // Once the customer has filled in a full address, re-quote shipping with
  // the real address + cart contents so the backend can try a live Shippo
  // rate (falls back to the flat zip-only estimate automatically if Shippo
  // isn't configured or fails — see OrderController::getShippingRates).
  // Debounced so we don't fire a request on every keystroke.
  useEffect(() => {
    if (!address || !city || !state || !/^\d{5}$/.test(zip)) return;

    const timer = setTimeout(() => {
      checkZip(zip, {
        address,
        city,
        state,
        items: items.map(i => ({
          productId: i.product.id,
          option: i.option,
          quantity: i.quantity,
        })),
      });
    }, 600);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, city, state, zip]);

  // Order + Stripe payment state
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [publishableKey, setPublishableKey] = useState<string | null>(null);

  // Processing states
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const shipping = getShippingCost();
  const total = getTotal();

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);

    // Basic address validations
    if (!firstName || !lastName || !email || !phone || !address || !city || !state || !zip) {
      setFormError(
        locale === 'ar'
          ? 'برجاء إدخال كل بيانات الشحن والتواصل المطلوبة.'
          : 'Please fill out all required shipping and contact details.'
      );
      setLoading(false);
      return;
    }

    try {
      // 1. Create the real order server-side first (this is what locks/decrements
      // inventory and recomputes the authoritative total — see backend
      // OrderController::store). Payment happens against this order, not before it.
      const customerRecord = {
        name: `${firstName} ${lastName}`,
        email,
        phone,
        address: `${address}${apartment ? ', ' + apartment : ''}`,
        city,
        state,
        zip,
      };

      const newOrder = await OrderService.createOrder(
        customerRecord,
        items,
        subtotal,
        shipping,
        discount,
        total,
        'Credit Card (Stripe)',
        appliedCoupon?.code, // previously dropped entirely — server can't validate/track a coupon it never receives
        locale,
        shippingOption === 'express' ? 'Express' : 'Standard',
        getShippingRateId()
      );

      setPlacedOrder(newOrder);

      // 2. Ask the backend for a real Stripe PaymentIntent tied to this order.
      const intent = await PaymentService.createIntent(newOrder.id, locale);
      setClientSecret(intent.client_secret);
      setPublishableKey(intent.publishable_key);
      setCheckoutStep('payment');
      setLoading(false);
    } catch (err: any) {
      setFormError(
        err.message ||
          (locale === 'ar' ? 'حدث خطأ أثناء إنشاء الطلب.' : 'An error occurred while creating your order.')
      );
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    if (placedOrder) {
      router.push(`/order-success?id=${placedOrder.id}&email=${encodeURIComponent(placedOrder.customer.email)}`);
    }
  };

  const stripePromiseMemo = useMemo(() => {
    if (!publishableKey) return null;
    return getStripe(publishableKey);
  }, [publishableKey]);

  if (items.length === 0 && checkoutStep === 'details') return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in space-y-6 pb-20 md:pb-8">
      {/* Checkout title and secure label */}
      <div className="flex items-center justify-between border-b border-light-border pb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-dark">{t('checkout.title')}</h1>
        <span className="flex items-center gap-1 bg-green-50 border border-green-200 px-3 py-1 rounded-md text-[10px] sm:text-xs font-bold text-green-700 uppercase tracking-wide">
          <Lock className="w-3.5 h-3.5" />
          <span>{locale === 'ar' ? 'دفع آمن عبر Stripe' : 'Secure Stripe Checkout'}</span>
        </span>
      </div>

      {/* Guest checkout notice */}
      {!user && checkoutStep === 'details' && (
        <div className="bg-cream border border-light-border rounded-xl px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="text-xs text-muted-text">
            {locale === 'ar'
              ? 'يمكنك إتمام الطلب بدون حساب، أو تسجيل الدخول لتجربة أسرع.'
              : 'You can checkout without an account, or sign in for a faster experience.'}
          </p>
          <div className="flex gap-2 shrink-0">
            <span className="text-xs font-bold text-primary border border-primary/30 rounded-lg px-3 py-1.5 bg-white">
              {locale === 'ar' ? '← المتابعة كضيف' : 'Continue as Guest →'}
            </span>
            <Link href="/account" className="text-xs text-muted-text hover:text-primary px-3 py-1.5 border border-light-border rounded-lg bg-white transition-colors">
              {locale === 'ar' ? 'تسجيل الدخول' : 'Sign In'}
            </Link>
          </div>
        </div>
      )}

      {checkoutStep === 'details' ? (
        <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Columns - Inputs */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white border border-light-border rounded-xl p-5 sm:p-6 space-y-4">
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider pb-2 border-b border-light-border">
                1. {t('checkout.contact')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">{t('checkout.first_name')} *</label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">{t('checkout.last_name')} *</label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">{t('checkout.email')} *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">{t('checkout.phone')} *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white border border-light-border rounded-xl p-5 sm:p-6 space-y-4">
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider pb-2 border-b border-light-border">
                2. {t('checkout.shipping')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">{t('checkout.address')} *</label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street Address, P.O. Box"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>
                <div className="sm:col-span-3 space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">{t('checkout.apartment')}</label>
                  <input
                    type="text"
                    value={apartment}
                    onChange={(e) => setApartment(e.target.value)}
                    placeholder="Apartment, Suite, Unit, Building (Optional)"
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">{t('checkout.city')} *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">{t('checkout.state')} *</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-500 uppercase">{t('checkout.zip')} *</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={zip}
                    onChange={(e) => setZip(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Options */}
            <div className="bg-white border border-light-border rounded-xl p-5 sm:p-6 space-y-4">
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider pb-2 border-b border-light-border">
                3. {t('checkout.delivery_method')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setShippingOption('standard')}
                  className={`p-4 rounded-xl border text-left rtl:text-right flex flex-col justify-between h-24 transition-all ${
                    shippingOption === 'standard'
                      ? 'bg-cream/40 border-primary ring-1 ring-primary/20'
                      : 'bg-white border-light-border hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-bold text-sm text-dark">{t('zip.standard')}</span>
                    <span className="text-xs text-primary font-bold">{formatPrice(standardRate, locale)}</span>
                  </div>
                  <span className="text-xs text-gray-500">Delivered in 3–5 business days</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShippingOption('express')}
                  className={`p-4 rounded-xl border text-left rtl:text-right flex flex-col justify-between h-24 transition-all ${
                    shippingOption === 'express'
                      ? 'bg-cream/40 border-primary ring-1 ring-primary/20'
                      : 'bg-white border-light-border hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="font-bold text-sm text-dark">{t('zip.express')}</span>
                    <span className="text-xs text-primary font-bold">{formatPrice(expressRate, locale)}</span>
                  </div>
                  <span className="text-xs text-gray-500">Delivered in 1–2 business days</span>
                </button>
              </div>
            </div>

            <div className="bg-white border border-light-border rounded-xl p-5 sm:p-6 space-y-2">
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider pb-2 border-b border-light-border flex items-center gap-1.5">
                <CreditCard className="w-5 h-5 text-gold" />
                <span>4. {t('checkout.payment')}</span>
              </h2>
              <p className="text-xs text-gray-500">
                {locale === 'ar'
                  ? 'بعد تأكيد بيانات الشحن، هننقلك لصفحة دفع آمنة من Stripe لإدخال بيانات البطاقة.'
                  : "After confirming your shipping details, you'll enter your card details on Stripe's secure payment step."}
              </p>
            </div>
          </div>

          {/* Right Column - Review Panel */}
          <div className="space-y-6">
            <div className="border border-light-border rounded-xl p-5 bg-cream/35 space-y-6">
              <h3 className="font-bold text-sm text-primary uppercase tracking-wider pb-3 border-b border-light-border flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-gold" />
                <span>5. {locale === 'ar' ? 'مراجعة وتأكيد الطلب' : 'Order Review'}</span>
              </h3>

              <div className="divide-y divide-light-border max-h-56 overflow-y-auto no-scrollbar">
                {items.map((item, idx) => {
                  const itemPrice = item.product.purchaseOptions[item.option].price;
                  return (
                    <div key={idx} className="py-2.5 flex justify-between text-xs gap-3">
                      <div className="space-y-0.5">
                        <strong className="text-dark line-clamp-1">
                          {locale === 'ar' ? item.product.arabicName : item.product.name}
                        </strong>
                        <span className="text-gray-500 text-[10px] block">
                          {item.quantity} x {getPurchaseOptionLabel(item.product.purchaseOptions, item.option, locale, item.product.sellingUnit)}
                        </span>
                      </div>
                      <span className="font-bold text-primary flex-shrink-0">
                        {formatPrice(itemPrice * item.quantity, locale)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2.5 text-xs text-gray-600 border-t border-b border-light-border py-4">
                <div className="flex justify-between">
                  <span>{t('cart.subtotal')}</span>
                  <span className="font-semibold text-dark">{formatPrice(subtotal, locale)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-700 font-semibold">
                    <span>{locale === 'ar' ? 'الخصم' : 'Discount'}</span>
                    <span>-{formatPrice(discount, locale)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>{locale === 'ar' ? 'تكلفة الشحن' : 'Shipping Cost'}</span>
                  <span className="font-semibold text-dark">{formatPrice(shipping, locale)}</span>
                </div>

                <p className="text-[10px] text-gray-400 pt-1">
                  {locale === 'ar'
                    ? 'الضريبة والإجمالي النهائي يتم احتسابهما وتأكيدهما من السيرفر عند إنشاء الطلب.'
                    : 'Tax and the final total are calculated and confirmed server-side when the order is created.'}
                </p>
              </div>

              <div className="flex justify-between items-baseline pt-1">
                <span className="font-bold text-sm text-dark">{locale === 'ar' ? 'الإجمالي التقديري' : 'Est. Total'}</span>
                <span className="font-bold text-xl text-primary">{formatPrice(total, locale)}</span>
              </div>

              {formError && (
                <p className="text-xs text-red-600 font-semibold bg-red-50 border border-red-200 p-2.5 rounded-lg">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-lg font-bold text-sm text-center flex items-center justify-center gap-2 shadow-md transition-all ${
                  loading
                    ? 'bg-gray-400 text-gray-100 cursor-not-allowed'
                    : 'bg-primary hover:bg-primary-dark text-cream'
                }`}
              >
                {loading
                  ? locale === 'ar' ? 'جارٍ إنشاء الطلب...' : 'Placing order...'
                  : locale === 'ar' ? 'المتابعة للدفع' : 'Continue to payment'}
                <ChevronRight className="w-4 h-4 rtl:rotate-180" />
              </button>

              <Link href="/cart" className="text-xs text-primary font-bold hover:underline block text-center">
                {locale === 'ar' ? 'تعديل عناصر السلة' : 'Edit Cart Items'}
              </Link>
            </div>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-light-border rounded-xl p-5 sm:p-6 space-y-4">
              <h2 className="text-sm font-bold text-primary uppercase tracking-wider pb-2 border-b border-light-border flex items-center gap-1.5">
                <CreditCard className="w-5 h-5 text-gold" />
                <span>{locale === 'ar' ? 'إتمام الدفع' : 'Complete payment'}</span>
              </h2>
              <p className="text-xs text-gray-500">
                {locale === 'ar'
                  ? `تم إنشاء طلبك رقم ${placedOrder?.id}. أدخل بيانات البطاقة بالأسفل لإتمام الدفع.`
                  : `Your order ${placedOrder?.id} has been created. Enter your card details below to complete payment.`}
              </p>

              {clientSecret && stripePromiseMemo ? (
                <Elements stripe={stripePromiseMemo} options={{ clientSecret }}>
                  <StripePaymentForm
                    locale={locale}
                    returnUrl={typeof window !== 'undefined' && placedOrder ? `${window.location.origin}/order-success?id=${placedOrder.id}&email=${encodeURIComponent(placedOrder.customer.email)}` : ''}
                    onSuccess={handlePaymentSuccess}
                  />
                </Elements>
              ) : (
                <p className="text-xs text-red-600 font-semibold bg-red-50 border border-red-200 p-2.5 rounded-lg">
                  {locale === 'ar'
                    ? 'تعذر تحميل نموذج الدفع. برجاء المحاولة مرة أخرى.'
                    : 'Could not load the payment form. Please try again.'}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="border border-light-border rounded-xl p-5 bg-cream/35 space-y-4">
              <h3 className="font-bold text-sm text-primary uppercase tracking-wider pb-3 border-b border-light-border">
                {locale === 'ar' ? 'ملخص الطلب' : 'Order Summary'}
              </h3>
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-sm text-dark">{locale === 'ar' ? 'الإجمالي' : 'Total'}</span>
                <span className="font-bold text-xl text-primary">{formatPrice(placedOrder?.total ?? total, locale)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
