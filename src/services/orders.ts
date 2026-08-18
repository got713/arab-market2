import { Order, CartItem, OrderCustomer } from '../types';
import { ApiClient } from '../lib/api-client';

export const OrderService = {
  getOrders: async (params?: any, locale: 'en' | 'ar' = 'en'): Promise<Order[]> => {
    try {
      const res = await ApiClient.get<any>('/admin/orders', { params }, locale);
      const data = res.data || res;
      return Array.isArray(data) ? data.map(o => OrderService.formatOrder(o)) : [];
    } catch (err) {
      return [];
    }
  },

  // email is required now — the backend track endpoint uses it as a second
  // factor (order_number alone isn't secret) and 404s without it.
  getOrderById: async (id: string, email: string, locale: 'en' | 'ar' = 'en'): Promise<Order | null> => {
    try {
      return await OrderService.trackOrder(id, email, locale);
    } catch (err) {
      return null;
    }
  },

  getOrdersByCustomerEmail: async (email: string, locale: 'en' | 'ar' = 'en'): Promise<Order[]> => {
    return OrderService.getOrders({ search: email }, locale);
  },

  // The authenticated user's own order history (backend: GET /orders/my,
  // scoped server-side to the Sanctum-authenticated user — never trusted
  // from a client-supplied id/email).
  getMyOrders: async (locale: 'en' | 'ar' = 'en'): Promise<Order[]> => {
    try {
      const res = await ApiClient.get<any>('/orders/my', undefined, locale);
      const data = res.data || res;
      return Array.isArray(data) ? data.map((o: any) => OrderService.formatOrder(o)) : [];
    } catch (err) {
      return [];
    }
  },

  createOrder: async (
    customer: OrderCustomer,
    items: CartItem[],
    subtotal: number,
    shipping: number,
    discount: number,
    total: number,
    paymentMethod: string,
    couponCode?: string,
    locale: 'en' | 'ar' = 'en',
    shippingMethodLabel: string = 'Standard',
    shippingRateId?: string | null
  ): Promise<Order> => {
    const payload = {
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      shipping_address: customer.address,
      shipping_city: customer.city,
      shipping_state: customer.state,
      shipping_zip: customer.zip,
      shipping_method: shippingMethodLabel,
      shipping_cost: shipping,
      shipping_rate_id: shippingRateId || null,
      coupon_code: couponCode || null,
      payment_method: paymentMethod,
      items: items.map(i => ({
        product_id: i.product.id,
        option: i.option,
        quantity: i.quantity
      })),
      notes: ''
    };

    const res = await ApiClient.post<any>('/orders', payload, undefined, locale);
    return OrderService.formatOrder(res.order);
  },

  // Takes the order's Laravel auto-increment id directly (what the admin
  // orders list already has via Order.databaseId) — previously this looked
  // the order back up by order_number via trackOrder() first, which never
  // matched a databaseId being passed in and was pure overhead anyway.
  updateOrderStatus: async (
    orderDatabaseId: number,
    status: Order['status'],
    paymentStatus?: string,
    locale: 'en' | 'ar' = 'en'
  ): Promise<Order> => {
    const targetStatus = status.toLowerCase();

    const res = await ApiClient.put<any>(`/admin/orders/${orderDatabaseId}/status`, {
      status: targetStatus,
      payment_status: paymentStatus
    }, undefined, locale);

    return OrderService.formatOrder(res);
  },

  // email is required — the backend validates it against the order's
  // customer_email as a second factor, since the order number alone is
  // guessable/leakable and previously exposed the full order (name, email,
  // phone, address) to anyone who had it.
  trackOrder: async (query: string, email: string, locale: 'en' | 'ar' = 'en'): Promise<Order | null> => {
    try {
      const q = query.trim();
      if (!q || !email.trim()) return null;
      const res = await ApiClient.get<any>(`/orders/track/${q}`, { params: { email: email.trim() } }, locale);
      return OrderService.formatOrder(res);
    } catch (err) {
      return null;
    }
  },

  formatOrder: (o: any): Order => {
    if (!o) return null as any;
    
    // Map order status to match UI expects capitalized
    const statusMap: Record<string, string> = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'processing': 'Processing',
      'packed': 'Packed',
      'shipped': 'Shipped',
      'out_for_delivery': 'Out for Delivery',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
    };

    // Format items
    const formattedItems: CartItem[] = (o.items || []).map((item: any) => {
      const prod = item.product || {};
      const imageUrl = prod.images && prod.images.length > 0 
        ? prod.images[0].url || prod.images[0] 
        : 'https://placehold.co/400x400/FDF8F0/6B6355?text=No+Image';

      return {
        id: item.id,
        option: item.option || 'single',
        quantity: item.quantity,
        price: Number(item.price),
        product: {
          id: String(prod.id),
          name: prod.name,
          slug: prod.slug,
          arabicName: prod.arabic_name,
          brand: prod.brand,
          price: Number(prod.price),
          images: [imageUrl],
          weight: prod.weight || '',
          stock: prod.inventory ? prod.inventory.stock_quantity : 0,
          purchaseOptions: {
            single: { price: Number(prod.price), quantity: 1 },
            pack: { price: Number(prod.pack_price), quantity: prod.pack_quantity || 6 },
            case: { price: Number(prod.case_price), quantity: prod.case_quantity || 12 },
          }
        }
      };
    });

    return {
      id: o.order_number,
      databaseId: o.id, // Store Laravel auto-increment ID
      customer: {
        name: o.customer_name,
        email: o.customer_email,
        phone: o.customer_phone,
        address: o.shipping_address,
        city: o.shipping_city,
        state: o.shipping_state,
        zip: o.shipping_zip,
      },
      items: formattedItems,
      subtotal: Number(o.subtotal),
      shipping: Number(o.shipping_cost),
      discount: Number(o.discount),
      total: Number(o.total),
      paymentMethod: o.payment_method,
      paymentStatus: o.payment_status,
      status: (statusMap[o.status] || o.status) as Order['status'],
      date: o.created_at,
      trackingNumber: o.tracking_number || '',
    };
  }
};
