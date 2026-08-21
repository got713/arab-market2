'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { useLocaleStore } from '@/store/locale-store';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { formatPrice, getPurchaseOptionLabel } from '@/lib/utils';
import { Heart, Star, Minus, Plus, ShoppingCart, X } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { locale } = useLocaleStore();
  const isAr = locale === 'ar';
  const { addToCart, items, updateQuantity, removeFromCart } = useCartStore();
  const { toggleWishlist, hasItem } = useWishlistStore();

  // Collect enabled options only
  const enabledOpts = (
    ['single', 'pack', 'case'] as const
  ).filter((key) => product.purchaseOptions[key]?.enabled !== false);

  const [selectedOption, setSelectedOption] = useState<'single' | 'pack' | 'case'>(
    enabledOpts[0] ?? 'single'
  );

  // Quick Add modal states
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [modalSelectedOption, setModalSelectedOption] = useState<'single' | 'pack' | 'case'>('single');
  const [modalQty, setModalQty] = useState(1);

  const isInWishlist = hasItem(product.id);
  const currentOpt  = product.purchaseOptions[selectedOption];
  const price       = currentOpt.price;

  // Label for the selected option
  const getLabel = (key: typeof enabledOpts[number]) =>
    getPurchaseOptionLabel(product.purchaseOptions, key, locale, product.sellingUnit);

  // Cart quantity for current product+option
  const cartItem = items.find((i) => i.product.id === product.id && i.option === selectedOption);
  const cartQty  = cartItem?.quantity ?? 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (enabledOpts.length > 1) {
      setModalSelectedOption(enabledOpts[0]);
      setModalQty(1);
      setIsQuickAddOpen(true);
    } else {
      addToCart(product, enabledOpts[0], 1);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, selectedOption, 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    if (cartQty <= 1) removeFromCart(product.id, selectedOption);
    else updateQuantity(product.id, selectedOption, cartQty - 1);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist(product);
  };

  const handleModalAdd = () => {
    addToCart(product, modalSelectedOption, modalQty);
    setIsQuickAddOpen(false);
  };

  const outOfStock = product.stock <= 0;

  return (
    <>
      <div className="group relative bg-white border border-light-border rounded-2xl hover:shadow-md hover:border-primary/25 transition-all duration-200 flex flex-col overflow-hidden product-card">

        {/* ── Image ─────────────────────────────────────────────── */}
        <div className="relative aspect-square bg-[#FAF7F0]/40 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images[0]}
            alt={isAr ? product.arabicName : product.name}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/FDF8F0/6B6355?text=No+Image';
            }}
          />

          {/* Wishlist button */}
          <button
            onClick={handleWishlist}
            aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`absolute top-2.5 end-2.5 w-8 h-8 rounded-full flex items-center justify-center border shadow-2xs transition-colors min-h-[32px] min-w-[32px] ${
              isInWishlist
                ? 'bg-red-50 border-red-200 text-red-500'
                : 'bg-white/95 border-light-border text-gray-300 hover:text-red-400 hover:bg-red-50'
            }`}
          >
            <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
          </button>

          {/* Out of stock overlay */}
          {outOfStock && (
            <div className="absolute inset-0 bg-white/75 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1 rounded-full border border-light-border shadow-xs">
                {isAr ? 'نفد من المخزن' : 'Out of Stock'}
              </span>
            </div>
          )}
        </div>

        {/* ── Body ──────────────────────────────────────────────── */}
        <div className="p-3.5 flex-1 flex flex-col gap-2">

          {/* Title */}
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="font-bold text-xs sm:text-[15px] text-dark hover:text-primary transition-colors leading-snug line-clamp-2">
              {isAr ? product.arabicName : product.name}
            </h3>
          </Link>

          {/* Brand */}
          <span className="text-[10px] text-muted-text font-bold uppercase tracking-wider">
            {product.brand}
          </span>

          {/* Rating */}
          <div className="flex items-center gap-1.5">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-200'}`} />
              ))}
            </div>
            <span className="text-[10px] text-muted-text font-bold">({product.rating.toFixed(1)})</span>
          </div>

          {/* Weight */}
          <p className="text-[11px] text-muted-text font-medium">{product.weight}</p>

          {/* ── Purchase option tabs — only enabled ones ─────────── */}
          {enabledOpts.length > 1 && (
            <div className="flex gap-1.5 pt-1">
              {enabledOpts.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={(e) => { e.preventDefault(); setSelectedOption(key); }}
                  className={`flex-1 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                    selectedOption === key
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-white text-muted-text border-light-border hover:border-primary/40 hover:text-primary'
                  }`}
                >
                  {getLabel(key)}
                </button>
              ))}
            </div>
          )}

          {/* If only one option, show its label as a subtle pill */}
          {enabledOpts.length === 1 && (
            <span className="inline-block text-[10px] font-bold text-primary bg-primary/5 px-2 py-0.5 rounded-md border border-primary/10 self-start">
              {getLabel(enabledOpts[0])}
            </span>
          )}

          {/* ── Price + Add/Qty ───────────────────────────────────── */}
          <div className="mt-auto pt-2.5 border-t border-light-border/60 flex items-center justify-between gap-2">
            <div>
              <span className="text-sm sm:text-base font-black text-primary">{formatPrice(price, locale)}</span>
            </div>

            {outOfStock ? (
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                {isAr ? 'نفد' : 'Out'}
              </span>
            ) : cartQty > 0 ? (
              <div className="flex items-center bg-primary rounded-xl overflow-hidden shadow-sm">
                <button onClick={handleDecrement} aria-label="Decrease" className="w-8 h-8 flex items-center justify-center text-white hover:bg-primary-dark transition-colors min-w-[32px] min-h-[32px]">
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-white font-bold text-xs w-6 text-center select-none">{cartQty}</span>
                <button onClick={handleIncrement} aria-label="Increase" className="w-8 h-8 flex items-center justify-center text-white hover:bg-primary-dark transition-colors min-w-[32px] min-h-[32px]">
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={handleAdd} 
                className="bg-primary hover:bg-primary-light text-white text-xs px-4 py-2 rounded-xl font-bold transition-all shadow-xs min-h-[36px] flex items-center gap-1"
              >
                <span>+ {isAr ? 'أضف' : 'Add'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── LIGHTWEIGHT QUICK ADD MODAL ── */}
      {isQuickAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs fade-in">
          <div className="bg-white rounded-2xl border border-light-border max-w-sm w-full p-5 space-y-4 shadow-2xl relative animate-fadeIn">
            <button 
              onClick={() => setIsQuickAddOpen(false)}
              className="absolute top-3.5 right-3.5 text-gray-400 hover:text-dark min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="space-y-1 pr-8 rtl:pr-0 rtl:pl-8">
              <h3 className="font-bold text-sm sm:text-base text-primary font-cairo">
                {isAr ? product.arabicName : product.name}
              </h3>
              <strong className="block text-[10px] text-gold font-bold uppercase tracking-wider leading-none">{product.brand}</strong>
              <span className="block text-xs text-muted-text font-medium">{product.weight}</span>
            </div>
            
            {/* Choose Quantity Type */}
            <div className="space-y-2">
              <span className="block text-xs font-bold text-gray-400 uppercase tracking-wide">
                {isAr ? 'اختر نوع التعبئة:' : 'Choose Quantity Type:'}
              </span>
              <div className="space-y-2">
                {enabledOpts.map((optKey) => {
                  const opt = product.purchaseOptions[optKey];
                  const active = modalSelectedOption === optKey;
                  return (
                    <button
                      key={optKey}
                      type="button"
                      onClick={() => setModalSelectedOption(optKey)}
                      className={`w-full p-3 rounded-xl border flex items-center justify-between text-xs font-bold transition-all min-h-[44px] ${
                        active 
                          ? 'border-primary bg-primary/5 text-primary' 
                          : 'border-light-border hover:border-primary/30 text-dark bg-white'
                      }`}
                    >
                      <span className="font-cairo">{getLabel(optKey)}</span>
                      <span className="font-mono">{formatPrice(opt.price, locale)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Select */}
            <div className="flex items-center justify-between pt-2 border-t border-light-border/60">
              <span className="text-xs font-bold text-gray-400 uppercase">
                {isAr ? 'الكمية:' : 'Quantity:'}
              </span>
              <div className="flex items-center bg-[#FAF7F0] rounded-xl overflow-hidden border border-light-border/65">
                <button
                  onClick={() => setModalQty(Math.max(1, modalQty - 1))}
                  className="w-9 h-9 flex items-center justify-center text-primary hover:bg-gray-150 transition-colors min-h-[36px] min-w-[36px]"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold text-sm text-primary w-8 text-center select-none">{modalQty}</span>
                <button
                  onClick={() => setModalQty(modalQty + 1)}
                  className="w-9 h-9 flex items-center justify-center text-primary hover:bg-gray-150 transition-colors min-h-[36px] min-w-[36px]"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add Button */}
            <button
              onClick={handleModalAdd}
              className="w-full py-3 bg-primary hover:bg-primary-light text-white text-xs font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 min-h-[44px]"
            >
              <ShoppingCart className="w-4 h-4 text-gold shrink-0" />
              <span>{locale === 'ar' ? 'إضافة إلى السلة' : 'Add to Cart'}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
