'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/cart-store';
import { useLocaleStore } from '@/store/locale-store';
import { formatPrice } from '@/lib/utils';
import { CouponService } from '@/services/coupons';
import { 
  Trash2, 
  Minus, 
  Plus, 
  ShoppingBag, 
  Ticket, 
  ArrowRight,
  Truck,
  ShieldAlert,
  Percent
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { t, locale } = useLocaleStore();
  const { 
    items, 
    updateQuantity, 
    removeFromCart, 
    appliedCoupon, 
    applyCoupon, 
    getSubtotal, 
    getDiscountAmount, 
    getShippingCost, 
    getTotal,
    isZipChecked,
    isDeliveryAvailable,
    shippingZip,
    checkZip
  } = useCartStore();

  const [couponCode, setCouponCode] = useState(appliedCoupon?.code || '');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState(appliedCoupon ? 'Coupon applied successfully!' : '');
  const [zipInput, setZipInput] = useState(shippingZip || '');

  const subtotal = getSubtotal();
  const discount = getDiscountAmount();
  const shipping = getShippingCost();
  const total = getTotal();

  const handleQtyChange = (productId: string, option: 'single' | 'pack' | 'case', currentQty: number, change: number) => {
    updateQuantity(productId, option, currentQty + change);
  };

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');

    if (!couponCode.trim()) {
      setCouponError('Please enter a coupon code.');
      return;
    }

    try {
      const res = await CouponService.validateCoupon(couponCode, subtotal);
      if (res.valid && res.coupon) {
        applyCoupon(res.coupon);
        setCouponSuccess(`Success! ${res.coupon.discountPercent}% off applied.`);
      } else {
        setCouponError(res.error || 'Invalid coupon.');
        applyCoupon(null);
      }
    } catch (err) {
      setCouponError('Error validating coupon.');
      applyCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    applyCoupon(null);
    setCouponCode('');
    setCouponSuccess('');
    setCouponError('');
  };

  const handleZipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (/^\d{5}$/.test(zipInput)) {
      checkZip(zipInput);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-6 fade-in">
        <div className="w-16 h-16 rounded-full bg-cream mx-auto flex items-center justify-center text-primary border border-gold/20">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-dark">{t('cart.title')}</h1>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            {t('cart.empty')}
          </p>
        </div>
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-cream font-bold rounded-lg hover:bg-primary-dark transition-colors text-sm"
        >
          <span>{t('cart.continue')}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in space-y-8">
      <h1 className="text-2xl sm:text-4xl font-bold text-dark border-b border-light-border pb-4">
        {t('cart.title')}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border border-light-border rounded-xl overflow-hidden bg-white">
            <table className="w-full text-left rtl:text-right border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-light-border text-xs uppercase tracking-wider text-muted-text font-bold">
                  <th className="p-4">{t('cart.item')}</th>
                  <th className="p-4 text-center">{t('cart.qty')}</th>
                  <th className="p-4 text-right rtl:text-left">{locale === 'ar' ? 'السعر الفرعي' : 'Subtotal'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border">
                {items.map((item, idx) => {
                  const itemPrice = item.product.purchaseOptions[item.option].price;
                  const itemSubtotal = itemPrice * item.quantity;
                  return (
                    <tr key={idx} className="group hover:bg-cream/10 transition-colors">
                      {/* Product details */}
                      <td className="p-4 flex gap-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg border border-light-border bg-cream/10"
                        />
                        <div className="space-y-1">
                          <Link
                            href={`/product/${item.product.slug}`}
                            className="font-bold text-sm text-dark hover:text-primary transition-colors block"
                          >
                            {locale === 'ar' ? item.product.arabicName : item.product.name}
                          </Link>
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="bg-cream border border-gold/20 px-2 py-0.5 rounded-md font-semibold text-primary uppercase text-[10px]">
                              {t(`prod.${item.option}`)}
                            </span>
                            <span className="text-gray-400">
                              {formatPrice(itemPrice, locale)} / unit
                            </span>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.product.id, item.option)}
                            className="text-red-600 hover:text-red-800 text-xs font-semibold flex items-center gap-1 mt-2.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>{t('cart.remove')}</span>
                          </button>
                        </div>
                      </td>

                      {/* Quantity Controller */}
                      <td className="p-4">
                        <div className="flex items-center justify-center border border-gray-300 rounded-lg overflow-hidden h-9 bg-white max-w-[110px] mx-auto">
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item.product.id, item.option, item.quantity, -1)}
                            className="px-2 hover:bg-gray-100 transition-colors text-gray-500"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-dark w-8 text-center select-none">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQtyChange(item.product.id, item.option, item.quantity, 1)}
                            className="px-2 hover:bg-gray-100 transition-colors text-gray-500"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Line Item Subtotal */}
                      <td className="p-4 text-right rtl:text-left font-bold text-sm text-primary">
                        {formatPrice(itemSubtotal, locale)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ZIP Code delivery verification box */}
          <div className="border border-light-border rounded-xl p-5 bg-white space-y-4">
            <h3 className="font-bold text-sm text-dark flex items-center gap-2 uppercase tracking-wide">
              <Truck className="w-4.5 h-4.5 text-gold" />
              <span>{t('cart.shipping')}</span>
            </h3>
            <form onSubmit={handleZipSubmit} className="flex gap-2 max-w-sm">
              <input
                type="text"
                maxLength={5}
                value={zipInput}
                onChange={(e) => setZipInput(e.target.value.replace(/\D/g, ''))}
                placeholder={t('zip.placeholder')}
                className="px-4 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-base flex-1"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-cream text-xs font-bold rounded-lg hover:bg-primary-dark transition-colors"
              >
                {t('zip.check')}
              </button>
            </form>

            {isZipChecked && (
              <div className="text-xs">
                {isDeliveryAvailable ? (
                  <p className="text-green-700 font-semibold">
                    ✓ Delivery is available to <strong>{shippingZip}</strong>. Estimated standard delivery is 3-5 days.
                  </p>
                ) : (
                  <p className="text-red-600 font-semibold">
                    {t('zip.unavailable')}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Summary Box */}
        <div className="space-y-6">
          <div className="border border-light-border rounded-xl p-6 bg-cream/35 space-y-6">
            <h3 className="font-bold text-sm text-primary uppercase tracking-wider pb-3 border-b border-light-border">
              {locale === 'ar' ? 'تفاصيل الطلبية' : 'Order Summary'}
            </h3>

            {/* Calculations lines */}
            <div className="space-y-3 text-sm text-gray-600 border-b border-light-border pb-4">
              <div className="flex justify-between">
                <span>{t('cart.subtotal')}</span>
                <span className="font-semibold text-dark">{formatPrice(subtotal, locale)}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-green-700 font-semibold">
                  <span className="flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5" />
                    <span>Discount ({appliedCoupon?.code})</span>
                  </span>
                  <span>-{formatPrice(discount, locale)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>{locale === 'ar' ? 'تكلفة الشحن المقدرة' : 'Est. Shipping'}</span>
                <span className="font-semibold text-dark">
                  {shipping === 0 ? (
                    <span className="text-green-700 font-bold uppercase">{locale === 'ar' ? 'مجاني' : 'Free'}</span>
                  ) : (
                    formatPrice(shipping, locale)
                  )}
                </span>
              </div>
            </div>

            {/* Total line */}
            <div className="flex justify-between items-baseline pt-2">
              <span className="font-bold text-base text-dark">{t('cart.total')}</span>
              <span className="font-bold text-2xl text-primary">{formatPrice(total, locale)}</span>
            </div>

            {/* Checkout Action */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  if (isZipChecked && !isDeliveryAvailable) return;
                  router.push('/checkout');
                }}
                disabled={isZipChecked && !isDeliveryAvailable}
                className={`w-full py-3.5 rounded-lg font-bold text-sm text-center flex items-center justify-center gap-2 shadow-md transition-all ${
                  isZipChecked && !isDeliveryAvailable
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary hover:bg-primary-dark text-cream'
                }`}
              >
                <span>{t('cart.checkout')}</span>
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </button>

              <Link
                href="/shop"
                className="w-full block py-2.5 border border-primary/20 hover:bg-white text-primary text-xs font-bold rounded-lg text-center transition-colors"
              >
                {t('cart.continue')}
              </Link>
            </div>
          </div>

          {/* Coupon Code Block */}
          <div className="border border-light-border rounded-xl p-6 bg-white space-y-4">
            <h3 className="font-bold text-sm text-dark flex items-center gap-2 uppercase tracking-wide">
              <Ticket className="w-4.5 h-4.5 text-gold" />
              <span>{t('checkout.coupon_code')}</span>
            </h3>

            {appliedCoupon ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center justify-between">
                <div className="text-xs">
                  <span className="font-bold text-green-800 block">{appliedCoupon.code}</span>
                  <span className="text-green-700">{appliedCoupon.discountPercent}% off first order</span>
                </div>
                <button
                  onClick={handleRemoveCoupon}
                  className="text-xs text-red-600 hover:text-red-800 font-bold"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. WELCOME10"
                  className="px-3.5 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary uppercase flex-1"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-cream text-xs font-bold rounded-lg hover:bg-primary-dark transition-colors"
                >
                  {t('checkout.apply_coupon')}
                </button>
              </form>
            )}

            {couponError && <p className="text-xs text-red-600 font-medium">{couponError}</p>}
            {couponSuccess && <p className="text-xs text-green-700 font-medium">{couponSuccess}</p>}
            
            <p className="text-[10px] text-gray-500 leading-normal">
              *Coupons have minimum order requirements and cannot be combined. Type <strong>WELCOME10</strong> for 10% off.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
