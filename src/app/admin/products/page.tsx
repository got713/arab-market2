'use client';

import React, { useState, useEffect } from 'react';
import { Product, PurchaseOptions } from '@/types';
import { ProductService } from '@/services/products';
import { categories } from '@/data/categories';
import { formatPrice } from '@/lib/utils';
import { Plus, Edit, Trash2, Check, X, ShieldAlert } from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal control states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields states
  const [name, setName] = useState('');
  const [arabicName, setArabicName] = useState('');
  const [slug, setSlug] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('groceries');
  const [country, setCountry] = useState('Egypt');
  const [description, setDescription] = useState('');
  const [arabicDescription, setArabicDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [weight, setWeight] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [allergens, setAllergens] = useState('');
  const [stock, setStock] = useState(100);
  const [featured, setFeatured] = useState(false);
  const [bestSeller, setBestSeller] = useState(false);
  
  // Sizing pricing fields
  const [singlePrice, setSinglePrice] = useState(4.99);
  const [packPrice, setPackPrice] = useState(26.99);
  const [packQty, setPackQty] = useState(6);
  const [casePrice, setCasePrice] = useState(49.99);
  const [caseQty, setCaseQty] = useState(12);

  // Load products list
  const loadProducts = async () => {
    setLoading(true);
    try {
      const list = await ProductService.getProducts(true);
      setProducts(list);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setName('');
    setArabicName('');
    setSlug('');
    setBrand('');
    setCategory('groceries');
    setCountry('Egypt');
    setDescription('');
    setArabicDescription('');
    setImageUrl('https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop');
    setWeight('400g');
    setIngredients('Pure ingredients.');
    setAllergens('None');
    setStock(100);
    setFeatured(false);
    setBestSeller(false);
    setSinglePrice(4.99);
    setPackPrice(26.99);
    setPackQty(6);
    setCasePrice(49.99);
    setCaseQty(12);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setArabicName(prod.arabicName);
    setSlug(prod.slug);
    setBrand(prod.brand);
    setCategory(prod.category);
    setCountry(prod.country);
    setDescription(prod.description);
    setArabicDescription(prod.arabicDescription);
    setImageUrl(prod.images[0]);
    setWeight(prod.weight);
    setIngredients(prod.ingredients);
    setAllergens(prod.allergens);
    setStock(prod.stock);
    setFeatured(prod.featured);
    setBestSeller(prod.bestSeller);
    
    // Set pricing options
    setSinglePrice(prod.purchaseOptions.single.price);
    setPackPrice(prod.purchaseOptions.pack.price);
    setPackQty(prod.purchaseOptions.pack.quantity);
    setCasePrice(prod.purchaseOptions.case.price);
    setCaseQty(prod.purchaseOptions.case.quantity);
    
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (prod: Product) => {
    try {
      const updated = { ...prod, active: prod.active === false ? true : false };
      await ProductService.updateProduct(updated);
      loadProducts();
    } catch (err) {
      alert('Error updating status');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this product from the catalog?')) {
      try {
        await ProductService.deleteProduct(id);
        loadProducts();
      } catch (err) {
        alert('Error deleting product');
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const purchaseOptions: PurchaseOptions = {
      single: { price: Number(singlePrice), quantity: 1 },
      pack: { price: Number(packPrice), quantity: Number(packQty) },
      case: { price: Number(casePrice), quantity: Number(caseQty) }
    };

    const productPayload: Omit<Product, 'id'> = {
      name,
      arabicName,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      brand,
      category,
      country,
      description,
      arabicDescription,
      images: [imageUrl],
      rating: editingProduct ? editingProduct.rating : 4.5,
      reviews: editingProduct ? editingProduct.reviews : [],
      weight,
      ingredients,
      allergens,
      purchaseOptions,
      stock: Number(stock),
      featured,
      bestSeller,
      active: editingProduct ? editingProduct.active : true
    };

    try {
      if (editingProduct) {
        await ProductService.updateProduct({
          ...productPayload,
          id: editingProduct.id
        });
      } else {
        await ProductService.createProduct(productPayload);
      }
      setIsModalOpen(false);
      loadProducts();
    } catch (err: any) {
      alert(err.message || 'Error saving product');
    }
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Title & Actions */}
      <div className="flex justify-between items-center border-b border-light-border pb-4">
        <div className="text-xs text-gray-500 font-medium">
          Total in catalog: <strong>{products.length} products</strong>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2 bg-primary text-cream hover:bg-primary-dark font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Products table */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : (
        <div className="bg-white border border-light-border rounded-xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50 border-b border-light-border text-gray-500 font-bold uppercase tracking-wider">
                  <th className="p-4">Item details</th>
                  <th className="p-4">Brand / Origin</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Single Price</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-cream/10 transition-colors">
                    {/* Item block */}
                    <td className="p-4 flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-10 h-10 object-cover rounded-md border border-light-border bg-gray-50"
                      />
                      <div className="space-y-0.5">
                        <strong className="text-dark block font-semibold text-[13px]">{prod.name}</strong>
                        <span className="text-[10px] text-gray-400 font-medium font-mono">{prod.id} • {prod.weight}</span>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="block font-semibold text-dark">{prod.brand}</span>
                      <span className="text-[10px] text-gray-400">{prod.country}</span>
                    </td>

                    <td className="p-4 uppercase font-semibold text-gray-500 text-[10px]">{prod.category}</td>

                    <td className="p-4 font-bold text-primary text-sm">
                      {formatPrice(prod.purchaseOptions.single.price)}
                    </td>

                    <td className="p-4 font-semibold text-dark">
                      {prod.stock === 0 ? (
                        <span className="text-red-650 font-bold">Out of stock</span>
                      ) : (
                        <span>{prod.stock} units</span>
                      )}
                    </td>

                    {/* Enable toggle */}
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(prod)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${
                          prod.active !== false
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-red-50 text-red-650 border border-red-200'
                        }`}
                      >
                        {prod.active !== false ? 'Enabled' : 'Disabled'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditModal(prod)}
                        className="p-1.5 text-gray-500 hover:text-primary transition-colors border border-gray-200 rounded-md hover:bg-gray-50"
                        title="Edit Product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(prod.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 border border-red-100 rounded-md transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CRUD Product Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs fade-in overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-light-border overflow-hidden my-8">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-light-border bg-cream">
              <span className="font-bold text-sm text-primary uppercase tracking-wider">
                {editingProduct ? 'Edit Catalog Product' : 'Add New Catalog Product'}
              </span>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-dark">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form content */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto no-scrollbar">
              
              {/* English & Arabic names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Product Name (EN) *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Product Name (AR) *</label>
                  <input
                    type="text"
                    required
                    value={arabicName}
                    onChange={(e) => setArabicName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300 focus:outline-none"
                  />
                </div>
              </div>

              {/* Brand, Category, Origin */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Brand *</label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300"
                  >
                    {categories.map((cat) => (
                      <option key={cat.slug} value={cat.slug}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Country of Origin *</label>
                  <input
                    type="text"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Description (EN) *</label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Description (AR) *</label>
                  <textarea
                    required
                    rows={3}
                    value={arabicDescription}
                    onChange={(e) => setArabicDescription(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300"
                  />
                </div>
              </div>

              {/* Images, Weight, Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Mock Image URL</label>
                  <input
                    type="text"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Weight Label (e.g. 400g)</label>
                  <input
                    type="text"
                    required
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300"
                  />
                </div>
              </div>

              {/* Ingredients & Allergens Accords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Ingredients List</label>
                  <input
                    type="text"
                    value={ingredients}
                    onChange={(e) => setIngredients(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Allergen Warnings</label>
                  <input
                    type="text"
                    value={allergens}
                    onChange={(e) => setAllergens(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300"
                  />
                </div>
              </div>

              {/* Pricing Config Tier options */}
              <div className="border-t border-light-border pt-4 space-y-3">
                <h4 className="text-xs font-bold text-primary uppercase tracking-wider">
                  Purchase Options Pricing Config
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
                  {/* Single */}
                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">Single Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={singlePrice}
                      onChange={(e) => setSinglePrice(Number(e.target.value))}
                      className="w-full px-2 py-2 rounded-lg border border-gray-300"
                    />
                  </div>
                  {/* Pack */}
                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">Pack Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={packPrice}
                      onChange={(e) => setPackPrice(Number(e.target.value))}
                      className="w-full px-2 py-2 rounded-lg border border-gray-300"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">Qty in Pack *</label>
                    <input
                      type="number"
                      required
                      value={packQty}
                      onChange={(e) => setPackQty(Number(e.target.value))}
                      className="w-full px-2 py-2 rounded-lg border border-gray-300"
                    />
                  </div>
                  {/* Case */}
                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">Case Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={casePrice}
                      onChange={(e) => setCasePrice(Number(e.target.value))}
                      className="w-full px-2 py-2 rounded-lg border border-gray-300"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-1">
                    <label className="text-[9px] font-bold text-gray-400 uppercase">Qty in Case *</label>
                    <input
                      type="number"
                      required
                      value={caseQty}
                      onChange={(e) => setCaseQty(Number(e.target.value))}
                      className="w-full px-2 py-2 rounded-lg border border-gray-300"
                    />
                  </div>
                </div>
              </div>

              {/* Stock and Toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-center pt-2">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Current Stock Qty *</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-gray-300"
                  />
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 text-primary accent-primary rounded"
                  />
                  <label htmlFor="featured" className="text-xs font-semibold text-dark">Featured</label>
                </div>

                <div className="flex items-center gap-2 pt-4">
                  <input
                    type="checkbox"
                    id="bestseller"
                    checked={bestSeller}
                    onChange={(e) => setBestSeller(e.target.checked)}
                    className="w-4 h-4 text-primary accent-primary rounded"
                  />
                  <label htmlFor="bestseller" className="text-xs font-semibold text-dark">Best Seller</label>
                </div>
              </div>

              {/* Submit actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-light-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-500 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary hover:bg-primary-dark text-cream font-bold rounded-lg shadow-sm transition-colors"
                >
                  {editingProduct ? 'Save Product Changes' : 'Create Catalog Product'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
