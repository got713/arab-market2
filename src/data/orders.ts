import { Order } from '../types';
import { products } from './products';

export const seedOrders: Order[] = [
  {
    id: 'AM-10482',
    customer: {
      name: 'Ahmed Al-Masri',
      email: 'ahmed.masri@gmail.com',
      phone: '+1 (555) 019-2834',
      address: '1428 Elm St, Apt 4B',
      city: 'New York',
      state: 'NY',
      zip: '10001'
    },
    items: [
      {
        product: products[0], // Molokhia
        option: 'case',
        quantity: 1
      },
      {
        product: products[3], // Tahini
        option: 'single',
        quantity: 2
      }
    ],
    subtotal: 63.97, // 49.99 + (6.99 * 2)
    shipping: 0, // Free over $50
    discount: 6.40, // WELCOME10 applied (10%)
    total: 57.57,
    paymentMethod: 'Credit Card (Visa - **** 4242)',
    status: 'Out for Delivery',
    date: '2026-08-12T14:32:00Z',
    trackingNumber: 'TRK-983472091'
  },
  {
    id: 'AM-10481',
    customer: {
      name: 'Sarah Mansour',
      email: 'sarah.mansour@yahoo.com',
      phone: '+1 (312) 555-9831',
      address: '455 Michigan Ave, Apt 12F',
      city: 'Chicago',
      state: 'IL',
      zip: '60611'
    },
    items: [
      {
        product: products[6], // Medjool Dates
        option: 'pack',
        quantity: 1
      },
      {
        product: products[8], // Turkish Coffee
        option: 'single',
        quantity: 1
      }
    ],
    subtotal: 102.98, // 94.99 + 7.99
    shipping: 0,
    discount: 10.30,
    total: 92.68,
    paymentMethod: 'Apple Pay',
    status: 'Delivered',
    date: '2026-08-08T09:15:00Z',
    trackingNumber: 'TRK-482103982'
  },
  {
    id: 'AM-10480',
    customer: {
      name: 'Ahmed Al-Masri',
      email: 'ahmed.masri@gmail.com',
      phone: '+1 (555) 019-2834',
      address: '1428 Elm St, Apt 4B',
      city: 'New York',
      state: 'NY',
      zip: '10001'
    },
    items: [
      {
        product: products[4], // Palestinian Olive Oil
        option: 'single',
        quantity: 1
      },
      {
        product: products[11], // Zaatar Mix
        option: 'single',
        quantity: 1
      }
    ],
    subtotal: 20.98, // 14.99 + 5.99
    shipping: 7.99,
    discount: 0,
    total: 28.97,
    paymentMethod: 'Credit Card (Visa - **** 4242)',
    status: 'Delivered',
    date: '2026-08-01T17:45:00Z',
    trackingNumber: 'TRK-108392810'
  },
  {
    id: 'AM-10479',
    customer: {
      name: 'Yasmine Haddad',
      email: 'yasmine.h@outlook.com',
      phone: '+1 (415) 555-1289',
      address: '892 Valencia St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94110'
    },
    items: [
      {
        product: products[16], // Assorted Baklava Box
        option: 'single',
        quantity: 2
      }
    ],
    subtotal: 49.98, // 24.99 * 2
    shipping: 7.99,
    discount: 0,
    total: 57.97,
    paymentMethod: 'PayPal',
    status: 'Delivered',
    date: '2026-07-28T11:20:00Z',
    trackingNumber: 'TRK-849204910'
  },
  {
    id: 'AM-10478',
    customer: {
      name: 'Tareq Farooq',
      email: 'tareq.f@gmail.com',
      phone: '+1 (713) 555-3920',
      address: '1102 Westheimer Rd',
      city: 'Houston',
      state: 'TX',
      zip: '77006'
    },
    items: [
      {
        product: products[26], // Brass Dallah
        option: 'single',
        quantity: 1
      },
      {
        product: products[5], // Al-Wazah Ceylon Tea
        option: 'pack',
        quantity: 1
      }
    ],
    subtotal: 79.98, // 29.99 + 49.99
    shipping: 0,
    discount: 7.99,
    total: 71.99,
    paymentMethod: 'Credit Card (Mastercard - **** 8910)',
    status: 'Cancelled',
    date: '2026-07-22T13:10:00Z',
    trackingNumber: ''
  }
];
