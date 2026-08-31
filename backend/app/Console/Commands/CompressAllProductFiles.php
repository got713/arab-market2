<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

/**
 * One-off / repeatable cleanup command that compresses every image file
 * physically stored under storage/app/public/products, WITHOUT relying on
 * the database at all.
 *
 * Why this exists (and why it's different from catalog:compress-images):
 * catalog:compress-images loops over ProductImage rows and uses the
 * `path` column to find each file. That works for images uploaded through
 * the normal admin upload form, but images inserted by bulk-import scripts
 * (e.g. ImportElPrinceCatalog) only populated the `url` column and left
 * `path` NULL — so those files were invisible to that command. There are
 * also orphan files on disk with no matching database row at all (leftovers
 * from earlier uploads/re-imports). This command scans the actual folder on
 * disk, so it catches all of the above regardless of what the database says.
 *
 * Usage:
 *   php artisan catalog:compress-all-files {--dry-run} {--max-width=1200} {--quality=80} {--skip-under=400}
 */
class CompressAllProductFiles extends Command
{
    protected $signature = 'catalog:compress-all-files
        {--dry-run : Show what would happen without changing any file}
        {--max-width=1200 : Max width in pixels to resize down to}
        {--quality=80 : JPEG/WEBP quality (1-100)}
        {--skip-under=400 : Skip files already smaller than this many KB}';

    protected $description = 'Compress every image file under storage/app/public/products directly on disk, regardless of database state.';

    public function handle(): int
    {
        $dryRun = (bool) $this->option('dry-run');
        $maxWidth = (int) $this->option('max-width');
        $quality = (int) $this->option('quality');
        $skipUnderKb = (float) $this->option('skip-under');

        $disk = Storage::disk('public');
        $root = 'products';

        if (!$disk->exists($root)) {
            $this->error("Folder not found: storage/app/public/{$root}");
            return self::FAILURE;
        }

        $files = $disk->allFiles($root);
        $imageFiles = array_filter($files, function ($f) {
            return preg_match('/\.(jpe?g|png|webp)$/i', $f) === 1;
        });

        $this->info(($dryRun ? '[DRY RUN] ' : '') . 'Found ' . count($imageFiles) . ' image files on disk under storage/app/public/' . $root . '.');

        $processed = 0;
        $skippedSmall = 0;
        $failed = 0;
        $totalBefore = 0;
        $totalAfter = 0;

        foreach ($imageFiles as $relativePath) {
            $fullPath = $disk->path($relativePath);

            if (!is_file($fullPath)) {
                continue;
            }

            $beforeSize = filesize($fullPath);
            $beforeKb = $beforeSize / 1024;

            if ($beforeKb < $skipUnderKb) {
                $skippedSmall++;
                continue;
            }

            $ext = strtolower(pathinfo($fullPath, PATHINFO_EXTENSION));

            try {
                $image = match ($ext) {
                    'jpg', 'jpeg' => @imagecreatefromjpeg($fullPath),
                    'png' => @imagecreatefrompng($fullPath),
                    'webp' => @imagecreatefromwebp($fullPath),
                    default => null,
                };

                if (!$image) {
                    $this->warn("  {$relativePath}: could not read image data, skipping.");
                    $failed++;
                    continue;
                }

                $width = imagesx($image);
                $height = imagesy($image);

                if ($width > $maxWidth) {
                    $newHeight = (int) round($height * ($maxWidth / $width));
                    $resized = imagescale($image, $maxWidth, $newHeight);
                    if ($resized !== false) {
                        imagedestroy($image);
                        $image = $resized;
                    }
                }

                $tmpPath = $fullPath . '.tmp';

                $ok = match ($ext) {
                    'jpg', 'jpeg' => imagejpeg($image, $tmpPath, $quality),
                    'png' => imagepng($image, $tmpPath, (int) round($quality / 100 * 9)),
                    'webp' => imagewebp($image, $tmpPath, $quality),
                    default => false,
                };

                imagedestroy($image);

                if (!$ok || !is_file($tmpPath)) {
                    $this->warn("  {$relativePath}: failed to write compressed version, skipping.");
                    @unlink($tmpPath);
                    $failed++;
                    continue;
                }

                $afterSize = filesize($tmpPath);

                if ($afterSize >= $beforeSize) {
                    // Compression didn't actually help (rare, e.g. already-optimized file) — keep original.
                    @unlink($tmpPath);
                    $skippedSmall++;
                    continue;
                }

                $this->line(sprintf(
                    '  %s: %s -> %s (-%d%%)',
                    $relativePath,
                    $this->formatBytes($beforeSize),
                    $this->formatBytes($afterSize),
                    round((1 - $afterSize / $beforeSize) * 100)
                ));

                $totalBefore += $beforeSize;
                $totalAfter += $afterSize;
                $processed++;

                if ($dryRun) {
                    @unlink($tmpPath);
                } else {
                    rename($tmpPath, $fullPath);
                }
            } catch (\Throwable $e) {
                $this->warn("  {$relativePath}: error - {$e->getMessage()}");
                $failed++;
            }
        }

        $this->newLine();
        $this->info($dryRun ? 'Dry run done.' : 'Done.');
        $this->line("Processed: {$processed}");
        $this->line("Skipped (already small or no gain): {$skippedSmall}");
        $this->line("Failed: {$failed}");

        if ($processed > 0) {
            $this->line(sprintf(
                'Total size: %s -> %s (saved %s, %d%%)',
                $this->formatBytes($totalBefore),
                $this->formatBytes($totalAfter),
                $this->formatBytes($totalBefore - $totalAfter),
                $totalBefore > 0 ? round((1 - $totalAfter / $totalBefore) * 100) : 0
            ));
        }

        if ($dryRun) {
            $this->comment('This was a dry run — nothing was written. Re-run without --dry-run to actually compress.');
        }

        return self::SUCCESS;
    }

    private function formatBytes(int $bytes): string
    {
        if ($bytes >= 1024 * 1024) {
            return round($bytes / 1024 / 1024, 2) . ' MB';
        }
        return round($bytes / 1024, 1) . ' KB';
    }
}
