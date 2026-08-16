import { ApiClient } from '../lib/api-client';

export interface PaymentDetails {
  cardNumber: string;
  expiry: string;
  cvc: string;
  nameOnCard: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId: string;
  error?: string;
}

export const PaymentService = {
  processPayment: async (amount: number, details: PaymentDetails, orderNumber?: string, locale: 'en' | 'ar' = 'en'): Promise<PaymentResponse> => {
    try {
      // 1. If we have an order number, create Stripe Payment Intent in Laravel backend
      if (orderNumber) {
        const intent = await ApiClient.post<any>('/payments/stripe/intent', { 
          order_number: orderNumber 
        }, undefined, locale);

        // 2. Simulate client-side success (matching Stripe Element confirmPayment)
        // 3. Inform backend via mock webhook call to mark order as confirmed/paid
        await ApiClient.post<any>('/payments/stripe/webhook', {
          order_number: orderNumber,
          status: 'succeeded',
          transaction_id: intent.client_secret || 'tx_mock_123'
        }, undefined, locale);

        return {
          success: true,
          transactionId: intent.transaction_id || 'tx_mock_123'
        };
      }

      // Fallback local validation
      if (details.cardNumber.replace(/\s+/g, '').length < 15) {
        return { success: false, transactionId: '', error: 'Invalid card number' };
      }

      return {
        success: true,
        transactionId: `TXN-MOCK-${Math.floor(10000000 + Math.random() * 90000000)}`
      };
    } catch (err: any) {
      return {
        success: false,
        transactionId: '',
        error: err.message || 'Payment processing failed.'
      };
    }
  }
};
