import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Locale = 'en' | 'ar';

export interface TranslationDictionary {
  [key: string]: {
    en: string;
    ar: string;
  };
}

export const translations: TranslationDictionary = {
  // Navigation & Header
  'nav.home': { en: 'Home', ar: 'الرئيسية' },
  'nav.shop': { en: 'Shop All', ar: 'تسوق الكل' },
  'nav.categories': { en: 'Categories', ar: 'الأقسام' },
  'nav.deals': { en: 'Deals', ar: 'العروض' },
  'nav.about': { en: 'About Us', ar: 'من نحن' },
  'nav.contact': { en: 'Contact', ar: 'اتصل بنا' },
  'nav.faq': { en: 'FAQ', ar: 'الأسئلة الشائعة' },
  'nav.track': { en: 'Track Order', ar: 'تتبع الطلب' },
  'nav.admin': { en: 'Admin Portal', ar: 'بوابة الإدارة' },
  'header.search': { en: 'Search for Middle Eastern groceries...', ar: 'ابحث عن مواد غذائية عربية...' },
  'header.zip_code': { en: 'Deliver to', ar: 'التوصيل إلى' },
  'header.enter_zip': { en: 'Enter ZIP Code', ar: 'أدخل الرمز البريدي' },
  'header.account': { en: 'Account', ar: 'حسابي' },
  'header.wishlist': { en: 'Wishlist', ar: 'المفضلة' },
  'header.cart': { en: 'Cart', ar: 'السلة' },
  'header.announcement': { en: '', ar: '' },

  // Hero Section
  'hero.title': { en: 'Your Favorite Arabic Groceries, Delivered Across America', ar: 'بقالتك العربية المفضلة، تصلك أينما كنت في أمريكا' },
  'hero.subtitle': { en: 'Shop authentic Middle Eastern groceries, snacks, frozen foods, spices, sweets, and household essentials.', ar: 'تسوق المواد الغذائية والوجبات الخفيفة والأغذية المجمدة والبهارات والحلويات والمستلزمات المنزلية الشرق أوسطية الأصيلة.' },
  'hero.cta_shop': { en: 'Shop Now', ar: 'تسوق الآن' },
  'hero.cta_categories': { en: 'Browse Categories', ar: 'تصفح الأقسام' },

  // Categories
  'cat.egyptian': { en: 'Egyptian', ar: 'مصري' },
  'cat.levantine': { en: 'Levantine', ar: 'بلاد الشام' },
  'cat.gulf': { en: 'Gulf', ar: 'الخليج العربي' },
  'cat.maghreb': { en: 'Maghreb', ar: 'المغرب العربي' },
  'cat.groceries': { en: 'Groceries', ar: 'البقالة العامة' },
  'cat.frozen': { en: 'Frozen', ar: 'المجمدات' },
  'cat.sweets': { en: 'Sweets & Desserts', ar: 'الحلويات الشرقية' },
  'cat.beverages': { en: 'Beverages', ar: 'المشروبات' },
  'cat.spices': { en: 'Spices & Herbs', ar: 'البهارات والتوابل' },
  'cat.household': { en: 'Household', ar: 'مستلزمات منزلية' },

  // Filters & Sorting
  'shop.filters': { en: 'Filters', ar: 'الفلاتر' },
  'shop.clear': { en: 'Clear All', ar: 'مسح الكل' },
  'shop.sort': { en: 'Sort By', ar: 'ترتيب حسب' },
  'shop.sort.relevance': { en: 'Relevance', ar: 'الأكثر ملاءمة' },
  'shop.sort.price_asc': { en: 'Price: Low to High', ar: 'السعر: من الأقل للأعلى' },
  'shop.sort.price_desc': { en: 'Price: High to Low', ar: 'السعر: من الأعلى للأقل' },
  'shop.sort.rating': { en: 'Best Rated', ar: 'الأعلى تقييماً' },
  'shop.sort.newest': { en: 'Newest', ar: 'الأحدث' },
  'shop.filter.category': { en: 'Category', ar: 'القسم' },
  'shop.filter.country': { en: 'Country of Origin', ar: 'بلد المنشأ' },
  'shop.filter.availability': { en: 'Availability', ar: 'حالة التوفر' },
  'shop.filter.instock': { en: 'In Stock', ar: 'متوفر حالياً' },
  'shop.filter.halal': { en: 'Halal Certified Only', ar: 'منتجات حلال فقط' },
  'shop.no_products': { en: 'No products found matching your criteria.', ar: 'لم يتم العثور على منتجات تطابق اختياراتك.' },

  // Product Page & Card
  'prod.single': { en: 'Single', ar: 'حبة' },
  'prod.pack': { en: 'Pack', ar: 'حزمة/رابطة' },
  'prod.case': { en: 'Case', ar: 'صندوق/كرتون' },
  'prod.add_to_cart': { en: 'Add to Cart', ar: 'إضافة إلى السلة' },
  'prod.buy_now': { en: 'Buy Now', ar: 'شراء الآن' },
  'prod.out_of_stock': { en: 'Out of Stock', ar: 'نفد من المخزن' },
  'prod.low_stock': { en: 'Low Stock', ar: 'كمية محدودة متبقية' },
  'prod.save_option': { en: 'Save', ar: 'وفر' },
  'prod.brand': { en: 'Brand', ar: 'العلامة التجارية' },
  'prod.origin': { en: 'Origin', ar: 'المنشأ' },
  'prod.weight': { en: 'Weight', ar: 'الوزن' },
  'prod.ingredients': { en: 'Ingredients', ar: 'المكونات' },
  'prod.allergens': { en: 'Allergen Warning', ar: 'تحذير الحساسية' },
  'prod.storage': { en: 'Storage Instructions', ar: 'تعليمات الحفظ' },
  'prod.reviews': { en: 'Customer Reviews', ar: 'آراء العملاء' },
  'prod.related': { en: 'You May Also Like', ar: 'منتجات قد تعجبك' },
  'prod.halal_tag': { en: 'Halal', ar: 'حلال' },

  // Cart Page
  'cart.title': { en: 'Shopping Cart', ar: 'سلة المشتريات' },
  'cart.empty': { en: 'Your shopping cart is empty.', ar: 'سلة مشترياتك فارغة حالياً.' },
  'cart.subtotal': { en: 'Subtotal', ar: 'المجموع الفرعي' },
  'cart.shipping': { en: 'Shipping Estimator', ar: 'حساب تكلفة الشحن' },
  'cart.total': { en: 'Estimated Total', ar: 'الإجمالي المقدر' },
  'cart.checkout': { en: 'Proceed to Checkout', ar: 'الانتقال للدفع' },
  'cart.continue': { en: 'Continue Shopping', ar: 'مواصلة التسوق' },
  'cart.save_later': { en: 'Save for Later', ar: 'احفظ لوقت لاحق' },
  'cart.remove': { en: 'Remove', ar: 'حذف' },
  'cart.item': { en: 'Item', ar: 'المنتج' },
  'cart.option': { en: 'Option', ar: 'الخيار' },
  'cart.qty': { en: 'Qty', ar: 'الكمية' },

  // ZIP code checker
  'zip.title': { en: 'Where should we deliver?', ar: 'أين تريد شحن طلبيتك؟' },
  'zip.placeholder': { en: 'Enter 5-digit ZIP code', ar: 'أدخل الرمز البريدي المكون من 5 أرقام' },
  'zip.check': { en: 'Check Availability', ar: 'التحقق من التوفر' },
  'zip.available': { en: '✓ Delivery available in your area', ar: '✓ التوصيل متوفر في منطقتك' },
  'zip.unavailable': { en: 'We\'re sorry, delivery is currently unavailable in this area.', ar: 'نأسف، خدمة التوصيل غير متوفرة في هذه المنطقة حالياً.' },
  'zip.standard': { en: 'Standard Delivery (3–5 business days)', ar: 'شحن قياسي (3-5 أيام عمل)' },
  'zip.express': { en: 'Express Delivery (1–2 business days)', ar: 'شحن سريع (1-2 يوم عمل)' },

  // Checkout Flow
  'checkout.title': { en: 'Checkout', ar: 'إتمام الطلب' },
  'checkout.contact': { en: 'Contact Information', ar: 'معلومات الاتصال' },
  'checkout.email': { en: 'Email Address', ar: 'البريد الإلكتروني' },
  'checkout.phone': { en: 'Phone Number', ar: 'رقم الهاتف' },
  'checkout.shipping': { en: 'Shipping Address', ar: 'عنوان الشحن' },
  'checkout.first_name': { en: 'First Name', ar: 'الاسم الأول' },
  'checkout.last_name': { en: 'Last Name', ar: 'اسم العائلة' },
  'checkout.address': { en: 'Address', ar: 'العنوان بالتفصيل' },
  'checkout.apartment': { en: 'Apartment, Suite, Unit, etc. (Optional)', ar: 'شقة، جناح، وحدة إلخ. (اختياري)' },
  'checkout.city': { en: 'City', ar: 'المدينة' },
  'checkout.state': { en: 'State', ar: 'الولاية' },
  'checkout.zip': { en: 'ZIP Code', ar: 'الرمز البريدي' },
  'checkout.delivery_method': { en: 'Delivery Method', ar: 'طريقة التوصيل' },
  'checkout.payment': { en: 'Payment Information (Demo)', ar: 'بيانات الدفع (تجريبية)' },
  'checkout.card_number': { en: 'Card Number', ar: 'رقم البطاقة' },
  'checkout.card_expiry': { en: 'Expiration Date (MM/YY)', ar: 'تاريخ الانتهاء (شهر/سنة)' },
  'checkout.card_cvc': { en: 'CVC / CVV', ar: 'الكود الأمني (CVC)' },
  'checkout.place_order': { en: 'Place Demo Order', ar: 'إتمام الطلب التجريبي' },
  'checkout.coupon_code': { en: 'Coupon Code', ar: 'كود الخصم' },
  'checkout.apply_coupon': { en: 'Apply', ar: 'تطبيق' },

  // Order Success & Tracking
  'order.success.title': { en: 'Order Confirmed! 🎉', ar: 'تم تأكيد طلبك بنجاح! 🎉' },
  'order.success.thank_you': { en: 'Thank you for shopping with Arab Market.', ar: 'شكرًا لتسوقك من عرب ماركت.' },
  'order.success.number': { en: 'Order Number', ar: 'رقم الطلب' },
  'order.success.delivery_est': { en: 'Estimated delivery', ar: 'التوصيل المتوقع' },
  'order.track_btn': { en: 'Track Order', ar: 'تتبع طلبك' },
  'order.track.title': { en: 'Track Your Order', ar: 'تتبع شحنتك' },
  'order.track.desc': { en: 'Enter your order number to track its real-time shipping status.', ar: 'أدخل رقم طلبك لمعرفة حالة الشحن في الوقت الفعلي.' },
  'order.track.placeholder': { en: 'e.g., AM-10482', ar: 'مثال: AM-10482' },
  'order.track.status': { en: 'Current Status', ar: 'الحالة الحالية' },
  'order.status.pending': { en: 'Order Confirmed', ar: 'تم تأكيد الطلب' },
  'order.status.processing': { en: 'Processing', ar: 'جاري التجهيز' },
  'order.status.shipped': { en: 'Shipped', ar: 'تم الشحن' },
  'order.status.out_for_delivery': { en: 'Out for Delivery', ar: 'مع المندوب للتوصيل' },
  'order.status.delivered': { en: 'Delivered', ar: 'تم التسليم' },
  'order.status.cancelled': { en: 'Cancelled', ar: 'ملغي' },

  // Account & Wishlist
  'account.title': { en: 'My Account', ar: 'حسابي الشخصي' },
  'account.profile': { en: 'Profile Details', ar: 'تفاصيل الملف الشخصي' },
  'account.orders': { en: 'Order History', ar: 'طلباتي السابقة' },
  'account.wishlist': { en: 'My Saved Items', ar: 'قائمة الأمنيات' },
  'account.buy_again': { en: 'Buy It Again', ar: 'شراء مجدداً' },
  'account.buy_again_desc': { en: 'Quickly reorder items from your previous orders.', ar: 'أعد طلب المنتجات التي اشتريتها سابقاً بنقرة واحدة.' },
  'account.logout': { en: 'Logout', ar: 'تسجيل الخروج' },
  'account.welcome': { en: 'Welcome back', ar: 'مرحباً بك مجدداً' },
  'account.no_orders': { en: 'You haven\'t placed any orders yet.', ar: 'لم تقم بإجراء أي طلبات بعد.' },

  // Footer & Miscellaneous
  'footer.shop_desc': { en: 'Arab Market brings authentic, premium Middle Eastern & Arabic groceries to doorsteps across the United States. Fresh, fast, and Halal.', ar: 'يوفر عرب ماركت بقالة عربية وشرق أوسطية أصيلة وممتازة لباب منزلك في جميع أنحاء الولايات المتحدة الأمريكية. طازجة، سريعة، وحلال.' },
  'footer.customer_service': { en: 'Customer Service', ar: 'خدمة العملاء' },
  'footer.company': { en: 'Company', ar: 'الشركة' },
  'footer.privacy': { en: 'Privacy Policy', ar: 'سياسة الخصوصية' },
  'footer.terms': { en: 'Terms of Service', ar: 'شروط الخدمة' },
  'footer.all_rights': { en: 'All Rights Reserved. Arab Market.', ar: 'جميع الحقوق محفوظة. عرب ماركت.' }
};

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set, get) => ({
      locale: 'en',
      setLocale: (locale) => {
        set({ locale });
        if (typeof window !== 'undefined') {
          const dir = locale === 'ar' ? 'rtl' : 'ltr';
          document.documentElement.dir = dir;
          document.documentElement.lang = locale;
        }
      },
      t: (key) => {
        const item = translations[key];
        if (!item) return key;
        return item[get().locale] || key;
      },
    }),
    {
      name: 'arab-market-locale',
      // Since t is a function, we don't persist it. Persist will ignore methods.
    }
  )
);
