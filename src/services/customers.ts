import { Customer, Order } from '../types';
import { ApiClient } from '../lib/api-client';
import { OrderService } from './orders';

interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}

export interface CustomerListParams {
  search?: string;
  status?: 'active' | 'inactive';
  page?: number;
  [key: string]: string | number | boolean | undefined;
}

// Shape returned by CustomerController — see backend/app/Http/Controllers/Api/V1/CustomerController.php
interface CustomerApiRow {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  orders_count: number;
  total_spent: number;
  last_order_at: string | null;
  created_at: string;
}

interface OrderApiRow {
  [key: string]: unknown;
}

function formatCustomer(c: CustomerApiRow): Customer {
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone || undefined,
    isActive: Boolean(c.is_active),
    ordersCount: Number(c.orders_count || 0),
    totalSpent: Number(c.total_spent || 0),
    lastOrderAt: c.last_order_at || null,
    createdAt: c.created_at,
  };
}

export const CustomerService = {
  getCustomers: async (
    params: CustomerListParams = {},
    locale: 'en' | 'ar' = 'en'
  ): Promise<{ customers: Customer[]; currentPage: number; lastPage: number; total: number }> => {
    const res = await ApiClient.get<PaginatedResponse<CustomerApiRow>>('/admin/customers', { params }, locale);
    return {
      customers: (res.data || []).map(formatCustomer),
      currentPage: res.current_page,
      lastPage: res.last_page,
      total: res.total,
    };
  },

  getCustomerById: async (id: number, locale: 'en' | 'ar' = 'en'): Promise<Customer> => {
    const res = await ApiClient.get<CustomerApiRow>(`/admin/customers/${id}`, undefined, locale);
    return formatCustomer(res);
  },

  getCustomerOrders: async (id: number, locale: 'en' | 'ar' = 'en'): Promise<Order[]> => {
    const res = await ApiClient.get<PaginatedResponse<OrderApiRow>>(`/admin/customers/${id}/orders`, undefined, locale);
    return (res.data || []).map((o) => OrderService.formatOrder(o));
  },

  setCustomerActive: async (id: number, isActive: boolean, locale: 'en' | 'ar' = 'en'): Promise<{ id: number; isActive: boolean }> => {
    const res = await ApiClient.put<{ id: number; is_active: boolean }>(`/admin/customers/${id}/status`, { is_active: isActive }, undefined, locale);
    return { id: res.id, isActive: Boolean(res.is_active) };
  },
};
