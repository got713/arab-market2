<?php

namespace App\Console\Commands;

use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Subcategory;
use Illuminate\Console\Command;

/**
 * Replaces the text-only placehold.co placeholder images (created by
 * catalog:import) with real, free-to-use stock photography from Unsplash —
 * one representative photo per subcategory (e.g. all "chocolate" products
 * share one chocolate-bar photo, all "tea" products share one tea photo).
 *
 * These are GENERIC photos representing the product TYPE, not the specific
 * brand/packaging — the store owner does not have real product photography
 * yet, and reproducing copyrighted brand packaging photos isn't something
 * this command does. Real per-product photos can still be uploaded any time
 * from Admin > Products, which will simply replace what this command sets.
 *
 * Only touches products whose current main image is still a placehold.co
 * URL, so it never overwrites a real photo an admin has already uploaded.
 *
 * Usage: php artisan catalog:apply-stock-images {--dry-run}
 */
class ApplyStockCategoryImages extends Command
{
    protected $signature = 'catalog:apply-stock-images {--dry-run : Preview without writing to the database}';

    protected $description = 'Replace placehold.co placeholders with real stock photos, one per subcategory';

    // Unsplash photo hashes (verified working), reused across the site's own
    // ?q=80&w=600&auto=format&fit=crop convention already used for the demo catalog.
    private array $subcategoryPhoto = [
        'chocolate' => '1625414502495-0c35143e32d3',
        'biscuits' => '1775210291462-af8fd54da403',
        'baklava' => '1509440159596-0249088772ff',
        'dates' => '1509440159596-0249088772ff',
        'snacks' => '1775210291462-af8fd54da403',
        'coffee' => '1447933601403-0c6688de566e',
        'tea' => '1576092768241-dec231879fc3',
        'juices' => '1600271886742-f049cd451bba',
        'soft-drinks' => '1600271886742-f049cd451bba',
        'water' => '1561041695-d2fadf9f318c',
        'pasta' => '1497802492746-aa584aa6ea22',
        'canned-jarred' => '1546833999-b9f581a1996d',
        'cooking-essentials' => '1590080875515-8a3a8dc5735e',
        'dry-goods' => '1586201375761-83865001e31c',
        'tahini' => '1590080875515-8a3a8dc5735e',
        'spices' => '1574484152510-903878da786c',
        'herbs' => '1574484152510-903878da786c',
        'condiments' => '1474979266404-7eaacbcd87c5',
        'frozen-vegetables' => '1576045057995-568f588f82fb',
        'frozen-dough' => '1558458601-0d69a278b8e6',
        'frozen-meals' => '1572098873382-f8e4bf925781',
    ];

    // Fallback per parent category, used when a product has no subcategory.
    private array $categoryFallbackPhoto = [
        'sweets-snacks' => '1625414502495-0c35143e32d3',
        'drinks' => '1447933601403-0c6688de566e',
        'groceries' => '1586201375761-83865001e31c',
        'spices-sauces' => '1574484152510-903878da786c',
        'frozen' => '1576045057995-568f588f82fb',
    ];

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $updated = 0;
        $skipped = 0;

        $products = Product::with(['images', 'subcategory', 'category'])->get();

        foreach ($products as $product) {
            $mainImage = $product->images->firstWhere('is_main', true) ?? $product->images->first();

            if (!$mainImage || !str_contains($mainImage->url, 'placehold.co')) {
                // No image, or already a real photo (either uploaded by an
                // admin or already a stock photo from a previous run) — leave it alone.
                $skipped++;
                continue;
            }

            $hash = $product->subcategory
                ? ($this->subcategoryPhoto[$product->subcategory->slug] ?? null)
                : null;
            $hash ??= $this->categoryFallbackPhoto[$product->category?->slug] ?? null;

            if (!$hash) {
                $this->warn("  no stock photo mapped for [{$product->sku}] {$product->name} (category: {$product->category?->slug}, subcategory: {$product->subcategory?->slug})");
                $skipped++;
                continue;
            }

            $url = "https://images.unsplash.com/photo-{$hash}?q=80&w=600&auto=format&fit=crop";
            $this->line("  [{$product->sku}] {$product->name} -> {$url}");

            if (!$dryRun) {
                $mainImage->update(['url' => $url]);
            }
            $updated++;
        }

        $this->newLine();
        $label = $dryRun ? '[DRY RUN] Would update' : 'Updated';
        $this->info("{$label}: {$updated}   Skipped (already has a real/uploaded photo): {$skipped}");

        return self::SUCCESS;
    }
}
