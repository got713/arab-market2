<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class Phase1SecurityFixesTest extends TestCase
{
    use RefreshDatabase;

    private function makeProduct(int $stock = 50): Product
    {
        $category = Category::create([
            'name' => 'Groceries',
            'arabic_name' => 'البقالة',
            'slug' => 'groceries-' . uniqid(),
            'active' => true,
        ]);

        $product = Product::create([
            'category_id' => $category->id,
            'name' => 'Test Rice',
            'arabic_name' => 'أرز',
            'slug' => 'test-rice-' . uniqid(),
            'brand' => 'TestBrand',
            'description' => 'Test',
            'arabic_description' => 'اختبار',
            'weight' => '1kg',
            'price' => 5.00,
            'pack_price' => 25.00,
            'pack_quantity' => 6,
            'case_price' => 45.00,
            'case_quantity' => 12,
            'active' => true,
        ]);

        Inventory::create([
            'product_id' => $product->id,
            'stock_quantity' => $stock,
            'low_stock_threshold' => 5,
        ]);

        return $product;
    }

    private function baseOrderPayload(Product $product): array
    {
        return [
            'customer_name' => 'Jane Doe',
            'customer_email' => 'jane@example.com',
            'customer_phone' => '5551234567',
            'shipping_address' => '123 Main St',
            'shipping_city' => 'Chicago',
            'shipping_state' => 'IL',
            'shipping_zip' => '60611',
            'shipping_method' => 'standard',
            'items' => [
                ['product_id' => $product->id, 'option' => 'single', 'quantity' => 2],
            ],
            'payment_method' => 'Credit Card (Stripe)',
        ];
    }

    /** Fix 1: shipping cost must be server-computed, not client-trusted. */
    public function test_client_supplied_shipping_cost_is_ignored_and_recomputed_server_side(): void
    {
        $product = $this->makeProduct();

        // Phase 2: shipping price now comes from the seeded shipping_methods
        // row (admin-editable), not a zip-based formula — standard = $7.99.
        $expectedShipping = 7.99;
        $expectedSubtotal = 2 * 5.00; // qty 2 * $5.00 single price
        $expectedTax = round($expectedSubtotal * 0.08, 2);
        $expectedTotal = round($expectedSubtotal + $expectedShipping + $expectedTax, 2);

        $payload = $this->baseOrderPayload($product);
        // Attempt to manipulate: even though the field is no longer validated,
        // send a malicious shipping_cost to prove it has zero effect.
        $payload['shipping_cost'] = 0.01;

        $response = $this->postJson('/api/v1/orders', $payload);

        $response->assertStatus(201);
        $order = $response->json('order');

        $this->assertEquals($expectedShipping, (float) $order['shipping_cost'], 'Client-supplied shipping_cost must be ignored.');
        $this->assertEquals($expectedTotal, (float) $order['total'], 'Total must reflect server-computed shipping, not the manipulated value.');

        // Express is a distinct DB-configured price — prove the method actually
        // drives which row's price gets used.
        $payload2 = $this->baseOrderPayload($product);
        $payload2['shipping_method'] = 'express';
        $response2 = $this->postJson('/api/v1/orders', $payload2);
        $response2->assertStatus(201);
        $this->assertEquals(14.99, (float) $response2->json('order.shipping_cost'));

        // An invalid method identifier must be rejected outright, not silently
        // accepted as $0 shipping.
        $payload3 = $this->baseOrderPayload($product);
        $payload3['shipping_method'] = 'free-for-me';
        $this->postJson('/api/v1/orders', $payload3)->assertStatus(422);
    }

    /** Fix 2: a user must never be able to reassign another user's address to themselves,
     *  or move their own address onto another user's account, via mass assignment. */
    public function test_address_update_cannot_be_used_to_change_ownership(): void
    {
        $owner = User::create(['name' => 'Owner', 'email' => 'owner@example.com', 'password' => Hash::make('secret123'), 'role' => 'customer']);
        $attacker = User::create(['name' => 'Attacker', 'email' => 'attacker@example.com', 'password' => Hash::make('secret123'), 'role' => 'customer']);

        $address = $owner->addresses()->create([
            'first_name' => 'Owner', 'last_name' => 'Person', 'email' => 'owner@example.com',
            'phone' => '5551112222', 'address_line_1' => '1 Owner St', 'city' => 'Chicago', 'state' => 'IL', 'zip' => '60611',
        ]);

        // Attacker cannot even reach owner's address by id.
        Sanctum::actingAs($attacker);
        $this->putJson("/api/v1/auth/addresses/{$address->id}", [
            'first_name' => 'Hacked', 'last_name' => 'Person', 'email' => 'attacker@example.com',
            'phone' => '5559998888', 'address_line_1' => 'Hacked St', 'city' => 'Chicago', 'state' => 'IL', 'zip' => '60611',
        ])->assertStatus(404);

        // Owner updates their own address but slips an extra user_id in the body,
        // trying to reassign it to the attacker's account.
        Sanctum::actingAs($owner);
        $this->putJson("/api/v1/auth/addresses/{$address->id}", [
            'first_name' => 'Owner', 'last_name' => 'Person', 'email' => 'owner@example.com',
            'phone' => '5551112222', 'address_line_1' => '1 Owner St', 'city' => 'Chicago', 'state' => 'IL', 'zip' => '60611',
            'user_id' => $attacker->id,
        ])->assertStatus(200);

        $address->refresh();
        $this->assertEquals($owner->id, $address->user_id, 'user_id must never be settable from the request body.');
    }

    /** Fix 6: order tracking must require the order number AND the email on the order. */
    public function test_order_tracking_requires_matching_email(): void
    {
        $product = $this->makeProduct();
        $created = $this->postJson('/api/v1/orders', $this->baseOrderPayload($product))->assertStatus(201);
        $orderNumber = $created->json('order_number');

        // No email at all.
        $this->getJson("/api/v1/orders/track/{$orderNumber}")->assertStatus(422);

        // Wrong email — must 404, not reveal that the order number is valid.
        $this->getJson("/api/v1/orders/track/{$orderNumber}?email=" . urlencode('someoneelse@example.com'))->assertStatus(404);

        // Correct email works.
        $this->getJson("/api/v1/orders/track/{$orderNumber}?email=" . urlencode('jane@example.com'))->assertStatus(200);
    }

    /** Fix 5: an abandoned/never-paid order's reservation is released after it expires,
     *  restoring the stock it held. */
    public function test_expired_unpaid_order_releases_its_inventory_reservation(): void
    {
        $product = $this->makeProduct(stock: 10);

        $this->postJson('/api/v1/orders', $this->baseOrderPayload($product))->assertStatus(201);

        $product->refresh();
        $this->assertEquals(8, $product->inventory->stock_quantity, 'Stock must be decremented at order creation.');

        $order = Order::first();
        $this->assertNotNull($order->reserved_until, 'A newly created unpaid order must carry a reservation expiry.');

        // Simulate the reservation window having lapsed.
        $order->reserved_until = now()->subMinute();
        $order->save();

        Artisan::call('orders:release-expired');

        $order->refresh();
        $product->refresh();
        $this->assertEquals('cancelled', $order->status);
        $this->assertEquals(10, $product->inventory->stock_quantity, 'Stock must be restored once the reservation expires unpaid.');

        // Running it again must be a safe no-op (idempotent), not double-restock.
        Artisan::call('orders:release-expired');
        $product->refresh();
        $this->assertEquals(10, $product->inventory->stock_quantity);
    }

    /** Fix 4 (backend half): admin-only endpoints must reject guests and non-admin
     *  customers server-side, independent of any frontend routing. */
    public function test_admin_endpoints_reject_guests_and_customers(): void
    {
        $this->getJson('/api/v1/admin/analytics')->assertStatus(401);

        $customer = User::create(['name' => 'Cust', 'email' => 'cust@example.com', 'password' => Hash::make('secret123'), 'role' => 'customer']);
        Sanctum::actingAs($customer);
        $this->getJson('/api/v1/admin/analytics')->assertStatus(403);

        $admin = User::create(['name' => 'Admin', 'email' => 'admin2@example.com', 'password' => Hash::make('secret123'), 'role' => 'admin']);
        Sanctum::actingAs($admin);
        $this->getJson('/api/v1/admin/analytics')->assertStatus(200);
    }
}
