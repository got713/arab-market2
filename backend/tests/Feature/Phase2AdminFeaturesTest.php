<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Inventory;
use App\Models\Order;
use App\Models\Product;
use App\Models\ShippingMethod;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class Phase2AdminFeaturesTest extends TestCase
{
    use RefreshDatabase;

    private function makeAdmin(): User
    {
        return User::create(['name' => 'Admin', 'email' => 'admin-t@example.com', 'password' => Hash::make('secret123'), 'role' => 'admin']);
    }

    private function makeCustomer(array $overrides = []): User
    {
        return User::create(array_merge([
            'name' => 'Customer',
            'email' => 'cust-t@example.com',
            'password' => Hash::make('secret123'),
            'role' => 'customer',
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

    // ── CUSTOMERS ─────────────────────────────────────────────────────

    public function test_admin_can_list_customers_with_real_order_stats(): void
    {
        $admin = $this->makeAdmin();
        $customer = $this->makeCustomer(['name' => 'Jane Buyer', 'email' => 'jane@example.com']);

        $product = $this->makeProduct();
        Sanctum::actingAs($customer);
        $this->postJson('/api/v1/orders', [
            'customer_name' => 'Jane Buyer', 'customer_email' => 'jane@example.com', 'customer_phone' => '5551234567',
            'shipping_address' => '1 Main St', 'shipping_city' => 'Chicago', 'shipping_state' => 'IL', 'shipping_zip' => '60611',
            'shipping_method' => 'standard',
            'items' => [['product_id' => $product->id, 'option' => 'single', 'quantity' => 1]],
            'payment_method' => 'Credit Card (Stripe)',
        ])->assertStatus(201);

        // Mark it paid directly (simulating the webhook) so total_spent reflects it.
        Order::where('customer_email', 'jane@example.com')->update(['payment_status' => 'paid']);

        Sanctum::actingAs($admin);
        $res = $this->getJson('/api/v1/admin/customers')->assertStatus(200);
        $row = collect($res->json('data'))->firstWhere('email', 'jane@example.com');

        $this->assertNotNull($row);
        $this->assertEquals(1, $row['orders_count']);
        $this->assertGreaterThan(0, $row['total_spent']);
        $this->assertArrayNotHasKey('password', $row);
    }

    public function test_customer_cannot_access_admin_customer_endpoints(): void
    {
        Sanctum::actingAs($this->makeCustomer());
        $this->getJson('/api/v1/admin/customers')->assertStatus(403);
    }

    public function test_guest_cannot_access_admin_customer_endpoints(): void
    {
        $this->getJson('/api/v1/admin/customers')->assertStatus(401);
    }

    public function test_customer_search_and_status_toggle_and_login_block(): void
    {
        $admin = $this->makeAdmin();
        $customer = $this->makeCustomer(['name' => 'Findable Frank', 'email' => 'frank@example.com']);

        Sanctum::actingAs($admin);
        $found = $this->getJson('/api/v1/admin/customers?search=Frank')->assertStatus(200);
        $this->assertCount(1, $found->json('data'));

        $this->putJson("/api/v1/admin/customers/{$customer->id}/status", ['is_active' => false])
            ->assertStatus(200)
            ->assertJson(['is_active' => false]);

        // Deactivated customer can no longer log in.
        $this->postJson('/api/v1/auth/login', ['email' => 'frank@example.com', 'password' => 'secret123'])
            ->assertStatus(422);
    }

    // ── ANALYTICS ─────────────────────────────────────────────────────

    public function test_admin_receives_real_analytics_and_range_changes_the_period(): void
    {
        Sanctum::actingAs($this->makeAdmin());

        $res7 = $this->getJson('/api/v1/admin/analytics?range=7d')->assertStatus(200);
        $res90 = $this->getJson('/api/v1/admin/analytics?range=90d')->assertStatus(200);

        $this->assertEquals('7d', $res7->json('range'));
        $this->assertEquals('90d', $res90->json('range'));
        $this->assertNotEquals($res7->json('period.start'), $res90->json('period.start'));
        $this->assertArrayHasKey('byStatus', $res7->json('orders'));
        $this->assertArrayHasKey('categoryBreakdown', $res7->json());
    }

    public function test_analytics_rejects_unauthorized_users(): void
    {
        $this->getJson('/api/v1/admin/analytics')->assertStatus(401);
        Sanctum::actingAs($this->makeCustomer());
        $this->getJson('/api/v1/admin/analytics')->assertStatus(403);
    }

    // ── SETTINGS ──────────────────────────────────────────────────────

    public function test_admin_can_update_settings_and_they_persist(): void
    {
        Sanctum::actingAs($this->makeAdmin());

        $payload = [
            'store_name' => 'Updated Market Name',
            'support_email' => 'help@updated.com',
            'support_phone' => '+1 (555) 000-1111',
            'address' => '99 New Address Ave',
            'currency' => 'EGP',
            'allow_guest_checkout' => false,
        ];

        $this->putJson('/api/v1/admin/settings', $payload)->assertStatus(200)->assertJsonFragment(['store_name' => 'Updated Market Name']);

        // Simulate a fresh page load re-fetching settings — must reflect the DB, not a session/cache.
        $refetched = $this->getJson('/api/v1/admin/settings')->assertStatus(200);
        $this->assertEquals('Updated Market Name', $refetched->json('store_name'));
        $this->assertEquals('EGP', $refetched->json('currency'));
        $this->assertFalse($refetched->json('allow_guest_checkout'));
    }

    public function test_customer_cannot_update_settings(): void
    {
        Sanctum::actingAs($this->makeCustomer());
        $this->putJson('/api/v1/admin/settings', [
            'store_name' => 'Hacked', 'support_email' => 'a@a.com', 'support_phone' => '1',
            'address' => 'a', 'currency' => 'USD', 'allow_guest_checkout' => true,
        ])->assertStatus(403);
    }

    // ── SHIPPING ──────────────────────────────────────────────────────

    public function test_admin_can_update_shipping_configuration(): void
    {
        Sanctum::actingAs($this->makeAdmin());
        $standard = ShippingMethod::where('code', 'standard')->firstOrFail();

        $this->putJson("/api/v1/admin/shipping-methods/{$standard->id}", [
            'name' => 'Standard Shipping', 'arabic_name' => 'شحن قياسي', 'price' => 11.50, 'active' => true,
        ])->assertStatus(200)->assertJsonFragment(['price' => '11.50']);

        $this->assertEquals(11.50, ShippingMethod::find($standard->id)->price);
    }

    public function test_checkout_uses_the_admin_configured_shipping_price(): void
    {
        $admin = $this->makeAdmin();
        $product = $this->makeProduct();

        Sanctum::actingAs($admin);
        $express = ShippingMethod::where('code', 'express')->firstOrFail();
        $this->putJson("/api/v1/admin/shipping-methods/{$express->id}", [
            'name' => 'Express Shipping', 'arabic_name' => 'شحن سريع', 'price' => 25.00, 'active' => true,
        ])->assertStatus(200);

        $order = $this->postJson('/api/v1/orders', [
            'customer_name' => 'Jane Doe', 'customer_email' => 'jane2@example.com', 'customer_phone' => '5551234567',
            'shipping_address' => '1 Main St', 'shipping_city' => 'Chicago', 'shipping_state' => 'IL', 'shipping_zip' => '60611',
            'shipping_method' => 'express',
            'items' => [['product_id' => $product->id, 'option' => 'single', 'quantity' => 1]],
            'payment_method' => 'Credit Card (Stripe)',
        ])->assertStatus(201);

        $this->assertEquals(25.00, (float) $order->json('order.shipping_cost'));
    }

    public function test_client_cannot_override_shipping_price_even_after_admin_configures_it(): void
    {
        $product = $this->makeProduct();

        $order = $this->postJson('/api/v1/orders', [
            'customer_name' => 'Jane Doe', 'customer_email' => 'jane3@example.com', 'customer_phone' => '5551234567',
            'shipping_address' => '1 Main St', 'shipping_city' => 'Chicago', 'shipping_state' => 'IL', 'shipping_zip' => '60611',
            'shipping_method' => 'standard',
            'shipping_cost' => 0.00, // attempted manipulation
            'items' => [['product_id' => $product->id, 'option' => 'single', 'quantity' => 1]],
            'payment_method' => 'Credit Card (Stripe)',
        ])->assertStatus(201);

        $this->assertEquals(7.99, (float) $order->json('order.shipping_cost'), 'The seeded standard price must be used, not the client-supplied 0.00.');
    }

    public function test_unauthorized_users_cannot_modify_shipping_configuration(): void
    {
        $standard = ShippingMethod::where('code', 'standard')->firstOrFail();

        $this->putJson("/api/v1/admin/shipping-methods/{$standard->id}", ['name' => 'x', 'arabic_name' => 'x', 'price' => 1, 'active' => true])
            ->assertStatus(401);

        Sanctum::actingAs($this->makeCustomer());
        $this->putJson("/api/v1/admin/shipping-methods/{$standard->id}", ['name' => 'x', 'arabic_name' => 'x', 'price' => 1, 'active' => true])
            ->assertStatus(403);

        $this->assertEquals(7.99, ShippingMethod::find($standard->id)->price, 'Price must be unchanged after rejected attempts.');
    }

    public function test_disabling_a_shipping_method_removes_it_from_checkout(): void
    {
        $admin = $this->makeAdmin();
        $product = $this->makeProduct();

        Sanctum::actingAs($admin);
        $express = ShippingMethod::where('code', 'express')->firstOrFail();
        $this->putJson("/api/v1/admin/shipping-methods/{$express->id}", [
            'name' => 'Express Shipping', 'arabic_name' => 'شحن سريع', 'price' => 14.99, 'active' => false,
        ])->assertStatus(200);

        // Public rates listing should no longer offer it.
        $rates = $this->postJson('/api/v1/checkout/shipping-rates', ['zip' => '60611'])->assertStatus(200);
        $this->assertNotContains('express', collect($rates->json('rates'))->pluck('id')->all());

        // And checkout must reject it outright, not silently charge $0.
        $this->postJson('/api/v1/orders', [
            'customer_name' => 'Jane Doe', 'customer_email' => 'jane4@example.com', 'customer_phone' => '5551234567',
            'shipping_address' => '1 Main St', 'shipping_city' => 'Chicago', 'shipping_state' => 'IL', 'shipping_zip' => '60611',
            'shipping_method' => 'express',
            'items' => [['product_id' => $product->id, 'option' => 'single', 'quantity' => 1]],
            'payment_method' => 'Credit Card (Stripe)',
        ])->assertStatus(422);
    }
}
