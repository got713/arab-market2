<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $cart = $this->getOrCreateUserCart($request->user());
        return response()->json($this->formatCart($cart));
    }

    public function add(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'option' => 'required|in:single,pack,case',
            'quantity' => 'required|integer|min:1',
        ]);

        $user = $request->user();
        $cart = $this->getOrCreateUserCart($user);
        $product = Product::findOrFail($request->product_id);

        // Check stock availability
        $stock = $product->inventory ? $product->inventory->stock_quantity : 0;
        if ($stock < $request->quantity) {
            return response()->json([
                'message' => 'Insufficient stock for this product.'
            ], 400);
        }

        // Find or create item
        $item = CartItem::where('cart_id', $cart->id)
            ->where('product_id', $product->id)
            ->where('option', $request->option)
            ->first();

        if ($item) {
            $newQty = $item->quantity + $request->quantity;
            if ($stock < $newQty) {
                return response()->json([
                    'message' => 'Cannot add more. Exceeds available stock.'
                ], 400);
            }
            $item->update(['quantity' => $newQty]);
        } else {
            CartItem::create([
                'cart_id' => $cart->id,
                'product_id' => $product->id,
                'option' => $request->option,
                'quantity' => $request->quantity,
            ]);
        }

        return response()->json($this->formatCart($cart->fresh()));
    }

    public function update(Request $request, $id)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
            'option' => 'nullable|in:single,pack,case',
        ]);

        $user = $request->user();
        $cart = $this->getOrCreateUserCart($user);
        $item = CartItem::where('cart_id', $cart->id)->findOrFail($id);

        $product = $item->product;
        $stock = $product->inventory ? $product->inventory->stock_quantity : 0;

        if ($stock < $request->quantity) {
            return response()->json([
                'message' => 'Insufficient stock. Only ' . $stock . ' items available.'
            ], 400);
        }

        $item->quantity = $request->quantity;
        if ($request->filled('option')) {
            $item->option = $request->option;
        }
        $item->save();

        return response()->json($this->formatCart($cart->fresh()));
    }

    public function remove(Request $request, $id)
    {
        $user = $request->user();
        $cart = $this->getOrCreateUserCart($user);
        $item = CartItem::where('cart_id', $cart->id)->findOrFail($id);
        $item->delete();

        return response()->json($this->formatCart($cart->fresh()));
    }

    public function sync(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.option' => 'required|in:single,pack,case',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        $user = $request->user();
        $cart = $this->getOrCreateUserCart($user);

        foreach ($request->items as $itemData) {
            $product = Product::find($itemData['product_id']);
            if (!$product) continue;

            $stock = $product->inventory ? $product->inventory->stock_quantity : 0;
            $quantity = min($itemData['quantity'], $stock); // clamp to stock
            if ($quantity <= 0) continue;

            $item = CartItem::where('cart_id', $cart->id)
                ->where('product_id', $product->id)
                ->where('option', $itemData['option'])
                ->first();

            if ($item) {
                $newQty = min($item->quantity + $quantity, $stock);
                $item->update(['quantity' => $newQty]);
            } else {
                CartItem::create([
                    'cart_id' => $cart->id,
                    'product_id' => $product->id,
                    'option' => $itemData['option'],
                    'quantity' => $quantity,
                ]);
            }
        }

        return response()->json($this->formatCart($cart->fresh()));
    }

    public function clear(Request $request)
    {
        $user = $request->user();
        $cart = $this->getOrCreateUserCart($user);
        $cart->items()->delete();

        return response()->json($this->formatCart($cart->fresh()));
    }

    // ── HELPERS ──────────────────────────────────────────────────────

    private function getOrCreateUserCart($user)
    {
        return Cart::firstOrCreate(['user_id' => $user->id]);
    }

    private function formatCart($cart)
    {
        $items = $cart->items()->with('product.images')->get()->map(function ($item) {
            $prod = $item->product;
            $imageUrl = $prod->images->where('is_main', true)->first()?->url ?: 'https://placehold.co/400x400/FDF8F0/6B6355?text=No+Image';

            // Find price based on option
            $price = (float)$prod->price;
            if ($item->option === 'pack' && $prod->pack_price) {
                $price = (float)$prod->pack_price;
            } elseif ($item->option === 'case' && $prod->case_price) {
                $price = (float)$prod->case_price;
            }

            return [
                'id' => $item->id,
                'product' => [
                    'id' => (string)$prod->id,
                    'name' => $prod->name,
                    'slug' => $prod->slug,
                    'arabicName' => $prod->arabic_name,
                    'brand' => $prod->brand,
                    'price' => (float)$prod->price,
                    'images' => [$imageUrl],
                    'weight' => $prod->weight,
                    'stock' => $prod->inventory ? $prod->inventory->stock_quantity : 0,
                    'purchaseOptions' => [
                        'single' => ['price' => (float)$prod->price, 'quantity' => 1],
                        'pack' => ['price' => (float)$prod->pack_price ?: (float)($prod->price * $prod->pack_quantity), 'quantity' => $prod->pack_quantity],
                        'case' => ['price' => (float)$prod->case_price ?: (float)($prod->price * $prod->case_quantity), 'quantity' => $prod->case_quantity],
                    ]
                ],
                'option' => $item->option,
                'quantity' => $item->quantity,
                'price' => $price,
            ];
        });

        return [
            'id' => $cart->id,
            'items' => $items,
        ];
    }
}
