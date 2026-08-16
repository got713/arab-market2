<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Subcategory;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Inventory;
use App\Models\Coupon;
use App\Models\Review;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // ── 1. SEED USERS ────────────────────────────────────────────────────
        //
        // 'admin123'/'customer123' below are DEVELOPMENT-ONLY convenience
        // credentials for local demo/testing — never real production passwords.
        // Outside local/testing this seeder refuses to use them: it generates a
        // random password instead (or uses SEED_ADMIN_PASSWORD /
        // SEED_CUSTOMER_PASSWORD from .env if explicitly provided), and prints
        // whatever it generated once so it can be rotated immediately.
        $isLocal = app()->environment(['local', 'testing']);

        $adminPassword = $isLocal
            ? 'admin123'
            : (env('SEED_ADMIN_PASSWORD') ?: Str::random(24));

        $customerPassword = $isLocal
            ? 'customer123'
            : (env('SEED_CUSTOMER_PASSWORD') ?: Str::random(24));

        if (!$isLocal) {
            $this->command?->warn('Non-local environment detected — seeding with a generated (not hardcoded) admin/customer password.');
            $this->command?->line("Seeded admin password:    {$adminPassword}");
            $this->command?->line("Seeded customer password: {$customerPassword}");
            $this->command?->warn('Rotate these immediately after first login. Set SEED_ADMIN_PASSWORD / SEED_CUSTOMER_PASSWORD in .env to control them explicitly instead.');
        }

        $admin = User::create([
            'name' => 'Administrator',
            'email' => 'admin@arabmarket.com',
            'password' => Hash::make($adminPassword),
            'role' => 'admin',
            'phone' => '+15550199',
        ]);

        $customer = User::create([
            'name' => 'Ahmed Al-Masri',
            'email' => 'ahmed.masri@gmail.com',
            'password' => Hash::make($customerPassword),
            'role' => 'customer',
            'phone' => '+1234567890',
        ]);

        // ── 2. SEED CATEGORIES & SUBCATEGORIES ───────────────────────────────
        $catsData = [
            [
                'name' => 'Groceries',
                'arabic_name' => 'البقالة والأغذية',
                'slug' => 'groceries',
                'description' => 'Everyday pantry essentials and Middle Eastern favorites.',
                'arabic_description' => 'أساسيات البقالة اليومية والمواد الغذائية الشرق أوسطية المفضلة.',
                'image' => 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop',
                'icon' => 'ShoppingBag',
                'subcategories' => [
                    ['slug' => 'pantry', 'name' => 'Pantry', 'arabic_name' => 'خزانة المؤن'],
                    ['slug' => 'grains-pasta', 'name' => 'Rice & Grains', 'arabic_name' => 'الأرز والحبوب'],
                    ['slug' => 'pasta', 'name' => 'Pasta', 'arabic_name' => 'المكرونة'],
                    ['slug' => 'canned-jarred', 'name' => 'Canned Foods', 'arabic_name' => 'المعلبات'],
                    ['slug' => 'cooking-essentials', 'name' => 'Cooking Essentials', 'arabic_name' => 'أساسيات الطبخ'],
                    ['slug' => 'dry-goods', 'name' => 'Dry Goods', 'arabic_name' => 'الأغذية الجافة'],
                ]
            ],
            [
                'name' => 'Frozen',
                'arabic_name' => 'الأغذية المجمدة',
                'slug' => 'frozen',
                'description' => 'Frozen vegetables, pastries, and quick Middle Eastern meals.',
                'arabic_description' => 'الخضروات المجمدة، المخبوزات والوجبات الشرق أوسطية السريعة.',
                'image' => 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?q=80&w=600&auto=format&fit=crop',
                'icon' => 'Snowflake',
                'subcategories' => [
                    ['slug' => 'frozen-pastries', 'name' => 'Frozen Pastries', 'arabic_name' => 'المعجنات المجمدة'],
                    ['slug' => 'frozen-vegetables', 'name' => 'Frozen Vegetables', 'arabic_name' => 'الخضروات المجمدة'],
                    ['slug' => 'frozen-meals', 'name' => 'Frozen Meals', 'arabic_name' => 'الوجبات المجمدة'],
                    ['slug' => 'frozen-dough', 'name' => 'Frozen Dough', 'arabic_name' => 'العجين المجمد'],
                ]
            ],
            [
                'name' => 'Drinks',
                'arabic_name' => 'المشروبات',
                'slug' => 'drinks',
                'description' => 'Premium coffee, traditional teas, juices, and soft drinks.',
                'arabic_description' => 'القهوة الفاخرة، الشاي التقليدي، العصائر، والمشروبات الغازية.',
                'image' => 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop',
                'icon' => 'Coffee',
                'subcategories' => [
                    ['slug' => 'coffee', 'name' => 'Coffee', 'arabic_name' => 'القهوة'],
                    ['slug' => 'tea', 'name' => 'Tea', 'arabic_name' => 'الشاي'],
                    ['slug' => 'juices', 'name' => 'Juices', 'arabic_name' => 'العصائر'],
                    ['slug' => 'soft-drinks', 'name' => 'Soft Drinks', 'arabic_name' => 'المشروبات الغازية'],
                    ['slug' => 'water', 'name' => 'Water', 'arabic_name' => 'المياه'],
                ]
            ],
            [
                'name' => 'Sweets & Snacks',
                'arabic_name' => 'الحلويات والتسالي',
                'slug' => 'sweets-snacks',
                'description' => 'Baklava, dates, biscuits, traditional chocolates, and savory snacks.',
                'arabic_description' => 'البقلاوة، التمور، البسكويت، الشوكولاتة التقليدية، والمقرمشات.',
                'image' => 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop',
                'icon' => 'Cookie',
                'subcategories' => [
                    ['slug' => 'baklava', 'name' => 'Baklava', 'arabic_name' => 'البقلاوة'],
                    ['slug' => 'biscuits', 'name' => 'Biscuits', 'arabic_name' => 'البسكويت'],
                    ['slug' => 'chocolate', 'name' => 'Chocolate', 'arabic_name' => 'الشوكولاتة'],
                    ['slug' => 'dates', 'name' => 'Dates', 'arabic_name' => 'التمور'],
                    ['slug' => 'snacks', 'name' => 'Snacks', 'arabic_name' => 'التسالي'],
                ]
            ],
            [
                'name' => 'Spices & Sauces',
                'arabic_name' => 'التوابل والصلصات',
                'slug' => 'spices-sauces',
                'description' => 'Zaatar, sumac, premium olive oils, tahini, and hot sauces.',
                'arabic_description' => 'الزعتر، السماق، زيت الزيتون الممتاز، الطحينة، والصلصات الحارة.',
                'image' => 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=600&auto=format&fit=crop',
                'icon' => 'Flame',
                'subcategories' => [
                    ['slug' => 'spices', 'name' => 'Spices', 'arabic_name' => 'البهارات'],
                    ['slug' => 'herbs', 'name' => 'Herbs', 'arabic_name' => 'الأعشاب'],
                    ['slug' => 'seasonings', 'name' => 'Seasonings', 'arabic_name' => 'التتبيلات'],
                    ['slug' => 'tahini', 'name' => 'Tahini', 'arabic_name' => 'الطحينة'],
                    ['slug' => 'hot-sauces', 'name' => 'Hot Sauces', 'arabic_name' => 'الصلصات الحارة'],
                    ['slug' => 'pickles', 'name' => 'Pickles', 'arabic_name' => 'المخللات'],
                    ['slug' => 'condiments', 'name' => 'Condiments', 'arabic_name' => 'المقبلات'],
                ]
            ],
            [
                'name' => 'Household',
                'arabic_name' => 'مستلزمات المنزل',
                'slug' => 'household',
                'description' => 'Traditional coffee pots, natural soaps, incense, and supplies.',
                'arabic_description' => 'أواني القهوة التقليدية، الصابون الطبيعي، البخور، والمستلزمات المنزلية.',
                'image' => 'https://images.unsplash.com/photo-1606722590583-6951b5ea92ad?q=80&w=600&auto=format&fit=crop',
                'icon' => 'Home',
                'subcategories' => [
                    ['slug' => 'kitchen', 'name' => 'Kitchen', 'arabic_name' => 'المطبخ'],
                    ['slug' => 'cleaning', 'name' => 'Cleaning', 'arabic_name' => 'المنظفات'],
                    ['slug' => 'household-supplies', 'name' => 'Household Supplies', 'arabic_name' => 'مستلزمات منزلية'],
                    ['slug' => 'personal-care', 'name' => 'Personal Care', 'arabic_name' => 'العناية الشخصية'],
                ]
            ]
        ];

        $catsMap = [];
        $subsMap = [];

        foreach ($catsData as $cIndex => $cData) {
            $cat = Category::create([
                'name' => $cData['name'],
                'arabic_name' => $cData['arabic_name'],
                'slug' => $cData['slug'],
                'description' => $cData['description'],
                'arabic_description' => $cData['arabic_description'],
                'image' => $cData['image'],
                'icon' => $cData['icon'],
                'active' => true,
                'featured' => true,
                'display_order' => $cIndex * 10,
            ]);

            $catsMap[$cData['slug']] = $cat;

            foreach ($cData['subcategories'] as $sIndex => $sData) {
                $sub = Subcategory::create([
                    'category_id' => $cat->id,
                    'name' => $sData['name'],
                    'arabic_name' => $sData['arabic_name'],
                    'slug' => $sData['slug'],
                    'active' => true,
                    'display_order' => $sIndex * 10,
                ]);
                $subsMap[$cat->slug . '-' . $sData['slug']] = $sub;
            }
        }

        // ── 3. SEED PRODUCTS ─────────────────────────────────────────────────
        $prodsData = [
            [
                'name' => 'Egyptian Molokhia - Premium Frozen',
                'slug' => 'egyptian-molokhia-frozen',
                'arabic_name' => 'ملوخية مصرية - مجمدة ممتازة',
                'brand' => 'Americana',
                'category_slug' => 'frozen',
                'subcategory_slug' => 'frozen-vegetables',
                'country' => 'Egypt',
                'description' => 'Freshly harvested and minced jute leaves, perfect for making traditional Egyptian Molokhia stew. Extremely nutritious and authentic.',
                'arabic_description' => 'أوراق ملوخية طازجة ومفرومة بعناية، مثالية لتحضير طاجن الملوخية المصري التقليدي. مغذية وغنية بالنكهة الأصلية.',
                'weight' => '400g',
                'ingredients' => 'Finely minced Molokhia (jute) leaves.',
                'allergens' => 'None',
                'price' => 4.99,
                'pack_price' => 26.99,
                'pack_quantity' => 6,
                'case_price' => 49.99,
                'case_quantity' => 12,
                'stock' => 5,
                'featured' => true,
                'best_seller' => true,
                'weekly_deal' => false,
                'sku' => 'AMER-MOL-FRZ-01',
                'rating' => 4.80,
                'image_url' => 'https://images.unsplash.com/photo-1547058886-f6d62c3f87ec?q=80&w=600&auto=format&fit=crop'
            ],
            [
                'name' => 'Premium Al-Doha Egyptian Rice',
                'slug' => 'al-doha-egyptian-rice',
                'arabic_name' => 'أرز مصري الضحى - فاخر',
                'brand' => 'Al-Doha',
                'category_slug' => 'groceries',
                'subcategory_slug' => 'grains-pasta',
                'country' => 'Egypt',
                'description' => 'Authentic medium-grain Egyptian white rice. Perfect for preparing Egyptian rice with vermicelli (sheereya) or stuffing vegetables (mahshi).',
                'arabic_description' => 'أرز مصري طبيعي حبة متوسطة فاخر. مثالي لعمل الأرز المصري بالشعرية أو حشو المحاشي.',
                'weight' => '1kg',
                'ingredients' => '100% Medium Grain Egyptian Rice.',
                'allergens' => 'None',
                'price' => 5.49,
                'pack_price' => 29.99,
                'pack_quantity' => 6,
                'case_price' => 54.99,
                'case_quantity' => 12,
                'stock' => 85,
                'featured' => true,
                'best_seller' => false,
                'weekly_deal' => true,
                'sku' => 'DOHA-RCE-EGY-02',
                'rating' => 4.70,
                'image_url' => 'https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=600&auto=format&fit=crop'
            ],
            [
                'name' => 'Cortas Canned Fava Beans - Plain Medammas',
                'slug' => 'cortas-fava-beans',
                'arabic_name' => 'فول مدمس كورتاس - سادة',
                'brand' => 'Cortas',
                'category_slug' => 'groceries',
                'subcategory_slug' => 'canned-jarred',
                'country' => 'Lebanon',
                'description' => 'Traditional canned fava beans cooked to perfection. Mash them with garlic, lemon, cumin, and extra virgin olive oil for a classic Middle Eastern breakfast.',
                'arabic_description' => 'فول مدمس لبناني تقليدي مطبوخ بعناية. اهرسه مع الثوم والليمون والكمون وزيت الزيتون البكر لفطور عربي كلاسيكي.',
                'weight' => '450g',
                'ingredients' => 'Fava beans, water, salt, citric acid, calcium disodium EDTA.',
                'allergens' => 'None',
                'price' => 2.49,
                'pack_price' => 13.49,
                'pack_quantity' => 6,
                'case_price' => 24.99,
                'case_quantity' => 12,
                'stock' => 300,
                'featured' => false,
                'best_seller' => true,
                'weekly_deal' => false,
                'sku' => 'CORT-FAV-MED-03',
                'rating' => 4.90,
                'image_url' => 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=600&auto=format&fit=crop'
            ],
            [
                'name' => 'Authentic Lebanese Tahini Sesame Paste',
                'slug' => 'cortas-tahini',
                'arabic_name' => 'طحينة سمسم لبنانية أصيلة',
                'brand' => 'Cortas',
                'category_slug' => 'groceries',
                'subcategory_slug' => 'pantry',
                'country' => 'Lebanon',
                'description' => '100% pure ground sesame paste. Smooth texture and nutty flavor, perfect for making Hummus, Baba Ghanoush, Halva, and Tarator sauce.',
                'arabic_description' => 'عصارة سمسم صافية 100%. قوام ناعم وطعم غني بالسمسم المحمص، ممتاز لصنع الحمص، البابا غنوج، الحلاوة، وصلصة الطراطور.',
                'weight' => '450g',
                'ingredients' => '100% Hulled Sesame Seeds.',
                'allergens' => 'Sesame',
                'price' => 6.99,
                'pack_price' => 38.99,
                'pack_quantity' => 6,
                'case_price' => 72.99,
                'case_quantity' => 12,
                'stock' => 140,
                'featured' => true,
                'best_seller' => true,
                'weekly_deal' => false,
                'sku' => 'CORT-TAH-SES-04',
                'rating' => 4.60,
                'image_url' => 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?q=80&w=600&auto=format&fit=crop'
            ],
            [
                'name' => 'Ziyad Extra Virgin Olive Oil - Cold Pressed',
                'slug' => 'ziyad-extra-virgin-olive-oil',
                'arabic_name' => 'زيت زيتون بكر ممتاز زياد - كبس بارد',
                'brand' => 'Ziyad',
                'category_slug' => 'groceries',
                'subcategory_slug' => 'cooking-essentials',
                'country' => 'Palestine',
                'description' => 'Cold-pressed extra virgin olive oil harvested from West Bank olive groves. Fruity notes with a peppery finish, perfect for dipping with Zaatar.',
                'arabic_description' => 'زيت زيتون بكر ممتاز معصور على البارد من مزارع الزيتون الفلسطينية. نكهة غنية تكتمل بلمسة حدة خفيفة، مثالي لتناوله مع الزعتر.',
                'weight' => '750ml',
                'ingredients' => '100% Cold Pressed Extra Virgin Olive Oil.',
                'allergens' => 'None',
                'price' => 14.99,
                'pack_price' => 82.99,
                'pack_quantity' => 6,
                'case_price' => 159.99,
                'case_quantity' => 12,
                'stock' => 60,
                'featured' => true,
                'best_seller' => true,
                'weekly_deal' => false,
                'sku' => 'ZIYD-EVO-OIL-05',
                'rating' => 4.90,
                'image_url' => 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?q=80&w=600&auto=format&fit=crop'
            ],
            [
                'name' => 'Al-Wazah Ceylon Black Tea - Loose Leaf',
                'slug' => 'al-wazah-ceylon-tea',
                'arabic_name' => 'شاي سيلان أسود الوزة - فرط',
                'brand' => 'Al-Wazah',
                'category_slug' => 'drinks',
                'subcategory_slug' => 'tea',
                'country' => 'Jordan',
                'description' => 'Premium loose Ceylon black tea, featuring a rich robust aroma and a deep amber color. The favorite hot beverage companion in Arab households.',
                'arabic_description' => 'شاي سيلان أسود فرط فاخر، يتميز بنكهة قوية ولون كهرماني داكن. المشروب الساخن المفضل في البيوت العربية.',
                'weight' => '400g',
                'ingredients' => 'Pure Ceylon black tea leaves.',
                'allergens' => 'None',
                'price' => 7.99,
                'pack_price' => 44.99,
                'pack_quantity' => 6,
                'case_price' => 84.99,
                'case_quantity' => 12,
                'stock' => 3,
                'featured' => false,
                'best_seller' => true,
                'weekly_deal' => true,
                'sku' => 'WAZH-TEA-BLK-06',
                'rating' => 4.85,
                'image_url' => 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?q=80&w=600&auto=format&fit=crop'
            ],
            [
                'name' => 'Ziyad Premium Jordan Dates - Medjool Large',
                'slug' => 'medjool-dates-large',
                'arabic_name' => 'تمور مجهول أردنية فاخرة - حجم كبير',
                'brand' => 'Ziyad',
                'category_slug' => 'sweets-snacks',
                'subcategory_slug' => 'dates',
                'country' => 'Jordan',
                'description' => 'Large, soft, and sweet Medjool dates. Hand-picked, natural sweetener rich in fiber, potassium, and antioxidants, perfect for sharing during family gatherings.',
                'arabic_description' => 'تمور مجهول أردنية فاخرة حبة كبيرة، طرية وحلوة المذاق. منتقاة يدوياً وغنية بالألياف والبوتاسيوم، ومثالية للضيافة والتجمعات.',
                'weight' => '900g',
                'ingredients' => 'Natural Medjool Dates.',
                'allergens' => 'None',
                'price' => 13.99,
                'pack_price' => 79.99,
                'pack_quantity' => 6,
                'case_price' => 149.99,
                'case_quantity' => 12,
                'stock' => 90,
                'featured' => true,
                'best_seller' => true,
                'weekly_deal' => false,
                'sku' => 'ZIYD-DAT-MED-07',
                'rating' => 4.90,
                'image_url' => 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop'
            ]
        ];

        foreach ($prodsData as $pData) {
            $cat = $catsMap[$pData['category_slug']] ?? null;
            $sub = $subsMap[$pData['category_slug'] . '-' . $pData['subcategory_slug']] ?? null;

            if (!$cat) continue;

            $product = Product::create([
                'category_id' => $cat->id,
                'subcategory_id' => $sub?->id,
                'name' => $pData['name'],
                'arabic_name' => $pData['arabic_name'],
                'slug' => $pData['slug'],
                'brand' => $pData['brand'],
                'sku' => $pData['sku'],
                'description' => $pData['description'],
                'arabic_description' => $pData['arabic_description'],
                'weight' => $pData['weight'],
                'ingredients' => $pData['ingredients'],
                'allergens' => $pData['allergens'],
                'price' => $pData['price'],
                'pack_price' => $pData['pack_price'],
                'pack_quantity' => $pData['pack_quantity'],
                'case_price' => $pData['case_price'],
                'case_quantity' => $pData['case_quantity'],
                'featured' => $pData['featured'],
                'best_seller' => $pData['best_seller'],
                'weekly_deal' => $pData['weekly_deal'],
                'active' => true,
                'rating' => $pData['rating'],
                'country' => $pData['country'],
            ]);

            // Create Main Image
            ProductImage::create([
                'product_id' => $product->id,
                'url' => $pData['image_url'],
                'is_main' => true,
            ]);

            // Create Inventory
            Inventory::create([
                'product_id' => $product->id,
                'stock_quantity' => $pData['stock'],
                'low_stock_threshold' => 10,
            ]);

            // Create generic approved reviews
            Review::create([
                'product_id' => $product->id,
                'user_id' => $customer->id,
                'rating' => 5,
                'comment' => 'Excellent quality and packaging, highly recommend!',
                'author_name' => 'Ahmed Al-Masri',
                'status' => 'approved'
            ]);
        }

        // ── 4. SEED COUPONS ──────────────────────────────────────────────────
        Coupon::create([
            'code' => 'WELCOME10',
            'type' => 'percentage',
            'value' => 10.00,
            'min_order_amount' => 30.00,
            'max_usages' => 1000,
            'usage_count' => 0,
            'active' => true,
            'expires_at' => now()->addDays(90),
        ]);

        Coupon::create([
            'code' => 'SAVE5',
            'type' => 'fixed',
            'value' => 5.00,
            'min_order_amount' => 20.00,
            'max_usages' => 500,
            'usage_count' => 0,
            'active' => true,
            'expires_at' => now()->addDays(30),
        ]);

        // ── 5. SEED ORDERS & ITEMS ───────────────────────────────────────────
        $products = Product::all();
        $ordersData = [
            [
                'days_ago' => 0,
                'customer_name' => 'Ahmed Al-Masri',
                'customer_email' => 'ahmed.masri@gmail.com',
                'payment_status' => 'paid',
                'status' => 'processing',
                'items' => [
                    ['qty' => 2, 'option' => 'single'],
                    ['qty' => 1, 'option' => 'pack']
                ]
            ],
            [
                'days_ago' => 0,
                'customer_name' => 'Fatima Hassan',
                'customer_email' => 'fatima.h@yahoo.com',
                'payment_status' => 'paid',
                'status' => 'pending',
                'items' => [
                    ['qty' => 1, 'option' => 'single']
                ]
            ],
            [
                'days_ago' => 1,
                'customer_name' => 'John Smith',
                'customer_email' => 'jsmith@outlook.com',
                'payment_status' => 'paid',
                'status' => 'shipped',
                'items' => [
                    ['qty' => 3, 'option' => 'single']
                ]
            ],
            [
                'days_ago' => 2,
                'customer_name' => 'Youssef Mansour',
                'customer_email' => 'youssef.m@gmail.com',
                'payment_status' => 'paid',
                'status' => 'delivered',
                'items' => [
                    ['qty' => 1, 'option' => 'case']
                ]
            ],
            [
                'days_ago' => 3,
                'customer_name' => 'Sarah Connor',
                'customer_email' => 'sconnor@skynet.com',
                'payment_status' => 'paid',
                'status' => 'delivered',
                'items' => [
                    ['qty' => 2, 'option' => 'single']
                ]
            ],
            [
                'days_ago' => 4,
                'customer_name' => 'Ali Raza',
                'customer_email' => 'aliraza@msn.com',
                'payment_status' => 'failed',
                'status' => 'cancelled',
                'items' => [
                    ['qty' => 1, 'option' => 'pack']
                ]
            ],
            [
                'days_ago' => 5,
                'customer_name' => 'Mustafa Al-Sayed',
                'customer_email' => 'mustafa.s@live.com',
                'payment_status' => 'paid',
                'status' => 'delivered',
                'items' => [
                    ['qty' => 4, 'option' => 'single']
                ]
            ],
            [
                'days_ago' => 6,
                'customer_name' => 'Layla Kanaan',
                'customer_email' => 'layla.k@gmail.com',
                'payment_status' => 'paid',
                'status' => 'delivered',
                'items' => [
                    ['qty' => 1, 'option' => 'pack'],
                    ['qty' => 2, 'option' => 'single']
                ]
            ]
        ];

        foreach ($ordersData as $index => $oData) {
            $createdDate = now()->subDays($oData['days_ago'])->subHours(rand(1, 10));
            
            $subtotal = 0.00;
            $itemsToCreate = [];

            foreach ($oData['items'] as $itemIndex => $itemDef) {
                // Select a product
                $prod = $products->skip(($index + $itemIndex) % $products->count())->first();
                if (!$prod) continue;
                
                $price = $prod->price;
                if ($itemDef['option'] === 'pack') {
                    $price = $prod->pack_price ?: ($prod->price * ($prod->pack_quantity ?: 6) * 0.85);
                } elseif ($itemDef['option'] === 'case') {
                    $price = $prod->case_price ?: ($prod->price * ($prod->case_quantity ?: 12) * 0.75);
                }

                $qty = $itemDef['qty'];
                $subtotal += ($price * $qty);

                $itemsToCreate[] = [
                    'product_id' => $prod->id,
                    'option' => $itemDef['option'],
                    'price' => $price,
                    'quantity' => $qty,
                ];
            }

            $discount = 0.00;
            $shipping = 5.99;
            $tax = round($subtotal * 0.0825, 2);
            $total = $subtotal - $discount + $shipping + $tax;

            $order = \App\Models\Order::create([
                'user_id' => $customer->id,
                'order_number' => 'AM' . (1000 + $index),
                'customer_name' => $oData['customer_name'],
                'customer_email' => $oData['customer_email'],
                'customer_phone' => '+155502' . $index,
                'shipping_address' => '123 Main St, Apt ' . ($index + 1),
                'shipping_city' => 'Chicago',
                'shipping_state' => 'IL',
                'shipping_zip' => '60611',
                'shipping_method' => 'Standard Shipping',
                'subtotal' => $subtotal,
                'discount' => $discount,
                'shipping_cost' => $shipping,
                'tax' => $tax,
                'total' => $total,
                'payment_method' => 'Credit Card',
                'payment_status' => $oData['payment_status'],
                'status' => $oData['status'],
                'created_at' => $createdDate,
                'updated_at' => $createdDate,
            ]);

            foreach ($itemsToCreate as $itemData) {
                \App\Models\OrderItem::create(array_merge($itemData, [
                    'order_id' => $order->id,
                    'created_at' => $createdDate,
                    'updated_at' => $createdDate,
                ]));
            }
        }
    }
}
