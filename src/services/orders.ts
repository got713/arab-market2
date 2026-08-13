import { Order, CartItem, OrderCustomer } from '../types';
import { db } from './db';

const delay = (ms = 100) => new Promise((resolve) => setTimeout(resolve, ms));

export const OrderService = {
  getOrders: async (): Promise<Order[]> => {
    await delay();
    return db.getOrders();
  },

  getOrderById: async (id: string): Promise<Order | null> => {
    await delay();
    const list = db.getOrders();
    return list.find((o) => o.id === id) || null;
  },

  getOrdersByCustomerEmail: async (email: string): Promise<Order[]> => {
    await delay();
    const list = db.getOrders();
    return list.filter((o) => o.customer.email.toLowerCase() === email.toLowerCase());
  },

  createOrder: async (
    customer: OrderCustomer,
    items: CartItem[],
    subtotal: number,
    shipping: number,
    discount: number,
    total: number,
    paymentMethod: string
  ): Promise<Order> => {
    await delay();
    const list = db.getOrders();
    
    // Generate order ID like AM-10483
    let nextNum = 10001;
    if (list.length > 0) {
      const numericIds = list
        .map((o) => parseInt(o.id.replace('AM-', '')))
        .filter((n) => !isNaN(n));
      if (numericIds.length > 0) {
        nextNum = Math.max(...numericIds) + 1;
      }
    }

    const orderId = `AM-${nextNum}`;
    const trackingNumber = `TRK-${Math.floor(100000000 + Math.random() * 900000000)}`;

    const newOrder: Order = {
      id: orderId,
      customer,
      items,
      subtotal,
      shipping,
      discount,
      total,
      paymentMethod,
      status: 'Pending',
      date: new Date().toISOString(),
      trackingNumber,
    };

    list.unshift(newOrder);
    db.saveOrders(list);

    // Also update or add customer details in admin customers database
    const customers = db.getCustomers();
    const customerIndex = customers.findIndex(
      (c) => c.email.toLowerCase() === customer.email.toLowerCase()
    );

    if (customerIndex > -1) {
      customers[customerIndex].ordersCount += 1;
      customers[customerIndex].totalSpent = Number((customers[customerIndex].totalSpent + total).toFixed(2));
      customers[customerIndex].lastOrderDate = new Date().toISOString().split('T')[0];
      customers[customerIndex].status = 'Active';
    } else {
      customers.unshift({
        id: `cust-${Date.now()}`,
        name: customer.name || 'Customer',
        email: customer.email,
        ordersCount: 1,
        totalSpent: Number(total.toFixed(2)),
        lastOrderDate: new Date().toISOString().split('T')[0],
        status: 'Active',
      });
    }
    db.saveCustomers(customers);

    // Update product stock counts
    const products = db.getProducts();
    items.forEach((item) => {
      const prodIndex = products.findIndex((p) => p.id === item.product.id);
      if (prodIndex > -1) {
        // Option quantities: single = 1, pack = 6, case = 12
        const qtyToReduce =
          item.quantity * (item.option === 'single' ? 1 : item.option === 'pack' ? 6 : 12);
        products[prodIndex].stock = Math.max(0, products[prodIndex].stock - qtyToReduce);
      }
    });
    db.saveProducts(products);

    return newOrder;
  },

  updateOrderStatus: async (
    orderId: string,
    status: Order['status']
  ): Promise<Order> => {
    await delay();
    const list = db.getOrders();
    const index = list.findIndex((o) => o.id === orderId);
    if (index === -1) throw new Error('Order not found');
    list[index].status = status;
    db.saveOrders(list);
    return list[index];
  },

  trackOrder: async (query: string): Promise<Order | null> => {
    await delay();
    const q = query.trim().toUpperCase();
    if (!q) return null;
    const list = db.getOrders();
    return (
      list.find(
        (o) => o.id === q || o.trackingNumber === q || o.id.replace('AM-', '') === q
      ) || null
    );
  },
};
