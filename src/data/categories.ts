import { Category } from '@/types';

export interface CategoryInfo extends Category {
  iconName: string; // for backward compatibility
  arabicDescription: string;
}

// Kept in sync by hand with catalog:restructure-categories on the backend —
// this static list drives the header/footer nav and any screen that can't
// wait on the /categories API call, so its slugs must match the live DB.
export const categories: CategoryInfo[] = [
  {
    id: 'frozen-foods',
    slug: 'frozen-foods',
    name: 'Frozen Foods',
    arabicName: 'المجمدات والمثلجات',
    description: 'Frozen vegetables, dough & pastries, and quick meals.',
    arabicDescription: 'خضار مجمد، عجائن، ووجبات سريعة.',
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?q=80&w=600&auto=format&fit=crop',
    icon: 'Snowflake',
    iconName: 'Snowflake',
    subcategories: [
      { slug: 'frozen-vegetables', name: 'Frozen Vegetables', arabicName: 'الخضروات المجمدة' },
      { slug: 'frozen-dough', name: 'Frozen Dough & Pastries', arabicName: 'العجين والمعجنات المجمدة' },
      { slug: 'frozen-meals', name: 'Frozen Meals', arabicName: 'الوجبات المجمدة' }
    ]
  },
  {
    id: 'canned-foods',
    slug: 'canned-foods',
    name: 'Canned Foods',
    arabicName: 'الأطعمة المعلبة',
    description: 'Tuna, sardines, fava beans, and hommos.',
    arabicDescription: 'تونة، سردين، فول، وحمص.',
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600&auto=format&fit=crop',
    icon: 'ShoppingBag',
    iconName: 'ShoppingBag',
    subcategories: [
      { slug: 'canned-fish', name: 'Canned Fish', arabicName: 'الأسماك المعلبة' },
      { slug: 'legumes', name: 'Legumes & Hommos', arabicName: 'البقوليات والحمص' },
      { slug: 'pickles-vine-leaves', name: 'Pickles & Vine Leaves', arabicName: 'المخللات وورق العنب' }
    ]
  },
  {
    id: 'rice-pasta-grains',
    slug: 'rice-pasta-grains',
    name: 'Rice, Pasta & Grains',
    arabicName: 'الأرز والمكرونة والحبوب',
    description: 'Pasta, rice, legumes, and flour.',
    arabicDescription: 'مكرونة، أرز، بقوليات، ودقيق.',
    image: 'https://images.unsplash.com/photo-1497802492746-aa584aa6ea22?q=80&w=600&auto=format&fit=crop',
    icon: 'ShoppingBag',
    iconName: 'ShoppingBag',
    subcategories: [
      { slug: 'pasta', name: 'Pasta', arabicName: 'المكرونة' },
      { slug: 'rice-grains', name: 'Rice & Grains', arabicName: 'الأرز والحبوب' },
      { slug: 'baking-flour', name: 'Baking & Flour', arabicName: 'الدقيق ومستلزمات الخبيز' }
    ]
  },
  {
    id: 'dairy-eggs',
    slug: 'dairy-eggs',
    name: 'Dairy & Eggs',
    arabicName: 'الألبان والأجبان الطازجة',
    description: 'Cheese, butter, and dairy staples.',
    arabicDescription: 'أجبان، زبدة، وأساسيات الألبان.',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop',
    icon: 'ShoppingBag',
    iconName: 'ShoppingBag',
    subcategories: [
      { slug: 'cheese', name: 'Cheese', arabicName: 'الأجبان' },
      { slug: 'butter-cream', name: 'Butter & Cream', arabicName: 'الزبدة والقشطة' }
    ]
  },
  {
    id: 'coffee-tea-drinks',
    slug: 'coffee-tea-drinks',
    name: 'Coffee, Tea & Drinks',
    arabicName: 'الشاي والقهوة والمشروبات',
    description: 'Coffee, tea, juices, and soft drinks.',
    arabicDescription: 'بن، شاي، عصائر، ومشروبات باردة.',
    image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?q=80&w=600&auto=format&fit=crop',
    icon: 'Coffee',
    iconName: 'Coffee',
    subcategories: [
      { slug: 'coffee', name: 'Coffee', arabicName: 'القهوة' },
      { slug: 'tea', name: 'Tea', arabicName: 'الشاي' },
      { slug: 'juices-soft-drinks', name: 'Juices & Soft Drinks', arabicName: 'العصائر والمشروبات الغازية' },
      { slug: 'syrups-water', name: 'Syrups & Water', arabicName: 'الشراب والمياه' }
    ]
  },
  {
    id: 'nuts-seeds-snacks',
    slug: 'nuts-seeds-snacks',
    name: 'Nuts, Seeds & Snacks',
    arabicName: 'المكسرات واللب والتسالي',
    description: 'Nuts, seeds, and crunchy snacks.',
    arabicDescription: 'لب، مكسرات، شيبسي، ومقرمشات.',
    image: 'https://images.unsplash.com/photo-1775210291462-af8fd54da403?q=80&w=600&auto=format&fit=crop',
    icon: 'Cookie',
    iconName: 'Cookie',
    subcategories: [
      { slug: 'nuts-seeds', name: 'Nuts & Seeds', arabicName: 'المكسرات واللب' },
      { slug: 'crackers-crisps', name: 'Crackers & Crisps', arabicName: 'الكراكرز والشيبسي' }
    ]
  },
  {
    id: 'sweets-biscuits',
    slug: 'sweets-biscuits',
    name: 'Sweets & Biscuits',
    arabicName: 'الشوكولاتة والحلويات والبسكويت',
    description: 'Chocolate, cakes, maamoul, and biscuits.',
    arabicDescription: 'شوكولاتة، كعك، معمول، وبسكويت.',
    image: 'https://images.unsplash.com/photo-1625414502495-0c35143e32d3?q=80&w=600&auto=format&fit=crop',
    icon: 'Cookie',
    iconName: 'Cookie',
    subcategories: [
      { slug: 'chocolate', name: 'Chocolate', arabicName: 'الشوكولاتة' },
      { slug: 'biscuits-wafers', name: 'Biscuits & Wafers', arabicName: 'البسكويت والويفر' },
      { slug: 'baklava-dates', name: 'Baklava & Dates', arabicName: 'البقلاوة والتمور' },
      { slug: 'halawa-turkish-delight', name: 'Halawa & Turkish Delight', arabicName: 'الحلاوة والراحة' }
    ]
  },
  {
    id: 'oils-spices-sauces',
    slug: 'oils-spices-sauces',
    name: 'Oils, Spices & Sauces',
    arabicName: 'الزيوت والتوابل والصوصات',
    description: 'Oils, ghee, spices, and pickles.',
    arabicDescription: 'زيوت، سمن، بهارات، ومخللات.',
    image: 'https://images.unsplash.com/photo-1574484152510-903878da786c?q=80&w=600&auto=format&fit=crop',
    icon: 'Flame',
    iconName: 'Flame',
    subcategories: [
      { slug: 'oils-ghee', name: 'Oils & Ghee', arabicName: 'الزيوت والسمن' },
      { slug: 'spices-herbs', name: 'Spices & Herbs', arabicName: 'البهارات والأعشاب' },
      { slug: 'sauces-condiments', name: 'Sauces & Condiments', arabicName: 'الصوصات والمقبلات' }
    ]
  }
];
