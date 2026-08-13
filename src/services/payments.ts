const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

export interface PaymentDetails {
  cardNumber: string;
  expiry: string;
  cvc: string;
  nameOnCard: string;
}

export const PaymentService = {
  processPayment: async (
    amount: number,
    details: PaymentDetails
  ): Promise<{
    success: boolean;
    transactionId: string;
    error?: string;
  }> => {
    await delay(1000); // Simulate transaction delay

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

    // Success transaction simulation
    return {
      success: true,
      transactionId: `TXN-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    };
  },
};
