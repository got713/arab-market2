<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\Inventory;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    // ── PUBLIC CATALOG ENDPOINTS ─────────────────────────────────────

    public function index(Request $request)
    {
        $includeInactive = $request->has('all') && $request->user()?->isAdmin();
        
        $query = Product::with(['images', 'inventory', 'category', 'subcategory']);

        if (!$includeInactive) {
            $query->where('active', true);
        }

        // Search query
        if ($request->filled('search')) {
            $search = '%' . $request->search . '%';
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', $search)
                  ->orWhere('arabic_name', 'like', $search)
                  ->orWhere('brand', 'like', $search)
                  ->orWhere('description', 'like', $search)
                  ->orWhere('sku', 'like', $search);
            });
        }

        // Category filter (slug or id)
        if ($request->filled('category')) {
            $cat = Category::where('slug', $request->category)->first();
            if ($cat) {
                $query->where('category_id', $cat->id);
            } else {
                $query->where('category_id', $request->category);
            }
        }

        // Subcategory filter (slug)
        if ($request->filled('subcategory')) {
            $query->whereHas('subcategory', function ($q) use ($request) {
                $q->where('slug', $request->subcategory);
            });
        }

        // Specials filter
        if ($request->filled('filter')) {
            if ($request->filter === 'deals') {
                $query->where(function ($q) {
                    $q->where('weekly_deal', true)->orWhere('featured', true);
                });
            } elseif ($request->filter === 'bestseller') {
                $query->where('best_seller', true);
            } elseif ($request->filter === 'featured') {
                $query->where('featured', true);
            }
        }

        if ($request->filled('tag')) {
            $tag = '%' . $request->tag . '%';
            $query->where(function ($q) use ($tag) {
                $q->where('name', 'like', $tag)->orWhere('brand', 'like', $tag);
            });
        }

        // Price filter
        if ($request->filled('price_range')) {
            $range = $request->price_range;
            if ($range === 'under-5') {
                $query->where('price', '<', 5.00);
            } elseif ($range === '5-to-15') {
                $query->whereBetween('price', [5.00, 15.00]);
            } elseif ($range === 'over-15') {
                $query->where('price', '>', 15.00);
            }
        }

        // Sorting
        $sortBy = $request->get('sort', 'relevance');
        if ($sortBy === 'price_asc') {
            $query->orderBy('price', 'asc');
        } elseif ($sortBy === 'price_desc') {
            $query->orderBy('price', 'desc');
        } elseif ($sortBy === 'rating') {
            $query->orderBy('rating', 'desc');
        } elseif ($sortBy === 'newest') {
            $query->orderBy('id', 'desc');
        } else {
            // Default sorting: featured items first, then best sellers
            $query->orderBy('featured', 'desc')->orderBy('best_seller', 'desc');
        }

        // Pagination
        $perPage = $request->get('per_page', 12);
        $products = $query->paginate($perPage);

        // Map product model to look like Next.js frontend model
        $products->getCollection()->transform(function ($prod) {
            return $this->formatProductPayload($prod);
        });

        return response()->json($products);
    }

    public function show($id)
    {
        $product = Product::with(['images', 'inventory', 'category', 'subcategory', 'reviews'])
            ->where('id', $id)
            ->orWhere('slug', $id)
            ->firstOrFail();

        return response()->json($this->formatProductPayload($product));
    }

    // ── ADMIN PRODUCT CRUD ───────────────────────────────────────────

    public function store(Request $request)
    {
        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'subcategory_id' => 'nullable|exists:subcategories,id',
            'name' => 'required|string|max:255',
            'arabic_name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:products,slug',
            'brand' => 'required|string|max:255',
            'sku' => 'nullable|string|max:255|unique:products,sku',
            'description' => 'required|string',
            'arabic_description' => 'required|string',
            'weight' => 'required|string|max:50',
            'ingredients' => 'nullable|string',
            'allergens' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'pack_price' => 'nullable|numeric|min:0',
            'pack_quantity' => 'nullable|integer|min:1',
            'case_price' => 'nullable|numeric|min:0',
            'case_quantity' => 'nullable|integer|min:1',
            'featured' => 'nullable|boolean',
            'best_seller' => 'nullable|boolean',
            'weekly_deal' => 'nullable|boolean',
            'active' => 'nullable|boolean',
            'stock' => 'required|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'images' => 'required|array|min:1',
            'images.*' => 'required|string|url',
        ]);

        $slug = $request->slug ?: str($request->name)->slug();

        if (Product::where('slug', $slug)->exists()) {
            return response()->json(['message' => 'Product slug already exists.'], 422);
        }

        $product = Product::create([
            'category_id' => $request->category_id,
            'subcategory_id' => $request->subcategory_id,
            'name' => $request->name,
            'arabic_name' => $request->arabic_name,
            'slug' => $slug,
            'brand' => $request->brand,
            'sku' => $request->sku,
            'description' => $request->description,
            'arabic_description' => $request->arabic_description,
            'weight' => $request->weight,
            'ingredients' => $request->ingredients,
            'allergens' => $request->allergens,
            'price' => $request->price,
            'pack_price' => $request->pack_price,
            'pack_quantity' => $request->pack_quantity ?? 6,
            'case_price' => $request->case_price,
            'case_quantity' => $request->case_quantity ?? 12,
            'featured' => $request->featured ?? false,
            'best_seller' => $request->best_seller ?? false,
            'weekly_deal' => $request->weekly_deal ?? false,
            'active' => $request->active ?? true,
            'rating' => 4.5,
        ]);

        // Create main image and extra images
        foreach ($request->images as $index => $url) {
            ProductImage::create([
                'product_id' => $product->id,
                'url' => $url,
                'is_main' => $index === 0,
            ]);
        }

        // Initialize inventory
        Inventory::create([
            'product_id' => $product->id,
            'stock_quantity' => $request->stock,
            'low_stock_threshold' => $request->low_stock_threshold ?? 10,
        ]);

        return response()->json($this->formatProductPayload($product->load(['images', 'inventory'])), 201);
    }

    public function update(Request $request, $id)
    {
        $product = Product::findOrFail($id);

        $request->validate([
            'category_id' => 'required|exists:categories,id',
            'subcategory_id' => 'nullable|exists:subcategories,id',
            'name' => 'required|string|max:255',
            'arabic_name' => 'required|string|max:255',
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('products', 'slug')->ignore($product->id)],
            'brand' => 'required|string|max:255',
            'sku' => ['nullable', 'string', 'max:255', Rule::unique('products', 'sku')->ignore($product->id)],
            'description' => 'required|string',
            'arabic_description' => 'required|string',
            'weight' => 'required|string|max:50',
            'ingredients' => 'nullable|string',
            'allergens' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'pack_price' => 'nullable|numeric|min:0',
            'pack_quantity' => 'nullable|integer|min:1',
            'case_price' => 'nullable|numeric|min:0',
            'case_quantity' => 'nullable|integer|min:1',
            'featured' => 'nullable|boolean',
            'best_seller' => 'nullable|boolean',
            'weekly_deal' => 'nullable|boolean',
            'active' => 'nullable|boolean',
            'stock' => 'required|integer|min:0',
            'low_stock_threshold' => 'nullable|integer|min:0',
            'images' => 'required|array|min:1',
            'images.*' => 'required|string|url',
        ]);

        $slug = $request->slug ?: str($request->name)->slug();

        if (Product::where('slug', $slug)->where('id', '!=', $product->id)->exists()) {
            return response()->json(['message' => 'Product slug already exists.'], 422);
        }

        $product->update([
            'category_id' => $request->category_id,
            'subcategory_id' => $request->subcategory_id,
            'name' => $request->name,
            'arabic_name' => $request->arabic_name,
            'slug' => $slug,
            'brand' => $request->brand,
            'sku' => $request->sku,
            'description' => $request->description,
            'arabic_description' => $request->arabic_description,
            'weight' => $request->weight,
            'ingredients' => $request->ingredients,
            'allergens' => $request->allergens,
            'price' => $request->price,
            'pack_price' => $request->pack_price,
            'pack_quantity' => $request->pack_quantity ?? 6,
            'case_price' => $request->case_price,
            'case_quantity' => $request->case_quantity ?? 12,
            'featured' => $request->featured ?? false,
            'best_seller' => $request->best_seller ?? false,
            'weekly_deal' => $request->weekly_deal ?? false,
            'active' => $request->active ?? $product->active,
        ]);

        // Sync images: Delete old ones and write new ones
        $product->images()->delete();
        foreach ($request->images as $index => $url) {
            ProductImage::create([
                'product_id' => $product->id,
                'url' => $url,
                'is_main' => $index === 0,
            ]);
        }

        // Update inventory
        $inventory = Inventory::firstOrCreate(
            ['product_id' => $product->id],
            ['low_stock_threshold' => 10]
        );
        $inventory->update([
            'stock_quantity' => $request->stock,
            'low_stock_threshold' => $request->low_stock_threshold ?? 10,
        ]);

        return response()->json($this->formatProductPayload($product->load(['images', 'inventory'])));
    }

    public function destroy($id)
    {
        $product = Product::findOrFail($id);
        $product->images()->delete();
        $product->inventory()->delete();
        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully'
        ]);
    }

    // ── HELPERS ──────────────────────────────────────────────────────

    private function formatProductPayload($prod)
    {
        $mainImage = $prod->images->where('is_main', true)->first();
        $imageUrls = $prod->images->sortByDesc('is_main')->pluck('url')->toArray();
        if (empty($imageUrls)) {
            $imageUrls = ['https://placehold.co/400x400/FDF8F0/6B6355?text=No+Image'];
        }

        $stock = $prod->inventory ? $prod->inventory->stock_quantity : 0;
        $lowThreshold = $prod->inventory ? $prod->inventory->low_stock_threshold : 10;

        return [
            'id' => (string) $prod->id,
            'name' => $prod->name,
            'slug' => $prod->slug,
            'arabicName' => $prod->arabic_name,
            'brand' => $prod->brand,
            'category' => $prod->category ? $prod->category->slug : '',
            'categoryId' => (string) $prod->category_id,
            'subcategoryId' => $prod->subcategory_id ? (string) $prod->subcategory_id : null,
            'country' => $prod->country,
            'origin' => $prod->country,
            'description' => $prod->description,
            'arabicDescription' => $prod->arabic_description,
            'images' => $imageUrls,
            'rating' => (float) $prod->rating,
            'weight' => $prod->weight,
            'ingredients' => $prod->ingredients ?? '',
            'allergens' => $prod->allergens ?? '',
            'stock' => $stock,
            'inventory' => $stock,
            'low_stock_threshold' => $lowThreshold,
            'featured' => (bool) $prod->featured,
            'bestSeller' => (bool) $prod->best_seller,
            'weeklyDeal' => (bool) $prod->weekly_deal,
            'active' => (bool) $prod->active,
            'sku' => $prod->sku,
            'reviews' => $prod->reviews ? $prod->reviews->map(function ($r) {
                return [
                    'author' => $r->author_name,
                    'rating' => $r->rating,
                    'comment' => $r->comment,
                    'date' => $r->created_at->format('Y-m-d'),
                ];
            }) : [],
            'purchaseOptions' => [
                'single' => [
                    'price' => (float) $prod->price,
                    'quantity' => 1,
                    'enabled' => true,
                    'label' => 'Each',
                    'labelAr' => 'حبة'
                ],
                'pack' => [
                    'price' => $prod->pack_price ? (float) $prod->pack_price : (float) ($prod->price * $prod->pack_quantity * 0.90),
                    'quantity' => $prod->pack_quantity ?? 6,
                    'enabled' => (bool) $prod->pack_price,
                    'label' => 'Pack',
                    'labelAr' => 'ربطة'
                ],
                'case' => [
                    'price' => $prod->case_price ? (float) $prod->case_price : (float) ($prod->price * $prod->case_quantity * 0.85),
                    'quantity' => $prod->case_quantity ?? 12,
                    'enabled' => (bool) $prod->case_price,
                    'label' => 'Case',
                    'labelAr' => 'كرتون'
                ],
            ]
        ];
    }
}
