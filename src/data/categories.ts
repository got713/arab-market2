export interface CategoryInfo {
  slug: string;
  name: string;
  arabicName: string;
  description: string;
  arabicDescription: string;
  image: string;
  iconName: string;
}

export const categories: CategoryInfo[] = [
  {
    slug: 'groceries',
    name: 'Pantry & Groceries',
    arabicName: 'البقالة والأغذية الجافة',
    description: 'Olive oils, ghee, honey, tahini, and dry pantry essentials.',
    arabicDescription: 'زيت الزيتون، السمن، العسل، الطحينة، وأسس البقالة الجافة.',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop',
    iconName: 'ShoppingBag'
  },
  {
    slug: 'frozen',
    name: 'Frozen Foods',
    arabicName: 'الأغذية المجمدة',
    description: 'Frozen vegetables, molokhia, okra, falafel, and ready meals.',
    arabicDescription: 'الخضروات المجمدة، الملوخية، البامية، الفلافل، والوجبات الجاهزة.',
    image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=600&auto=format&fit=crop',
    iconName: 'Snowflake'
  },
  {
    slug: 'fresh-bakery',
    name: 'Fresh & Bakery',
    arabicName: 'المخبوزات والمنتجات الطازجة',
    description: 'Fresh pita bread, flatbreads, spinach pies, and seasonal produce.',
    arabicDescription: 'خبز البيتا الطازج، الخبز العربي، فطائر السبانخ، والخضروات الطازجة.',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop',
    iconName: 'Carrot'
  },
  {
    slug: 'dairy-cheese',
    name: 'Dairy & Cheese',
    arabicName: 'الألبان والأجبان',
    description: 'Feta cheese, labneh, halloumi, yogurt, and Middle Eastern dairy.',
    arabicDescription: 'جبنة الفيتا، اللبنة، الحلوم، الزبادي، ومنتجات الألبان الشرق أوسطية.',
    image: 'https://images.unsplash.com/photo-1486887396153-fa416525c108?q=80&w=600&auto=format&fit=crop',
    iconName: 'Milk'
  },
  {
    slug: 'meat-poultry',
    name: 'Meat & Poultry',
    arabicName: 'اللحم والدواجن',
    description: '100% certified Halal beef cuts, lamb, and chicken breasts.',
    arabicDescription: 'قطع لحم بقري حلال معتمد 100%، ريش الضأن، وصدور الدجاج.',
    image: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?q=80&w=600&auto=format&fit=crop',
    iconName: 'Beef'
  },
  {
    slug: 'beverages',
    name: 'Beverages',
    arabicName: 'المشروبات والعصائر',
    description: 'Turkish coffee, premium black teas, herbal infusions, and malt sodas.',
    arabicDescription: 'القهوة التركية، الشاي الأسود الممتاز، الأعشاب، ومشروبات الشعير.',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop',
    iconName: 'Coffee'
  },
  {
    slug: 'sweets-snacks',
    name: 'Sweets & Snacks',
    arabicName: 'الحلويات والتسالي',
    description: 'Fresh Baklava, Maamoul cookies, halvah, and sesame biscuits.',
    arabicDescription: 'البقلاوة الطازجة، معمول التمر، الحلاوة الطحينية، وبسكويت السمسم.',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop',
    iconName: 'Cookie'
  },
  {
    slug: 'spices',
    name: 'Spices & Herbs',
    arabicName: 'البهارات والأعشاب',
    description: 'Zaatar, sumac, cumin, cardamom, and premium spice blends.',
    arabicDescription: 'الزعتر، السماق، الكمون، الهيل، وخلطات التوابل الممتازة.',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop',
    iconName: 'Flame'
  },
  {
    slug: 'sauces-condiments',
    name: 'Sauces & Condiments',
    arabicName: 'الصلصات والمقبلات',
    description: 'Premium sesame Tahini paste, hot harissa sauces, and pomegranate molasses.',
    arabicDescription: 'طحينة السمسم الفاخرة، صلصات الهريسة الحارة، ودبس الرمان.',
    image: 'https://images.unsplash.com/photo-1470324161839-ce2bb6fa6bc3?q=80&w=600&auto=format&fit=crop',
    iconName: 'Utensils'
  },
  {
    slug: 'canned-jarred',
    name: 'Canned & Jarred Foods',
    arabicName: 'المعلبات والأغذية المحفوظة',
    description: 'Canned fava beans, chickpeas, pickled olives, and preserved grape leaves.',
    arabicDescription: 'الفول المدمس المعلب، الحمص، مخلل الزيتون، وورق العنب المحفوظ.',
    image: 'https://images.unsplash.com/photo-1536630596251-b01b6ace0475?q=80&w=600&auto=format&fit=crop',
    iconName: 'Package'
  },
  {
    slug: 'grains-pasta',
    name: 'Rice, Grains & Pasta',
    arabicName: 'الأرز، الحبوب والمكرونة',
    description: 'Basmati rice, freekeh, couscous, bulgur, and traditional pastas.',
    arabicDescription: 'الأرز البسمتي، الفريكة، الكسكسي، البرغل، والمكرونة التقليدية.',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop',
    iconName: 'Wheat'
  },
  {
    slug: 'household',
    name: 'Household Essentials',
    arabicName: 'المستلزمات المنزلية',
    description: 'Coffee cups, incense, natural olive oil soaps, and home items.',
    arabicDescription: 'فناجين القهوة، البخور والعود، صابون زيت الزيتون، واللوازم المنزلية.',
    image: 'https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?q=80&w=600&auto=format&fit=crop',
    iconName: 'Home'
  }
];
