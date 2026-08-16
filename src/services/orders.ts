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

  getOrderById: async (id: string, email: string, locale: 'en' | 'ar' = 'en'): Promise<Order | null> => {
    try {
      return await OrderService.trackOrder(id, email, locale);
    } catch (err) {
      return null;
    }
  },

  // The authenticated customer's own order history — the backend derives
  // "whose orders" entirely from the Sanctum token (see
  // OrderController::myOrders, scoped via $request->user()->orders()), never
  // from a client-supplied email. Previously this incorrectly called the
  // admin-only /admin/orders?search= endpoint, which 403s for a real customer.
  getMyOrders: async (locale: 'en' | 'ar' = 'en'): Promise<Order[]> => {
    try {
      const res = await ApiClient.get<any[]>('/orders/my', undefined, locale);
      return Array.isArray(res) ? res.map((o) => OrderService.formatOrder(o)) : [];
    } catch (err) {
      return [];
    }
  },

  createOrder: async (
    customer: OrderCustomer,
    items: CartItem[],
    shippingMethod: 'standard' | 'express',
    discount: number,
    paymentMethod: string,
    couponCode?: string,
    locale: 'en' | 'ar' = 'en'
  ): Promise<Order> => {
    // Shipping cost is deliberately NOT sent here — the backend derives it
    // server-side from shipping_zip + shipping_method (see
    // OrderController::resolveShippingCost) so it can't be tampered with by
    // sending a manipulated shipping_cost value. Only the method identifier
    // ('standard' | 'express') is sent.
    const payload = {
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      shipping_address: customer.address,
      shipping_city: customer.city,
      shipping_state: customer.state,
      shipping_zip: customer.zip,
      shipping_method: shippingMethod,
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

  // Takes the order's internal database id directly (admin already has this
  // from the /admin/orders list) rather than re-resolving it through the
  // public tracking endpoint — that endpoint now requires the customer's
  // email as a second factor (see trackOrder below) and admins updating
  // order status don't necessarily have that on hand.
  updateOrderStatus: async (
    orderDatabaseId: number | string,
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

  // Public order lookup — requires the order number AND the email used on the
  // order, matching the backend's OrderController::track(). A bare order
  // number is not enough to view another customer's name/email/phone/address.
  trackOrder: async (query: string, email: string, locale: 'en' | 'ar' = 'en'): Promise<Order | null> => {
    try {
      const q = query.trim();
      const e = email.trim();
      if (!q || !e) return null;
      const res = await ApiClient.get<any>(`/orders/track/${q}`, { params: { email: e } }, locale);
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
