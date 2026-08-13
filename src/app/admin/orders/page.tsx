'use client';

import React, { useState, useEffect } from 'react';
import { Order } from '@/types';
import { OrderService } from '@/services/orders';
import { formatDate, formatPrice } from '@/lib/utils';
import { useLocaleStore } from '@/store/locale-store';
import { Eye, FileText, CheckCircle, XCircle, Clock, ClipboardList } from 'lucide-react';

export default function AdminOrdersPage() {
  const { locale } = useLocaleStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Status filter
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Detail Modal control
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const list = await OrderService.getOrders();
      setOrders(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // Filter orders
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter((o) => o.status.toLowerCase() === statusFilter.toLowerCase()));
    }
  }, [orders, statusFilter]);

  const handleStatusChange = async (orderId: string, status: Order['status']) => {
    try {
      await OrderService.updateOrderStatus(orderId, status);
      // Reload orders list
      const list = await OrderService.getOrders();
      setOrders(list);
      // If modal open, sync details
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (err) {
      alert('Error updating order status');
    }
  };

  const handleOpenDetailModal = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 fade-in" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* Filters block */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white border border-light-border p-4 rounded-xl shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="text-gray-400 uppercase tracking-wide">
            {locale === 'ar' ? 'تصنيف الطلبات:' : 'Filter status:'}
          </span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 border border-gray-300 rounded-lg px-2 py-1.5 focus:outline-none"
          >
            <option value="all">{locale === 'ar' ? 'جميع الطلبات' : 'All Orders'}</option>
            <option value="pending">{locale === 'ar' ? 'قيد الانتظار' : 'Pending'}</option>
            <option value="processing">{locale === 'ar' ? 'جاري التجهيز' : 'Processing'}</option>
            <option value="shipped">{locale === 'ar' ? 'تم الشحن' : 'Shipped'}</option>
            <option value="out for delivery">{locale === 'ar' ? 'مع المندوب للتوصيل' : 'Out for Delivery'}</option>
            <option value="delivered">{locale === 'ar' ? 'تم التسليم' : 'Delivered'}</option>
            <option value="cancelled">{locale === 'ar' ? 'ملغي' : 'Cancelled'}</option>
          </select>
        </div>
        <div className="text-xs text-muted-text font-medium">
          {locale === 'ar' ? 'عرض ' : 'Showing '}
          <strong>{filteredOrders.length} {locale === 'ar' ? 'طلب' : 'orders'}</strong>
        </div>
      </div>

      {/* Orders Table */}
      {loading ? (
        <div className="text-center py-20 animate-pulse">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 bg-white border border-light-border rounded-xl">
          <ClipboardList className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-semibold">
            {locale === 'ar' ? 'لم يتم العثور على طلبات بهذه الحالة.' : 'No orders found matching status.'}
          </p>
        </div>
      ) : (
        <div className="bg-white border border-light-border rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-light-border text-gray-500 font-bold uppercase tracking-wider">
                  <th className="p-4">{locale === 'ar' ? 'رقم الطلب' : 'Order ID'}</th>
                  <th className="p-4">{locale === 'ar' ? 'بيانات العميل' : 'Customer Details'}</th>
                  <th className="p-4">{locale === 'ar' ? 'تاريخ الطلب' : 'Date'}</th>
                  <th className="p-4">{locale === 'ar' ? 'إجمالي المدفوع' : 'Total Paid'}</th>
                  <th className="p-4">{locale === 'ar' ? 'الحالة' : 'Status'}</th>
                  <th className="p-4">{locale === 'ar' ? 'تعديل الحالة' : 'Update Status'}</th>
                  <th className="p-4 text-right">{locale === 'ar' ? 'تفاصيل الفاتورة' : 'Invoice View'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-cream/10 transition-colors">
                    {/* ID */}
                    <td className="p-4 font-bold text-primary font-mono text-[13px]">{order.id}</td>

                    {/* Customer */}
                    <td className="p-4">
                      <strong className="block font-semibold text-dark text-[13px]">{order.customer.name}</strong>
                      <span className="text-[10px] text-gray-400">{order.customer.email}</span>
                    </td>

                    {/* Date */}
                    <td className="p-4 font-medium text-gray-500">{formatDate(order.date)}</td>

                    {/* Total */}
                    <td className="p-4 font-bold text-dark text-sm">{formatPrice(order.total)}</td>

                    {/* Status */}
                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        order.status === 'Delivered' 
                          ? 'bg-green-100 text-green-700' 
                          : order.status === 'Cancelled' 
                          ? 'bg-red-100 text-red-700'
                          : 'bg-primary/10 text-primary'
                      }`}>
                        {locale === 'ar' ? (order.status === 'Pending' ? 'معلق' : order.status === 'Processing' ? 'جاري التجهيز' : order.status === 'Shipped' ? 'تم الشحن' : order.status === 'Out for Delivery' ? 'مع المندوب' : order.status === 'Delivered' ? 'تم التسليم' : 'ملغي') : order.status}
                      </span>
                    </td>

                    {/* Update Status Dropdown */}
                    <td className="p-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value as Order['status'])}
                        className="bg-gray-50 border border-gray-300 rounded px-2 py-1 text-xs focus:outline-none"
                      >
                        <option value="Pending">{locale === 'ar' ? 'معلق' : 'Pending'}</option>
                        <option value="Processing">{locale === 'ar' ? 'جاري التجهيز' : 'Processing'}</option>
                        <option value="Shipped">{locale === 'ar' ? 'تم الشحن' : 'Shipped'}</option>
                        <option value="Out for Delivery">{locale === 'ar' ? 'مع المندوب للتوصيل' : 'Out for Delivery'}</option>
                        <option value="Delivered">{locale === 'ar' ? 'تم التسليم' : 'Delivered'}</option>
                        <option value="Cancelled">{locale === 'ar' ? 'إلغاء الطلب' : 'Cancelled'}</option>
                      </select>
                    </td>

                    {/* View Details */}
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenDetailModal(order)}
                        className="px-3 py-1.5 border border-gray-350 hover:bg-gray-50 text-gray-700 font-bold rounded-lg transition-colors inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5 text-gold" />
                        <span>{locale === 'ar' ? 'فحص الفاتورة' : 'Inspect'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs fade-in overflow-y-auto">
          <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl border border-light-border overflow-hidden my-8">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-light-border bg-cream" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
              <span className="font-bold text-sm text-primary uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4.5 h-4.5 text-gold" />
                <span>{locale === 'ar' ? 'تفاصيل فاتورة العميل' : 'Invoice Details'} ({selectedOrder.id})</span>
              </span>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-dark">
                <XCircle className="w-5 h-5 text-gray-500 hover:text-red-650 transition-colors" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[85vh] overflow-y-auto no-scrollbar text-xs" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
              
              {/* Customer and Shipping grids */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-light-border pb-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">
                    {locale === 'ar' ? 'وجهة الشحن والتسليم' : 'Shipping Destination'}
                  </span>
                  <strong className="text-sm text-dark block font-semibold">{selectedOrder.customer.name}</strong>
                  <p className="text-gray-500 leading-normal">{selectedOrder.customer.address}</p>
                  <p className="text-gray-500">{selectedOrder.customer.city}, {selectedOrder.customer.state} {selectedOrder.customer.zip}</p>
                </div>
                <div className="space-y-1.5 text-gray-600">
                  <span className="text-[10px] text-gray-400 font-bold uppercase block">
                    {locale === 'ar' ? 'بيانات الاتصال والتواصل' : 'Contact Details'}
                  </span>
                  <p>{locale === 'ar' ? 'البريد الإلكتروني:' : 'Email:'} <strong>{selectedOrder.customer.email}</strong></p>
                  <p>{locale === 'ar' ? 'رقم الهاتف:' : 'Phone:'} <strong>{selectedOrder.customer.phone}</strong></p>
                  <p className="pt-2 border-t border-gray-150 mt-1">
                    {locale === 'ar' ? 'طريقة الدفع:' : 'Payment Method:'} <strong>{selectedOrder.paymentMethod}</strong>
                  </p>
                </div>
              </div>

              {/* Items Breakdown list */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-primary uppercase tracking-wider">
                  {locale === 'ar' ? 'تفاصيل السلة والمشتريات' : 'Package Inventory'}
                </h4>
                <div className="border border-light-border rounded-lg overflow-hidden divide-y divide-gray-100 bg-white">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex justify-between items-center bg-gray-50/20 text-xs">
                      <div>
                        <strong className="text-dark block font-semibold">
                          {locale === 'ar' ? item.product.arabicName : item.product.name}
                        </strong>
                        <span className="text-[10px] text-gray-400 uppercase">
                          {item.quantity} x {locale === 'ar' ? (item.option === 'single' ? 'حبة' : item.option === 'pack' ? 'رابطة' : 'صندوق') : item.option} ({item.product.weight})
                        </span>
                      </div>
                      <span className="font-bold text-primary">
                        {formatPrice(item.product.purchaseOptions[item.option].price * item.quantity, locale)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Calculations */}
              <div className="pt-2 border-t border-light-border flex flex-col items-end gap-1.5 text-gray-600 max-w-xs ml-auto rtl:mr-auto rtl:ml-0 font-medium">
                <div className="flex justify-between w-full">
                  <span>{locale === 'ar' ? 'المجموع الفرعي' : 'Subtotal'}</span>
                  <strong>{formatPrice(selectedOrder.subtotal, locale)}</strong>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between w-full text-green-700">
                    <span>{locale === 'ar' ? 'خصم الكوبون' : 'Coupon Discount'}</span>
                    <strong>-{formatPrice(selectedOrder.discount, locale)}</strong>
                  </div>
                )}
                <div className="flex justify-between w-full">
                  <span>{locale === 'ar' ? 'تكلفة الشحن والتوصيل' : 'Shipping Fee'}</span>
                  <strong>{selectedOrder.shipping === 0 ? (locale === 'ar' ? 'شحن مجاني' : 'FREE') : formatPrice(selectedOrder.shipping, locale)}</strong>
                </div>
                <div className="flex justify-between w-full pt-2 border-t border-gray-150 text-dark font-bold text-sm">
                  <span>{locale === 'ar' ? 'الإجمالي الكلي للطلب' : 'Grand Total'}</span>
                  <span className="text-primary text-base font-bold">{formatPrice(selectedOrder.total, locale)}</span>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-between items-center pt-4 border-t border-light-border">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 font-bold">{locale === 'ar' ? 'الحالة:' : 'Status:'}</span>
                  <select
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as Order['status'])}
                    className="bg-gray-50 border border-gray-300 rounded px-2.5 py-1 text-xs focus:outline-none"
                  >
                    <option value="Pending">{locale === 'ar' ? 'معلق' : 'Pending'}</option>
                    <option value="Processing">{locale === 'ar' ? 'جاري التجهيز' : 'Processing'}</option>
                    <option value="Shipped">{locale === 'ar' ? 'تم الشحن' : 'Shipped'}</option>
                    <option value="Out for Delivery">{locale === 'ar' ? 'مع المندوب للتوصيل' : 'Out for Delivery'}</option>
                    <option value="Delivered">{locale === 'ar' ? 'تم التسليم' : 'Delivered'}</option>
                    <option value="Cancelled">{locale === 'ar' ? 'إلغاء الطلب' : 'Cancelled'}</option>
                  </select>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 bg-primary text-cream font-bold rounded-lg hover:bg-primary-dark transition-colors"
                >
                  {locale === 'ar' ? 'إغلاق الفاتورة' : 'Close Invoice'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
