<?php

namespace App\Console\Commands;

use App\Models\Category;
use App\Models\Product;
use App\Models\Subcategory;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

/**
 * Replaces the current 6 top-level categories with the 8-category scheme
 * the store owner approved (Frozen Foods, Canned Foods, Rice/Pasta/Grains,
 * Dairy & Eggs, Coffee/Tea/Drinks, Nuts/Seeds/Snacks, Sweets & Biscuits,
 * Oils/Spices/Sauces), and re-files every product into the new category +
 * subcategory that best matches its name.
 *
 * Matching is keyword-based against the product's English name, Arabic
 * name and SKU (first rule that matches wins) — the same approach used by
 * catalog:remap-categories, just against a different target taxonomy.
 * A handful of non-food items (soap, a coffee pot, incense) don't cleanly
 * fit any of the 8 categories; they fall back into Oils, Spices & Sauces /
 * Sauces & Condiments as a catch-all and are flagged in the output so they
 * can be moved by hand from Admin > Products afterward if desired.
 *
 * Usage: php artisan catalog:restructure-categories {--dry-run}
 */
class RestructureToEightCategories extends Command
{
    protected $signature = 'catalog:restructure-categories {--dry-run : Preview without writing to the database}';

    protected $description = 'Replace the 6 current categories with the approved 8-category scheme and re-file every product';

    // [slug, name, arabic_name, icon, [ [sub_slug, sub_name, sub_arabic_name], ... ] ]
    private array $newCategories = [
        ['frozen-foods', 'Frozen Foods', 'المجمدات والمثلجات', 'Snowflake', [
            ['frozen-vegetables', 'Frozen Vegetables', 'الخضروات المجمدة'],
            ['frozen-dough', 'Frozen Dough & Pastries', 'العجين والمعجنات المجمدة'],
            ['frozen-meals', 'Frozen Meals', 'الوجبات المجمدة'],
        ]],
        ['canned-foods', 'Canned Foods', 'الأطعمة المعلبة', 'ShoppingBag', [
            ['canned-fish', 'Canned Fish', 'الأسماك المعلبة'],
            ['legumes', 'Legumes & Hommos', 'البقوليات والحمص'],
            ['pickles-vine-leaves', 'Pickles & Vine Leaves', 'المخللات وورق العنب'],
        ]],
        ['rice-pasta-grains', 'Rice, Pasta & Grains', 'الأرز والمكرونة والحبوب', 'ShoppingBag', [
            ['pasta', 'Pasta', 'المكرونة'],
            ['rice-grains', 'Rice & Grains', 'الأرز والحبوب'],
            ['baking-flour', 'Baking & Flour', 'الدقيق ومستلزمات الخبيز'],
        ]],
        ['dairy-eggs', 'Dairy & Eggs', 'الألبان والأجبان الطازجة', 'ShoppingBag', [
            ['cheese', 'Cheese', 'الأجبان'],
            ['butter-cream', 'Butter & Cream', 'الزبدة والقشطة'],
        ]],
        ['coffee-tea-drinks', 'Coffee, Tea & Drinks', 'الشاي والقهوة والمشروبات', 'Coffee', [
            ['coffee', 'Coffee', 'القهوة'],
            ['tea', 'Tea', 'الشاي'],
            ['juices-soft-drinks', 'Juices & Soft Drinks', 'العصائر والمشروبات الغازية'],
            ['syrups-water', 'Syrups & Water', 'الشراب والمياه'],
        ]],
        ['nuts-seeds-snacks', 'Nuts, Seeds & Snacks', 'المكسرات واللب والتسالي', 'Cookie', [
            ['nuts-seeds', 'Nuts & Seeds', 'المكسرات واللب'],
            ['crackers-crisps', 'Crackers & Crisps', 'الكراكرز والشيبسي'],
        ]],
        ['sweets-biscuits', 'Sweets & Biscuits', 'الشوكولاتة والحلويات والبسكويت', 'Cookie', [
            ['chocolate', 'Chocolate', 'الشوكولاتة'],
            ['biscuits-wafers', 'Biscuits & Wafers', 'البسكويت والويفر'],
            ['baklava-dates', 'Baklava & Dates', 'البقلاوة والتمور'],
            ['halawa-turkish-delight', 'Halawa & Turkish Delight', 'الحلاوة والراحة'],
        ]],
        ['oils-spices-sauces', 'Oils, Spices & Sauces', 'الزيوت والتوابل والصوصات', 'Flame', [
            ['oils-ghee', 'Oils & Ghee', 'الزيوت والسمن'],
            ['spices-herbs', 'Spices & Herbs', 'البهارات والأعشاب'],
            ['sauces-condiments', 'Sauces & Condiments', 'الصوصات والمقبلات'],
        ]],
    ];

    // Ordered rules: first (category, subcategory) whose keyword list
    // matches the product's "name arabicName sku" haystack wins.
    private function rules(): array
    {
        return [
            // ── Frozen Foods ──
            ['frozen-foods', 'frozen-vegetables', ['molokhia', 'ملوخية', 'okra', 'بامية', 'taro', 'قلقاس', 'green peas', 'green beans', 'frozen vegetable']],
            ['frozen-foods', 'frozen-dough', ['fillo', 'kataifi', 'konafah', 'كنافة', 'جلاش', 'قطايف']],
            ['frozen-foods', 'frozen-meals', ['samosa', 'سمبوسة', 'falafel', 'فلافل', 'taameya', 'طعمية']],
            ['frozen-foods', 'frozen-vegetables', ['frozen']],

            // ── Dairy & Eggs ──
            ['dairy-eggs', 'butter-cream', ['butter', 'زبدة', 'lurpak', 'whipped topping', 'chantilly', 'jameed', 'جميد']],
            // NOTE: no bare 'مش' here — it's a substring of many unrelated
            // Arabic words (مقرمش "crunchy", مشمش "apricot", مشروب "drink"),
            // so it caused mass false-positives when this ran the first time.
            ['dairy-eggs', 'cheese', ['cheese', 'جبن', 'جبنة', 'demiaty mish', 'kiri', 'dairy & cheese']],

            // ── Coffee, Tea & Drinks ──
            ['coffee-tea-drinks', 'coffee', ['coffee', 'قهوة', 'nescafe', 'cappuccino', 'espresso', 'tora bika']],
            ['coffee-tea-drinks', 'tea', ['tea', 'شاي', 'chai', 'karak', 'sahlab', 'سحلب']],
            ['coffee-tea-drinks', 'juices-soft-drinks', ['juice', 'soft drink', 'freez', 'laziza', 'barbican', 'moussy', 'faragello', 'mira', 'sun top', 'عصائر']],
            ['coffee-tea-drinks', 'syrups-water', ['syrup', 'rose water', 'blossom water', 'jallab', 'tamarind', 'molasses', 'دبس', 'زهر', 'cocoa powder', 'creamer']],

            // ── Nuts, Seeds & Snacks ──
            ['nuts-seeds-snacks', 'crackers-crisps', ['cracker', 'breadstick', 'bread stick', 'قسماط', 'كراكرز', 'chips', 'crisp']],
            ['nuts-seeds-snacks', 'nuts-seeds', ['nut', 'seed', 'peanut', 'chickpea', 'مكسرات', 'لب', 'cri cri', 'sunflower seed', 'pumpkin seed', 'melon seed']],

            // ── Sweets & Biscuits ──
            ['sweets-biscuits', 'baklava-dates', ['baklava', 'بقلاوة', 'date', 'تمر', 'maamoul', 'معمول', 'petit four']],
            ['sweets-biscuits', 'halawa-turkish-delight', ['halawa', 'حلاوة طحين', 'turkish delight', 'rahat lokum', 'راحة', 'marshmallow']],
            ['sweets-biscuits', 'biscuits-wafers', ['biscuit', 'بسكويت', 'wafer', 'cookie', 'كوكيز', 'cake', 'twinkies']],
            ['sweets-biscuits', 'chocolate', ['chocolate', 'شوكولاتة', 'kitkat', 'snickers', 'twix', 'bounty', 'mars', 'kinder', 'milka', 'cadbury', 'lion', 'candy']],

            // ── Rice, Pasta & Grains ──
            ['rice-pasta-grains', 'pasta', ['pasta', 'مكرونة', 'spaghetti', 'lasagna', 'penne', 'ziti', 'elbow', 'macaroni']],
            ['rice-pasta-grains', 'baking-flour', ['starch', 'نشا', 'baking powder', 'custard', 'gelatin', 'vanilla']],
            ['rice-pasta-grains', 'rice-grains', ['rice', 'أرز', 'couscous', 'كسكس', 'oat', 'شوفان', 'bulgur', 'arabic bread', 'خبز']],

            // ── Canned Foods ──
            ['canned-foods', 'canned-fish', ['tuna', 'تونة', 'sardine', 'سردين', 'mackerel', 'herring']],
            ['canned-foods', 'pickles-vine-leaves', ['pickle', 'مخلل', 'vine leaves', 'grape leaves', 'ورق عنب', 'stuffed']],
            ['canned-foods', 'legumes', ['fava', 'foul', 'فول', 'chickpea', 'حمص', 'hommos', 'hummus']],

            // ── Oils, Spices & Sauces ──
            ['oils-spices-sauces', 'oils-ghee', ['oil', 'زيت', 'ghee', 'سمن']],
            ['oils-spices-sauces', 'spices-herbs', ['spice', 'بهار', 'بهارات', 'cinnamon', 'ginger', 'sumac', 'سماق', 'zaatar', 'زعتر', 'garlic powder', 'onion powder', 'herb']],
            ['oils-spices-sauces', 'sauces-condiments', ['salt', 'ملح', 'vinegar', 'خل', 'ketchup', 'mayonnaise', 'tomato paste', 'tahini', 'tahina', 'طحينة', 'honey', 'عسل', 'harissa', 'jam', 'مربى']],
        ];
    }

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        // ── 1. Create (or find) the 8 new categories + their subcategories ──
        $categoryModels = [];   // slug => Category
        $subcategoryModels = []; // "catSlug/subSlug" => Subcategory

        foreach ($this->newCategories as $order => [$slug, $name, $arabicName, $icon, $subs]) {
            $this->line("Category: {$name} ({$slug})");

            if ($dryRun) {
                $categoryModels[$slug] = Category::where('slug', $slug)->first();
            } else {
                $category = Category::updateOrCreate(
                    ['slug' => $slug],
                    [
                        'name' => $name,
                        'arabic_name' => $arabicName,
                        'description' => $name,
                        'arabic_description' => $arabicName,
                        'image' => 'https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=600&auto=format&fit=crop',
                        'icon' => $icon,
                        'active' => true,
                        'featured' => false,
                        'display_order' => $order,
                    ]
                );
                $categoryModels[$slug] = $category;
            }

            foreach ($subs as $subOrder => [$subSlug, $subName, $subArabicName]) {
                if ($dryRun) {
                    continue;
                }
                $sub = Subcategory::updateOrCreate(
                    ['category_id' => $categoryModels[$slug]->id, 'slug' => $subSlug],
                    [
                        'name' => $subName,
                        'arabic_name' => $subArabicName,
                        'active' => true,
                        'display_order' => $subOrder,
                    ]
                );
                $subcategoryModels["{$slug}/{$subSlug}"] = $sub;
            }
        }

        // ── 2. Re-file every product into the best-matching new category/subcategory ──
        $rules = $this->rules();
        $products = Product::all();
        $counts = [];
        $unmatched = [];

        // Last-resort fallback keyed off the SKU prefix the original import
        // used (NUTS-, CHOC-, TEA-, ...) — only consulted when NO content
        // keyword matched anything, so it can't outrank an actual match on
        // the product's real name (which is what caused PASTA-0015 "Pickled
        // Cucumbers" to get dragged into "pasta" just because its SKU
        // happened to start with PASTA- on the first run of this command).
        $skuPrefixFallback = [
            'NUTS' => ['nuts-seeds-snacks', 'nuts-seeds'],
            'CHOC' => ['sweets-biscuits', 'chocolate'],
            'TEA' => ['coffee-tea-drinks', 'tea'],
            'BEV' => ['coffee-tea-drinks', 'juices-soft-drinks'],
            'DAIRY' => ['dairy-eggs', 'cheese'],
            'PASTA' => ['rice-pasta-grains', 'pasta'],
            'OILS' => ['oils-spices-sauces', 'oils-ghee'],
            'FROZEN' => ['frozen-foods', 'frozen-vegetables'],
        ];

        foreach ($products as $product) {
            // Content only — the SKU is deliberately excluded here so a
            // keyword can't be out-muscled by an unrelated SKU prefix.
            $haystack = mb_strtolower(($product->name ?? '') . ' ' . ($product->arabic_name ?? ''));

            $matchedCatSlug = null;
            $matchedSubSlug = null;

            foreach ($rules as [$catSlug, $subSlug, $keywords]) {
                foreach ($keywords as $kw) {
                    if (mb_strpos($haystack, mb_strtolower($kw)) !== false) {
                        $matchedCatSlug = $catSlug;
                        $matchedSubSlug = $subSlug;
                        break 2;
                    }
                }
            }

            // No content keyword matched — fall back to the SKU prefix
            // before giving up entirely.
            if (!$matchedCatSlug && $product->sku) {
                foreach ($skuPrefixFallback as $prefix => [$fallbackCat, $fallbackSub]) {
                    if (str_starts_with($product->sku, $prefix)) {
                        $matchedCatSlug = $fallbackCat;
                        $matchedSubSlug = $fallbackSub;
                        break;
                    }
                }
            }

            // Nothing matched (e.g. soap, incense, a copper coffee pot) —
            // fall back to the closest catch-all bucket and flag it.
            if (!$matchedCatSlug) {
                $matchedCatSlug = 'oils-spices-sauces';
                $matchedSubSlug = 'sauces-condiments';
                $unmatched[] = "[{$product->sku}] {$product->name}";
            }

            $counts[$matchedCatSlug] = ($counts[$matchedCatSlug] ?? 0) + 1;

            $this->line("  [{$product->sku}] {$product->name} -> {$matchedCatSlug} / {$matchedSubSlug}");

            if (!$dryRun) {
                $category = $categoryModels[$matchedCatSlug];
                $subcategory = $subcategoryModels["{$matchedCatSlug}/{$matchedSubSlug}"] ?? null;
                $product->update([
                    'category_id' => $category->id,
                    'subcategory_id' => $subcategory?->id,
                ]);
            }
        }

        // ── 3. Remove the old categories, now that every product has moved off them ──
        $oldSlugs = ['groceries', 'frozen', 'drinks', 'sweets-snacks', 'spices-sauces', 'household'];
        $newSlugs = array_column($this->newCategories, 0);
        $oldCategories = Category::whereIn('slug', $oldSlugs)->whereNotIn('slug', $newSlugs)->get();

        foreach ($oldCategories as $old) {
            $stillHasProducts = $old->products()->exists();
            if ($stillHasProducts) {
                $this->warn("  Skipped deleting '{$old->slug}' — it still has products attached (unexpected, check manually).");
                continue;
            }
            $this->line("  Deleting old category: {$old->slug}");
            if (!$dryRun) {
                $old->subcategories()->delete();
                $old->delete();
            }
        }

        // ── Summary ──
        $this->newLine();
        $label = $dryRun ? '[DRY RUN] Would file' : 'Filed';
        foreach ($counts as $slug => $count) {
            $this->line("  {$label} {$count} products into {$slug}");
        }
        if ($unmatched) {
            $this->newLine();
            $this->warn('No keyword matched these — fell back to Oils, Spices & Sauces / Sauces & Condiments, review manually:');
            foreach ($unmatched as $u) {
                $this->warn("  {$u}");
            }
        }
        $this->newLine();
        $this->info($dryRun ? '[DRY RUN] No changes written.' : 'Done — 8 categories are live, old categories removed.');

        return self::SUCCESS;
    }
}
