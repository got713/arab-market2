'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart-store';
import { useLocaleStore } from '@/store/locale-store';
import { useAuthStore } from '@/store/auth-store';
import { formatPrice } from '@/lib/utils';
import { PaymentService } from '@/services/payments';
import { OrderService } from '@/services/orders';
import { Lock, ShoppingBag, CreditCard, ChevronRight } from 'lucide-react';
import Link from 'next/link';

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
    shippingZip
  } = useCartStore();

  // Redirect to cart if empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

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

  // Payment states
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [nameOnCard, setNameOnCard] = useState('');

  // Processing states
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const shipping = getShippingCost();
  const total = getTotal();

  const handleCardNumberChange = (value: string) => {
    // Format card number with spaces every 4 digits
    const cleaned = value.replace(/\s+/g, '').replace(/\D/g, '');
    const matches = cleaned.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length > 0) {
      setCardNumber(parts.join(' '));
    } else {
      setCardNumber(cleaned);
    }
  };

  const handleExpiryChange = (value: string) => {
    // Format as MM/YY
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      setExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`);
    } else {
      setExpiry(cleaned);
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setLoading(true);

    // Basic address validations
    if (!firstName || !lastName || !email || !phone || !address || !city || !state || !zip) {
      setFormError('Please fill out all required shipping and contact details.');
      setLoading(false);
      return;
    }

    if (!cardNumber || !expiry || !cvc || !nameOnCard) {
      setFormError('Please fill out all credit card payment details.');
      setLoading(false);
      return;
    }

    try {
      // Process simulated payment
      const paymentRes = await PaymentService.processPayment(total, {
        cardNumber,
        expiry,
        cvc,
        nameOnCard,
      });

      if (!paymentRes.success) {
        setFormError(paymentRes.error || 'Payment declined. Please check card numbers.');
        setLoading(false);
        return;
      }

      // Create Order
      const customerRecord = {
        name: `${firstName} ${lastName}`,
        email,
        phone,
        address: `${address}${apartment ? ', ' + apartment : ''}`,
        city,
        state,
        zip,
      };

      const paymentMethod = `Credit Card (Visa - **** ${cardNumber.slice(-4)})`;
      
      const newOrder = await OrderService.createOrder(
        customerRecord,
        items,
        subtotal,
        shipping,
        discount,
        total,
        paymentMethod
      );

      // Clean Cart state
      clearCart();

      // Redirect to Success
      router.push(`/order-success?id=${newOrder.id}`);
    } catch (err: any) {
      setFormError(err.message || 'An error occurred while creating order.');
      setLoading(false);
    }
  };

  if (items.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in space-y-6">
      {/* Checkout title and secure label */}
      <div className="flex items-center justify-between border-b border-light-border pb-5">
        <h1 className="text-2xl sm:text-4xl font-bold text-dark">{t('checkout.title')}</h1>
        <span className="flex items-center gap-1 bg-green-50 border border-green-200 px-3 py-1 rounded-md text-[10px] sm:text-xs font-bold text-green-700 uppercase tracking-wide">
          <Lock className="w-3.5 h-3.5" />
          <span>Secure Demo Session</span>
        </span>
      </div>

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
                  <span className="text-xs text-primary font-bold">
                    $7.99
                  </span>
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
                  <span className="text-xs text-primary font-bold">$14.99</span>
                </div>
                <span className="text-xs text-gray-500">Delivered in 1–2 business days</span>
              </button>
            </div>
          </div>

          {/* Payment details */}
          <div className="bg-white border border-light-border rounded-xl p-5 sm:p-6 space-y-4">
            <h2 className="text-sm font-bold text-primary uppercase tracking-wider pb-2 border-b border-light-border flex items-center gap-1.5">
              <CreditCard className="w-5 h-5 text-gold" />
              <span>4. {t('checkout.payment')}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-3 space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">{t('checkout.card_number')} *</label>
                <input
                  type="text"
                  required
                  placeholder="4000 1234 5678 9010"
                  value={cardNumber}
                  onChange={(e) => handleCardNumberChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-mono"
                />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">Cardholder Name *</label>
                <input
                  type="text"
                  required
                  placeholder="AHMED AL MASRI"
                  value={nameOnCard}
                  onChange={(e) => setNameOnCard(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">{t('checkout.card_expiry')} *</label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  placeholder="MM/YY"
                  value={expiry}
                  onChange={(e) => handleExpiryChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-500 uppercase">{t('checkout.card_cvc')} *</label>
                <input
                  type="password"
                  required
                  maxLength={4}
                  placeholder="123"
                  value={cvc}
                  onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm font-mono"
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-500">
              * This is a checkout demo only. Feel free to use mock numbers (e.g. 4000 1234 5678 9010). No funds will be charged.
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

            {/* Small listing */}
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
                        {item.quantity} x {t(`prod.${item.option}`)}
                      </span>
                    </div>
                    <span className="font-bold text-primary flex-shrink-0">
                      {formatPrice(itemPrice * item.quantity, locale)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Calculations lines */}
            <div className="space-y-2.5 text-xs text-gray-600 border-t border-b border-light-border py-4">
              <div className="flex justify-between">
                <span>{t('cart.subtotal')}</span>
                <span className="font-semibold text-dark">{formatPrice(subtotal, locale)}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-green-700 font-semibold">
                  <span>Discount</span>
                  <span>-{formatPrice(discount, locale)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping Cost</span>
                <span className="font-semibold text-dark">
                  {formatPrice(shipping, locale)}
                </span>
              </div>
            </div>

            {/* Total line */}
            <div className="flex justify-between items-baseline pt-1">
              <span className="font-bold text-sm text-dark">Est. Total</span>
              <span className="font-bold text-xl text-primary">{formatPrice(total, locale)}</span>
            </div>

            {/* Submit checkout button */}
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
              {loading ? 'Processing Demo Payment...' : t('checkout.place_order')}
            </button>

            <Link
              href="/cart"
              className="text-xs text-primary font-bold hover:underline block text-center"
            >
              Edit Cart Items
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
