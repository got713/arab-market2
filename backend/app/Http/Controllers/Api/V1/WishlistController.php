<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Wishlist;
use App\Models\WishlistItem;
use App\Models\Product;
use Illuminate\Http\Request;

class WishlistController extends Controller
{
    public function index(Request $request)
    {
        $wishlist = $this->getOrCreateUserWishlist($request->user());
        
        $items = $wishlist->items()->with('product.images')->get()->map(function ($item) {
            $prod = $item->product;
            $imageUrl = $prod->images->where('is_main', true)->first()?->url ?: 'https://placehold.co/400x400/FDF8F0/6B6355?text=No+Image';

            return [
                'id' => (string) $prod->id,
                'name' => $prod->name,
                'slug' => $prod->slug,
                'arabicName' => $prod->arabic_name,
                'brand' => $prod->brand,
                'price' => (float)$prod->price,
                'images' => [$imageUrl],
                'weight' => $prod->weight,
                'rating' => (float)$prod->rating,
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
        });

        return response()->json($items);
    }

    public function toggle(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);

        $user = $request->user();
        $wishlist = $this->getOrCreateUserWishlist($user);

        $item = WishlistItem::where('wishlist_id', $wishlist->id)
            ->where('product_id', $request->product_id)
            ->first();

        if ($item) {
            $item->delete();
            $added = false;
        } else {
            WishlistItem::create([
                'wishlist_id' => $wishlist->id,
                'product_id' => $request->product_id,
            ]);
            $added = true;
        }

        return response()->json([
            'added' => $added,
            'message' => $added ? 'Product added to wishlist' : 'Product removed from wishlist'
        ]);
    }

    private function getOrCreateUserWishlist($user)
    {
        return Wishlist::firstOrCreate(['user_id' => $user->id]);
    }
}
