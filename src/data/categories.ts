import { Category } from '@/types';

export interface CategoryInfo extends Category {
  iconName: string; // for backward compatibility
  arabicDescription: string;
}

export const categories: CategoryInfo[] = [
  {
    id: 'groceries',
    slug: 'groceries',
    name: 'Groceries',
    arabicName: 'البقالة والأغذية',
    description: 'Everyday pantry essentials and Middle Eastern favorites.',
    arabicDescription: 'أساسيات البقالة اليومية والمواد الغذائية الشرق أوسطية المفضلة.',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop',
    icon: 'ShoppingBag',
    iconName: 'ShoppingBag',
    subcategories: [
      { slug: 'pantry', name: 'Pantry', arabicName: 'خزانة المؤن' },
      { slug: 'grains-pasta', name: 'Rice & Grains', arabicName: 'الأرز والحبوب' },
      { slug: 'pasta', name: 'Pasta', arabicName: 'المكرونة' },
      { slug: 'canned-jarred', name: 'Canned Foods', arabicName: 'المعلبات' },
      { slug: 'cooking-essentials', name: 'Cooking Essentials', arabicName: 'أساسيات الطبخ' },
      { slug: 'dry-goods', name: 'Dry Goods', arabicName: 'الأغذية الجافة' }
    ]
  },
  {
    id: 'frozen',
    slug: 'frozen',
    name: 'Frozen',
    arabicName: 'الأغذية المجمدة',
    description: 'Frozen vegetables, pastries, and quick Middle Eastern meals.',
    arabicDescription: 'الخضروات المجمدة، المخبوزات والوجبات الشرق أوسطية السريعة.',
    image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=600&auto=format&fit=crop',
    icon: 'Snowflake',
    iconName: 'Snowflake',
    subcategories: [
      { slug: 'frozen-pastries', name: 'Frozen Pastries', arabicName: 'المعجنات المجمدة' },
      { slug: 'frozen-vegetables', name: 'Frozen Vegetables', arabicName: 'الخضروات المجمدة' },
      { slug: 'frozen-meals', name: 'Frozen Meals', arabicName: 'الوجبات المجمدة' },
      { slug: 'frozen-dough', name: 'Frozen Dough', arabicName: 'العجين المجمد' }
    ]
  },
  {
    id: 'drinks',
    slug: 'drinks',
    name: 'Drinks',
    arabicName: 'المشروبات',
    description: 'Premium coffee, traditional teas, juices, and soft drinks.',
    arabicDescription: 'القهوة الفاخرة، الشاي التقليدي، العصائر، والمشروبات الغازية.',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop',
    icon: 'Coffee',
    iconName: 'Coffee',
    subcategories: [
      { slug: 'coffee', name: 'Coffee', arabicName: 'القهوة' },
      { slug: 'tea', name: 'Tea', arabicName: 'الشاي' },
      { slug: 'juices', name: 'Juices', arabicName: 'العصائر' },
      { slug: 'soft-drinks', name: 'Soft Drinks', arabicName: 'المشروبات الغازية' },
      { slug: 'water', name: 'Water', arabicName: 'المياه' }
    ]
  },
  {
    id: 'sweets-snacks',
    slug: 'sweets-snacks',
    name: 'Sweets & Snacks',
    arabicName: 'الحلويات والتسالي',
    description: 'Baklava, dates, biscuits, traditional chocolates, and savory snacks.',
    arabicDescription: 'البقلاوة، التمور، البسكويت، الشوكولاتة التقليدية، والمقرمشات.',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop',
    icon: 'Cookie',
    iconName: 'Cookie',
    subcategories: [
      { slug: 'baklava', name: 'Baklava', arabicName: 'البقلاوة' },
      { slug: 'biscuits', name: 'Biscuits', arabicName: 'البسكويت' },
      { slug: 'chocolate', name: 'Chocolate', arabicName: 'الشوكولاتة' },
      { slug: 'dates', name: 'Dates', arabicName: 'التمور' },
      { slug: 'snacks', name: 'Snacks', arabicName: 'التسالي' }
    ]
  },
  {
    id: 'spices-sauces',
    slug: 'spices-sauces',
    name: 'Spices & Sauces',
    arabicName: 'التوابل والصلصات',
    description: 'Zaatar, sumac, premium olive oils, tahini, and hot sauces.',
    arabicDescription: 'الزعتر، السماق، زيت الزيتون الممتاز، الطحينة، والصلصات الحارة.',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop',
    icon: 'Flame',
    iconName: 'Flame',
    subcategories: [
      { slug: 'spices', name: 'Spices', arabicName: 'البهارات' },
      { slug: 'herbs', name: 'Herbs', arabicName: 'الأعشاب' },
      { slug: 'seasonings', name: 'Seasonings', arabicName: 'التتبيلات' },
      { slug: 'tahini', name: 'Tahini', arabicName: 'الطحينة' },
      { slug: 'hot-sauces', name: 'Hot Sauces', arabicName: 'الصلصات الحارة' },
      { slug: 'pickles', name: 'Pickles', arabicName: 'المخللات' },
      { slug: 'condiments', name: 'Condiments', arabicName: 'المقبلات' }
    ]
  },
  {
    id: 'household',
    slug: 'household',
    name: 'Household',
    arabicName: 'مستلزمات المنزل',
    description: 'Traditional coffee pots, natural soaps, incense, and supplies.',
    arabicDescription: 'أواني القهوة التقليدية، الصابون الطبيعي، البخور، والمستلزمات المنزلية.',
    image: 'https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?q=80&w=600&auto=format&fit=crop',
    icon: 'Home',
    iconName: 'Home',
    subcategories: [
      { slug: 'kitchen', name: 'Kitchen', arabicName: 'المطبخ' },
      { slug: 'cleaning', name: 'Cleaning', arabicName: 'المنظفات' },
      { slug: 'household-supplies', name: 'Household Supplies', arabicName: 'مستلزمات منزلية' },
      { slug: 'personal-care', name: 'Personal Care', arabicName: 'العناية الشخصية' }
    ]
  }
];
