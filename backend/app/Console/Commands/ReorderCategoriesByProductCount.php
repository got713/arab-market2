<?php

namespace App\Console\Commands;

use App\Models\Category;
use Illuminate\Console\Command;

/**
 * Sets display_order on every category (and every subcategory within it) so
 * the ones with the most products show first on the storefront and in
 * Admin > Categories — instead of the current state where every row is 0
 * (meaning "no order set", so they just fall back to insertion order).
 *
 * Ties are broken alphabetically by English name so the order is stable and
 * predictable on repeat runs.
 *
 * Usage: php artisan catalog:reorder-categories {--dry-run}
 */
class ReorderCategoriesByProductCount extends Command
{
    protected $signature = 'catalog:reorder-categories {--dry-run : Preview without writing to the database}';

    protected $description = 'Set category/subcategory display_order by product count, most products first';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');

        $categories = Category::withCount('products')
            ->with(['subcategories' => function ($q) {
                $q->withCount('products');
            }])
            ->get()
            ->sortByDesc(fn ($cat) => $cat->products_count)
            ->values();

        // Stable secondary sort: same product count -> alphabetical by name.
        $categories = $categories->sort(function ($a, $b) {
            return $b->products_count <=> $a->products_count
                ?: strcmp($a->name, $b->name);
        })->values();

        foreach ($categories as $index => $category) {
            $this->line("  [{$category->products_count} products] {$category->name} -> order {$index}");
            if (!$dryRun) {
                $category->update(['display_order' => $index]);
            }

            $subs = $category->subcategories->sort(function ($a, $b) {
                return $b->products_count <=> $a->products_count
                    ?: strcmp($a->name, $b->name);
            })->values();

            foreach ($subs as $subIndex => $sub) {
                $this->line("      [{$sub->products_count} products] {$sub->name} -> order {$subIndex}");
                if (!$dryRun) {
                    $sub->update(['display_order' => $subIndex]);
                }
            }
        }

        $this->newLine();
        $label = $dryRun ? '[DRY RUN] Would reorder' : 'Reordered';
        $this->info("{$label}: {$categories->count()} categories and their subcategories.");

        return self::SUCCESS;
    }
}
