<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProductImageController extends Controller
{
    // All routes here sit behind auth:sanctum + can:admin-access (see
    // routes/api.php) — customers can never reach any of these.
    //
    // SECURITY: never trust the client for the stored filename or path.
    // - MIME/extension are validated by Laravel's `mimes` rule, which sniffs
    //   real file content (fileinfo), not the client-supplied Content-Type —
    //   this alone rejects PHP/executable/SVG/arbitrary files, since none of
    //   them can pass as jpg/jpeg/png/webp.
    // - The stored filename is always a server-generated UUID, never the
    //   client's original filename — that closes path traversal entirely,
    //   since nothing user-supplied ever reaches the filesystem path.
    // - The API response only ever returns a public URL (Storage::url), never
    //   an absolute server filesystem path.

    private function disk()
    {
        return Storage::disk(config('filesystems.product_media_disk'));
    }

    public function store(Request $request, Product $product)
    {
        $request->validate([
            'images' => 'required|array|min:1|max:10',
            'images.*' => [
                'required',
                'file',
                'mimes:jpg,jpeg,png,webp',
                'max:5120', // 5MB, in kilobytes
                'dimensions:min_width=100,min_height=100,max_width=6000,max_height=6000',
            ],
        ]);

        $hasExistingMain = $product->images()->where('is_main', true)->exists();
        $nextSortOrder = (int) ($product->images()->max('sort_order') ?? -1) + 1;

        $created = [];
        foreach ($request->file('images') as $index => $file) {
            $filename = (string) Str::uuid() . '.' . strtolower($file->getClientOriginalExtension());
            $path = $file->storeAs("products/{$product->id}", $filename, config('filesystems.product_media_disk'));

            $image = ProductImage::create([
                'product_id' => $product->id,
                'url' => $this->disk()->url($path),
                'path' => $path,
                'original_name' => Str::limit($file->getClientOriginalName(), 250, ''),
                'sort_order' => $nextSortOrder + $index,
                // First image ever uploaded for a product becomes primary
                // automatically; otherwise stays a gallery image until the
                // admin explicitly sets a new primary.
                'is_main' => !$hasExistingMain && $index === 0,
            ]);
            $created[] = $image;
        }

        return response()->json([
            'images' => $product->images()->orderBy('sort_order')->get(),
        ], 201);
    }

    public function setPrimary(Request $request, Product $product, ProductImage $image)
    {
        if ($image->product_id !== $product->id) {
            abort(404);
        }

        $product->images()->update(['is_main' => false]);
        $image->update(['is_main' => true]);

        return response()->json(['images' => $product->images()->orderBy('sort_order')->get()]);
    }

    public function reorder(Request $request, Product $product)
    {
        $request->validate([
            'image_ids' => 'required|array',
            'image_ids.*' => 'required|integer|exists:product_images,id',
        ]);

        // Only ever reorders images that actually belong to this product —
        // an id for someone else's image in the payload is silently ignored,
        // never acted on.
        $ownedIds = $product->images()->pluck('id')->all();

        foreach (array_values($request->image_ids) as $position => $imageId) {
            if (in_array((int) $imageId, $ownedIds, true)) {
                ProductImage::where('id', $imageId)->update(['sort_order' => $position]);
            }
        }

        return response()->json(['images' => $product->images()->orderBy('sort_order')->get()]);
    }

    public function destroy(Product $product, ProductImage $image)
    {
        if ($image->product_id !== $product->id) {
            abort(404);
        }

        $wasMain = $image->is_main;

        // Remove the physical file only if this row actually owns one —
        // legacy/external `url` rows (no `path`) have nothing local to clean
        // up, and nothing else in this schema currently reuses an uploaded
        // file across products, so it's always safe to delete here.
        if ($image->path) {
            $this->disk()->delete($image->path);
        }

        $image->delete();

        // If the primary image was removed, promote the next one in gallery
        // order so the product never ends up with zero primary images while
        // other images still exist.
        if ($wasMain) {
            $next = $product->images()->orderBy('sort_order')->first();
            $next?->update(['is_main' => true]);
        }

        return response()->json(['images' => $product->images()->orderBy('sort_order')->get()]);
    }
}
