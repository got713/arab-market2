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
    slug: 'egyptian',
    name: 'Egyptian Foods',
    arabicName: 'المأكولات المصرية',
    description: 'Authentic flavors from Cairo and Alexandria, including Molokhia, Koshary items, and Fava Beans.',
    arabicDescription: 'النكهات المصرية الأصيلة من القاهرة والإسكندرية، بما في ذلك الملوخية والفسيخ والكشري والفول المدمس.',
    image: 'https://images.unsplash.com/photo-1541518763669-27fef04b14ea?q=80&w=600&auto=format&fit=crop',
    iconName: 'Pyramid'
  },
  {
    slug: 'levantine',
    name: 'Levantine Specialties',
    arabicName: 'التخصصات الشامية',
    description: 'Delicacies from Lebanon, Syria, Jordan, and Palestine - Hummus, Tahini, Grape Leaves, and Olive Oils.',
    arabicDescription: 'مأكولات شهية من لبنان وسوريا والأردن وفلسطين - الحمص والطحينة وورق العنب وزيت الزيتون البكر.',
    image: 'https://images.unsplash.com/photo-1547058886-f6d62c3f87ec?q=80&w=600&auto=format&fit=crop',
    iconName: 'Compass'
  },
  {
    slug: 'gulf',
    name: 'Gulf Selects',
    arabicName: 'مختارات الخليج',
    description: 'Kabsa spices, premium Basmati rice, cardamom teas, and dates from the Arabian Peninsula.',
    arabicDescription: 'بهارات الكبسة، الأرز البسمتي الفاخر، شاي الهيل، والتمور الفاخرة من الجزيرة العربية.',
    image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?q=80&w=600&auto=format&fit=crop',
    iconName: 'Sun'
  },
  {
    slug: 'maghreb',
    name: 'Maghrebi Delights',
    arabicName: 'مأكولات المغرب العربي',
    description: 'Moroccan Couscous, Harissa, mint teas, and unique spices from North Africa.',
    arabicDescription: 'الكسكس المغربي، الهريسة التونسية، شاي النعناع، والتوابل الفريدة من شمال إفريقيا.',
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=600&auto=format&fit=crop',
    iconName: 'Moon'
  },
  {
    slug: 'groceries',
    name: 'Pantry Groceries',
    arabicName: 'مواد البقالة',
    description: 'Canned fava beans, chickpeas, extra virgin olive oils, tahini, Halva, and cooking essentials.',
    arabicDescription: 'الفول المدمس المعلب، الحمص، زيت الزيتون البكر، الطحينة، الحلاوة الطحينية، وأساسيات الطبخ.',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop',
    iconName: 'ShoppingBag'
  },
  {
    slug: 'frozen',
    name: 'Frozen Foods',
    arabicName: 'المجمدات',
    description: 'Frozen Molokhia, Okra, Falafel patties, and pre-packaged Middle Eastern meals.',
    arabicDescription: 'الملوخية المجمدة، البامية الممتازة، أقراص الفلافل الجاهزة، والوجبات الشرق أوسطية الجاهزة.',
    image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=600&auto=format&fit=crop',
    iconName: 'Snowflake'
  },
  {
    slug: 'sweets',
    name: 'Baklava & Sweets',
    arabicName: 'الحلويات الشرقية',
    description: 'Freshly baked Baklava, Halva, date cookies, Maamoul, and sweet syrups.',
    arabicDescription: 'البقلاوة الطازجة، الحلاوة، بسكويت التمر (المعمول)، والقطر المركز.',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop',
    iconName: 'Cookie'
  },
  {
    slug: 'beverages',
    name: 'Beverages & Teas',
    arabicName: 'المشروبات والشاي',
    description: 'Turkish coffee, cardamom black tea, herbal infusions, and Barbican malt beverages.',
    arabicDescription: 'القهوة التركية بالهيل، الشاي الأسود المخمر، شاي الأعشاب، ومشروبات باربيكان الشعير.',
    image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop',
    iconName: 'Coffee'
  },
  {
    slug: 'spices',
    name: 'Spices & Herbs',
    arabicName: 'البهارات والتوابل',
    description: 'Zaatar, Sumac, Seven Spices mix, cumin, cardamom, and premium saffron.',
    arabicDescription: 'الزعتر البري، السماق، السبع بهارات، الكمون المطحون، الهيل، والزعفران الإيراني الفاخر.',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop',
    iconName: 'Flame'
  },
  {
    slug: 'household',
    name: 'Household & Incense',
    arabicName: 'المستلزمات المنزلية والعود',
    description: 'Dallah coffee pots, Turkish teacups, Bakhoor, incense burners, and olive oil soaps.',
    arabicDescription: 'الدلال (أواني القهوة)، كاسات الشاي التركية، البخور والعود، المباخر، وصابون زيت الزيتون.',
    image: 'https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?q=80&w=600&auto=format&fit=crop',
    iconName: 'Home'
  }
];
