export interface PurchaseOptionDetails {
  price: number;
  quantity: number; // 1 for single, e.g., 6 for pack, 12 for case
}

export interface PurchaseOptions {
  single: PurchaseOptionDetails;
  pack: PurchaseOptionDetails;
  case: PurchaseOptionDetails;
}

export interface ProductReview {
  rating: number;
  comment: string;
  author: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  arabicName: string;
  brand: string;
  category: string; // Keep for backward compatibility
  categoryId?: string;
  subcategoryId?: string;
  country: string; // Keep for backward compatibility
  origin?: string;
  description: string;
  arabicDescription: string;
  images: string[];
  rating: number;
  reviews: ProductReview[];
  weight: string;
  ingredients: string;
  allergens: string;
  purchaseOptions: PurchaseOptions;
  price?: number; // Single price helper
  packPrice?: number; // Pack price helper
  casePrice?: number; // Case price helper
  stock: number; // Keep for backward compatibility
  inventory?: number; // Alias for stock
  featured: boolean;
  bestSeller: boolean;
  newArrival?: boolean;
  tags?: string[];
  active: boolean; // For admin enablement/disablement
}

export interface Subcategory {
  slug: string;
  name: string;
  arabicName: string;
}

export interface Category {
  id: string;
  name: string;
  arabicName: string;
  slug: string;
  description: string;
  arabicDescription?: string;
  image: string;
  icon: string;
  subcategories: Subcategory[];
}

export interface CartItem {
  product: Product;
  option: 'single' | 'pack' | 'case';
  quantity: number;
}

export interface OrderCustomer {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export interface Order {
  id: string;
  customer: OrderCustomer;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  paymentMethod: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  date: string;
  trackingNumber: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string;
  status: 'Active' | 'Inactive';
}

export interface Coupon {
  code: string;
  discountPercent: number;
  minOrder: number;
  usageCount: number;
  maxUsage: number;
  expires: string;
}
