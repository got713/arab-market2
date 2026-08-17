<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Subcategory;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class CategoryController extends Controller
{
    // ── PUBLIC ENDPOINTS ─────────────────────────────────────────────

    public function index(Request $request)
    {
        $includeInactive = $request->has('all') && $request->user()?->isAdmin();
        
        $query = Category::with(['subcategories' => function ($q) use ($includeInactive) {
            if (!$includeInactive) {
                $q->where('active', true);
            }
            $q->orderBy('display_order', 'asc');
        }]);

        if (!$includeInactive) {
            $query->where('active', true);
        }

        $categories = $query->orderBy('display_order', 'asc')->get();
        return response()->json($categories);
    }

    public function show($slug)
    {
        $category = Category::with(['subcategories' => function ($q) {
            $q->where('active', true)->orderBy('display_order', 'asc');
        }])->where('slug', $slug)->firstOrFail();

        return response()->json($category);
    }

    // ── ADMIN CATEGORY CRUD ──────────────────────────────────────────

    public function storeCategory(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'arabic_name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:categories,slug',
            'description' => 'nullable|string',
            'arabic_description' => 'nullable|string',
            'image' => 'nullable|string|url',
            'icon' => 'nullable|string|max:50',
            'active' => 'nullable|boolean',
            'featured' => 'nullable|boolean',
            'display_order' => 'nullable|integer',
        ]);

        $slug = $request->slug ?: str($request->name)->slug();

        // Check unique slug manually since it was generated
        if (Category::where('slug', $slug)->exists()) {
            return response()->json([
                'message' => 'The slug has already been taken.'
            ], 422);
        }

        $category = Category::create([
            'name' => $request->name,
            'arabic_name' => $request->arabic_name,
            'slug' => $slug,
            'description' => $request->description,
            'arabic_description' => $request->arabic_description,
            'image' => $request->image,
            'icon' => $request->icon ?: 'ShoppingBag',
            'active' => $request->active ?? true,
            'featured' => $request->featured ?? false,
            'display_order' => $request->display_order ?? 0,
        ]);

        return response()->json($category, 201);
    }

    public function updateCategory(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'arabic_name' => 'required|string|max:255',
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('categories', 'slug')->ignore($category->id)],
            'description' => 'nullable|string',
            'arabic_description' => 'nullable|string',
            'image' => 'nullable|string|url',
            'icon' => 'nullable|string|max:50',
            'active' => 'nullable|boolean',
            'featured' => 'nullable|boolean',
            'display_order' => 'nullable|integer',
        ]);

        $slug = $request->slug ?: str($request->name)->slug();

        if (Category::where('slug', $slug)->where('id', '!=', $category->id)->exists()) {
            return response()->json([
                'message' => 'The slug has already been taken.'
            ], 422);
        }

        $category->update([
            'name' => $request->name,
            'arabic_name' => $request->arabic_name,
            'slug' => $slug,
            'description' => $request->description,
            'arabic_description' => $request->arabic_description,
            'image' => $request->image,
            'icon' => $request->icon,
            'active' => $request->active ?? $category->active,
            'featured' => $request->featured ?? $category->featured,
            'display_order' => $request->display_order ?? $category->display_order,
        ]);

        return response()->json($category);
    }

    // Uploads a real photo from the admin's device for a category (or
    // subcategory, via the optional ?subcategory=<slug> query param) and
    // stores it as that record's `image`, replacing whatever URL was there
    // before — same validation/storage approach as ProductImageController,
    // so a client-supplied filename never reaches the filesystem.
    public function uploadImage(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $request->validate([
            'image' => [
                'required',
                'file',
                'mimes:jpg,jpeg,png,webp',
                'max:5120', // 5MB, in kilobytes
                'dimensions:min_width=100,min_height=100,max_width=6000,max_height=6000',
            ],
            'subcategory' => 'nullable|string',
        ]);

        $file = $request->file('image');
        $filename = (string) Str::uuid() . '.' . strtolower($file->getClientOriginalExtension());
        $disk = config('filesystems.product_media_disk');
        $path = $file->storeAs('categories/' . $category->id, $filename, $disk);
        $url = Storage::disk($disk)->url($path);

        if ($request->filled('subcategory')) {
            $subcategory = $category->subcategories()->where('slug', $request->subcategory)->firstOrFail();
            $subcategory->update(['image' => $url]);

            return response()->json($subcategory);
        }

        $category->update(['image' => $url]);

        return response()->json($category);
    }

    public function destroyCategory($id)
    {
        $category = Category::findOrFail($id);

        // Check if category contains products
        if ($category->products()->exists()) {
            return response()->json([
                'message' => 'Cannot delete category because it contains products. Reassign or delete products first.'
            ], 400);
        }

        $category->delete();

        return response()->json([
            'message' => 'Category deleted successfully'
        ]);
    }

    // ── ADMIN SUBCATEGORY CRUD ───────────────────────────────────────

    public function storeSubcategory(Request $request, $categoryId)
    {
        $category = Category::findOrFail($categoryId);

        $request->validate([
            'name' => 'required|string|max:255',
            'arabic_name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string|url',
            'active' => 'nullable|boolean',
            'display_order' => 'nullable|integer',
        ]);

        $slug = $request->slug ?: str($request->name)->slug();

        // Check unique slug within the category
        if ($category->subcategories()->where('slug', $slug)->exists()) {
            return response()->json([
                'message' => 'A subcategory with this slug already exists in this category.'
            ], 422);
        }

        $subcategory = $category->subcategories()->create([
            'name' => $request->name,
            'arabic_name' => $request->arabic_name,
            'slug' => $slug,
            'description' => $request->description,
            'image' => $request->image,
            'active' => $request->active ?? true,
            'display_order' => $request->display_order ?? 0,
        ]);

        return response()->json($subcategory, 201);
    }

    public function updateSubcategory(Request $request, $categoryId, $slug)
    {
        $category = Category::findOrFail($categoryId);
        $subcategory = $category->subcategories()->where('slug', $slug)->firstOrFail();

        $request->validate([
            'name' => 'required|string|max:255',
            'arabic_name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'image' => 'nullable|string|url',
            'active' => 'nullable|boolean',
            'display_order' => 'nullable|integer',
        ]);

        $newSlug = $request->slug ?: str($request->name)->slug();

        // Check unique slug within category (excluding itself)
        if ($category->subcategories()->where('slug', $newSlug)->where('id', '!=', $subcategory->id)->exists()) {
            return response()->json([
                'message' => 'A subcategory with this slug already exists in this category.'
            ], 422);
        }

        $subcategory->update([
            'name' => $request->name,
            'arabic_name' => $request->arabic_name,
            'slug' => $newSlug,
            'description' => $request->description,
            'image' => $request->image,
            'active' => $request->active ?? $subcategory->active,
            'display_order' => $request->display_order ?? $subcategory->display_order,
        ]);

        return response()->json($subcategory);
    }

    public function destroySubcategory($categoryId, $slug)
    {
        $category = Category::findOrFail($categoryId);
        $subcategory = $category->subcategories()->where('slug', $slug)->firstOrFail();

        // Check if contains products
        if ($subcategory->products()->exists()) {
            return response()->json([
                'message' => 'Cannot delete subcategory because it contains products.'
            ], 400);
        }

        $subcategory->delete();

        return response()->json([
            'message' => 'Subcategory deleted successfully'
        ]);
    }
}
