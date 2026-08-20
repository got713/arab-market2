<?php

namespace App\Console\Commands;

use App\Models\Category;
use App\Models\Inventory;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Bulk-imports the real product catalog (category / name / brand / details / packaging)
 * supplied by the store owner. Prices, SKUs and images were NOT provided in the source
 * data, so this command fills them with clearly-flagged placeholders:
 *   - price:  a flat, reasonable per-category placeholder (edit later in Admin > Products)
 *   - sku:    auto-generated as {CATEGORY-CODE}-{0001, 0002, ...}
 *   - image:  a branded placeholder graphic (site cream/navy colors) with the product
 *             name as text, generated on the fly by placehold.co — no real product photo.
 *
 * Safe to re-run: matches existing categories by slug (firstOrCreate) and skips a
 * product if one with the same generated slug already exists, so it will not create
 * duplicates on a second run.
 *
 * Usage: php artisan catalog:import
 *        php artisan catalog:import --dry-run   (show what would be created, write nothing)
 */
class ImportProductCatalog extends Command
{
    protected $signature = 'catalog:import {--dry-run : Preview without writing to the database}';

    protected $description = 'Import the real Arab Market product catalog supplied by the store owner';

    /** Arabic category name (exactly as it appears in the source data) => [english, slug, code, price] */
    private array $categoryMap = [
        'المكسرات واللب والتسالي' => ['Nuts, Seeds & Snacks', 'nuts-seeds-snacks', 'NUTS', 6.99],
        'الشوكولاتة والحلويات والبسكويت' => ['Chocolate, Sweets & Biscuits', 'chocolate-sweets-biscuits', 'CHOC', 4.99],
        'الشاي والقهوة والمشروبات الساخنة' => ['Tea, Coffee & Hot Drinks', 'tea-coffee-hot-drinks', 'TEA', 7.99],
        'المشروبات الغازية والعصائر والمياه' => ['Soft Drinks, Juices & Water', 'soft-drinks-juices-water', 'BEV', 3.49],
        'منتجات الألبان والأجبان' => ['Dairy & Cheese', 'dairy-cheese', 'DAIRY', 8.99],
        'المعكرونة والبقوليات والمعلبات' => ['Pasta, Legumes & Canned Goods', 'pasta-legumes-canned-goods', 'PASTA', 4.49],
        'الزيوت والسمن والتوابل والبهارات' => ['Oils, Ghee & Spices', 'oils-ghee-spices', 'OILS', 9.99],
        'الأطعمة والعجائن والخضار المجمد' => ['Frozen Foods & Pastry', 'frozen-foods-pastry', 'FROZEN', 6.49],
    ];

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $rows = $this->parseCsv($this->catalogCsv());

        $this->info(($dryRun ? '[DRY RUN] ' : '') . 'Parsed ' . count($rows) . ' product rows from the catalog.');

        $seqByCategory = [];
        $created = 0;
        $skipped = 0;

        DB::beginTransaction();

        try {
            foreach ($rows as $row) {
                [$categoryAr, $nameAr, $brand, $details, $packaging] = $row;

                if (!isset($this->categoryMap[$categoryAr])) {
                    $this->warn("Unknown category, skipping row: {$categoryAr} / {$nameAr}");
                    $skipped++;
                    continue;
                }

                [$categoryEn, $categorySlug, $code, $price] = $this->categoryMap[$categoryAr];

                $category = Category::firstOrCreate(
                    ['slug' => $categorySlug],
                    [
                        'name' => $categoryEn,
                        'arabic_name' => $categoryAr,
                        'active' => true,
                        'featured' => false,
                        'display_order' => 0,
                    ]
                );

                $seqByCategory[$code] = ($seqByCategory[$code] ?? 0) + 1;
                $sku = sprintf('%s-%04d', $code, $seqByCategory[$code]);

                $nameEn = $this->deriveEnglishName($details, $brand, $categoryEn);
                $slug = Str::slug($nameEn) . '-' . strtolower($sku);

                if (Product::where('slug', $slug)->exists()) {
                    $skipped++;
                    continue;
                }

                $description = $nameEn . ($brand && $brand !== 'متنوع' ? " — {$brand}" : '');
                $arabicDescription = trim($details . ($packaging ? " — {$packaging}" : ''));
                $imageLabel = trim(preg_replace('/[^\x20-\x7E]/', '', $nameEn));
                $imageLabel = trim(preg_replace('/\s+/', ' ', $imageLabel));
                if ($imageLabel === '') {
                    $imageLabel = $sku;
                }
                $imageLabel = Str::limit($imageLabel, 30, '');
                $imageUrl = 'https://placehold.co/600x600/FAF7F0/17324D?text=' . rawurlencode($imageLabel);

                $this->line("  + [{$sku}] {$nameEn}");

                if ($dryRun) {
                    $created++;
                    continue;
                }

                $product = Product::create([
                    'category_id' => $category->id,
                    'subcategory_id' => null,
                    'name' => $nameEn,
                    'arabic_name' => $nameAr,
                    'slug' => $slug,
                    'brand' => $brand ?: 'Assorted',
                    'sku' => $sku,
                    'description' => $description,
                    'arabic_description' => $arabicDescription,
                    'weight' => 'N/A — needs update',
                    'ingredients' => null,
                    'allergens' => null,
                    'price' => $price,
                    'pack_price' => null,
                    'pack_quantity' => 6,
                    'case_price' => null,
                    'case_quantity' => 12,
                    'featured' => false,
                    'best_seller' => false,
                    'weekly_deal' => false,
                    'active' => true,
                    'rating' => 4.50,
                    'country' => 'Egypt',
                ]);

                ProductImage::create([
                    'product_id' => $product->id,
                    'url' => $imageUrl,
                    'is_main' => true,
                ]);

                Inventory::create([
                    'product_id' => $product->id,
                    'stock_quantity' => 100,
                    'low_stock_threshold' => 10,
                ]);

                $created++;
            }

            if ($dryRun) {
                DB::rollBack();
                $this->warn('Dry run complete — nothing was written. Re-run without --dry-run to import for real.');
            } else {
                DB::commit();
            }
        } catch (\Throwable $e) {
            DB::rollBack();
            $this->error('Import failed, rolled back: ' . $e->getMessage());
            return self::FAILURE;
        }

        $this->newLine();
        $this->info("Done. Created: {$created}  Skipped (duplicate/unknown): {$skipped}");
        $this->warn('Reminder: prices, weights and images are PLACEHOLDERS — review and edit them from Admin > Products before going live with these listings.');

        return self::SUCCESS;
    }

    private function deriveEnglishName(string $details, string $brand, string $categoryEn): string
    {
        $name = null;

        if (preg_match('/[A-Za-z]{3,}/', $details)) {
            $name = trim($details);
        }

        $latinBrand = null;
        if (preg_match('/\(([^)]+)\)/', $brand, $m)) {
            $latinBrand = trim($m[1]);
        }

        if (!$name) {
            $name = trim(($latinBrand ? $latinBrand . ' ' : '') . $categoryEn . ' Item');
        }

        if (strlen($name) > 150) {
            $name = substr($name, 0, 150);
        }

        return $name;
    }

    /**
     * @return array<int, array{0: string, 1: string, 2: string, 3: string, 4: string}>
     */
    private function parseCsv(string $csv): array
    {
        $lines = preg_split('/\r\n|\r|\n/', trim($csv));
        $header = array_shift($lines);
        $rows = [];

        // Re-join lines that were split mid-quoted-field, then parse with str_getcsv.
        $buffer = '';
        foreach ($lines as $line) {
            $buffer .= ($buffer === '' ? '' : "\n") . $line;
            if (substr_count($buffer, '"') % 2 === 0) {
                $fields = str_getcsv($buffer);
                if (count($fields) >= 5) {
                    $rows[] = array_slice($fields, 0, 5);
                }
                $buffer = '';
            }
        }

        return $rows;
    }

    private function catalogCsv(): string
    {
        return <<<'CSV'
القسم,اسم المنتج,العلامة التجارية,النوع / النكهة / التفاصيل,نوع العبوة
المكسرات واللب والتسالي,لب أبيض فاخر,بيروت (Beirut),بذور قرع مقمرة ومملحة,كيس شفاف
المكسرات واللب والتسالي,لب سوبر أسمر,بيروت (Beirut),لب بطيخ أسمر محمص ومملح,كيس شفاف
المكسرات واللب والتسالي,لب خشب فاخر,بيروت (Beirut),بذور لب خشب ممتازة محمصة,كيس شفاف
المكسرات واللب والتسالي,بذور دوار الشمس محمصة ومملحة (أحمر),تاديم (Tadim),Sunflower Seeds Roasted & Salted,كيس أحمر وأبيض
المكسرات واللب والتسالي,بذور دوار الشمس محمصة ومملحة قليلاً (بنفسجي),تاديم (Tadim),Sunflower Seeds Roasted & Less Salted,كيس بنفسجي وأبيض
المكسرات واللب والتسالي,بذور دوار الشمس محمصة (أخضر),Qiaqia / ChaCheer,Roasted Sunflower Seeds Original Flavor (250g),كيس أخضر وزيتوني
المكسرات واللب والتسالي,بذور دوار الشمس بملح البحر,الأميرة (Al Amira),Sunflower Seeds with Sea Salt,كيس أزرق
المكسرات واللب والتسالي,بزر أبيض محمص ومملح,الأميرة (Al Amira),Pumpkin Seeds Roasted & Salted,كيس أزرق
المكسرات واللب والتسالي,بزر بطيخ محمص ومملح,بركة (Baraka),Roasted & Salted Melon Seeds,كيس أحمر وأصفر
المكسرات واللب والتسالي,فول سوداني محمص ومملح,القزي (Al Kazzi),Low Salted Planter Peanuts مع القشرة,كيس أحمر
المكسرات واللب والتسالي,كراكرز مقرمش بالفول السوداني,القزي (Al Kazzi),Cri Cri Quality Nuts كراكرز مقرمش,كيس أحمر
المكسرات واللب والتسالي,حمص أصفر محمص,شاهين (Shahin),Salted Yellow Roasted Chickpeas,كيس شفاف وأزرق
المكسرات واللب والتسالي,حمص تسالي مقرمش,متنوع,حمص تسالي أصفر وأبيض محمص,كيس شفاف
المكسرات واللب والتسالي,عين جمل (جوز) مقشر,متنوع,أنصاف عين جمل فاخرة,علبة بلاستيكية شفافة
المكسرات واللب والتسالي,كاجو محمص,متنوع,كاجو محمص مملح وسادة,علبة بلاستيكية شفافة
المكسرات واللب والتسالي,لوز مقشر ومحمص,متنوع,لوز أمريكي محمص / ني,علبة بلاستيكية شفافة
المكسرات واللب والتسالي,فول سوداني مقشر محمص,متنوع,سوداني محمص بدون قشر,علبة بلاستيكية شفافة
المكسرات واللب والتسالي,أقراص حلاوة المولد سمسمية,متنوع,أقراص سمسمية مدورة عائلية,تغليف بلاستيكي مفرغ
المكسرات واللب والتسالي,أقراص حلاوة المولد حمصية,متنوع,أقراص حمصية مدورة,تغليف بلاستيكي مفرغ
المكسرات واللب والتسالي,أقراص فولية / سودانية,متنوع,أقراص فولية دائرية,تغليف بلاستيكي مفرغ
المكسرات واللب والتسالي,شيبس بطاطس شيبسي,شيبسي (Chipsy),طماطم، شطة وليمون، كباب، جبنة متبلة، ملح,أكياس بلاستيكية
المكسرات واللب والتسالي,شيبس ويز,ويز (Waves),طماطم، كباب، شطة حارة، جبنة,أكياس سوداء وصفراء
المكسرات واللب والتسالي,سناكس مقرمشات الذرة جاكوار,جاكوار (Jaguar),جبنة حلوة، جبنة متبلة,أكياس وكراتين ملونة
المكسرات واللب والتسالي,أصابع بقسماط مقرمشة,إيتوال (Etoile),Bread Sticks أصابع بقسماط مقرمشة بالسمسم والكمون,علب كرتونية خضراء وحمراء
المكسرات واللب والتسالي,أصابع مقرمشات مالحة,متنوع,Salty Crackers Breadsticks,برطمانات بلاستيكية أسطوانية
الشوكولاتة والحلويات والبسكويت,شوكولاتة ميلكا بسكويت لو,ميلكا (Milka),Milka LU Chocolate Bar,لوح شوكولاتة أحمر وبنفسجي
الشوكولاتة والحلويات والبسكويت,شوكولاتة ميلكا أوريو,ميلكا (Milka),Milka Oreo,لوح بنفسجي
الشوكولاتة والحلويات والبسكويت,شوكولاتة ميلكا بالحليب,ميلكا (Milka),Milka Alpine Milk,لوح بنفسجي
الشوكولاتة والحلويات والبسكويت,شوكولاتة ميلكا كراميل وبندق,ميلكا (Milka),Milka Caramel & Whole Hazelnuts,لوح بنفسجي
الشوكولاتة والحلويات والبسكويت,شوكولاتة كيندر بوينو,كيندر (Kinder),Kinder Bueno أبيض وشوكولاتة حليب,أصابع مغلفة
الشوكولاتة والحلويات والبسكويت,شوكولاتة كيندر كونتري,كيندر (Kinder),Kinder Country مع الحبوب المقرمشة,أصابع مغلفة
الشوكولاتة والحلويات والبسكويت,شوكولاتة كادبوري كرانشي,كادبوري (Cadbury),Cadbury Crunchie honeycomb bar,لوح شوكولاتة أصفر وبنفسجي
الشوكولاتة والحلويات والبسكويت,شوكولاتة سنيكرز,سنيكرز (Snickers),Snickers Chocolate Bar,لوح شوكولاتة
الشوكولاتة والحلويات والبسكويت,شوكولاتة تويكس,تويكس (Twix),Twix Caramel Cookie Bars,أصابع شوكولاتة
الشوكولاتة والحلويات والبسكويت,شوكولاتة باونتي,باونتي (Bounty),Bounty Coconut Milk Chocolate,أصابع شوكولاتة
الشوكولاتة والحلويات والبسكويت,شوكولاتة مارس,مارس (Mars),Mars Caramel Nougat Bar,لوح شوكولاتة
الشوكولاتة والحلويات والبسكويت,شوكولاتة كيت كات,كيت كات (KitKat),KitKat 4 Fingers,أصابع ويفر بالشوكولاتة
الشوكولاتة والحلويات والبسكويت,شوكولاتة ليون,ليون (Lion),Lion Caramel & Cereal Chocolate Bar,لوح شوكولاتة
الشوكولاتة والحلويات والبسكويت,شوكولاتة ليو ويفر,ليو (Leo),Leo Chocolate Coated Wafer,علب أرجوانية
الشوكولاتة والحلويات والبسكويت,شوكولاتة فاخرة مشكلة,ويلميد (Wellmade),Assorted Chocolates فواكه وشوكولاتة متنوعة,علب وأطباق بلاستيكية شفافة
الشوكولاتة والحلويات والبسكويت,بسكويت بيمبو شوكولاتة,بيمبو (Bimbo),Original Chocolate Bisco Misr (كلاسيك أصفر وأحمر),علب كرتونية صفراء وحمراء
الشوكولاتة والحلويات والبسكويت,بسكويت شاي أولكر,أولكر (Ulker),Ulker Tea Biscuits سادة,علب ورزم كرتونية
الشوكولاتة والحلويات والبسكويت,بسكويت ماري أولكر,أولكر (Ulker),Marie Tea / Coffee Cookie,علب كرتونية زرقاء وحمراء
الشوكولاتة والحلويات والبسكويت,بسكويت فنجرز شاي بالزبدة,Ulker / متنوع,Tea & Coffee Cookie Finger Biscuits,علب كرتونية صفراء وحمراء
الشوكولاتة والحلويات والبسكويت,بسكويت ديجيستيف ديدجي,ديدجي (Dedye),Dedye Digestive Biscuits سادة ومغطى بالشوكولاتة,عبوات كرتونية زرقاء
الشوكولاتة والحلويات والبسكويت,بسكويت بسكوتة ماري,بسكوتة (Baskota),Marie Biscuits كلاسيك,علب كرتونية زرقاء
الشوكولاتة والحلويات والبسكويت,ويفر رافو مغطى,رافو (Ravo),"Ravo Chocolate, Hazelnut & Vanilla Wafers",علب كرتونية خضراء وصفراء
الشوكولاتة والحلويات والبسكويت,ويفر فايتس مقرمش,فايتس (Vaites),Vaites Wafer Rolls & Bars,علب كرتونية ملونة
الشوكولاتة والحلويات والبسكويت,ويفر ريفو وتورينو كلاسيك,متنوع,ويفر بسكويت بالشوكولاتة والفراولة,علب كرتون
الشوكولاتة والحلويات والبسكويت,بسكويت الشوفان الطبيعي,أوت (Oat),Oat Crispy Healthy Biscuits,علب كرتونية برتقالية
الشوكولاتة والحلويات والبسكويت,كيك توينكيز بكريمة الفانيليا,توينكيز (Twinkies),Twinkies Vanilla Cream Cake,علب كرتونية بنية وصفراء
الشوكولاتة والحلويات والبسكويت,ويفر ويفرز علب صفيح أسطوانية,Wafers,Chocolate / Hazelnut Wafer Rolls,علب معدنية أسطوانية خضراء وصفراء
الشوكولاتة والحلويات والبسكويت,بسكويت ويفر تيتشر,تيتشر (Teacher),Teacher Wafer Crispy Biscuits,علب كرتونية لبنية
الشوكولاتة والحلويات والبسكويت,بسكويت فريش بدون سكر,فريش (No Sugar Added),Sugar Free Sandwich Cookies,علب كرتونية زرقاء
الشوكولاتة والحلويات والبسكويت,بسكويت باتيسري باستو,باستو (Pasto),Pasto Chocolate Cream Biscuits,علب كرتونية زرقاء وصفراء
الشوكولاتة والحلويات والبسكويت,معمول بالتمر الفاخر,حلواني إخوان (Halwani Bros),معمول تمر كلاسيك / معمول بالتمر المغلف,علب كرتونية بنية وصفراء
الشوكولاتة والحلويات والبسكويت,معمول تمر محشو ومغلف,إجازة / متنوع,معمول بالتمر الطبيعي,علب كرتونية ملونة
الشوكولاتة والحلويات والبسكويت,كعك العيد المشكل بالسمن البلدي,العبد (El Abd),كعك سادة ومحشو ملبن وعين جمل,علب كرتونية فاخرة بنفسجية
الشوكولاتة والحلويات والبسكويت,بيتي فور فاخر مشكل,النجمة (Al Negmah),Petit Four مشكل بالمكسرات والشوكولاتة,علب كرتونية فاخرة بنفسجية وذهبية
الشوكولاتة والحلويات والبسكويت,بقلاوة مشكلة بالفستق والكاجو,حلويات نفيسة (Nafeesah Sweets),Assorted Baklava الأصيل,علب كرتونية صفراء وذهبية
الشوكولاتة والحلويات والبسكويت,مارشميلو حلال منوع,بونجور (Bonjour),Halal Marshmallows نكهات وأشكال فواكه,أكياس بلاستيكية زرقاء
الشوكولاتة والحلويات والبسكويت,حلوى راحة الحلقوم بالفستق والمستكة,كاندي ديلايتس (Candy Delights),Turkish Delight Rahat Lokum,علب وأطباق بلاستيكية
الشوكولاتة والحلويات والبسكويت,بونبون وحلوى القهوة والكراميل,Wellmade / متنوع,Coffee Candy & Fruit Chews,أكياس وبرطمانات بلاستيكية
الشاي والقهوة والمشروبات الساخنة,شاي أسود ناعم ومخرز,شاي العروسة,شاي أسود حبيبات وأكياس 100 فتلة,علب كرتونية صفراء وحمراء
الشاي والقهوة والمشروبات الساخنة,شاي أسود العلامة الصفراء,شاي ليبتون (Lipton Yellow Label),شاي أسود ناعم وفتلة,علب كرتونية صفراء
الشاي والقهوة والمشروبات الساخنة,شاي أسود فاخر,شاي ممتاز (Mumtaz Tea),The Famous Brand Ceylon Tea,علب كرتونية حمراء وصفراء
الشاي والقهوة والمشروبات الساخنة,شاي بنكهة المشمش والرمان والتفاح,شاي أحمد (Ahmad Tea),"Apricot Sunrise, Apple Refresh, Raspberry & Pomegranate, Lemon & Lime",علب كرتونية خضراء وملونة
الشاي والقهوة والمشروبات الساخنة,شاي أخضر نقي وخلاصات أعشاب,شاي أحمد (Ahmad Tea),Pure Green Tea & Herbal Infusions,علب كرتونية خضراء
الشاي والقهوة والمشروبات الساخنة,شاي سيلاني فاخر,سيلان تي (Ceylon Tea),Pure Ceylon Black Tea,علب قصدير وكرتون خضراء وبنية
الشاي والقهوة والمشروبات الساخنة,شاي كرك بالحليب والهيل,شاي كرك (Chai Karak / Tea Break),"Original, Cardamom, Saffron Chai Karak",علب أظرف كرتونية بنية
الشاي والقهوة والمشروبات الساخنة,شاي أخضر وأعشاب أسطا,أسطا (Asta),Asta The Vert & Spices,علب كرتونية خضراء
الشاي والقهوة والمشروبات الساخنة,شاي أعشاب وكركديه يابس,متنوع / Roots,كركديه أسواني، يانسون، نعناع مجفف,أكياس وعلب كرتونية
الشاي والقهوة والمشروبات الساخنة,بن تركي بالهيل (أخضر),بن النجار (Café Najjar),بن مطحون مع هال أكسترا,أكياس مفرغة مضغوطة
الشاي والقهوة والمشروبات الساخنة,بن تركي سادة بدون هيل (أزرق),بن النجار (Café Najjar),بن سادة نخب أول,أكياس مفرغة مضغوطة
الشاي والقهوة والمشروبات الساخنة,بن برازيلي مطحون (أحمر),بن النجار (Café Najjar),بن مطحون داكن / برازيلي,أكياس مفرغة مضغوطة
الشاي والقهوة والمشروبات الساخنة,بن تركي كولومبي فاخر,بن النجار سلكشن (Café Najjar Selection),Selection 100% Arabica,أكياس قصديرية ذهبية وبنفسجية
الشاي والقهوة والمشروبات الساخنة,بن تركي محوج وسادة,بن العميد / عبد المعبود,فاتح، وسط، غامق، محوج بالهيل والمستكة,أكياس قصديرية كرتونية بيضاء وبنية
الشاي والقهوة والمشروبات الساخنة,بن تركي محوج ومحمص,أبو عوف (Abu Auf),"بن تركي توليفة خاصة (Classic, Dark, Cardamom)",أكياس ورقية بنية مع سحاب
الشاي والقهوة والمشروبات الساخنة,قهوة إسبريسو مطحونة وقهوة سريعة التحضير,أبو عوف (Abu Auf),Barista Espresso & Instant Coffee Powder,علب صفيح معدنية أسطوانية وبرطمانات
الشاي والقهوة والمشروبات الساخنة,قهوة سريعة التحضير نسكافيه كلاسيك,نسكافيه (Nescafe Classic),Nescafe Classic Pure Instant Coffee,برطمانات زجاجية ذات أغطية خضراء
الشاي والقهوة والمشروبات الساخنة,نسكافيه 3 في 1 / 2 في 1,نسكافيه (Nescafe),Nescafe 3-in-1 Creamy & 2-in-1 Zero Sugar,علب أظرف كرتونية خضراء وحمراء
الشاي والقهوة والمشروبات الساخنة,كابتشينو بنكهة الفانيليا وكلاسيك,بونجورنو (Bonjorno Cafe),"Cappuccino Vanilla, Cappuccino Foamy",علب كرتونية خضراء وبنفسجية
الشاي والقهوة والمشروبات الساخنة,تورابيكا كابتشينو مع حبيبات الشوكو,تورابيكا (Tora Bika),Tora Bika Cappuccino with Choco Granule,أكياس أظرف عائلية كرتونية
الشاي والقهوة والمشروبات الساخنة,مسحوق كاكاو فاخر,جلاسكو (Glasco),Cocoa Powder For Baking and Drinks,علب كرتونية بنية وحمراء
الشاي والقهوة والمشروبات الساخنة,سحلب جاهز بالمكسرات والسمسم,عبيدو / أبو عوف (Abido / Abu Auf),Sahlab Instant Mix,علب كرتونية وبرطمانات
الشاي والقهوة والمشروبات الساخنة,مهلبية ومغات وبودينج جاهز,عبيدو / كورتاس (Abido / Cortas),مهلبية بيضاء، مغات، كاسترد,علب كرتونية صفراء وحمراء
الشاي والقهوة والمشروبات الساخنة,مبيض قهوة بودرة أصلي,كوفي ميت (Coffee-mate),Original Coffee Creamer Powder (311 Servings),عبوات بلاستيكية أسطوانية برتقالية
المشروبات الغازية والعصائر والمياه,مشروب غازي فواكه فيروز ميكس,فيروز (Freez Mix),توت أزرق، تفاح، فراولة، رمان، مانجو، ليمون، كيوي، خوخ,زجاجات زجاجية شفافة وكراتين 6 حبات
المشروبات الغازية والعصائر والمياه,مشروب شعير خالي من الكحول لذيذة,لذيذة (Laziza),تفاح أخضر، توت بري، فراولة، أناناس، شعير كلاسيك,زجاجات زجاجية خضراء وعبوات 6 حبات كرتون
المشروبات الغازية والعصائر والمياه,مشروب شعير بربيكان,بربيكان (Barbican),شعير سادة، تفاح، رمان، فراولة، خوخ,زجاجات زجاجية بنية وخضراء وعلب كانز كرتون 6 حبات
المشروبات الغازية والعصائر والمياه,مشروب شعير موسي,موسي (Moussy),رمان، تفاح، خوخ، شعير صافي,زجاجات زجاجية وكراتين 6 حبات كرتونية حمراء
المشروبات الغازية والعصائر والمياه,عصير فرجلو فواكه مشكلة,فرجلو (Faragello),كوكتيل فواكه، أناناس، مانجو، برتقال، تفاح,عبوات كرتون تتراباك ملونة
المشروبات الغازية والعصائر والمياه,عصير ميرا فواكه طبيعية,ميرا (Mira),عصير مانجو، عصير جوافة طبيعي باللب اللزج,زجاجات بلاستيكية شفافة
المشروبات الغازية والعصائر والمياه,عصير سن توب فواكه وبرتقال,سن توب (Sun Top),برتقال، توت، فواكه استوائية,عبوات كرتونية صغيرة للأطفال
المشروبات الغازية والعصائر والمياه,شراب الورد الطبيعي المركز,كاساتلي شتورا (Kassatly Chtaura),Rose Syrup Concentrated Cordial,زجاجات زجاجية وردية
المشروبات الغازية والعصائر والمياه,شراب الجلاب بالتمر وماء الورد,كاساتلي شتورا (Kassatly Chtaura),Jallab Dates Syrup,زجاجات زجاجية داكنة بغطاء ذهبي
المشروبات الغازية والعصائر والمياه,شراب التمر هندي المركز,كاساتلي شتورا / اليمامة,Tamarind Concentrated Syrup,زجاجات زجاجية بنية داكنة
المشروبات الغازية والعصائر والمياه,ماء زهر وماء ورد مقطر,اليمامة / كورتاس / شتورا,Orange Blossom Water & Rose Water,زجاجات زجاجية صفراء وخضراء
المشروبات الغازية والعصائر والمياه,دبس الرمان الطبيعي,اليمامة / كورتاس / مازة (Mezza),Pomegranate Molasses دبس رمان حامض حلو,زجاجات زجاجية داكنة وبرطمانات
منتجات الألبان والأجبان,جبن أبيض دمياطي كامل الدسم,المعلم (محمود فوزي أحمد حسان),طري مسوي، كامل الدسم، المنيا - عزبة شاهين,صفيحة معدنية بيضاء مستطيلة
منتجات الألبان والأجبان,جبن إسطنبولي خزين بالفلفل,جبنة ملوي,كاملة الدسم بالفلفل الحار الأخضر,صفيحة معدنية زرقاء وخضراء مستطيلة
منتجات الألبان والأجبان,جبنة براميلي بالفلفل الأخضر والطبيعي,مزارع دينا (Dina Farms),Barameely Cheese بالفلفل والخيار,عبوات بلاستيكية بيضاء بغطاء أخضر
منتجات الألبان والأجبان,جبن أبيض طري خفيف الملح,مزارع دينا (Dina Farms),Soft White Cheese قليل الملح,عبوات بلاستيكية بيضاء بغطاء أزرق
منتجات الألبان والأجبان,جبن إسطنبولي وخزين معتق,الدمياطي,جبن أبيض معتق خزين دمياطي أصلي,عبوات بلاستيكية مستطيلة بيضاء
منتجات الألبان والأجبان,جبنة فيتا وقشطة بيضاء,جرين لاند (Greenland),فيتا بيضاء، جبنة بالقشطة، دبل كريم,عبوات كرتونية تتراباك ملونة
منتجات الألبان والأجبان,مش دمياطي قديم بلدي,كتيلو (Katilo),Old Demiaty Mish مش فلاحي أصلي حار,برطمانات بلاستيكية ذات أغطية بيضاء
منتجات الألبان والأجبان,جبنة فيتا وجبن مثلثات ومربعات,كيري (Kiri),Kiri Cream Spread Squares 24/12 قطعة,علب كرتونية زرقاء وبيضاء
منتجات الألبان والأجبان,زبدة لورباك دانماركية طبيعية,لورباك (Lurpak),Lurpak Danish Pure Unsalted Butter,قوالب قصديرية مستطيلة زرقاء وفضية
منتجات الألبان والأجبان,جبنة عكاوي وجبنة حلوم ونابلسية,كورتاس / حلب / حلواني,أجبان بيضاء للشوي والتحلية والحلويات,عبوات بلاستيكية مستطيلة مفرغة
منتجات الألبان والأجبان,جبنة قريش فلاحي طازجة,بلدي / ألبان مزارع,جبنة قريش خالية من الملح والدسم للدايت,أسطال بلاستيكية بيضاء مستديرة
منتجات الألبان والأجبان,لبنة بلدية وزبادي يوناني,حلوة / جرين لاند / المراعي,لبنة كريمية كاملة الدسم,علب بلاستيكية بيضاء
منتجات الألبان والأجبان,بيض مائدة طازج,مزارع محلية,طبق بيض أحمر وأبيض كبير (30 بيضة),أطباق كرتونية
المعكرونة والبقوليات والمعلبات,مكرونة لازانيا عريضة,رونزوني (Ronzoni),Ronzoni Lasagna No. 80 Enriched Pasta,علب كرتونية زرقاء مستطيلة
المعكرونة والبقوليات والمعلبات,مكرونة كوع إلبو وبيني,رونزوني (Ronzoni),Ronzoni Elbows & Penne Rigate,علب كرتونية زرقاء
المعكرونة والبقوليات والمعلبات,مكرونة زيتي ريجاتي وسباغيتي رفيعة,رونزوني (Ronzoni),Ronzoni Ziti Rigate & Thin Spaghetti,علب كرتونية زرقاء
المعكرونة والبقوليات والمعلبات,مكرونة إيطالية سميد ديورم,أنطونيو (Antonio / De Ble Dur),سباغيتي، شعرية، لسان عصفور، أقلام,أكياس بلاستيكية شفافة وزرقاء
المعكرونة والبقوليات والمعلبات,مكرونة ريجينا مصرية,ريجينا (Regina),ريشة، حلزونة، خواتم، فوسيلي,أكياس بلاستيكية ملونة
المعكرونة والبقوليات والمعلبات,ورق عنب كاليفورنيا في محلول ملحي,أورلاندو (Orlando Grape Leaves),California Grape Leaves طري وفاخر,برطمانات زجاجية كبيرة أغطية صفراء
المعكرونة والبقوليات والمعلبات,ورق عنب محشي / جاهز,المروة / ستي / شتورا,Stuffed Vine Leaves ورق عنب جاهز للأكل,علب صفيح معدنية دائرية
المعكرونة والبقوليات والمعلبات,تونة قطع في زيت دوار الشمس,الدار البيضاء (Casablanca),Chunk Light Tuna In Sunflower Oil & Olive Oil,علب صفيح كرتونية ترويجية (مجموعات 3/4)
المعكرونة والبقوليات والمعلبات,تونة لحم أبيض فاخر,البحارة (El Bahara),White Solid Meat Tuna in Oil,علب صفيح دائرية
المعكرونة والبقوليات والمعلبات,سردين مغربي بالزيت والشطة والصلصة,البحارة (El Bahara) / سيدي داود,Moroccan Sardines In Vegetable Oil & Chili,علب صفيح مسطحة دائرية ومستطيلة
المعكرونة والبقوليات والمعلبات,فول مدمس سادة وبالخلطة والكمون,كورتاس / حدائق كاليفورنيا (Cortas / Americana),Fava Beans Foul Mudammas,علب صفيح معدنية أسطوانية
المعكرونة والبقوليات والمعلبات,حمص مسلوق حب,كورتاس / المروة (Cortas / El Marwa),Cooked Chickpeas in Brine,علب صفيح وبرطمانات
المعكرونة والبقوليات والمعلبات,حمص بطحينة متبل جاهز,كورتاس (Cortas),Hommos Tahina Dip,علب صفيح معدنية
المعكرونة والبقوليات والمعلبات,طرشي بلدي مشكل ومخلل لفت أحمر,المروة / الريان / صوفيا,مخلل مشكل بالقرنبيط والجزر والخيار واللفت,برطمانات زجاجية كبيرة
المعكرونة والبقوليات والمعلبات,مخلل خيار بلدي مقرمش وفلفل حار,صوفيا / إيريس (Sofia / Iris / Beirut),Pickled Cucumbers & Pickled Wild Hot Peppers,برطمانات زجاجية طويلة أغطية بيضاء
المعكرونة والبقوليات والمعلبات,مخلل زيتون أخضر وأسود مخلي ومحشو,متنوع (Olive Grooves),زيتون تفاحي، زيتون كلاماتا، زيتون بالليمون والفلفل,برطمانات وأوعية بلاستيكية
المعكرونة والبقوليات والمعلبات,مربى فراولة وتين ومشمش وتوت,حلواني إخوان / المروة / فيتراك,"Strawberry, Fig, Apricot, Raspberry Jam",برطمانات زجاجية أغطية حمراء وخضراء
المعكرونة والبقوليات والمعلبات,حلاوة طحينية سادة وبالمكسرات والفستق,حلواني إخوان / الرشيدي الميزان,Halawa Tahinia Plain & Pistachio,علب بلاستيكية مستطيلة ودائرية
المعكرونة والبقوليات والمعلبات,طحينة بيضاء نقية 100% سمسم,الرشيدي الميزان / حلواني / البرج,Pure Sesame Tahina,برطمانات بلاستيكية وزجاجية
المعكرونة والبقوليات والمعلبات,عسل نحل طبيعي زهور الموالح والبرسيم,متنوع,Pure Blossom Honey,برطمانات زجاجية وعبوات ضغط
المعكرونة والبقوليات والمعلبات,صلصة طماطم معجون مركز,كريستال / هاينز / إيزيس,Tomato Paste Pure Concentrate,علب صفيح وبرطمانات
المعكرونة والبقوليات والمعلبات,كاتشب ومايونيز ومستردة,هاينز / هايكرز (Heinz / Heckers),Tomato Ketchup & Real Mayonnaise,زجاجات ضغط بلاستيكية
المعكرونة والبقوليات والمعلبات,سردين وتونة ورنجة مدخنة معلبة,متنوع,Smoked Herring & Mackerel Fillets,علب صفيح معدنية
الزيوت والسمن والتوابل والبهارات,زيت دوار الشمس النقي للطهي,زير (Zer),Pure Sunflower Cooking Oil (1.8L / 4L),جالونات وقوارير بلاستيكية صفراء شفافة
الزيوت والسمن والتوابل والبهارات,زيت ذرة نقي,زير / عافية (Zer / Afia),Pure Corn Oil,جالونات وقوارير بلاستيكية صفراء
الزيوت والسمن والتوابل والبهارات,زيت زيتون بكر ممتاز معصور على البارد,اليمامة / كورتاس / زير (Extra Virgin),Cold Pressed Extra Virgin Olive Oil,زجاجات زجاجية خضراء داكنة وقوارير
الزيوت والسمن والتوابل والبهارات,سمن بقري حلوب نقي,بقر الحلوب / فارم / مرجوانا,Pure Butter Ghee فلاحي صافي,برطمانات زجاجية وصفائح معدنية خضراء وصفراء
الزيوت والسمن والتوابل والبهارات,سمن نباتي بنكهة الزبدة الفلاحي,روابي / جنة / جولدن ميكس,Vegetable Ghee with Butter Flavor,صفائح وبرطمانات بلاستيكية
الزيوت والسمن والتوابل والبهارات,ملح طعام يودي ناعم وخشن,مورتون (Morton Salt),Iodized Table Salt & Coarse Salt,عبوات أسطوانية كرتونية زرقاء داكنة
الزيوت والسمن والتوابل والبهارات,خل أبيض نقي وخل تفاح طبيعي,متنوع,Pure White Distilled Vinegar & Apple Cider Vinegar,زجاجات بلاستيكية وزجاجية شفافة
الزيوت والسمن والتوابل والبهارات,توابل وبهارات طهي مشكلة,بهارات الشرق / توليفة,كمون مطحون، كزبرة ناشفة، بابريكا حلوة وحارة، بهارات شاورما، بهارات كبسة، كاري هندي,برطمانات بهارات بلاستيكية بأغطية حمراء وبيضاء
الزيوت والسمن والتوابل والبهارات,أعشاب عطرية جافة,متنوع,زعتر بري، روزماري (إكليل الجبل)، ريحان، أوريجانو، ورق لورا (غار),برطمانات بهارات صغيرة
الزيوت والسمن والتوابل والبهارات,ثوم وبصل بودرة وزنجبيل وقرفة,متنوع,"Garlic Powder, Onion Powder, Ground Ginger, Cinnamon",برطمانات بهارات زجاجية وبلاستيكية
الزيوت والسمن والتوابل والبهارات,مستلزمات خفق وكيك (كريم شانتيه),دريم (Dream),Chantilly Whipped Topping Cream,أكياس وعلب كرتونية زرقاء وبيضاء
الزيوت والسمن والتوابل والبهارات,بودرة كاسترد وفانيليا وبيكنج باودر,دريم / فوستر كلاركس (Foster Clark's / Dream),"Baking Powder, Pure Vanilla, Custard Powder",علب صفيح دائرية وأظرف كرتونية
الزيوت والسمن والتوابل والبهارات,نشا ذرة نقي,دريم / نشا القمح (Wheat / Corn Starch),Pure Corn Starch & Wheat Starch,علب وأكياس بلاستيكية
الزيوت والسمن والتوابل والبهارات,جيلي بنكهات الفراولة والمشمش والكرز,دريم (Dream),Flavored Gelatin Dessert,علب كرتونية ملونة
الأطعمة والعجائن والخضار المجمد,ملوخية مصرية مخروطة مجمدة,مونتانا (Montana),Minced Molokhia Green Leaves,أكياس بلاستيكية خضراء مجمدة
الأطعمة والعجائن والخضار المجمد,بامية ممتازة خضراء مجمدة,مونتانا (Montana),Okra Extra / Zero,أكياس بلاستيكية خضراء مجمدة
الأطعمة والعجائن والخضار المجمد,قلقاس مصري بالسلق والخضرة,مونتانا (Montana),Taro Colocasia with Chard Leaves,أكياس بلاستيكية خضراء مجمدة
الأطعمة والعجائن والخضار المجمد,بازلاء خضراء وجزر مشكل,مونتانا (Montana),Green Peas with Diced Carrots,أكياس بلاستيكية خضراء مجمدة
الأطعمة والعجائن والخضار المجمد,فاصوليا خضراء مقطعة,مونتانا (Montana),Cut Green Beans,أكياس بلاستيكية خضراء مجمدة
الأطعمة والعجائن والخضار المجمد,ملوخية وخضروات مجمدة ماركة بسمة,بسمة (Basma),Molokhia & Frozen Vegetables,أكياس بلاستيكية خضراء
الأطعمة والعجائن والخضار المجمد,خضار مشكل وملوخية وبامية تركية,فيجي تورك (Vegie Turk),"Frozen Molokhia, Okra, Mixed Veggies",أكياس بلاستيكية بيضاء وخضراء
الأطعمة والعجائن والخضار المجمد,رقائق عجينة جلاش / فيلو رقيقة,كورتاس / الزهار (Cortas / El Zahar),Fillo Dough Thin Pastry Sheets,علب كرتونية مستطيلة زرقاء وصفراء
الأطعمة والعجائن والخضار المجمد,عجينة كنافة شعر مجمدة,الزهار / كورتاس (Konafah Dough),عجينة كنافة بلدية وشعر فاخرة,أكياس وعلب كرتونية مستطيلة
الأطعمة والعجائن والخضار المجمد,قطايف دائرية جاهزة مجمدة,كورتاس (Cortas Kataifi / Katayef),قطايف جاهزة للحشو والقلي,علب كرتونية سوداء وذهبية
الأطعمة والعجائن والخضار المجمد,رقائق سمبوسك مثلثة ومستطيلة,الزهار (El Zahar Samosa),رقائق سمبوسك مقرمشة للتحمير بالفرن والقلي,أكياس بلاستيكية مستطيلة
الأطعمة والعجائن والخضار المجمد,أقراص وعجينة طعمية / فلافل جاهزة,الزهار / كورتاس (Falafel Patties),Egyptian Falafel Taameya جاهزة للقلي,علب وأطباق فوم مغلفة
الأطعمة والعجائن والخضار المجمد,أصابع كفتة وممبار مصري مجمد,أكلات بلدية جاهزة,جاهز للطهي والتحمير,علب وأطباق فوم مغلفة
CSV;
    }
}
