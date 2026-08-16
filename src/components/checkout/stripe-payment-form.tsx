'use client';

import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Lock } from 'lucide-react';

interface StripePaymentFormProps {
  locale: 'en' | 'ar';
  returnUrl: string;
  onSuccess: () => void;
}

/**
 * Must be rendered inside a Stripe <Elements> provider (see checkout/page.tsx).
 * Uses Stripe's own PaymentElement UI, so raw card numbers never enter our own
 * component state or get sent to our backend — Stripe.js handles that directly
 * with Stripe's servers, which is both the secure and the PCI-compliant way to
 * do this (the previous version of checkout captured raw card digits into React
 * state and never sent them to Stripe at all).
 */
export default function StripePaymentForm({ locale, returnUrl, onSuccess }: StripePaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setSubmitting(true);
    setError('');

    // redirect: 'if_required' keeps card payments on this page (no bounce to a
    // separate Stripe page) unless the payment method genuinely requires a
    // redirect (e.g. certain bank-redirect methods), in which case Stripe sends
    // the customer to returnUrl itself.
    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
      },
      redirect: 'if_required',
    });

    if (confirmError) {
      setError(
        confirmError.message ||
          (locale === 'ar' ? 'تعذر إتمام الدفع. حاول مرة أخرى.' : 'Payment could not be completed. Please try again.')
      );
      setSubmitting(false);
      return;
    }

    if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing')) {
      onSuccess();
      return;
    }

    setError(locale === 'ar' ? 'حالة الدفع غير معروفة، برجاء المحاولة مرة أخرى.' : 'Unexpected payment status. Please try again.');
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />

      {error && (
        <p className="text-xs text-red-600 font-semibold bg-red-50 border border-red-200 p-2.5 rounded-lg">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!stripe || submitting}
        className={`w-full py-3.5 rounded-lg font-bold text-sm text-center flex items-center justify-center gap-2 shadow-md transition-all ${
          submitting || !stripe
            ? 'bg-gray-400 text-gray-100 cursor-not-allowed'
            : 'bg-primary hover:bg-primary-dark text-cream'
        }`}
      >
        <Lock className="w-4 h-4" />
        {submitting
          ? locale === 'ar' ? 'جارٍ معالجة الدفع...' : 'Processing payment...'
          : locale === 'ar' ? 'ادفع الآن' : 'Pay now'}
      </button>
    </form>
  );
}
