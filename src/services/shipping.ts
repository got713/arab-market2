const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

export interface ShippingRate {
  id: string;
  name: string;
  arabicName: string;
  price: number;
  minDays: number;
  maxDays: number;
}

export const ShippingService = {
  checkAvailability: async (zip: string): Promise<{
    available: boolean;
    rates: ShippingRate[];
  }> => {
    await delay(300); // Simulate network latency
    const isValid = /^\d{5}$/.test(zip);
    // Simulate some restricted ZIP codes (e.g. starting with '00' or '999')
    const isSupported = isValid && !zip.startsWith('00') && !zip.startsWith('999');

    if (!isSupported) {
      return { available: false, rates: [] };
    }

    return {
      available: true,
      rates: [
        {
          id: 'standard',
          name: 'Standard Delivery',
          arabicName: 'الشحن القياسي',
          price: 7.99,
          minDays: 3,
          maxDays: 5,
        },
        {
          id: 'express',
          name: 'Express Delivery',
          arabicName: 'الشحن السريع',
          price: 14.99,
          minDays: 1,
          maxDays: 2,
        },
      ],
    };
  },
};
