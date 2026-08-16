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
use App\Models\ShippingMethod;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class OrderController extends Controller
{
    // How long an unpaid order holds its inventory/coupon reservation before
    // the scheduled orders:release-expired command gives it back (see
    // Order::releaseReservation()).
    private const RESERVATION_MINUTES = 30;

    // ── SHARED SHIPPING RATE LOGIC ───────────────────────────────────
    //
    // SECURITY: this is the ONLY place shipping cost is computed, and it is
    // read exclusively from the shipping_methods table (managed by admins via
    // ShippingMethodController). store() below calls resolveShippingCost()
    // directly instead of trusting a client-supplied shipping_cost — do not
    // reintroduce a client-supplied cost field, and do not let this read
    // anything other than the DB row.

    // Delivery-day estimate only (never affects price) — kept as a simple
    // zip heuristic since there's no per-zip delivery-time data to replace it
    // with; admin-configured pricing (Phase 2) doesn't change this.
    private function shippingEstimatedDays(string $zip): int
    {
        if (str_starts_with($zip, '9') || str_starts_with($zip, '8')) {
            return 5;
        } elseif (str_starts_with($zip, '0') || str_starts_with($zip, '1')) {
            return 4;
        }
        return 3;
    }

    /**
     * @return array{cost: float, method_label: string}
     */
    private function resolveShippingCost(string $method): array
    {
        $shippingMethod = ShippingMethod::where('code', $method)->where('active', true)->first();

        if (!$shippingMethod) {
            throw new \Illuminate\Http\Exceptions\HttpResponseException(
                response()->json(['message' => 'The selected shipping method is not currently available.'], 422)
            );
        }

        return ['cost' => (float) $shippingMethod->price, 'method_label' => $shippingMethod->name];
    }

    // ── PUBLIC SHIPPING CALCULATOR ───────────────────────────────────

    public function getShippingRates(Request $request)
    {
        $request->validate([
            'zip' => 'required|string|max:10',
        ]);

        $zip = trim($request->zip);
        $deliveryDays = $this->shippingEstimatedDays($zip);

        $rates = ShippingMethod::where('active', true)
            ->orderBy('display_order')
            ->orderBy('id')
            ->get()
            ->map(function ($m) use ($deliveryDays) {
                return [
                    'id' => $m->code,
                    'name' => $m->name,
                    'name_ar' => $m->arabic_name,
                    'cost' => (float) $m->price,
                    'estimated_days' => $m->code === 'express' ? 1 : $deliveryDays,
                ];
            });

        return response()->json(['rates' => $rates]);
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
            // Not hardcoded to 'standard'/'express' here — resolveShippingCost()
            // below is the single authoritative check (looks the code up against
            // active shipping_methods rows and 422s if it doesn't match one), so
            // the valid set never has to be kept in sync in two places.
            'shipping_method' => 'required|string|max:50',
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

                // Inventory verification — lock the inventory row itself (not just the
                // product row) so two concurrent checkouts for the same product can't
                // both read the same stale stock_quantity and both oversell it.
                $inventory = $product->inventory()->lockForUpdate()->first();
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
                // Lock the coupon row for the duration of this transaction so two
                // concurrent checkouts can't both read the same usage_count and both
                // slip past isLimitReached() when only one usage slot remains.
                $coupon = Coupon::where('code', strtoupper($request->coupon_code))->lockForUpdate()->first();
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

            // Shipping cost is never accepted from the client — it's derived
            // server-side from the shipping zip + method, exactly like
            // getShippingRates() above, so it can't be under/overpaid by
            // manipulating the request.
            $shippingResolved = $this->resolveShippingCost($request->shipping_method);
            $shippingCost = $shippingResolved['cost'];

            // Flat simplified 8% rate — this is genuinely charged (real money,
            // included in the real Stripe amount), just not a full per-state/
            // locality US sales-tax calculation. Wiring up real jurisdiction-
            // based tax (e.g. a tax API) is a distinct feature, not a bug fix.
            $tax = round(($subtotal - $discount) * 0.08, 2);
            $total = $subtotal - $discount + $shippingCost + $tax;

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
                'shipping_method' => $shippingResolved['method_label'],
                'subtotal' => $subtotal,
                'discount' => $discount,
                'shipping_cost' => $shippingCost,
                'tax' => $tax,
                'total' => $total,
                'payment_method' => $request->payment_method,
                'payment_status' => $request->payment_method === 'Cash on Delivery' ? 'pending' : 'pending',
                'status' => 'pending',
                // Inventory and coupon usage are reserved immediately below, before
                // payment exists — this timestamp bounds how long that reservation
                // can be held by an order that never gets paid (see
                // Order::releaseReservation() and the orders:release-expired command).
                'reserved_until' => now()->addMinutes(self::RESERVATION_MINUTES),
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

            return response()->json([
                'message' => 'Order created successfully',
                'order_number' => $orderNumber,
                'order' => $order->load('items.product')
            ], 201);
        });
    }

    // ── PUBLIC TRACK ORDER ───────────────────────────────────────────
    //
    // SECURITY: order_number alone is not sufficient to view an order — the
    // order numbers are guessable-enough (see routes/api.php throttle) that a
    // bare order-number lookup would let anyone enumerate other customers'
    // name/email/phone/address. The caller must also know the email used on
    // the order, so this now requires both.

    public function track(Request $request, $orderNumber)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $order = Order::with(['items.product.images', 'payment', 'shipment'])
            ->where('order_number', trim($orderNumber))
            ->first();

        // Same 404 whether the order number doesn't exist or the email just
        // doesn't match it — a distinct response for "wrong email" would let
        // an attacker confirm a guessed order number is real.
        if (!$order || strcasecmp($order->customer_email, $request->email) !== 0) {
            abort(404);
        }

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
                // Re-fetch under a lock: guards against this racing the scheduled
                // orders:release-expired command releasing the same order's
                // reservation at the same moment, and makes duplicate webhook
                // delivery (Stripe retries these) a safe no-op below.
                $locked = Order::where('id', $order->id)->lockForUpdate()->first();

                if ($locked->payment_status === 'paid') {
                    return; // already processed by an earlier delivery of this event
                }

                $wasReleased = $locked->status === 'cancelled';

                $locked->update([
                    'payment_status' => 'paid',
                    // If the reservation had already expired and been released
                    // (stock/coupon usage given back — see Order::releaseReservation),
                    // don't silently confirm the order as if inventory is still held
                    // for it. Leave it as pending-but-paid so an admin notices and
                    // reconciles stock manually instead of risking an oversell.
                    'status' => $wasReleased ? 'pending' : 'confirmed',
                    'reserved_until' => null,
                ]);

                if ($wasReleased) {
                    Log::warning('Stripe payment succeeded for an order whose reservation had already been released — needs manual stock review.', [
                        'order_number' => $locked->order_number,
                    ]);
                }

                $payment = Payment::where('order_id', $locked->id)->first();
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
            // Deliberately does NOT release inventory/coupon usage here — Stripe
            // lets a customer retry the same PaymentIntent after a failed attempt,
            // so releasing immediately could let the stock be resold to someone
            // else while this customer is still mid-retry. If they never retry,
            // the reservation still expires safely via reserved_until (see
            // Order::releaseReservation / orders:release-expired).
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

        // Filter search — grouped in a closure so this OR'd search condition is
        // AND'ed as a single unit with the status filter above, instead of the
        // unparenthesized orWhere() previously making the status filter apply to
        // only the first term (order_number) and get silently dropped for
        // customer_name/customer_email matches.
        if ($request->filled('search')) {
            $search = '%' . $request->search . '%';
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', $search)
                  ->orWhere('customer_name', 'like', $search)
                  ->orWhere('customer_email', 'like', $search);
            });
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

                // No reservation to hold onto once cancelled, paid or not.
                $order->reserved_until = null;
                $order->save();
            });

            return response()->json($order->load('items.product'));
        }

        $order->save();

        return response()->json($order->load('items.product'));
    }
}
