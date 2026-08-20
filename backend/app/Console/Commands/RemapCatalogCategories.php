<?php

namespace App\Console\Commands;

use App\Models\Category;
use App\Models\Product;
use App\Models\Subcategory;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * One-time fix: the catalog:import command created 8 brand-new top-level
 * categories (nuts-seeds-snacks, chocolate-sweets-biscuits, ...) because they
 * didn't exist yet. The public storefront's category navigation is a static
 * list hardcoded in the frontend (src/data/categories.ts) with only 6 known
 * categories (groceries, frozen, drinks, sweets-snacks, spices-sauces,
 * household) — so those 8 new categories are invisible/broken on the site
 * even though the products are correctly saved in the database.
 *
 * This command re-assigns every product from the 8 new categories into the
 * correct existing category + a matching subcategory (chosen by simple
 * keyword rules against the product name/description), then deletes the 8
 * now-empty categories. Safe to re-run.
 *
 * Usage: php artisan catalog:remap-categories {--dry-run}
 */
class RemapCatalogCategories extends Command
{
    protected $signature = 'catalog:remap-categories {--dry-run : Preview without writing to the database}';

    protected $description = 'Re-map products from the 8 orphan import categories into the site\'s existing 6 categories';

    /** old category slug (created by catalog:import) => target existing category slug */
    private array $targetCategory = [
        'nuts-seeds-snacks' => 'sweets-snacks',
        'chocolate-sweets-biscuits' => 'sweets-snacks',
        'tea-coffee-hot-drinks' => 'drinks',
        'soft-drinks-juices-water' => 'drinks',
        'dairy-cheese' => 'groceries',
        'pasta-legumes-canned-goods' => 'groceries',
        'oils-ghee-spices' => 'spices-sauces',
        'frozen-foods-pastry' => 'frozen',
    ];

    /**
     * Per target category, ordered [subcategory_slug, keywords] rules.
     * First matching keyword (case-insensitive, matched against name+description+brand) wins.
     * No match => subcategory left null (still visible under the parent category).
     */
    private array $subcategoryRules = [
        'sweets-snacks' => [
            ['chocolate', ['chocolate', 'milka', 'kinder', 'twix', 'kit kat', 'kitkat', 'mars', 'snickers', 'bounty', 'cadbury', 'lion', 'wafer']],
            ['biscuits', ['biscuit', 'cookie', 'wafer', 'cracker']],
            ['baklava', ['baklava', 'turkish delight', 'halawa', 'petit four', 'maamoul', 'معمول']],
            ['dates', ['dates', 'تمر']],
            ['snacks', []], // fallback for this category
        ],
        'drinks' => [
            ['coffee', ['coffee', 'nescafe', 'espresso', 'cappuccino', 'tora bika', 'najjar', 'كافيه']],
            ['tea', ['tea', 'chai', 'karak', 'شاي']],
            ['juices', ['juice', 'عصير']],
            ['soft-drinks', ['freez', 'laziza', 'barbican', 'moussy', 'malt', 'شعير']],
            ['water', ['water', 'blossom', 'rose water', 'ماء']],
        ],
        'groceries' => [
            ['pasta', ['pasta', 'spaghetti', 'lasagna', 'penne', 'ziti', 'macaroni', 'مكرونة']],
            ['canned-jarred', ['tuna', 'sardine', 'grape leaves', 'vine leaves', 'fava', 'chickpea', 'pickle', 'jam', 'olive', 'herring', 'mackerel']],
            ['cooking-essentials', ['tahina', 'tahini', 'honey', 'tomato paste', 'ketchup', 'mayonnaise']],
            ['dry-goods', []], // fallback (covers dairy/cheese too — no dedicated subcategory exists yet)
        ],
        'spices-sauces' => [
            ['tahini', ['tahina', 'tahini', 'طحينة']],
            ['spices', ['spice', 'cumin', 'paprika', 'cinnamon', 'ginger', 'garlic powder', 'onion powder', 'بهارات', 'كمون']],
            ['herbs', ['thyme', 'oregano', 'rosemary', 'bay leaf', 'زعتر']],
            ['condiments', ['vinegar', 'starch', 'baking', 'custard', 'vanilla', 'gelatin', 'salt']],
            ['spices', []], // fallback
        ],
        'frozen' => [
            ['frozen-dough', ['fillo', 'kataifi', 'konafah', 'phyllo', 'dough']],
            ['frozen-meals', ['falafel', 'samosa', 'kofta', 'taameya']],
            ['frozen-vegetables', ['molokhia', 'okra', 'taro', 'peas', 'beans', 'carrot', 'vegetable']],
            ['frozen-vegetables', []], // fallback
        ],
    ];

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $moved = 0;
        $categoriesToDelete = [];

        DB::beginTransaction();

        try {
            foreach ($this->targetCategory as $oldSlug => $newSlug) {
                $oldCategory = Category::where('slug', $oldSlug)->first();
                if (!$oldCategory) {
                    $this->line("  (skip) category '{$oldSlug}' not found — already remapped?");
                    continue;
                }

                $newCategory = Category::where('slug', $newSlug)->first();
                if (!$newCategory) {
                    $this->error("Target category '{$newSlug}' not found — is the site's original seed data present?");
                    DB::rollBack();
                    return self::FAILURE;
                }

                $rules = $this->subcategoryRules[$newSlug] ?? [];
                $products = Product::where('category_id', $oldCategory->id)->get();

                $this->info("{$oldSlug} -> {$newSlug} ({$products->count()} products)");

                foreach ($products as $product) {
                    $haystack = strtolower($product->name . ' ' . $product->description . ' ' . $product->brand);
                    $subcategoryId = null;
                    $matchedSubSlug = null;

                    foreach ($rules as [$subSlug, $keywords]) {
                        $isMatch = empty($keywords);
                        foreach ($keywords as $kw) {
                            if (str_contains($haystack, strtolower($kw))) {
                                $isMatch = true;
                                break;
                            }
                        }
                        if ($isMatch) {
                            $sub = Subcategory::where('category_id', $newCategory->id)->where('slug', $subSlug)->first();
                            $subcategoryId = $sub?->id;
                            $matchedSubSlug = $subSlug;
                            break;
                        }
                    }

                    $this->line("  [{$product->sku}] {$product->name} -> {$newSlug}" . ($matchedSubSlug ? " / {$matchedSubSlug}" : ''));

                    if (!$dryRun) {
                        $product->update([
                            'category_id' => $newCategory->id,
                            'subcategory_id' => $subcategoryId,
                        ]);
                    }
                    $moved++;
                }

                $categoriesToDelete[] = $oldCategory;
            }

            if (!$dryRun) {
                foreach ($categoriesToDelete as $cat) {
                    $remaining = Product::where('category_id', $cat->id)->count();
                    if ($remaining === 0) {
                        $cat->delete();
                        $this->info("Deleted now-empty category: {$cat->slug}");
                    } else {
                        $this->warn("Category {$cat->slug} still has {$remaining} products, not deleting.");
                    }
                }
            }

            if ($dryRun) {
                DB::rollBack();
                $this->warn('Dry run — nothing was written.');
            } else {
                DB::commit();
            }
        } catch (\Throwable $e) {
            DB::rollBack();
            $this->error('Remap failed, rolled back: ' . $e->getMessage());
            return self::FAILURE;
        }

        $this->newLine();
        $this->info("Done. Products remapped: {$moved}");

        return self::SUCCESS;
    }
}
