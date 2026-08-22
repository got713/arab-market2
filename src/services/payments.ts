import { loadStripe, Stripe } from '@stripe/stripe-js';
import { ApiClient } from '../lib/api-client';

// Real Stripe integration. The old version of this file simulated success and
// called the webhook endpoint directly from the browser — that never touched
// Stripe at all. Real payments now flow as:
//   1. Order is created server-side (OrderService.createOrder) with payment_status
//      'pending' and stock already reserved.
//   2. PaymentService.createIntent() asks the backend for a real Stripe
//      PaymentIntent tied to that order (backend/OrderController::createPaymentIntent).
//   3. The frontend mounts Stripe's own <PaymentElement/> using the returned
//      client_secret and calls stripe.confirmPayment() — card details never touch
//      our own state/servers, Stripe handles that (this is also what makes it PCI
//      compliant, unlike the old raw <input> fields).
//   4. Stripe calls our webhook (signature-verified) to confirm success/failure and
//      flip the order to paid/confirmed.

let stripePromise: Promise<Stripe | null> | null = null;
let stripePromiseKey: string | null = null;

/**
 * Returns a cached Stripe.js instance for the given publishable key. The key
 * comes from the backend (config/services.php -> STRIPE_KEY) rather than being
 * hardcoded on the frontend, so switching Stripe accounts only requires an env
 * change on the backend.
 */
export const getStripe = (publishableKey: string): Promise<Stripe | null> => {
  if (!publishableKey) {
    return Promise.resolve(null);
  }
  if (!stripePromise || stripePromiseKey !== publishableKey) {
    stripePromiseKey = publishableKey;
    stripePromise = loadStripe(publishableKey);
  }
  return stripePromise;
};

export interface PaymentIntentResponse {
  client_secret: string;
  publishable_key: string;
  amount: number;
  order_number: string;
}

export const PaymentService = {
  /**
   * Creates (or re-fetches) a real Stripe PaymentIntent for an order that
   * already exists in the database. Throws if the backend isn't configured
   * with real Stripe keys yet (see backend/.env STRIPE_SECRET).
   */
  createIntent: async (orderNumber: string, locale: 'en' | 'ar' = 'en'): Promise<PaymentIntentResponse> => {
    return ApiClient.post<PaymentIntentResponse>(
      '/payments/stripe/intent',
      { order_number: orderNumber },
      undefined,
      locale
    );
  },

  /**
   * Called right after Stripe.js confirms the payment succeeded (see
   * checkout/page.tsx handlePaymentSuccess) — tells the backend to
   * independently re-verify the PaymentIntent with Stripe, mark the order
   * paid, and send the order-confirmation emails. Doesn't rely on the Stripe
   * Dashboard webhook being configured correctly, which is easy to get wrong.
   * Best-effort from the caller's side: a failure here should never block the
   * customer from seeing their order-success page, since the order and
   * payment already succeeded — just log/ignore and let the (also-existing)
   * webhook catch it eventually if this call fails.
   */
  confirmPayment: async (orderNumber: string, locale: 'en' | 'ar' = 'en'): Promise<{ status: string }> => {
    return ApiClient.post<{ status: string }>(
      `/orders/${orderNumber}/confirm-payment`,
      {},
      undefined,
      locale
    );
  },
};
