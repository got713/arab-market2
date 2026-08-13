'use client';

import React, { useState, useEffect } from 'react';
import { Product } from '@/types';
import { ProductService } from '@/services/products';
import { ShieldAlert, CheckCircle, RefreshCw } from 'lucide-react';

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Stock update inputs map
  const [stockInputs, setStockInputs] = useState<Record<string, string>>({});
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadInventory = async () => {
    setLoading(true);
    try {
      const list = await ProductService.getProducts(true);
      setProducts(list);
      
      // Initialize inputs map
      const inputs: Record<string, string> = {};
      list.forEach((p) => {
        inputs[p.id] = String(p.stock);
      });
      setStockInputs(inputs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const handleStockInputChange = (productId: string, val: string) => {
    setStockInputs((prev) => ({
      ...prev,
      [productId]: val.replace(/\D/g, '')
    }));
  };

  const handleSaveStock = async (prod: Product) => {
    const rawVal = stockInputs[prod.id];
    if (!rawVal) return;

    setUpdatingId(prod.id);
    try {
      const updatedProduct = { ...prod, stock: Number(rawVal) };
      await ProductService.updateProduct(updatedProduct);
      
      // Reload list to sync
      const list = await ProductService.getProducts(true);
      setProducts(list);
    } catch (err) {
      alert('Error updating stock');
    } finally {
      setUpdatingId(null);
    }
  };

  // Compile totals
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock < 15).length;

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      
      {/* Alert KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-red-50 border border-red-150 p-4 rounded-xl shadow-xs flex items-center justify-between text-red-700">
          <div>
            <span className="text-[10px] uppercase font-bold text-red-500 block mb-0.5">Out of Stock</span>
            <strong className="text-2xl font-bold">{outOfStockCount} items</strong>
          </div>
          <div className="p-2.5 bg-red-100 rounded-lg">
            <ShieldAlert className="w-5 h-5 text-red-650" />
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl shadow-xs flex items-center justify-between text-amber-700">
          <div>
            <span className="text-[10px] uppercase font-bold text-amber-500 block mb-0.5">Low stock warnings</span>
            <strong className="text-2xl font-bold">{lowStockCount} items</strong>
          </div>
          <div className="p-2.5 bg-amber-100 rounded-lg">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 p-4 rounded-xl shadow-xs flex items-center justify-between text-green-700">
          <div>
            <span className="text-[10px] uppercase font-bold text-green-500 block mb-0.5">Healthy Stock Count</span>
            <strong className="text-2xl font-bold">{products.length - outOfStockCount - lowStockCount} items</strong>
          </div>
          <div className="p-2.5 bg-green-100 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
        </div>
      </div>

      {/* Inventory table */}
      <div className="bg-white border border-light-border rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50 border-b border-light-border text-gray-500 font-bold uppercase tracking-wider">
                <th className="p-4">Product details</th>
                <th className="p-4">Supplier / Brand</th>
                <th className="p-4">Status Alert</th>
                <th className="p-4">Unit Weight</th>
                <th className="p-4">Manage Stock (Units)</th>
                <th className="p-4 text-right">Quick Save</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-light-border">
              {products.map((p) => {
                const isOutOfStock = p.stock === 0;
                const isLowStock = p.stock > 0 && p.stock < 15;
                const inputVal = stockInputs[p.id] || '';

                return (
                  <tr key={p.id} className="hover:bg-cream/10 transition-colors">
                    {/* Item */}
                    <td className="p-4 flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={p.images[0]}
                        alt=""
                        className="w-10 h-10 object-cover rounded-md border border-light-border"
                      />
                      <div className="space-y-0.5">
                        <strong className="text-dark block font-semibold text-[13px]">{p.name}</strong>
                        <span className="text-[10px] text-gray-400 font-medium font-mono">{p.id}</span>
                      </div>
                    </td>

                    {/* Brand */}
                    <td className="p-4">
                      <span className="block font-semibold text-dark">{p.brand}</span>
                      <span className="text-[10px] text-gray-400">{p.country}</span>
                    </td>

                    {/* Alert status badge */}
                    <td className="p-4">
                      {isOutOfStock ? (
                        <span className="inline-block bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase">
                          Out of stock
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-block bg-amber-100 text-amber-700 px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase">
                          Low Stock
                        </span>
                      ) : (
                        <span className="inline-block bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase">
                          Healthy
                        </span>
                      )}
                    </td>

                    {/* Weight */}
                    <td className="p-4 font-semibold text-gray-500">{p.weight}</td>

                    {/* Update Input box */}
                    <td className="p-4">
                      <div className="flex gap-2 max-w-[120px]">
                        <input
                          type="text"
                          value={inputVal}
                          onChange={(e) => handleStockInputChange(p.id, e.target.value)}
                          className="w-20 px-2 py-1 rounded border border-gray-300 focus:outline-none focus:border-primary text-center font-bold"
                        />
                      </div>
                    </td>

                    {/* Save Action */}
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleSaveStock(p)}
                        disabled={updatingId === p.id}
                        className="px-3.5 py-1.5 bg-primary text-cream hover:bg-primary-dark rounded-md font-bold text-[10px] transition-colors flex items-center justify-center gap-1 ml-auto"
                      >
                        {updatingId === p.id ? (
                          <RefreshCw className="w-3 h-3 animate-spin" />
                        ) : (
                          <span>Update</span>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
