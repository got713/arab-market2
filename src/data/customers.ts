import { Customer } from '../types';

export const seedCustomers: Customer[] = [
  {
    id: 'cust-101',
    name: 'Ahmed Al-Masri',
    email: 'ahmed.masri@gmail.com',
    ordersCount: 3,
    totalSpent: 86.54,
    lastOrderDate: '2026-08-12',
    status: 'Active'
  },
  {
    id: 'cust-102',
    name: 'Sarah Mansour',
    email: 'sarah.mansour@yahoo.com',
    ordersCount: 5,
    totalSpent: 412.30,
    lastOrderDate: '2026-08-08',
    status: 'Active'
  },
  {
    id: 'cust-103',
    name: 'Yasmine Haddad',
    email: 'yasmine.h@outlook.com',
    ordersCount: 2,
    totalSpent: 125.80,
    lastOrderDate: '2026-07-28',
    status: 'Active'
  },
  {
    id: 'cust-104',
    name: 'Tareq Farooq',
    email: 'tareq.f@gmail.com',
    ordersCount: 1,
    totalSpent: 71.99,
    lastOrderDate: '2026-07-22',
    status: 'Inactive'
  },
  {
    id: 'cust-105',
    name: 'Khaled bin Walid',
    email: 'khaled.walid@hotmail.com',
    ordersCount: 12,
    totalSpent: 1045.50,
    lastOrderDate: '2026-08-10',
    status: 'Active'
  },
  {
    id: 'cust-106',
    name: 'Fatima El-Fassi',
    email: 'fatima.fassi@gmail.com',
    ordersCount: 4,
    totalSpent: 189.60,
    lastOrderDate: '2026-08-05',
    status: 'Active'
  }
];
