'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useLocaleStore } from '@/store/locale-store';
import { formatPrice } from '@/lib/utils';
import { Heart, ShoppingCart, Star, Check } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { t, locale } = useLocaleStore();
  const addToCart = useCartStore((state) => state.addToCart);
  const { toggleWishlist, hasItem } = useWishlistStore();
  
  const [selectedOption, setSelectedOption] = useState<'single' | 'pack' | 'case'>('single');
  const [isAdded, setIsAdded] = useState(false);

  const isInWishlist = hasItem(product.id);
  const currentOption = product.purchaseOptions[selectedOption];
  const price = currentOption.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product, selectedOption, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist(product);
  };

  return (
    <div className="group relative bg-white border border-light-border rounded-xl shadow-xs hover:shadow-md hover:border-gold/50 transition-all duration-300 flex flex-col overflow-hidden">
      
      {/* Product Image & Badges */}
      <div className="relative aspect-square w-full bg-cream/30 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        
        {/* Country Badge */}
        <div className="absolute top-2 left-2 rtl:left-auto rtl:right-2 bg-white/95 border border-light-border px-2 py-0.5 rounded-md text-[10px] font-semibold text-dark flex items-center gap-1">
          <span>{product.country === 'Egypt' ? '🇪🇬' : product.country === 'Palestine' ? '🇵🇸' : product.country === 'Lebanon' ? '🇱🇧' : product.country === 'Jordan' ? '🇯🇴' : product.country === 'Syria' ? '🇸🇾' : product.country === 'Saudi Arabia' ? '🇸🇦' : product.country === 'Morocco' ? '🇲🇦' : '🌍'}</span>
          <span>{product.country}</span>
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-2 right-2 rtl:right-auto rtl:left-2 w-8 h-8 rounded-full flex items-center justify-center border shadow-xs transition-colors ${
            isInWishlist 
              ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100' 
              : 'bg-white/95 border-light-border text-gray-400 hover:text-red-500 hover:bg-red-50'
          }`}
        >
          <Heart className={`w-4 h-4 ${isInWishlist ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Info & Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand */}
          <span className="block text-[10px] text-muted-text font-bold uppercase tracking-wider mb-1">
            {product.brand}
          </span>

          {/* Title */}
          <Link href={`/product/${product.slug}`} className="block">
            <h3 className="font-semibold text-sm text-dark hover:text-primary transition-colors leading-tight line-clamp-2 h-10">
              {locale === 'ar' ? product.arabicName : product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-2">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] font-semibold text-gray-500">
              ({product.rating.toFixed(1)})
            </span>
          </div>

          {/* Sizing/Quantity label */}
          <div className="text-xs text-gray-500 mt-1">
            {product.weight} {selectedOption !== 'single' && `(${t('prod.' + selectedOption)} x${currentOption.quantity})`}
          </div>

          {/* Purchase Options Selector (Single / Pack / Case) */}
          <div className="grid grid-cols-3 gap-1 mt-3 bg-gray-50 p-1 rounded-lg border border-gray-200">
            {(['single', 'pack', 'case'] as const).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setSelectedOption(opt)}
                className={`py-1 text-[10px] font-bold rounded-md uppercase transition-all duration-150 ${
                  selectedOption === opt
                    ? 'bg-white shadow-xs text-primary border border-primary/10'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {t(`prod.${opt}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Pricing & Add to Cart button */}
        <div className="mt-4 pt-3 border-t border-light-border flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-primary">
              {formatPrice(price, locale)}
            </span>
            {selectedOption !== 'single' && (
              <span className="text-[9px] text-green-700 font-bold leading-none">
                Save ${((product.purchaseOptions.single.price * currentOption.quantity) - price).toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`px-3.5 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
              product.stock <= 0
                ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                : isAdded
                ? 'bg-green-600 text-cream'
                : 'bg-primary hover:bg-primary-dark text-cream'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>{locale === 'ar' ? 'تمت الإضافة' : 'Added'}</span>
              </>
            ) : product.stock <= 0 ? (
              <span>{t('prod.out_of_stock')}</span>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>{t('prod.add_to_cart')}</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
