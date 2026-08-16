<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\ContactMessage;
use App\Models\Coupon;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class Phase3Test extends TestCase
{
    use RefreshDatabase;

    private function makeAdmin(): User
    {
        return User::create(['name' => 'Admin', 'email' => 'admin-p3@example.com', 'password' => Hash::make('secret123'), 'role' => 'admin']);
    }

    private function makeCustomer(array $overrides = []): User
    {
        return User::create(array_merge([
            'name' => 'Customer', 'email' => 'cust-p3@example.com', 'password' => Hash::make('secret123'), 'role' => 'customer',
        ], $overrides));
    }

    private function makeProduct(int $stock = 50): Product
    {
        $category = Category::create(['name' => 'Groceries', 'arabic_name' => 'البقالة', 'slug' => 'groceries-' . uniqid(), 'active' => true]);
        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Test Rice', 'arabic_name' => 'أرز', 'slug' => 'test-rice-' . uniqid(),
            'brand' => 'TestBrand', 'description' => 'Test', 'arabic_description' => 'اختبار', 'weight' => '1kg',
            'price' => 5.00, 'pack_price' => 25.00, 'pack_quantity' => 6, 'case_price' => 45.00, 'case_quantity' => 12,
            'active' => true,
        ]);
        Inventory::create(['product_id' => $product->id, 'stock_quantity' => $stock, 'low_stock_threshold' => 5]);
        return $product;
    }

    private function placeOrder(User $customer, Product $product, string $email): array
    {
        Sanctum::actingAs($customer);
        $res = $this->postJson('/api/v1/orders', [
            'customer_name' => $customer->name, 'customer_email' => $email, 'customer_phone' => '5551234567',
            'shipping_address' => '1 Main St', 'shipping_city' => 'Chicago', 'shipping_state' => 'IL', 'shipping_zip' => '60611',
            'shipping_method' => 'standard',
            'items' => [['product_id' => $product->id, 'option' => 'single', 'quantity' => 1]],
            'payment_method' => 'Credit Card (Stripe)',
        ])->assertStatus(201);

        return $res->json();
    }

    /** Requirement 1: a customer can retrieve their own orders via the dedicated endpoint. */
    public function test_customer_can_retrieve_their_own_orders(): void
    {
        $product = $this->makeProduct();
        $alice = $this->makeCustomer(['name' => 'Alice', 'email' => 'alice@example.com']);
        $this->placeOrder($alice, $product, 'alice@example.com');

        Sanctum::actingAs($alice);
        $res = $this->getJson('/api/v1/orders/my')->assertStatus(200);

        $this->assertCount(1, $res->json());
        $this->assertEquals('alice@example.com', $res->json('0.customer_email'));
    }

    /** Requirement 2: a customer must never see another customer's orders through this endpoint. */
    public function test_customer_cannot_retrieve_another_customers_orders(): void
    {
        $product = $this->makeProduct();
        $alice = $this->makeCustomer(['name' => 'Alice', 'email' => 'alice2@example.com']);
        $bob = $this->makeCustomer(['name' => 'Bob', 'email' => 'bob2@example.com']);

        $this->placeOrder($alice, $product, 'alice2@example.com');
        $this->placeOrder($bob, $product, 'bob2@example.com');

        // Bob's endpoint call is scoped by his own Sanctum token — there is no
        // parameter he could change to see Alice's order.
        Sanctum::actingAs($bob);
        $res = $this->getJson('/api/v1/orders/my')->assertStatus(200);

        $this->assertCount(1, $res->json());
        $this->assertEquals('bob2@example.com', $res->json('0.customer_email'));

        $emails = collect($res->json())->pluck('customer_email')->all();
        $this->assertNotContains('alice2@example.com', $emails);
    }

    public function test_guest_cannot_access_my_orders(): void
    {
        $this->getJson('/api/v1/orders/my')->assertStatus(401);
    }

    /** Requirement 7: the coupon validate response's discount is the server's
     *  real calculated amount — this is what the cart page's fixed success
     *  message now reads directly, instead of a client-derived field. */
    public function test_coupon_discount_response_is_correct(): void
    {
        Coupon::create([
            'code' => 'SAVE10', 'type' => 'percentage', 'value' => 10.00,
            'min_order_amount' => 20.00, 'max_usages' => 100, 'usage_count' => 0, 'active' => true,
        ]);

        $res = $this->postJson('/api/v1/coupons/validate', [
            'code' => 'SAVE10', 'order_subtotal' => 50.00,
        ])->assertStatus(200);

        $this->assertTrue($res->json('valid'));
        $this->assertEquals(5.00, $res->json('discount_amount'), '10% of $50.00 must be exactly $5.00.');

        // A fixed coupon must return its flat amount, not a percentage calc.
        Coupon::create([
            'code' => 'FLAT5', 'type' => 'fixed', 'value' => 5.00,
            'min_order_amount' => 10.00, 'max_usages' => 100, 'usage_count' => 0, 'active' => true,
        ]);
        $res2 = $this->postJson('/api/v1/coupons/validate', ['code' => 'FLAT5', 'order_subtotal' => 50.00])->assertStatus(200);
        $this->assertEquals(5.00, $res2->json('discount_amount'));
    }

    /** Requirement 8: product endpoints return the full image gallery (not
     *  just a single image repeated three times, which the old frontend
     *  gallery bug used to mask). */
    public function test_product_listing_returns_full_image_gallery(): void
    {
        $product = $this->makeProduct();
        ProductImage::create(['product_id' => $product->id, 'url' => 'https://example.com/second.jpg', 'is_main' => false]);
        ProductImage::create(['product_id' => $product->id, 'url' => 'https://example.com/main.jpg', 'is_main' => true]);

        $res = $this->getJson("/api/v1/products/{$product->slug}")->assertStatus(200);
        $images = $res->json('images');

        $this->assertCount(2, $images);
        $this->assertEquals('https://example.com/main.jpg', $images[0], 'The main image must be sorted first.');
        $this->assertContains('https://example.com/second.jpg', $images);
    }

    /** Requirement 10: a duplicate Stripe webhook delivery for the same event
     *  (Stripe retries these) must not double-apply the paid transition or
     *  any side effect — this is the idempotency guard in
     *  OrderController::stripeWebhook, re-verified here rather than assumed
     *  to still be correct after Phase 2's changes. */
    public function test_stripe_webhook_is_idempotent_on_duplicate_delivery(): void
    {
        $secret = 'whsec_test_secret_123';
        config(['services.stripe.webhook_secret' => $secret]);

        $product = $this->makeProduct(stock: 10);
        $orderRes = $this->postJson('/api/v1/orders', [
            'customer_name' => 'Jane', 'customer_email' => 'webhook@example.com', 'customer_phone' => '5551234567',
            'shipping_address' => '1 Main St', 'shipping_city' => 'Chicago', 'shipping_state' => 'IL', 'shipping_zip' => '60611',
            'shipping_method' => 'standard',
            'items' => [['product_id' => $product->id, 'option' => 'single', 'quantity' => 1]],
            'payment_method' => 'Credit Card (Stripe)',
        ])->assertStatus(201);
        $orderNumber = $orderRes->json('order_number');

        $payload = json_encode([
            'type' => 'payment_intent.succeeded',
            'data' => ['object' => ['metadata' => ['order_number' => $orderNumber]]],
        ]);

        $timestamp = time();
        $signature = hash_hmac('sha256', $timestamp . '.' . $payload, $secret);
        $header = "t={$timestamp},v1={$signature}";
        $serverHeaders = ['HTTP_Stripe-Signature' => $header, 'CONTENT_TYPE' => 'application/json'];

        // First delivery marks the order paid.
        $this->call('POST', '/api/v1/payments/stripe/webhook', [], [], [], $serverHeaders, $payload)
            ->assertStatus(200);
        $this->assertDatabaseHas('orders', ['order_number' => $orderNumber, 'payment_status' => 'paid', 'status' => 'confirmed']);

        $product->refresh();
        $stockAfterFirstDelivery = $product->inventory->stock_quantity;

        // Duplicate delivery of the exact same event — must be a safe no-op.
        $this->call('POST', '/api/v1/payments/stripe/webhook', [], [], [], $serverHeaders, $payload)
            ->assertStatus(200);
        $this->assertDatabaseHas('orders', ['order_number' => $orderNumber, 'payment_status' => 'paid', 'status' => 'confirmed']);

        $product->refresh();
        $this->assertEquals(
            $stockAfterFirstDelivery,
            $product->inventory->stock_quantity,
            'A duplicate webhook delivery must not change stock again.'
        );
    }

    /** A forged webhook (wrong signature) must never be able to mark an order paid. */
    public function test_stripe_webhook_rejects_invalid_signature(): void
    {
        config(['services.stripe.webhook_secret' => 'whsec_test_secret_123']);

        $product = $this->makeProduct();
        $orderRes = $this->postJson('/api/v1/orders', [
            'customer_name' => 'Jane', 'customer_email' => 'forged@example.com', 'customer_phone' => '5551234567',
            'shipping_address' => '1 Main St', 'shipping_city' => 'Chicago', 'shipping_state' => 'IL', 'shipping_zip' => '60611',
            'shipping_method' => 'standard',
            'items' => [['product_id' => $product->id, 'option' => 'single', 'quantity' => 1]],
            'payment_method' => 'Credit Card (Stripe)',
        ])->assertStatus(201);
        $orderNumber = $orderRes->json('order_number');

        $payload = json_encode([
            'type' => 'payment_intent.succeeded',
            'data' => ['object' => ['metadata' => ['order_number' => $orderNumber]]],
        ]);

        $header = 't=' . time() . ',v1=not_a_real_signature';

        $this->call('POST', '/api/v1/payments/stripe/webhook', [], [], [], [
            'HTTP_Stripe-Signature' => $header,
            'CONTENT_TYPE' => 'application/json',
        ], $payload)->assertStatus(400);

        $this->assertDatabaseHas('orders', ['order_number' => $orderNumber, 'payment_status' => 'pending']);
    }

    /** The contact form must genuinely persist the message server-side, not
     *  just flip a local "submitted" flag (the bug the original audit found). */
    public function test_contact_form_persists_the_message(): void
    {
        $this->postJson('/api/v1/contact', [
            'name' => 'Sara Contactor',
            'email' => 'sara@example.com',
            'subject' => 'Order question',
            'message' => 'Where is my order?',
        ])->assertStatus(201);

        $this->assertDatabaseHas('contact_messages', [
            'name' => 'Sara Contactor',
            'email' => 'sara@example.com',
            'message' => 'Where is my order?',
        ]);
    }

    public function test_contact_form_requires_the_real_fields(): void
    {
        $this->postJson('/api/v1/contact', ['name' => 'No Email'])->assertStatus(422);
        $this->assertEquals(0, ContactMessage::count());
    }
}
