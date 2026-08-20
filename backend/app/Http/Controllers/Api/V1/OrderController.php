<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Coupon;
use App\Models\CouponUsage;
use App\Models\Payment;
use App\Models\Inventory;
use App\Services\ShippoService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    // ── PUBLIC SHIPPING CALCULATOR ───────────────────────────────────

    // Fallback weight (ounces) for any product without a real weight_oz set —
    // roughly "1 lb", a reasonable generic-grocery-item default until
    // per-product weights are filled in via Admin.
    private const DEFAULT_ITEM_WEIGHT_OZ = 16.0;

    public function getShippingRates(Request $request)
    {
        $request->validate([
            'zip' => 'required|string|max:10',
            'city' => 'nullable|string|max:100',
            'state' => 'nullable|string|max:100',
            'address' => 'nullable|string|max:255',
            'items' => 'nullable|array',
            'items.*.product_id' => 'nullable|exists:products,id',
            'items.*.option' => 'nullable|in:single,pack,case',
            'items.*.quantity' => 'nullable|integer|min:1',
        ]);

        $zip = trim($request->zip);

        // Try real Shippo rates when configured AND we have enough of a
        // destination address + cart contents to ask for a meaningful quote.
        // Any failure here (missing config, network error, Shippo rejecting
        // the address) falls straight through to the flat mock rates below —
        // the site must never go down because Shippo is unreachable.
        $shippo = new ShippoService();

        if ($shippo->isConfigured() && $request->filled('city') && $request->filled('state') && $request->filled('items')) {
            try {
                $totalWeightOz = 0.0;

                foreach ($request->items as $itemData) {
                    $product = Product::find($itemData['product_id'] ?? null);
                    if (!$product) {
                        continue;
                    }

                    $unitWeight = (float) ($product->weight_oz ?? self::DEFAULT_ITEM_WEIGHT_OZ);
                    $option = $itemData['option'] ?? 'single';
                    $multiplier = 1;
                    if ($option === 'pack') {
                        $multiplier = $product->pack_quantity ?: 1;
                    } elseif ($option === 'case') {
                        $multiplier = $product->case_quantity ?: 1;
                    }

                    $totalWeightOz += $unitWeight * $multiplier * (int) ($itemData['quantity'] ?? 1);
                }

                $rates = $shippo->getRates([
                    'street1' => $request->input('address'),
                    'city' => $request->city,
                    'state' => $request->state,
                    'zip' => $zip,
                ], $totalWeightOz);

                $mapped = $this->mapShippoRates($rates);

                if (!empty($mapped)) {
                    return response()->json(['rates' => $mapped, 'source' => 'shippo']);
                }
            } catch (\Throwable $e) {
                Log::warning('Shippo live rate lookup failed, falling back to flat rates.', [
                    'error' => $e->getMessage(),
                ]);
            }
        }

        // ── Fallback: configurable mock rates based on US Zip codes ──────
        // If zip starts with 9 (West coast) or 1/0 (East Coast)
        $cost = 5.99;
        $deliveryDays = 3;

        if (str_starts_with($zip, '9') || str_starts_with($zip, '8')) {
            $cost = 9.99;
            $deliveryDays = 5;
        } elseif (str_starts_with($zip, '0') || str_starts_with($zip, '1')) {
            $cost = 7.99;
            $deliveryDays = 4;
        }

        return response()->json([
            'source' => 'flat',
            'rates' => [
                [
                    'id' => 'standard',
                    'name' => 'Standard Shipping',
                    'name_ar' => 'شحن قياسي',
                    'cost' => $cost,
                    'estimated_days' => $deliveryDays,
                ],
                [
                    'id' => 'express',
                    'name' => 'Express Shipping',
                    'name_ar' => 'شحن سريع',
                    'cost' => $cost + 8.00,
                    'estimated_days' => 1,
                ]
            ]
        ]);
    }

    /**
     * Shippo returns many carrier/service combinations (USPS Ground, UPS
     * Next Day Air, etc). Keep it simple for the customer: pick the
     * cheapest as "standard" and the fastest as "express" — same two-option
     * shape the frontend already expects, just backed by real prices. Each
     * mapped rate also carries the raw Shippo `object_id` (as `rate_id`) so
     * admin label purchase can reference the exact rate the customer saw.
     */
    private function mapShippoRates(array $rates): array
    {
        $usable = array_values(array_filter($rates, fn($r) => isset($r['amount'], $r['object_id'])));
        if (empty($usable)) {
            return [];
        }

        usort($usable, fn($a, $b) => (float) $a['amount'] <=> (float) $b['amount']);
        $cheapest = $usable[0];

        usort($usable, fn($a, $b) => (float) ($a['estimated_days'] ?? 99) <=> (float) ($b['estimated_days'] ?? 99));
        $fastest = $usable[0];

        $format = function (array $r, string $id, string $name, string $nameAr) {
            return [
                'id' => $id,
                'name' => $name . ' (' . ($r['provider'] ?? 'Carrier') . ' ' . ($r['servicelevel']['name'] ?? '') . ')',
                'name_ar' => $nameAr,
                'cost' => (float) $r['amount'],
                'estimated_days' => $r['estimated_days'] ?? null,
                'rate_id' => $r['object_id'],
            ];
        };

        $result = [$format($cheapest, 'standard', 'Standard Shipping', 'شحن قياسي')];

        if ($fastest['object_id'] !== $cheapest['object_id']) {
            $result[] = $format($fastest, 'express', 'Express Shipping', 'شحن سريع');
        }

        return $result;
    }

    // ── PUBLIC PLACE ORDER ───────────────────────────────────────────

    public function store(Request $request)
    {
        $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'required|string|max:20',
            'shipping_address' => 'required|string|max:255',
            'shipping_city' => 'required|string|max:100',
            'shipping_state' => 'required|string|max:100',
            'shipping_zip' => 'required|string|max:20',
            'shipping_method' => 'required|string',
            'shipping_cost' => 'required|numeric|min:0',
            'shipping_rate_id' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.option' => 'required|in:single,pack,case',
            'items.*.quantity' => 'required|integer|min:1',
            'coupon_code' => 'nullable|string',
            'payment_method' => 'required|string',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user('sanctum');

        return DB::transaction(function () use ($request, $user) {
            $subtotal = 0.00;
            $orderItemsToCreate = [];

            // 1. Process items and check/lock inventory
            foreach ($request->items as $itemData) {
                $product = Product::lockForUpdate()->findOrFail($itemData['product_id']);
                $qty = $itemData['quantity'];
                $option = $itemData['option'];

                // Calculate product quantity multiplier
                $multiplier = 1;
                $price = (float)$product->price;
                
                if ($option === 'pack') {
                    $multiplier = $product->pack_quantity;
                    $price = (float)$product->pack_price ?: ($price * $multiplier);
                } elseif ($option === 'case') {
                    $multiplier = $product->case_quantity;
                    $price = (float)$product->case_price ?: ($price * $multiplier);
                }

                $totalQtyNeeded = $qty * $multiplier;

                // Inventory verification
                $inventory = $product->inventory;
                if (!$inventory || $inventory->stock_quantity < $totalQtyNeeded) {
                    $message = (request()->header('Accept-Language') === 'ar' ? 'عذراً، لا يوجد مخزون كافٍ لمنتج ' : 'Insufficient stock for product ') .
                        (request()->header('Accept-Language') === 'ar' ? $product->arabic_name : $product->name);

                    // Use HttpResponseException instead of a plain \Exception so this
                    // surfaces as a proper 422 to the client instead of an opaque 500 —
                    // insufficient stock is a client-correctable condition, not a server error.
                    throw new \Illuminate\Http\Exceptions\HttpResponseException(
                        response()->json(['message' => $message], 422)
                    );
                }

                // Decrease stock
                $inventory->stock_quantity -= $totalQtyNeeded;
                $inventory->save();

                $itemSubtotal = $price * $qty;
                $subtotal += $itemSubtotal;

                $orderItemsToCreate[] = [
                    'product_id' => $product->id,
                    'option' => $option,
                    'price' => $price,
                    'quantity' => $qty,
                ];
            }

            // 2. Validate Coupon discount if supplied
            $discount = 0.00;
            $coupon = null;
            
            if ($request->filled('coupon_code')) {
                $coupon = Coupon::where('code', strtoupper($request->coupon_code))->first();
                if ($coupon && $coupon->active && !$coupon->isExpired() && !$coupon->isLimitReached() && $subtotal >= $coupon->min_order_amount) {
                    if ($coupon->type === 'percentage') {
                        $discount = round(($subtotal * $coupon->value) / 100, 2);
                    } else {
                        $discount = (float)$coupon->value;
                    }
                    $discount = min($discount, $subtotal);
                    
                    // Increment coupon usage
                    $coupon->increment('usage_count');
                }
            }

            $tax = round(($subtotal - $discount) * 0.08, 2); // 8% mock tax
            $total = $subtotal - $discount + $request->shipping_cost + $tax;

            // Generate order number
            $orderNumber = 'AM-' . strtoupper(Str::random(3)) . '-' . rand(100000, 999999);

            // Create Order record
            $order = Order::create([
                'user_id' => $user?->id,
                'order_number' => $orderNumber,
                'customer_name' => $request->customer_name,
                'customer_email' => $request->customer_email,
                'customer_phone' => $request->customer_phone,
                'shipping_address' => $request->shipping_address,
                'shipping_city' => $request->shipping_city,
                'shipping_state' => $request->shipping_state,
                'shipping_zip' => $request->shipping_zip,
                'shipping_method' => $request->shipping_method,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'shipping_cost' => $request->shipping_cost,
                'tax' => $tax,
                'total' => $total,
                'payment_method' => $request->payment_method,
                'payment_status' => $request->payment_method === 'Cash on Delivery' ? 'pending' : 'pending',
                'status' => 'pending',
                'notes' => $request->notes,
            ]);

            // Save order items
            foreach ($orderItemsToCreate as $itemData) {
                $order->items()->create($itemData);
            }

            // Save coupon usage if coupon applied
            if ($coupon) {
                CouponUsage::create([
                    'coupon_id' => $coupon->id,
                    'user_id' => $user?->id,
                    'order_id' => $order->id,
                ]);
            }

            // Stash the Shippo rate the customer was quoted (if any — the
            // flat-rate fallback never sends one) so Admin > Orders can buy
            // the exact label later without re-quoting. NOTE: Shippo rate
            // object_ids expire (~7 days), so this only works for labels
            // purchased reasonably soon after the order is placed.
            if ($request->filled('shipping_rate_id')) {
                $order->shipment()->updateOrCreate(
                    ['order_id' => $order->id],
                    ['shippo_rate_id' => $request->shipping_rate_id]
                );
            }

            return response()->json([
                'message' => 'Order created successfully',
                'order_number' => $orderNumber,
                'order' => $order->load('items.product')
            ], 201);
        });
    }

    // ── PUBLIC TRACK ORDER ───────────────────────────────────────────

    public function track($orderNumber)
    {
        $order = Order::with(['items.product.images', 'payment', 'shipment'])
            ->where('order_number', trim($orderNumber))
            ->firstOrFail();

        return response()->json($order);
    }

    // ── AUTH USER ORDERS HISTORY ─────────────────────────────────────

    public function myOrders(Request $request)
    {
        $orders = $request->user()->orders()
            ->with(['items.product.images'])
            ->orderBy('id', 'desc')
            ->get();

        return response()->json($orders);
    }

    // ── STRIPE INTEGRATION INTENT ────────────────────────────────────

    public function createPaymentIntent(Request $request)
    {
        $request->validate([
            'order_number' => 'required|exists:orders,order_number',
        ]);

        $order = Order::where('order_number', $request->order_number)->firstOrFail();

        $secretKey = config('services.stripe.secret');

        if (!$secretKey || str_starts_with($secretKey, 'sk_test_placeholder') || $secretKey === '') {
            return response()->json([
                'message' => 'Stripe is not configured on this server. Set STRIPE_SECRET (and STRIPE_KEY / STRIPE_WEBHOOK_SECRET) in backend/.env to real Stripe test keys before accepting payments.',
            ], 500);
        }

        // Calls the Stripe REST API directly over Laravel's HTTP client (Guzzle,
        // already a framework dependency) rather than requiring the stripe/stripe-php
        // SDK — no new composer install needed to get real PaymentIntents working.
        $response = Http::asForm()
            ->withToken($secretKey)
            ->post('https://api.stripe.com/v1/payment_intents', [
                'amount' => (int) round(((float) $order->total) * 100), // Stripe expects cents
                'currency' => 'usd',
                'description' => 'Arab Market order ' . $order->order_number,
                'metadata' => [
                    'order_number' => $order->order_number,
                    'order_id' => (string) $order->id,
                ],
                'automatic_payment_methods' => [
                    'enabled' => 'true',
                ],
            ]);

        if ($response->failed()) {
            Log::error('Stripe PaymentIntent creation failed', [
                'order_number' => $order->order_number,
                'stripe_error' => $response->json('error.message') ?? $response->body(),
            ]);

            return response()->json([
                'message' => 'Unable to start payment with Stripe. Please try again.',
                'error' => $response->json('error.message'),
            ], 502);
        }

        $intent = $response->json();

        // Record a pending payment row keyed by the real Stripe PaymentIntent id —
        // the webhook below uses this to reconcile the eventual success/failure event.
        Payment::updateOrCreate(
            ['order_id' => $order->id],
            [
                'transaction_id' => $intent['id'],
                'amount' => $order->total,
                'method' => $order->payment_method,
                'status' => 'pending',
            ]
        );

        return response()->json([
            'client_secret' => $intent['client_secret'],
            'publishable_key' => config('services.stripe.key'),
            'amount' => (float) $order->total,
            'order_number' => $order->order_number,
        ]);
    }

    // ── STRIPE WEBHOOK ───────────────────────────────────────────────
    //
    // SECURITY: this endpoint is intentionally public (Stripe calls it directly,
    // it can't send a Sanctum bearer token) — so signature verification below is
    // the *only* thing standing between this endpoint and anyone on the internet
    // being able to mark arbitrary orders as paid. Do not remove/weaken this check.
    //
    // Verification follows Stripe's documented algorithm (see
    // https://stripe.com/docs/webhooks#verify-manually) without requiring the
    // stripe/stripe-php SDK: signed_payload = "{timestamp}.{raw_body}", compared
    // via HMAC-SHA256 against STRIPE_WEBHOOK_SECRET.

    public function stripeWebhook(Request $request)
    {
        $webhookSecret = config('services.stripe.webhook_secret');

        if (!$webhookSecret || str_starts_with($webhookSecret, 'whsec_placeholder')) {
            Log::warning('Stripe webhook received but STRIPE_WEBHOOK_SECRET is not configured — rejecting request.');
            return response()->json(['status' => 'error', 'message' => 'Webhook not configured'], 500);
        }

        $signatureHeader = $request->header('Stripe-Signature');
        if (!$signatureHeader) {
            return response()->json(['status' => 'error', 'message' => 'Missing Stripe-Signature header'], 400);
        }

        $rawPayload = $request->getContent();

        // Parse "t=169...,v1=abc...,v1=def...(rotated secret)"
        $parts = [];
        foreach (explode(',', $signatureHeader) as $pair) {
            [$key, $value] = array_pad(explode('=', $pair, 2), 2, null);
            if ($key !== null) {
                $parts[$key][] = $value;
            }
        }

        $timestamp = $parts['t'][0] ?? null;
        $signatures = $parts['v1'] ?? [];

        if (!$timestamp || empty($signatures)) {
            return response()->json(['status' => 'error', 'message' => 'Malformed Stripe-Signature header'], 400);
        }

        // Reject stale requests to prevent replay attacks (5 minute tolerance, matches Stripe's own default).
        if (abs(time() - (int) $timestamp) > 300) {
            return response()->json(['status' => 'error', 'message' => 'Webhook timestamp too old'], 400);
        }

        $expectedSignature = hash_hmac('sha256', $timestamp . '.' . $rawPayload, $webhookSecret);

        $verified = false;
        foreach ($signatures as $signature) {
            if ($signature && hash_equals($expectedSignature, $signature)) {
                $verified = true;
                break;
            }
        }

        if (!$verified) {
            Log::warning('Stripe webhook signature verification FAILED — possible forged request.', [
                'ip' => $request->ip(),
            ]);
            return response()->json(['status' => 'error', 'message' => 'Invalid signature'], 400);
        }

        $payload = json_decode($rawPayload, true) ?? [];
        $eventType = $payload['type'] ?? null;
        $orderNumber = $payload['data']['object']['metadata']['order_number'] ?? null;

        if (!$orderNumber) {
            return response()->json(['status' => 'ignored']);
        }

        $order = Order::where('order_number', $orderNumber)->first();
        if (!$order) {
            return response()->json(['status' => 'ignored']);
        }

        if ($eventType === 'payment_intent.succeeded') {
            DB::transaction(function () use ($order, $payload) {
                $order->update([
                    'payment_status' => 'paid',
                    'status' => 'confirmed',
                ]);

                $payment = Payment::where('order_id', $order->id)->first();
                if ($payment) {
                    $payment->update([
                        'status' => 'success',
                        'payload' => $payload,
                    ]);
                }
            });

            return response()->json(['status' => 'success']);
        }

        if ($eventType === 'payment_intent.payment_failed') {
            $order->update(['payment_status' => 'failed']);
            $payment = Payment::where('order_id', $order->id)->first();
            if ($payment) {
                $payment->update(['status' => 'failed', 'payload' => $payload]);
            }

            return response()->json(['status' => 'recorded']);
        }

        return response()->json(['status' => 'ignored']);
    }

    // ── ADMIN CONTROLS ───────────────────────────────────────────────

    public function adminOrders(Request $request)
    {
        $query = Order::with(['items.product', 'user']);

        // Filter status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter search
        if ($request->filled('search')) {
            $search = '%' . $request->search . '%';
            $query->where('order_number', 'like', $search)
                  ->orWhere('customer_name', 'like', $search)
                  ->orWhere('customer_email', 'like', $search);
        }

        return response()->json($query->orderBy('id', 'desc')->paginate(15));
    }

    public function updateOrderStatus(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $request->validate([
            'status' => 'required|in:pending,confirmed,processing,packed,shipped,out_for_delivery,delivered,cancelled',
            'payment_status' => 'nullable|in:pending,paid,failed,refunded',
            'tracking_number' => 'nullable|string|max:100',
        ]);

        // Validation status transitions
        $current = $order->status;
        $target = $request->status;

        // Cancelled check
        if ($current === 'delivered' && $target === 'cancelled') {
            return response()->json(['message' => 'Cannot cancel an order that has already been delivered.'], 422);
        }

        $order->status = $target;
        if ($request->filled('payment_status')) {
            $order->payment_status = $request->payment_status;
        }
        if ($request->filled('tracking_number')) {
            $order->tracking_number = $request->tracking_number;
            
            // Sync tracking shipment if present
            $order->shipment()->updateOrCreate(
                ['order_id' => $order->id],
                [
                    'tracking_number' => $request->tracking_number,
                    'status' => 'shipped',
                    'shipped_at' => now(),
                ]
            );
        }

        // If transition to cancelled, return inventory. Wrapped in a transaction so a
        // failure partway through restocking can't leave inventory partially restored
        // while the order status change still commits.
        if ($target === 'cancelled' && $current !== 'cancelled') {
            DB::transaction(function () use ($order) {
                foreach ($order->items as $item) {
                    $product = $item->product;
                    $multiplier = 1;
                    if ($item->option === 'pack') $multiplier = $product->pack_quantity;
                    elseif ($item->option === 'case') $multiplier = $product->case_quantity;

                    $inventory = $product->inventory()->lockForUpdate()->first();
                    if ($inventory) {
                        $inventory->stock_quantity += ($item->quantity * $multiplier);
                        $inventory->save();
                    }
                }

                $order->save();
            });

            return response()->json($order->load('items.product'));
        }

        $order->save();

        return response()->json($order->load('items.product'));
    }

    // ── ADMIN: BUY SHIPPO SHIPPING LABEL ─────────────────────────────
    //
    // Called from Admin > Order detail once the order's `shipping_method`
    // holds a Shippo rate id (i.e. it was quoted through the live Shippo
    // path in getShippingRates(), not the flat-rate fallback). Purchases
    // the actual label/tracking number through Shippo and stores the
    // result on the order's Shipment row + Order.tracking_number.

    public function buyShippingLabel(Request $request, $id)
    {
        $order = Order::findOrFail($id);

        $request->validate([
            'rate_id' => 'nullable|string',
        ]);

        // Allow the admin UI to just click "buy label" without re-passing the
        // rate id — use whatever was captured at checkout time if the request
        // didn't supply one.
        $rateId = $request->input('rate_id') ?: $order->shipment?->shippo_rate_id;

        if (!$rateId) {
            return response()->json([
                'message' => 'No Shippo rate is on file for this order (it was likely placed before Shippo was configured, or via the flat-rate fallback). Provide a rate_id explicitly, or re-quote shipping for this order.',
            ], 422);
        }

        $shippo = new ShippoService();

        if (!$shippo->isConfigured()) {
            return response()->json([
                'message' => 'Shippo is not configured on this server. Set SHIPPO_API_TOKEN and SHIPPO_FROM_* in backend/.env first.',
            ], 500);
        }

        try {
            $transaction = $shippo->buyLabel($rateId);
        } catch (\Throwable $e) {
            Log::error('Shippo buyShippingLabel failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);

            return response()->json([
                'message' => 'Unable to purchase shipping label from Shippo.',
                'error' => $e->getMessage(),
            ], 502);
        }

        $shipment = $order->shipment()->updateOrCreate(
            ['order_id' => $order->id],
            [
                'carrier' => $transaction['rate']['provider'] ?? null,
                'tracking_number' => $transaction['tracking_number'] ?? null,
                'status' => 'label_purchased',
                'shippo_rate_id' => $rateId,
                'shippo_transaction_id' => $transaction['object_id'] ?? null,
                'label_url' => $transaction['label_url'] ?? null,
            ]
        );

        if ($transaction['tracking_number'] ?? null) {
            $order->tracking_number = $transaction['tracking_number'];
            $order->save();
        }

        return response()->json([
            'message' => 'Shipping label purchased.',
            'shipment' => $shipment,
        ]);
    }
}
