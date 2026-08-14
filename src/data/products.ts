import { Product } from '../types';

export const products: Product[] = [
  {
    id: 'prod-001',
    name: 'Egyptian Molokhia - Premium Frozen',
    slug: 'egyptian-molokhia-frozen',
    arabicName: 'ملوخية مصرية - مجمدة ممتازة',
    brand: 'Americana',
    category: 'frozen',
    country: 'Egypt',
    description: 'Freshly harvested and minced jute leaves, perfect for making traditional Egyptian Molokhia stew. Extremely nutritious and authentic.',
    arabicDescription: 'أوراق ملوخية طازجة ومفرومة بعناية، مثالية لتحضير طاجن الملوخية المصري التقليدي. مغذية وغنية بالنكهة الأصلية.',
    images: ['https://images.unsplash.com/photo-1547058886-f6d62c3f87ec?q=80&w=600&auto=format&fit=crop'],
    rating: 4.8,
    reviews: [
      { author: 'Mariam H.', rating: 5, comment: 'Just like my grandmother makes in Cairo! Very fresh.', date: '2026-07-20' },
      { author: 'Sherif A.', rating: 4.5, comment: 'Excellent texture and color. Highly recommend.', date: '2026-08-02' }
    ],
    weight: '400g',
    ingredients: 'Finely minced Molokhia (jute) leaves.',
    allergens: 'None',
    purchaseOptions: {
      single: { price: 4.99, quantity: 1 },
      pack: { price: 26.99, quantity: 6 }, // Save $2.95
      case: { price: 49.99, quantity: 12 } // Save $9.89
    },
    stock: 120,
    featured: true,
    bestSeller: true,
    active: true
  },
  {
    id: 'prod-002',
    name: 'Premium Al-Doha Egyptian Rice',
    slug: 'al-doha-egyptian-rice',
    arabicName: 'أرز مصري الضحى - فاخر',
    brand: 'Al-Doha',
    category: 'groceries',
    country: 'Egypt',
    description: 'Authentic medium-grain Egyptian white rice. Perfect for preparing Egyptian rice with vermicelli (sheereya) or stuffing vegetables (mahshi).',
    arabicDescription: 'أرز مصري طبيعي حبة متوسطة فاخر. مثالي لعمل الأرز المصري بالشعرية أو حشو المحاشي.',
    images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop'],
    rating: 4.7,
    reviews: [
      { author: 'Fatma K.', rating: 5, comment: 'The cleanest Egyptian rice available in the US market.', date: '2026-06-15' }
    ],
    weight: '1kg',
    ingredients: '100% Medium Grain Egyptian Rice.',
    allergens: 'None',
    purchaseOptions: {
      single: { price: 5.49, quantity: 1 },
      pack: { price: 29.99, quantity: 6 },
      case: { price: 54.99, quantity: 12 }
    },
    stock: 85,
    featured: true,
    bestSeller: false,
    active: true
  },
  {
    id: 'prod-003',
    name: 'Cortas Canned Fava Beans - Plain Medammas',
    slug: 'cortas-fava-beans',
    arabicName: 'فول مدمس كورتاس - سادة',
    brand: 'Cortas',
    category: 'groceries',
    country: 'Lebanon',
    description: 'Traditional canned fava beans cooked to perfection. Mash them with garlic, lemon, cumin, and extra virgin olive oil for a classic Middle Eastern breakfast.',
    arabicDescription: 'فول مدمس لبناني تقليدي مطبوخ بعناية. اهرسه مع الثوم والليمون والكمون وزيت الزيتون البكر لفطور عربي كلاسيكي.',
    images: ['https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600&auto=format&fit=crop'],
    rating: 4.9,
    reviews: [
      { author: 'Rami S.', rating: 5, comment: 'A daily breakfast staple in our house. Tastes authentic.', date: '2026-08-10' }
    ],
    weight: '450g',
    ingredients: 'Fava beans, water, salt, citric acid, calcium disodium EDTA.',
    allergens: 'None',
    purchaseOptions: {
      single: { price: 2.49, quantity: 1 },
      pack: { price: 13.49, quantity: 6 },
      case: { price: 24.99, quantity: 12 }
    },
    stock: 300,
    featured: false,
    bestSeller: true,
    active: true
  },
  {
    id: 'prod-004',
    name: 'Authentic Lebanese Tahini Sesame Paste',
    slug: 'cortas-tahini',
    arabicName: 'طحينة سمسم لبنانية أصيلة',
    brand: 'Cortas',
    category: 'groceries',
    country: 'Lebanon',
    description: '100% pure ground sesame paste. Smooth texture and nutty flavor, perfect for making Hummus, Baba Ghanoush, Halva, and Tarator sauce.',
    arabicDescription: 'عصارة سمسم صافية 100%. قوام ناعم وطعم غني بالسمسم المحمص، ممتاز لصنع الحمص، البابا غنوج، الحلاوة، وصلصة الطراطور.',
    images: ['https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?q=80&w=600&auto=format&fit=crop'],
    rating: 4.6,
    reviews: [
      { author: 'Youssef B.', rating: 4, comment: 'Nice, runnier consistency, makes dressing very easy.', date: '2026-07-28' }
    ],
    weight: '450g',
    ingredients: '100% Hulled Sesame Seeds.',
    allergens: 'Sesame',
    purchaseOptions: {
      single: { price: 6.99, quantity: 1 },
      pack: { price: 38.99, quantity: 6 },
      case: { price: 72.99, quantity: 12 }
    },
    stock: 140,
    featured: true,
    bestSeller: true,
    active: true
  },
  {
    id: 'prod-005',
    name: 'Ziyad Extra Virgin Olive Oil - Cold Pressed',
    slug: 'ziyad-extra-virgin-olive-oil',
    arabicName: 'زيت زيتون بكر ممتاز زياد - كبس بارد',
    brand: 'Ziyad',
    category: 'groceries',
    country: 'Palestine',
    description: 'Cold-pressed extra virgin olive oil harvested from West Bank olive groves. Fruity notes with a peppery finish, perfect for dipping with Zaatar.',
    arabicDescription: 'زيت زيتون بكر ممتاز معصور على البارد من مزارع الزيتون الفلسطينية. نكهة غنية تكتمل بلمسة حدة خفيفة، مثالي لتناوله مع الزعتر.',
    images: ['https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=600&auto=format&fit=crop'],
    rating: 4.9,
    reviews: [
      { author: 'Huda T.', rating: 5, comment: 'The smell takes me right back to Palestine. Amazing quality!', date: '2026-08-05' }
    ],
    weight: '750ml',
    ingredients: '100% Cold Pressed Extra Virgin Olive Oil.',
    allergens: 'None',
    purchaseOptions: {
      single: { price: 14.99, quantity: 1 },
      pack: { price: 82.99, quantity: 6 },
      case: { price: 159.99, quantity: 12 }
    },
    stock: 60,
    featured: true,
    bestSeller: true,
    active: true
  },
  {
    id: 'prod-006',
    name: 'Al-Wazah Ceylon Black Tea - Loose Leaf',
    slug: 'al-wazah-ceylon-tea',
    arabicName: 'شاي سيلان أسود الوزة - فرط',
    brand: 'Al-Wazah',
    category: 'drinks',
    country: 'Jordan',
    description: 'High-quality Pure Ceylon black tea. Famously known as "Swan Tea", it delivers a deep, robust flavor and dark golden brew, best enjoyed with fresh mint or sage (marmaraya).',
    arabicDescription: 'شاي أسود سيلاني خالص عالي الجودة. يشتهر بشاي الوزة، يقدم نكهة عميقة وقوية ولوناً ذهبياً داكناً، يفضل شربه مع النعناع أو الميرمية.',
    images: ['https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=600&auto=format&fit=crop'],
    rating: 4.8,
    reviews: [
      { author: 'Tariq M.', rating: 5, comment: 'The only tea we drink in our family. Absolute best.', date: '2026-08-01' }
    ],
    weight: '454g',
    ingredients: '100% Pure Ceylon Black Tea.',
    allergens: 'None',
    purchaseOptions: {
      single: { price: 8.99, quantity: 1 },
      pack: { price: 49.99, quantity: 6 },
      case: { price: 92.99, quantity: 12 }
    },
    stock: 95,
    featured: false,
    bestSeller: true,
    active: true
  },
  {
    id: 'prod-007',
    name: 'Premium Medjool Dates - Large Jumbo',
    slug: 'premium-medjool-dates',
    arabicName: 'تمر مجدول فاخر - حجم جامبو',
    brand: 'Desert Fruit',
    category: 'sweets-snacks',
    country: 'Saudi Arabia',
    description: 'Rich, soft, and sweet Medjool dates with a honey-like taste and caramel texture. A healthy and natural source of energy, and an essential guest during Ramadan.',
    arabicDescription: 'تمور مجدول غنية وناعمة وحلوة المذاق بنكهة تشبه العسل وقوام الكراميل. مصدر طاقة طبيعي وصحي، ورفيق أساسي في رمضان.',
    images: ['https://images.unsplash.com/photo-1506084868230-bb9d95c24759?q=80&w=600&auto=format&fit=crop'],
    rating: 4.9,
    reviews: [
      { author: 'Lila F.', rating: 5, comment: 'Super soft and sweet. Plump dates, very good value.', date: '2026-08-11' }
    ],
    weight: '908g',
    ingredients: 'Natural Medjool Dates (with pits).',
    allergens: 'None',
    purchaseOptions: {
      single: { price: 16.99, quantity: 1 },
      pack: { price: 94.99, quantity: 6 },
      case: { price: 179.99, quantity: 12 }
    },
    stock: 200,
    featured: true,
    bestSeller: true,
    active: true
  },
  {
    id: 'prod-008',
    name: 'California Garden Falafel Mix',
    slug: 'california-garden-falafel',
    arabicName: 'خلطة الفلافل حدائق كاليفورنيا',
    brand: 'California Garden',
    category: 'groceries',
    country: 'Egypt',
    description: 'Easy-to-prepare authentic Egyptian and Levantine style Falafel mix. Just add water, let sit for 15 minutes, shape, and fry for crispy, golden fava-and-chickpea balls.',
    arabicDescription: 'خلطة فلافل سهلة التحضير على الطريقة المصرية والشامية. أضف الماء فقط، واتركها لمدة 15 دقيقة، ثم شكلها واقليها للحصول على فلافل مقرمشة.',
    images: ['https://images.unsplash.com/photo-1547058886-f6d62c3f87ec?q=80&w=600&auto=format&fit=crop'],
    rating: 4.5,
    reviews: [
      { author: 'Khalid D.', rating: 4, comment: 'Great for a quick dinner. Crisp up very nicely.', date: '2026-05-30' }
    ],
    weight: '350g',
    ingredients: 'Fava beans, chickpeas, spices (coriander, cumin, garlic, onion), salt, baking powder.',
    allergens: 'May contain gluten',
    purchaseOptions: {
      single: { price: 3.49, quantity: 1 },
      pack: { price: 18.99, quantity: 6 },
      case: { price: 34.99, quantity: 12 }
    },
    stock: 150,
    featured: false,
    bestSeller: false,
    active: true
  },
  {
    id: 'prod-009',
    name: 'Mehmet Efendi Turkish Coffee with Cardamom',
    slug: 'mehmet-efendi-turkish-coffee-cardamom',
    arabicName: 'قهوة تركية محمد أفندي بالهيل',
    brand: 'Mehmet Efendi',
    category: 'drinks',
    country: 'Gulf',
    description: 'Finely ground Turkish coffee blend, premixed with aromatic cardamom. Roasted using heritage methods for a dense, delicious, and frothy cup.',
    arabicDescription: 'بن قهوة تركي مطحون طحناً ناعماً جداً، مخلوط مسبقاً بالهيل العطري. محمص بطرق تراثية للحصول على رغوة غنية وطعم مميز.',
    images: ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop'],
    rating: 4.8,
    reviews: [
      { author: 'Zeinab A.', rating: 5, comment: 'Amazing crema! Cardamom balance is perfect.', date: '2026-08-08' }
    ],
    weight: '250g',
    ingredients: '100% Arabica Coffee, Ground Cardamom.',
    allergens: 'None',
    purchaseOptions: {
      single: { price: 7.99, quantity: 1 },
      pack: { price: 44.99, quantity: 6 },
      case: { price: 84.99, quantity: 12 }
    },
    stock: 110,
    featured: true,
    bestSeller: true,
    active: true
  },
  {
    id: 'prod-010',
    name: 'Durra Stuffed Grape Leaves with Rice',
    slug: 'durra-stuffed-grape-leaves',
    arabicName: 'ورق عنب محشي بالخطبة الدرة',
    brand: 'Durra',
    category: 'groceries',
    country: 'Syria',
    description: 'Ready-to-eat stuffed grape leaves (Yalanji). Cooked with premium rice, onions, parsley, spices, and olive oil, packed in a tangy pomegranate syrup bath.',
    arabicDescription: 'ورق عنب محشي (يلنجي) جاهز للأكل. مطبوخ بالأرز الفاخر، البصل، البقدونس، التوابل، وزيت الزيتون، مغمور بدبس الرمان اللذيذ.',
    images: ['https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop'],
    rating: 4.7,
    reviews: [
      { author: 'Omar G.', rating: 4, comment: 'A bit sour but very tasty. Hits the spot for canned.', date: '2026-07-12' }
    ],
    weight: '400g',
    ingredients: 'Rice, water, grape leaves, onions, soy oil, salt, spices, citric acid.',
    allergens: 'Soy',
    purchaseOptions: {
      single: { price: 3.99, quantity: 1 },
      pack: { price: 21.99, quantity: 6 },
      case: { price: 39.99, quantity: 12 }
    },
    stock: 180,
    featured: false,
    bestSeller: true,
    active: true
  },
  {
    id: 'prod-011',
    name: 'Al-Kasih Liquid Jameed for Mansaf',
    slug: 'al-kasih-liquid-jameed',
    arabicName: 'جميد سائل الكسيح للمنسف الأردني',
    brand: 'Al-Kasih',
    category: 'groceries',
    country: 'Jordan',
    description: 'Premium liquid sheep milk jameed, prepared to make cooking Mansaf - Jordan\'s national dish - incredibly easy. No soaking or blending needed.',
    arabicDescription: 'جميد سائل محضر من حليب الأغنام الفاخر لتسهيل طبخ المنسف - طبق الأردن الوطني. لا يحتاج للنقع أو الخلط.',
    images: ['https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop'],
    rating: 4.9,
    reviews: [
      { author: 'Lara J.', rating: 5, comment: 'Saves so much time! The taste is perfectly sour and salty.', date: '2026-08-04' }
    ],
    weight: '1kg',
    ingredients: 'Pasteurized sheep milk cheese (jameed), salt, stabilizers, water.',
    allergens: 'Dairy',
    purchaseOptions: {
      single: { price: 9.99, quantity: 1 },
      pack: { price: 54.99, quantity: 6 },
      case: { price: 99.99, quantity: 12 }
    },
    stock: 90,
    featured: true,
    bestSeller: true,
    active: true
  },
  {
    id: 'prod-012',
    name: 'Lebanese Thyme Green Zaatar Mix',
    slug: 'lebanese-thyme-green-zaatar',
    arabicName: 'زعتر أخضر لبناني بالسمسم',
    brand: 'Ziyad',
    category: 'spices-sauces',
    country: 'Lebanon',
    description: 'Authentic wild thyme blend with roasted sesame seeds, sumac, and a touch of salt. Mix with olive oil for the ultimate dipping paste or sprinkle on Manakeesh flatbread.',
    arabicDescription: 'زعتر بري أخضر أصيل مخلوط بالسمسم المحمص والسماق وقرصة ملح. يخلط مع زيت الزيتون للمسح أو لعمل المناقيش الشامية.',
    images: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop'],
    rating: 4.7,
    reviews: [
      { author: 'Bassem Y.', rating: 5, comment: 'Very fragrant. Not too salty like other brands.', date: '2026-07-22' }
    ],
    weight: '250g',
    ingredients: 'Wild thyme, sesame seeds, sumac, salt, sunflower oil.',
    allergens: 'Sesame',
    purchaseOptions: {
      single: { price: 5.99, quantity: 1 },
      pack: { price: 32.99, quantity: 6 },
      case: { price: 59.99, quantity: 12 }
    },
    stock: 160,
    featured: true,
    bestSeller: true,
    active: true
  },
  {
    id: 'prod-013',
    name: 'Moroccan Couscous - Medium Grain',
    slug: 'moroccan-couscous-medium',
    arabicName: 'كسكس مغربي - حبة متوسطة',
    brand: 'Dari',
    category: 'groceries',
    country: 'Morocco',
    description: 'Traditional Moroccan semolina couscous. Pre-steamed and dried for instant cooking. Serve with lamb, chicken, or stewed vegetables for an authentic Maghrebi meal.',
    arabicDescription: 'كسكس سميد مغربي تقليدي. مبخر ومجفف مسبقاً لسهولة الطبخ. يقدم مع لحم الضأن أو الدجاج أو الخضار المطبوخة لوجبة مغربية أصيلة.',
    images: ['https://images.unsplash.com/photo-1587314168485-3236d6710814?q=80&w=600&auto=format&fit=crop'],
    rating: 4.8,
    reviews: [
      { author: 'Nadia E.', rating: 5, comment: 'Dari is the best brand in Morocco. So happy to find it here.', date: '2026-08-09' }
    ],
    weight: '1kg',
    ingredients: '100% Durum Wheat Semolina.',
    allergens: 'Gluten',
    purchaseOptions: {
      single: { price: 6.49, quantity: 1 },
      pack: { price: 35.99, quantity: 6 },
      case: { price: 64.99, quantity: 12 }
    },
    stock: 100,
    featured: false,
    bestSeller: false,
    active: true
  },
  {
    id: 'prod-014',
    name: 'Tunisian Harissa Hot Chili Paste',
    slug: 'tunisian-harissa-paste',
    arabicName: 'هريسة حارة تونسية',
    brand: 'Le Phare du Cap Bon',
    category: 'spices-sauces',
    country: 'Morocco', // Represent North Africa/Maghreb
    description: 'Authentic fiery red hot pepper paste seasoned with garlic, coriander, and caraway. Essential condiment for couscous, soups, marinades, and sandwiches.',
    arabicDescription: 'عجون هريسة حارة تونسية أصيلة متبلة بالثوم والكزبرة والكروية. چاشني أساسي للكسكس والشوربات وتتبيل اللحوم.',
    images: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop'],
    rating: 4.7,
    reviews: [
      { author: 'Amine B.', rating: 5, comment: 'Real Tunisian heat! Very spicy and savory.', date: '2026-06-25' }
    ],
    weight: '150g',
    ingredients: 'Red hot peppers, garlic, coriander, caraway, salt.',
    allergens: 'None',
    purchaseOptions: {
      single: { price: 2.99, quantity: 1 },
      pack: { price: 15.99, quantity: 6 },
      case: { price: 29.99, quantity: 12 }
    },
    stock: 220,
    featured: false,
    bestSeller: true,
    active: true
  },
  {
    id: 'prod-015',
    name: 'Cortas Pomegranate Molasses - Tangy Sweet',
    slug: 'cortas-pomegranate-molasses',
    arabicName: 'دبس رمان كورتاس - حامض حلو',
    brand: 'Cortas',
    category: 'groceries',
    country: 'Lebanon',
    description: 'Premium pomegranate syrup made from concentrated juice. Adds a delicious sweet and tart flavor to salads (Fattoush), dips (Muhammara), and meat glazes.',
    arabicDescription: 'شراب رمان مركز ممتاز. يضفي نكهة حامضة وحلوة غنية على السلطات (الفتوش)، والغموس (المحمرة)، وتتبيل اللحوم والمشويات.',
    images: ['https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?q=80&w=600&auto=format&fit=crop'],
    rating: 4.9,
    reviews: [
      { author: 'Samer T.', rating: 5, comment: 'Perfect thickness and tartness. A must-have for Fattoush.', date: '2026-08-01' }
    ],
    weight: '300ml',
    ingredients: 'Concentrated pomegranate juice, sugar, citric acid.',
    allergens: 'None',
    purchaseOptions: {
      single: { price: 5.99, quantity: 1 },
      pack: { price: 32.99, quantity: 6 },
      case: { price: 59.99, quantity: 12 }
    },
    stock: 130,
    featured: true,
    bestSeller: true,
    active: true
  },
  {
    id: 'prod-016',
    name: 'Syrian Halva Extra Pistachio',
    slug: 'syrian-halva-pistachio',
    arabicName: 'حلاوة طحينية شامية بالفستق الحلبي',
    brand: 'Al-Kanater',
    category: 'sweets-snacks',
    country: 'Syria',
    description: 'Traditional sesame-based sweet halva packed with rich whole Mediterranean pistachios. Crumbles beautifully, perfect for spreading with butter in pocket bread.',
    arabicDescription: 'حلاوة طحينية سمسم تقليدية غنية بالفستق الحلبي المقشر الكامل. تتفتت بشكل رائع ولذيذة جداً للفطور أو العشاء.',
    images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop'],
    rating: 4.8,
    reviews: [
      { author: 'Maya N.', rating: 5, comment: 'Loaded with pistachios! Absolutely delicious.', date: '2026-07-15' }
    ],
    weight: '450g',
    ingredients: 'Tahini (sesame paste), sugar, pistachios, halawa root extract, citric acid, artificial vanillin.',
    allergens: 'Sesame, Pistachios (Nuts)',
    purchaseOptions: {
      single: { price: 8.99, quantity: 1 },
      pack: { price: 49.99, quantity: 6 },
      case: { price: 92.99, quantity: 12 }
    },
    stock: 75,
    featured: true,
    bestSeller: false,
    active: true
  },
  {
    id: 'prod-017',
    name: 'Assorted Baklava Premium Tin Box',
    slug: 'assorted-baklava-tin',
    arabicName: 'علبة بقلاوة مشكلة فاخرة',
    brand: 'Al-Basha',
    category: 'sweets-snacks',
    country: 'Levantine',
    description: 'A luxurious assortment of crispy pastry layered with pistachios, cashews, and pine nuts, soaked in pure sweet ghee and rosewater syrup.',
    arabicDescription: 'تشكيلة فاخرة من أصابع ورقائق البقلاوة الهشة المحشية بالفستق الحلبي والكاجو والصنوبر، ومسقاة بالسمن البلدي والقطر المخفف.',
    images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop'],
    rating: 4.9,
    reviews: [
      { author: 'Jamil K.', rating: 5, comment: 'Stays flaky and crispy. Sweets are not overly sugary. Perfect gift tin.', date: '2026-08-07' }
    ],
    weight: '500g',
    ingredients: 'Wheat flour, sugar, water, pistachios, cashews, butter ghee, vegetable oil, corn starch, salt, rose water.',
    allergens: 'Gluten, Milk, Tree Nuts',
    purchaseOptions: {
      single: { price: 24.99, quantity: 1 },
      pack: { price: 139.99, quantity: 6 },
      case: { price: 269.99, quantity: 12 }
    },
    stock: 50,
    featured: true,
    bestSeller: true,
    active: true
  },
  {
    id: 'prod-018',
    name: 'Barbican Non-Alcoholic Malt Beverage - Pomegranate (6 Pack)',
    slug: 'barbican-pomegranate-6pack',
    arabicName: 'شراب شعير باربيكان خالي من الكحول - رمان (6 حبات)',
    brand: 'Barbican',
    category: 'drinks',
    country: 'Gulf',
    description: 'Refreshing carbonated non-alcoholic malt beverage with a crisp, sweet pomegranate flavor. Best served cold for parties and hot summer days.',
    arabicDescription: 'مشروب شعير غازي خالي من الكحول بنكهة الرمان المنعشة واللذيذة. يقدم بارداً وهو مثالي للتجمعات وأيام الصيف الحارة.',
    images: ['https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop'],
    rating: 4.6,
    reviews: [
      { author: 'Nasser F.', rating: 4.5, comment: 'Classic Middle Eastern soda. Reminds me of my childhood.', date: '2026-07-10' }
    ],
    weight: '6 x 330ml',
    ingredients: 'Carbonated water, sugar, malt concentrate, acidifier (citric acid), natural pomegranate flavor, color.',
    allergens: 'Gluten (Malt)',
    purchaseOptions: {
      single: { price: 9.99, quantity: 1 },
      pack: { price: 54.99, quantity: 6 },
      case: { price: 99.99, quantity: 12 }
    },
    stock: 140,
    featured: false,
    bestSeller: true,
    active: true
  },
  {
    id: 'prod-019',
    name: 'Premium Saudi Ajwa Dates',
    slug: 'premium-saudi-ajwa-dates',
    arabicName: 'تمر عجوة المدينة المنورة فاخر',
    brand: 'Medina Farms',
    category: 'sweets-snacks',
    country: 'Saudi Arabia',
    description: 'A dark, soft, and fruity date variety native to Medina, Saudi Arabia. Celebrated for its unique nutritional and spiritual value. Mildly sweet and melting texture.',
    arabicDescription: 'تمر أسود ناعم وذو حلاوة معتدلة، تشتهر به المدينة المنورة في المملكة العربية السعودية. ذو قيمة غذائية عالية ومذاق فريد.',
    images: ['https://images.unsplash.com/photo-1506084868230-bb9d95c24759?q=80&w=600&auto=format&fit=crop'],
    rating: 5.0,
    reviews: [
      { author: 'Abdelrahman M.', rating: 5, comment: 'Genuine Ajwa dates. Small, fresh, and deeply authentic.', date: '2026-08-02' }
    ],
    weight: '500g',
    ingredients: 'Ajwa Dates.',
    allergens: 'None',
    purchaseOptions: {
      single: { price: 19.99, quantity: 1 },
      pack: { price: 109.99, quantity: 6 },
      case: { price: 199.99, quantity: 12 }
    },
    stock: 80,
    featured: false,
    bestSeller: false,
    active: true
  },
  {
    id: 'prod-020',
    name: 'Maamoul Date Cookies - Traditional Semolina',
    slug: 'maamoul-date-cookies',
    arabicName: 'معمول بالتمر - سميد تقليدي',
    brand: 'Ziyad',
    category: 'sweets-snacks',
    country: 'Levantine',
    description: 'Traditional buttery semolina shortbread cookies filled with sweet, smooth ground dates. Perfectly spiced and melted-in-your-mouth texture. Box contains 12 wrapped cookies.',
    arabicDescription: 'معمول سميد وهش بالزبدة محشي بعجينة التمر الطرية. بطعم الهيل والمستكة والبهارات الشرقية. العلبة تحتوي 12 قطعة مغلفة بشكل فردي.',
    images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop'],
    rating: 4.7,
    reviews: [
      { author: 'Zeina R.', rating: 4, comment: 'Nice, not dry. Great with afternoon tea.', date: '2026-08-03' }
    ],
    weight: '250g',
    ingredients: 'Semolina, butter, date paste, vegetable oil, sugar, mahlab, rose water, yeast.',
    allergens: 'Gluten, Dairy',
    purchaseOptions: {
      single: { price: 4.49, quantity: 1 },
      pack: { price: 23.99, quantity: 6 },
      case: { price: 44.99, quantity: 12 }
    },
    stock: 210,
    featured: false,
    bestSeller: true,
    active: true
  },
  {
    id: 'prod-021',
    name: 'Premium Iranian Sumac Powder',
    slug: 'premium-iranian-sumac-powder',
    arabicName: 'سماق إيراني مطحون فاخر',
    brand: 'Sadaf',
    category: 'spices-sauces',
    country: 'Gulf',
    description: 'Tarty, lemon-flavored red spice coarsely ground from sumac berries. Gives a beautiful dark crimson color and tangy taste to kebabs, roasted chickens, and hummus.',
    arabicDescription: 'بهار أحمر حامض شبيه بالليمون مطحون خشن من ثمار السماق البرية. يضفي نوناً أحمراً وطعماً حامضاً رائعاً للكباب والدجاج المشوي والسماقية والفتوش.',
    images: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop'],
    rating: 4.8,
    reviews: [
      { author: 'Farhad N.', rating: 5, comment: 'Very fresh crimson color, excellent on onions and grilled meats.', date: '2026-07-11' }
    ],
    weight: '150g',
    ingredients: '100% Ground Sumac Berries, salt.',
    allergens: 'None',
    purchaseOptions: {
      single: { price: 4.99, quantity: 1 },
      pack: { price: 26.99, quantity: 6 },
      case: { price: 49.99, quantity: 12 }
    },
    stock: 150,
    featured: false,
    bestSeller: false,
    active: true
  },
  {
    id: 'prod-022',
    name: 'Traditional Libius Arabic Flatbread',
    slug: 'arabic-flatbread-pack',
    arabicName: 'خبز عربي تقليدي - كيس 5 أرغفة',
    brand: 'Libius Bakery',
    category: 'groceries',
    country: 'Levantine',
    description: 'Freshly baked, double-layered pocket flatbread. Perfect for slicing open to stuff falafels, shawarma, or dipping in hummus and Labneh.',
    arabicDescription: 'خبز عربي منفوخ طازج بطبقتين. مثالي لفتحه وحشوه بالفلافل أو الشاورما أو لتناوله مع الحمص واللبنة.',
    images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop'],
    rating: 4.5,
    reviews: [
      { author: 'Tareq O.', rating: 4, comment: 'Soft and fresh. Freezes well.', date: '2026-08-12' }
    ],
    weight: '5 Pack',
    ingredients: 'Enriched wheat flour, water, yeast, sugar, salt.',
    allergens: 'Gluten',
    purchaseOptions: {
      single: { price: 2.29, quantity: 1 },
      pack: { price: 12.49, quantity: 6 },
      case: { price: 22.99, quantity: 12 }
    },
    stock: 250,
    featured: true,
    bestSeller: true,
    active: true
  },
  {
    id: 'prod-023',
    name: 'Green Giant Peeled Broad Beans',
    slug: 'green-giant-broad-beans',
    arabicName: 'فول عريض مقشر العملاق الأخضر',
    brand: 'Green Giant',
    category: 'groceries',
    country: 'Egypt',
    description: 'Canned peeled broad beans, perfect for quick morning stews or Mediterranean salads. Tender texture and clean taste.',
    arabicDescription: 'فول عريض مقشر معلب، مثالي لليخنات السريعة أو سلطات البحر الأبيض المتوسط. قوام طري ونكهة نظيفة.',
    images: ['https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop'],
    rating: 4.4,
    reviews: [
      { author: 'Wael M.', rating: 4, comment: 'Good quality fava beans. Skinless makes them easier to digest.', date: '2026-07-04' }
    ],
    weight: '400g',
    ingredients: 'Fava beans, water, salt, calcium chloride.',
    allergens: 'None',
    purchaseOptions: {
      single: { price: 2.79, quantity: 1 },
      pack: { price: 14.99, quantity: 6 },
      case: { price: 27.99, quantity: 12 }
    },
    stock: 180,
    featured: false,
    bestSeller: false,
    active: true
  },
  {
    id: 'prod-024',
    name: 'Al-Basha Middle Eastern Seven Spices Blend',
    slug: 'middle-eastern-seven-spices',
    arabicName: 'بهارات مشكلة سبعة شامية الباشا',
    brand: 'Al-Basha',
    category: 'spices-sauces',
    country: 'Levantine',
    description: 'A heritage blend of seven spices (allspice, black pepper, cinnamon, cloves, nutmeg, fenugreek, and ginger). Essential for seasoning ground meats, rice, and stuffing.',
    arabicDescription: 'خلطة البهارات السبعة التراثية (البزار الحلو، الفلفل الأسود، القرفة، القرنفل، جوزة الطيب، الحلبة، والزنجبيل). أساسية لتتبيل اللحوم المفرومة والأرز وحشوات الدجاج.',
    images: ['https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop'],
    rating: 4.9,
    reviews: [
      { author: 'Basma A.', rating: 5, comment: ' Smells exactly like Damascus spice markets! Instant flavor enhancer.', date: '2026-07-15' }
    ],
    weight: '200g',
    ingredients: 'Allspice, black pepper, cinnamon, ginger, cloves, nutmeg, fenugreek.',
    allergens: 'None',
    purchaseOptions: {
      single: { price: 4.99, quantity: 1 },
      pack: { price: 26.99, quantity: 6 },
      case: { price: 49.99, quantity: 12 }
    },
    stock: 140,
    featured: false,
    bestSeller: true,
    active: true
  },
  {
    id: 'prod-025',
    name: 'Moroccan Mint Green Tea Bags',
    slug: 'moroccan-mint-green-tea',
    arabicName: 'شاي أخضر بالنعناع المغربي - أكياس',
    brand: 'Sultan',
    category: 'drinks',
    country: 'Morocco',
    description: 'Authentic blend of Chinese gunpowder green tea and sweet Moroccan spearmint leaves. Delivers a refreshing, soothing, and sweet brew, traditionally poured from heights.',
    arabicDescription: 'مزيج أصيل من الشاي الأخضر وورق النعناع المغربي الحلو. يقدم شاي منعشاً ومهدئاً، يصب تقليدياً من مسافة عالية لعمل رغوة.',
    images: ['https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop'],
    rating: 4.7,
    reviews: [
      { author: 'Siham Y.', rating: 5, comment: 'True Sultan brand tea from Morocco. Refreshing cold or hot.', date: '2026-08-03' }
    ],
    weight: '20 Bags',
    ingredients: 'Green tea, mint leaves.',
    allergens: 'None',
    purchaseOptions: {
      single: { price: 3.99, quantity: 1 },
      pack: { price: 21.99, quantity: 6 },
      case: { price: 39.99, quantity: 12 }
    },
    stock: 160,
    featured: false,
    bestSeller: false,
    active: true
  },
  {
    id: 'prod-026',
    name: 'Traditional Olive Oil Nablus Soap',
    slug: 'traditional-olive-oil-nablus-soap',
    arabicName: 'صابون زيت زيتون نابلسي تقليدي',
    brand: 'Al-Jamal',
    category: 'household',
    country: 'Palestine',
    description: 'Pure, natural soap handcrafted in Nablus from Palestinian virgin olive oil and water. Unscented, moisturizing, and completely free of chemicals or synthetic perfumes.',
    arabicDescription: 'صابون طبيعي نقي مصنع يدوياً في نابلس من زيت الزيتون البكر الفلسطيني النقي والماء. خالي من العطور والمواد الكيميائية ومرطب ممتاز للبشرة.',
    images: ['https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?q=80&w=600&auto=format&fit=crop'],
    rating: 4.8,
    reviews: [
      { author: 'Tamer Z.', rating: 5, comment: 'Clean, simple, and the best soap for sensitive skin.', date: '2026-07-29' }
    ],
    weight: '4 Pack',
    ingredients: 'Palestinian virgin olive oil, sodium salts, water.',
    allergens: 'None',
    purchaseOptions: {
      single: { price: 6.99, quantity: 1 },
      pack: { price: 38.99, quantity: 6 },
      case: { price: 72.99, quantity: 12 }
    },
    stock: 90,
    featured: true,
    bestSeller: false,
    active: true
  },
  {
    id: 'prod-027',
    name: 'Traditional Brass Coffee Pot (Dallah)',
    slug: 'brass-coffee-pot-dallah',
    arabicName: 'دلة قهوة عربية من النحاس التقليدي',
    brand: 'Al-Amir',
    category: 'household',
    country: 'Gulf',
    description: 'Engraved, heavy-duty traditional brass Turkish and Arabic coffee pot (Dallah). Features a long, heat-resistant wooden handle and narrow pouring spout. Capacity: 350ml (3-4 cups).',
    arabicDescription: 'دلة قهوة عربية تركية تقليدية مصنوعة من النحاس الأصفر المحفور بشكل رائع. تتميز بمقبض خشبي عازل للحرارة ومصب ضيق للسكب. سعة: 350 مل.',
    images: ['https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?q=80&w=600&auto=format&fit=crop'],
    rating: 4.9,
    reviews: [
      { author: 'Khalil K.', rating: 5, comment: 'Stunning craftsmanship! Heats coffee perfectly on gas or electric stoves.', date: '2026-06-18' }
    ],
    weight: '1 Unit',
    ingredients: 'Brass metal, wooden handle.',
    allergens: 'None',
    purchaseOptions: {
      single: { price: 29.99, quantity: 1 },
      pack: { price: 169.99, quantity: 6 },
      case: { price: 319.99, quantity: 12 }
    },
    stock: 35,
    featured: true,
    bestSeller: false,
    active: true
  },
  {
    id: 'prod-028',
    name: 'Al-Alali Premium White Oats',
    slug: 'al-alali-white-oats',
    arabicName: 'شوفان أبيض فاخر العلالي',
    brand: 'Al-Alali',
    category: 'groceries',
    country: 'Gulf',
    description: 'Quick-cooking rolled oats, popular in the Gulf for preparing savory Ramadan lamb-oat soups (Shorbat Shofaan). Soft and thick grains.',
    arabicDescription: 'شوفان أبيض سريع التحضير، شهير في الخليج العربي لتحضير شوربة الشوفان الرمضانية باللحم والمرق. حبوب غنية وسميكة.',
    images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop'],
    rating: 4.6,
    reviews: [
      { author: 'Sultan S.', rating: 4, comment: 'Ideal for Ramadan soup! Essential pantry item.', date: '2026-05-10' }
    ],
    weight: '400g',
    ingredients: '100% Rolled Oats.',
    allergens: 'Gluten',
    purchaseOptions: {
      single: { price: 3.49, quantity: 1 },
      pack: { price: 18.99, quantity: 6 },
      case: { price: 34.99, quantity: 12 }
    },
    stock: 130,
    featured: false,
    bestSeller: false,
    active: true
  },
  {
    id: 'prod-029',
    name: 'Americana Frozen Falafel Patties',
    slug: 'americana-frozen-falafel',
    arabicName: 'أقراص فلافل مجمدة أمريكانا',
    brand: 'Americana',
    category: 'frozen',
    country: 'Egypt',
    description: 'Pre-shaped and seasoned frozen falafel patties. Just deep fry or air-fry for 5 minutes for crisp, delicious, and warm falafels containing fava beans and fresh herbs.',
    arabicDescription: 'أقراص فلافل مجمدة ومتبلة مسبقاً. اقليها أو ضعها في القلاية الهوائية لـ 5 دقائق لحمص مقرمش ولذيذ بنكهة الكزبرة والبقدونس.',
    images: ['https://images.unsplash.com/photo-1547058886-f6d62c3f87ec?q=80&w=600&auto=format&fit=crop'],
    rating: 4.7,
    reviews: [
      { author: 'Hisham N.', rating: 5, comment: 'So easy to air-fry for the kids. Taste is very nice and light.', date: '2026-08-08' }
    ],
    weight: '500g',
    ingredients: 'Fava beans, chickpeas, onions, garlic, coriander, parsley, salt, spices.',
    allergens: 'None',
    purchaseOptions: {
      single: { price: 5.49, quantity: 1 },
      pack: { price: 29.99, quantity: 6 },
      case: { price: 54.99, quantity: 12 }
    },
    stock: 110,
    featured: false,
    bestSeller: true,
    active: true
  },
  {
    id: 'prod-030',
    name: 'Al-Amir Premium Syrian Halva - Plain',
    slug: 'al-amir-syrian-halva-plain',
    arabicName: 'حلاوة طحينية شامية سادة الأمير',
    brand: 'Al-Amir',
    category: 'sweets-snacks',
    country: 'Syria',
    description: 'Silky smooth sesame tahini halva, plain sweetened variety. Traditional Damascus recipe that melts in the mouth, great with honey and fresh cream (Qashta).',
    arabicDescription: 'حلاوة طحينية سمسم ناعمة وسادة. وصفة دمشقية تقليدية تذوب في الفم، رائعة مع العسل والقشطة البلدية.',
    images: ['https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop'],
    rating: 4.6,
    reviews: [
      { author: 'Ghalia D.', rating: 5, comment: 'Very smooth and high-quality tahini taste.', date: '2026-07-30' }
    ],
    weight: '450g',
    ingredients: 'Tahini (sesame paste), sugar, halawa root extract, citric acid, vanillin.',
    allergens: 'Sesame',
    purchaseOptions: {
      single: { price: 6.99, quantity: 1 },
      pack: { price: 38.99, quantity: 6 },
      case: { price: 72.99, quantity: 12 }
    },
    stock: 8, // Set low for admin panel warning simulation
    featured: false,
    bestSeller: false,
    active: true
  },
  {
    id: 'prod-031',
    name: 'Arabic Bakhoor - Oud Al-Sultan Incense',
    slug: 'arabic-bakhoor-oud-sultan',
    arabicName: 'بخور عود السلطان الملكي',
    brand: 'Al-Rehab',
    category: 'household',
    country: 'Gulf',
    description: 'High-quality compressed wood chips soaked in pure jasmine, sandalwood, and sweet cambodian oud perfume oils. Burn on charcoal to fill your home with a premium Middle Eastern fragrance.',
    arabicDescription: 'كسر عود مضغوطة ومنقوعة في عطور الياسمين والصندل والعود الكمبودي الفاخر. يحرق على الفحم ليملأ منزلك برائحة شرقية ممتازة تدوم طويلاً.',
    images: ['https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?q=80&w=600&auto=format&fit=crop'],
    rating: 4.8,
    reviews: [
      { author: 'Yara W.', rating: 5, comment: 'Smells very rich and luxurious. Clears kitchen smells immediately.', date: '2026-08-01' }
    ],
    weight: '100g',
    ingredients: 'Compressed wood chips, perfume oils (Oud, Jasmine, Sandalwood).',
    allergens: 'None',
    purchaseOptions: {
      single: { price: 18.99, quantity: 1 },
      pack: { price: 104.99, quantity: 6 },
      case: { price: 199.99, quantity: 12 }
    },
    stock: 0, // Out of stock for testing
    featured: false,
    bestSeller: false,
    active: true
  }
];
export const mockCoupons = [
  { code: 'WELCOME10', discountPercent: 10, minOrder: 30, usageCount: 128, maxUsage: 500, expires: '2026-09-30' },
  { code: 'ARABMARKET20', discountPercent: 20, minOrder: 75, usageCount: 42, maxUsage: 200, expires: '2026-12-31' },
  { code: 'FREESHIP', discountPercent: 5, minOrder: 40, usageCount: 89, maxUsage: 300, expires: '2026-10-31' }
];
