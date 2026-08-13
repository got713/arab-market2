'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/services/db';
import { OrderService } from '@/services/orders';
import { ProductService } from '@/services/products';
import { Order, Product, Customer } from '@/types';
import { formatDate, formatPrice } from '@/lib/utils';
import { 
  DollarSign, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  ArrowRight,
  ClipboardList,
  CheckCircle,
  Eye
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [lowStock, setLowStock] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats computed from local data
  const [stats, setStats] = useState({
    revenue: 48920.00, // Pre-seeded starting point + new orders
    ordersCount: 1284,
    customersCount: 892,
    productsCount: 164,
    aov: 38.10
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        const oList = await OrderService.getOrders();
        const pList = await ProductService.getProducts(true);
        const cList = db.getCustomers();

        setOrders(oList);
        setProducts(pList);
        setCustomers(cList);

        // Filter low stock
        const low = pList.filter((p) => p.stock < 15);
        setLowStock(low.slice(0, 5));

        // Calculate dynamic additions to seeds
        const dynamicRevenue = oList.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.total : 0), 0);
        // Base seed revenue is $48,920. Add dynamic orders to represent active dashboard
        const baseRev = 48920.00;
        const baseOrders = 1284;
        const baseCustomers = 892;
        
        const finalRevenue = baseRev + dynamicRevenue;
        const finalOrders = baseOrders + oList.length;
        const finalCustomers = baseCustomers + cList.length - 6; // Deduct seed customer count overlap
        
        setStats({
          revenue: finalRevenue,
          ordersCount: finalOrders,
          customersCount: finalCustomers,
          productsCount: pList.length,
          aov: Number((finalRevenue / finalOrders).toFixed(2))
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const handleStatusChange = async (orderId: string, status: Order['status']) => {
    try {
      await OrderService.updateOrderStatus(orderId, status);
      // Reload orders to reflect update
      const oList = await OrderService.getOrders();
      setOrders(oList);
    } catch (err) {
      alert('Error updating order status');
    }
  };

  // SVG Chart Dimensions & Plots
  // Dynamic line chart for sales over months
  const chartPoints = "10,90 30,75 50,85 70,60 90,40 110,48 130,30 150,20";
  // Dynamic bar values
  const orderBars = [
    { label: 'Jan', val: 40 },
    { label: 'Feb', val: 55 },
    { label: 'Mar', val: 45 },
    { label: 'Apr', val: 70 },
    { label: 'May', val: 80 },
    { label: 'Jun', val: 65 },
    { label: 'Jul', val: 95 },
    { label: 'Aug', val: 110 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 fade-in">
      
      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        
        {/* Total Revenue */}
        <div className="bg-white border border-light-border p-5 rounded-xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Revenue</span>
            <strong className="text-xl font-bold text-dark">{formatPrice(stats.revenue)}</strong>
            <span className="text-[10px] text-green-600 font-semibold flex items-center gap-0.5 leading-none">
              <TrendingUp className="w-3 h-3" />
              <span>+12% vs last month</span>
            </span>
          </div>
          <div className="p-3 bg-green-50 text-green-700 rounded-lg">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Orders count */}
        <div className="bg-white border border-light-border p-5 rounded-xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Orders</span>
            <strong className="text-xl font-bold text-dark">{stats.ordersCount.toLocaleString()}</strong>
            <span className="text-[10px] text-green-600 font-semibold flex items-center gap-0.5 leading-none">
              <TrendingUp className="w-3 h-3" />
              <span>+8.4% growth</span>
            </span>
          </div>
          <div className="p-3 bg-primary/10 text-primary rounded-lg">
            <ClipboardList className="w-5 h-5" />
          </div>
        </div>

        {/* Customers count */}
        <div className="bg-white border border-light-border p-5 rounded-xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Customers</span>
            <strong className="text-xl font-bold text-dark">{stats.customersCount}</strong>
            <span className="text-[10px] text-green-600 font-semibold flex items-center gap-0.5 leading-none">
              <TrendingUp className="w-3 h-3" />
              <span>+15 new signups</span>
            </span>
          </div>
          <div className="p-3 bg-gold/15 text-gold rounded-lg">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Products count */}
        <div className="bg-white border border-light-border p-5 rounded-xl shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Active Products</span>
            <strong className="text-xl font-bold text-dark">{stats.productsCount}</strong>
            <span className="text-[10px] text-gray-500 font-medium leading-none">
              Across 10 categories
            </span>
          </div>
          <div className="p-3 bg-cream text-primary border border-light-border rounded-lg">
            <ShoppingBag className="w-5 h-5 text-primary" />
          </div>
        </div>

        {/* Average Order Value */}
        <div className="bg-white border border-light-border p-5 rounded-xl shadow-xs flex items-center justify-between col-span-1 sm:col-span-2 lg:col-span-1">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Average Order Value</span>
            <strong className="text-xl font-bold text-dark">{formatPrice(stats.aov)}</strong>
            <span className="text-[10px] text-green-600 font-semibold flex items-center gap-0.5 leading-none">
              <TrendingUp className="w-3 h-3" />
              <span>+2.3% AOV</span>
            </span>
          </div>
          <div className="p-3 bg-gray-50 text-gray-600 rounded-lg">
            <TrendingUp className="w-5 h-5 text-gray-500" />
          </div>
        </div>

      </div>

      {/* Analytics Graph Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Sales trend - Line SVG chart */}
        <div className="lg:col-span-2 bg-white border border-light-border p-5 rounded-xl shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-dark uppercase tracking-wider border-b border-light-border pb-3">
            Revenue Performance trend
          </h3>
          <div className="relative w-full h-56 bg-cream/10 rounded-lg border border-light-border p-4 flex items-end">
            {/* SVG line */}
            <svg viewBox="0 0 160 100" className="w-full h-full absolute inset-0 p-4 overflow-visible" preserveAspectRatio="none">
              {/* Grid lines */}
              <line x1="0" y1="20" x2="160" y2="20" stroke="#f1f1f1" strokeWidth="0.5" />
              <line x1="0" y1="50" x2="160" y2="50" stroke="#f1f1f1" strokeWidth="0.5" />
              <line x1="0" y1="80" x2="160" y2="80" stroke="#f1f1f1" strokeWidth="0.5" />
              {/* Line path */}
              <polyline
                fill="none"
                stroke="#123D2F"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={chartPoints}
              />
              {/* Highlight dot */}
              <circle cx="150" cy="20" r="3.5" fill="#C8A24D" stroke="#123D2F" strokeWidth="1" />
            </svg>
            
            {/* Month indicators */}
            <div className="flex justify-between w-full text-[9px] text-gray-400 font-bold uppercase pt-2 z-10 select-none px-2">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
              <span>Jul</span>
              <span>Aug</span>
            </div>
          </div>
        </div>

        {/* Orders trend - Bar SVG chart */}
        <div className="bg-white border border-light-border p-5 rounded-xl shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-dark uppercase tracking-wider border-b border-light-border pb-3">
            Monthly Order Quantity
          </h3>
          <div className="w-full h-56 flex items-end justify-between p-4 bg-cream/10 rounded-lg border border-light-border gap-2 select-none">
            {orderBars.map((bar, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <div 
                  className="w-full bg-gold rounded-t-sm hover:bg-primary transition-colors cursor-pointer" 
                  style={{ height: `${(bar.val / 120) * 100}%` }}
                  title={`${bar.val} orders`}
                />
                <span className="text-[8px] text-gray-400 font-bold uppercase">{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Recent Orders Table & Inventory Warning */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Recent Orders - 5 rows */}
        <div className="lg:col-span-2 bg-white border border-light-border rounded-xl shadow-xs p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-light-border pb-3">
            <h3 className="font-bold text-sm text-dark uppercase tracking-wider">
              Recent Store Orders
            </h3>
            <Link 
              href="/admin/orders" 
              className="text-xs text-primary hover:text-gold font-bold flex items-center gap-0.5"
            >
              <span>View All Orders</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-light-border text-gray-500 font-bold">
                  <th className="p-3">Order ID</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Total Paid</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Change Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-cream/10 transition-colors">
                    <td className="p-3 font-semibold text-primary font-mono">{order.id}</td>
                    <td className="p-3 text-dark font-medium">{order.customer.name}</td>
                    <td className="p-3 font-bold text-dark">{formatPrice(order.total)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        order.status === 'Delivered' 
                          ? 'bg-green-100 text-green-700' 
                          : order.status === 'Cancelled' 
                          ? 'bg-red-100 text-red-700'
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                        className="bg-gray-50 border border-gray-300 rounded px-1.5 py-1 text-[10px] focus:outline-none focus:border-primary"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Out for Delivery">Out for Delivery</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Warning Box */}
        <div className="bg-white border border-light-border rounded-xl shadow-xs p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-light-border pb-3">
            <h3 className="font-bold text-sm text-dark uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4.5 h-4.5 text-red-650" />
              <span>Stock warnings</span>
            </h3>
            <Link 
              href="/admin/inventory" 
              className="text-xs text-primary hover:text-gold font-bold flex items-center gap-0.5"
            >
              <span>Manage Inventory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {lowStock.length === 0 ? (
            <p className="text-xs text-gray-500 py-6 text-center">
              ✓ All products have healthy stock levels.
            </p>
          ) : (
            <div className="divide-y divide-gray-100 space-y-3.5">
              {lowStock.map((prod) => (
                <div key={prod.id} className="pt-3.5 flex items-center justify-between text-xs gap-3">
                  <div>
                    <strong className="text-dark block line-clamp-1">{prod.name}</strong>
                    <span className="text-[10px] text-gray-400">{prod.brand} • {prod.weight}</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] ${
                    prod.stock === 0 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {prod.stock === 0 ? 'Out' : `${prod.stock} left`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
