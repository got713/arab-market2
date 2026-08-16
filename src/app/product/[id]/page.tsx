'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Product } from '@/types';
import { ProductService } from '@/services/products';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { useLocaleStore } from '@/store/locale-store';
import { formatPrice, translateCountry } from '@/lib/utils';
import ProductCard from '@/components/products/product-card';
import { 
  Heart, 
  ShoppingCart, 
  Star, 
  ChevronRight, 
  Plus, 
  Minus, 
  Globe, 
  ShieldCheck, 
  Bookmark, 
  HelpCircle,
  Truck,
  Check,
  AlertTriangle
} from 'lucide-react';
import Link from 'next/link';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t, locale } = useLocaleStore();
  const idOrSlug = (params?.id as string) || '';

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState<'single' | 'pack' | 'case'>('single');
  const [quantity, setQuantity] = useState(1);
  const [isAdded, setIsAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'details' | 'reviews'>('description');

  const addToCart = useCartStore((state) => state.addToCart);
  const { toggleWishlist, hasItem } = useWishlistStore();

  useEffect(() => {
    if (!idOrSlug) return;

    const loadProductDetails = async () => {
      setLoading(true);
      try {
        // Try slug first, then fallback to ID
        let prod = await ProductService.getProductBySlug(idOrSlug);
        if (!prod) {
          prod = await ProductService.getProductById(idOrSlug);
        }

        if (prod) {
          setProduct(prod);
          // Set default selected option to first enabled choice
          const enabledOpts = (['single', 'pack', 'case'] as const).filter(
            (key) => prod.purchaseOptions[key]?.enabled !== false
          );
          if (enabledOpts.length > 0) {
            setSelectedOption(enabledOpts[0]);
          }
          // Fetch related products in the same category
          const related = await ProductService.getProductsByCategory(prod.category);
          setRelatedProducts(related.filter((r) => r.id !== prod?.id).slice(0, 4));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadProductDetails();
  }, [idOrSlug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        <p className="text-sm text-gray-500 mt-4">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-gold mx-auto" />
        <h2 className="text-xl font-bold text-dark">Product Not Found</h2>
        <p className="text-sm text-gray-500">We couldn't find the product you're looking for.</p>
        <button
          onClick={() => router.push('/shop')}
          className="bg-primary text-cream px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary-dark transition-colors"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  const optionDetails = product.purchaseOptions[selectedOption];
  const optionPrice = optionDetails.price;
  const isWishlisted = hasItem(product.id);

  const handleQtyChange = (type: 'inc' | 'dec') => {
    if (type === 'dec') {
      setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
    } else {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, selectedOption, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, selectedOption, quantity);
    router.push('/checkout');
  };

  const handleWishlistToggle = () => {
    toggleWishlist(product);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-in space-y-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-muted-text font-semibold">
        <Link href="/" className="hover:text-primary transition-colors">{t('nav.home')}</Link>
        <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
        <Link href="/shop" className="hover:text-primary transition-colors">{t('nav.shop')}</Link>
        <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
        <Link href={`/category/${product.category}`} className="hover:text-primary transition-colors uppercase">
          {t(`cat.${product.category}`)}
        </Link>
        <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
        <span className="text-primary truncate max-w-xs">
          {locale === 'ar' ? product.arabicName : product.name}
        </span>
      </div>

      {/* Main product box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
        {/* Left: Product Gallery */}
        <div className="space-y-4">
          <div className="border border-light-border rounded-2xl overflow-hidden aspect-square bg-cream/10 relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {/* Halal Badge */}
            <div className="absolute top-4 left-4 bg-primary text-cream border border-gold/30 px-3.5 py-1 rounded-full text-xs font-bold tracking-wider shadow-md">
              {t('prod.halal_tag')}
            </div>
          </div>
          {/* Thumbnails list */}
          <div className="flex gap-3">
            {[...Array(3)].map((_, idx) => (
              <button
                key={idx}
                className={`w-20 h-20 rounded-xl overflow-hidden border-2 ${
                  idx === 0 ? 'border-primary' : 'border-light-border opacity-65 hover:opacity-100'
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right: Info details */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="inline-block bg-cream text-primary border border-gold/20 px-3 py-1 rounded-md text-xs font-bold uppercase tracking-wider">
              {product.brand}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-dark leading-tight">
              {locale === 'ar' ? product.arabicName : product.name}
            </h1>
            
            {/* Ratings and Origin Row */}
            <div className="flex flex-wrap items-center gap-4 text-sm pt-2">
              <div className="flex items-center gap-1.5 border-r border-light-border pr-4 rtl:border-r-0 rtl:border-l rtl:pr-0 rtl:pl-4">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-bold text-dark">{product.rating.toFixed(1)}</span>
                <span className="text-gray-400">({product.reviews.length})</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-gold" />
                <span className="text-muted-text">{t('prod.origin')}:</span>
                <span className="font-semibold text-dark">{translateCountry(product.country, locale)}</span>
              </div>
            </div>
          </div>

          <div className="border-y border-light-border py-4 space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(optionPrice, locale)}
              </span>
              <span className="text-sm text-gray-500 font-medium">/ {t('prod.' + selectedOption)}</span>
            </div>
            {selectedOption !== 'single' && (
              <span className="text-xs text-green-700 font-bold bg-green-50 px-2 py-0.5 rounded-md border border-green-200 inline-block">
                {locale === 'ar' ? 'وفرت' : 'Saved'} ${((product.purchaseOptions.single.price * optionDetails.quantity) - optionPrice).toFixed(2)}
              </span>
            )}
          </div>

          {/* Sizing description */}
          <div className="space-y-1 text-sm">
            <span className="text-muted-text">{t('prod.weight')}:</span>{' '}
            <strong className="text-dark">{product.weight} {selectedOption !== 'single' && `(${optionDetails.quantity} units per ${t('prod.' + selectedOption)})`}</strong>
          </div>

          {/* Purchase Options Config */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              {locale === 'ar' ? 'خيارات الشراء المتاحة' : 'Purchase Options'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['single', 'pack', 'case'] as const).map((opt) => {
                const optDetails = product.purchaseOptions[opt];
                const active = selectedOption === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => {
                      setSelectedOption(opt);
                      setQuantity(1);
                    }}
                    className={`p-3 rounded-xl border text-left rtl:text-right transition-all duration-200 flex flex-col justify-between ${
                      active
                        ? 'bg-cream/40 border-primary shadow-xs ring-1 ring-primary/20'
                        : 'bg-white border-light-border hover:bg-gray-50'
                    }`}
                  >
                    <span className="block text-xs font-bold text-dark uppercase">{t(`prod.${opt}`)}</span>
                    <span className="block text-xs text-gray-400 mb-2">
                      {opt === 'single' ? '1 Unit' : `${optDetails.quantity} Units`}
                    </span>
                    <span className="block text-base font-bold text-primary">
                      {formatPrice(optDetails.price, locale)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stock state */}
          <div>
            {product.stock <= 0 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                {t('prod.out_of_stock')}
              </span>
            ) : product.stock < 15 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
                {t('prod.low_stock')} ({product.stock} units remaining)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                {locale === 'ar' ? 'متوفر في المخزن' : 'In Stock'}
              </span>
            )}
          </div>

          {/* Quantity selector and checkout actions */}
          <div className="flex flex-wrap gap-4 pt-2">
            {/* Quantity controller */}
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden h-12 bg-white">
              <button
                type="button"
                onClick={() => handleQtyChange('dec')}
                className="px-3.5 hover:bg-gray-100 transition-colors text-gray-600"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 text-sm font-bold text-dark w-12 text-center select-none">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => handleQtyChange('inc')}
                className="px-3.5 hover:bg-gray-100 transition-colors text-gray-600"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Add to Cart button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`flex-1 min-w-[150px] h-12 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                product.stock <= 0
                  ? 'bg-gray-100 border border-gray-200 text-gray-400 cursor-not-allowed'
                  : isAdded
                  ? 'bg-green-600 text-cream'
                  : 'bg-primary hover:bg-primary-dark text-cream'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>{locale === 'ar' ? 'تمت إضافة المنتج للسلة' : 'Added to Cart!'}</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>{t('prod.add_to_cart')}</span>
                </>
              )}
            </button>

            {/* Buy Now button */}
            <button
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className="px-6 h-12 bg-gold hover:bg-gold-light text-dark font-bold rounded-lg text-sm transition-colors border border-gold/10"
            >
              {t('prod.buy_now')}
            </button>

            {/* Wishlist toggle */}
            <button
              onClick={handleWishlistToggle}
              className={`w-12 h-12 rounded-lg flex items-center justify-center border transition-colors ${
                isWishlisted
                  ? 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
                  : 'bg-white border-gray-300 text-gray-400 hover:text-red-500'
              }`}
              title="Add to Wishlist"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Delivery speed simulator check */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-start gap-2.5 text-xs text-gray-600">
            <Truck className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
            <div>
              {locale === 'ar' ? (
                <>
                  <strong>شحن سريع وموثوق</strong> في جميع أنحاء أمريكا. يتم الشحن عادة خلال 24 ساعة من مراكز التوزيع بنيويورك.
                </>
              ) : (
                <>
                  <strong>Fast & reliable shipping</strong> across America. Typically ships within 24 hours from New York hubs.
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs description / ingredients / reviews */}
      <div className="border-t border-light-border pt-10">
        <div className="flex border-b border-light-border gap-6 text-sm font-semibold mb-6">
          <button
            onClick={() => setActiveTab('description')}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === 'description'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-gray-400 hover:text-dark'
            }`}
          >
            {locale === 'ar' ? 'الوصف' : 'Description'}
          </button>
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === 'details'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-gray-400 hover:text-dark'
            }`}
          >
            {locale === 'ar' ? 'التفاصيل والمكونات' : 'Product Details'}
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-3 border-b-2 transition-all ${
              activeTab === 'reviews'
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-gray-400 hover:text-dark'
            }`}
          >
            {t('prod.reviews')} ({product.reviews.length})
          </button>
        </div>

        <div className="text-sm leading-relaxed max-w-3xl">
          {activeTab === 'description' && (
            <p className="text-gray-600 whitespace-pre-line">
              {locale === 'ar' ? product.arabicDescription : product.description}
            </p>
          )}

          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 py-2 border-b border-light-border">
                <span className="text-gray-400 font-semibold">{t('prod.brand')}</span>
                <span className="col-span-2 text-dark font-medium">{product.brand}</span>
              </div>
              <div className="grid grid-cols-3 py-2 border-b border-light-border">
                <span className="text-gray-400 font-semibold">{t('prod.origin')}</span>
                <span className="col-span-2 text-dark font-medium">{translateCountry(product.country, locale)}</span>
              </div>
              <div className="grid grid-cols-3 py-2 border-b border-light-border">
                <span className="text-gray-400 font-semibold">{t('prod.ingredients')}</span>
                <span className="col-span-2 text-gray-600">{product.ingredients}</span>
              </div>
              <div className="grid grid-cols-3 py-2 border-b border-light-border">
                <span className="text-gray-400 font-semibold">{t('prod.allergens')}</span>
                <span className="col-span-2 text-red-600 font-medium">{product.allergens}</span>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {product.reviews.map((rev, idx) => (
                <div key={idx} className="border-b border-light-border pb-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-dark">{rev.author}</span>
                    <span className="text-gray-400">{rev.date}</span>
                  </div>
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < rev.rating ? 'fill-current' : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-gray-600 text-xs">{rev.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related Products list */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-light-border pt-12 space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-dark">
            {t('prod.related')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
