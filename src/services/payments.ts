const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

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

export interface IPaymentService {
  processPayment(amount: number, details: PaymentDetails): Promise<PaymentResponse>;
}

// 1. Mock Payment Service (Active Provider)
export const MockPaymentService: IPaymentService = {
  processPayment: async (amount: number, details: PaymentDetails): Promise<PaymentResponse> => {
    await delay(1000); // Simulate transaction network delay

    // Basic Card Validation Simulation
    const cardNo = details.cardNumber.replace(/\s+/g, '');
    if (cardNo.length < 15 || cardNo.length > 16) {
      return {
        success: false,
        transactionId: '',
        error: 'Invalid card number length. Must be 15 or 16 digits.',
      };
    }

    if (!/^\d+$/.test(cardNo)) {
      return {
        success: false,
        transactionId: '',
        error: 'Card number must contain digits only.',
      };
    }

    if (!/^\d{2}\/\d{2}$/.test(details.expiry)) {
      return {
        success: false,
        transactionId: '',
        error: 'Expiry date must follow MM/YY format.',
      };
    }

    const cvc = details.cvc.trim();
    if (cvc.length < 3 || cvc.length > 4 || !/^\d+$/.test(cvc)) {
      return {
        success: false,
        transactionId: '',
        error: 'CVC must be 3 or 4 digits.',
      };
    }

    // Success transaction simulation (no actual billing occurs)
    return {
      success: true,
      transactionId: `TXN-MOCK-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    };
  }
};

// 2. Stripe Payment Service Stub (Prepared for future production use)
export const StripePaymentService: IPaymentService = {
  processPayment: async (amount: number, details: PaymentDetails): Promise<PaymentResponse> => {
    console.log(`[StripePaymentService] Processing payment of $${amount} via Stripe API.`);
    // TODO: Integrate Stripe Web SDK and charge via secure API token
    return {
      success: false,
      transactionId: '',
      error: 'Stripe Payment Service is not yet configured.'
    };
  }
};

// 3. PayPal Payment Service Stub (Prepared for future production use)
export const PayPalPaymentService: IPaymentService = {
  processPayment: async (amount: number, details: PaymentDetails): Promise<PaymentResponse> => {
    console.log(`[PayPalPaymentService] Processing payment of $${amount} via PayPal SDK.`);
    // TODO: Redirect/Init PayPal checkout flows
    return {
      success: false,
      transactionId: '',
      error: 'PayPal Payment Service is not yet configured.'
    };
  }
};

// Main Export pointing to active service
export const PaymentService = MockPaymentService;
