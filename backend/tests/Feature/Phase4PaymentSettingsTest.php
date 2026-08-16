<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class Phase4PaymentSettingsTest extends TestCase
{
    use RefreshDatabase;

    private function makeAdmin(): User
    {
        return User::create(['name' => 'Admin', 'email' => 'admin-pay@example.com', 'password' => Hash::make('secret123'), 'role' => 'admin']);
    }

    private function makeCustomer(): User
    {
        return User::create(['name' => 'Customer', 'email' => 'cust-pay@example.com', 'password' => Hash::make('secret123'), 'role' => 'customer']);
    }

    public function test_admin_can_view_default_payment_settings(): void
    {
        Sanctum::actingAs($this->makeAdmin());

        $res = $this->getJson('/api/v1/admin/payment-settings');

        $res->assertStatus(200)
            ->assertJson([
                'stripeEnabled' => true,
                'codEnabled' => false,
                'activeGateway' => 'stripe',
                'mode' => 'test',
            ]);
        // Never leaks secret key material.
        $res->assertJsonMissingPath('secret');
        $res->assertJsonMissingPath('stripeSecret');
        $res->assertJsonMissingPath('apiKey');
    }

    public function test_admin_can_update_payment_settings(): void
    {
        Sanctum::actingAs($this->makeAdmin());

        $res = $this->putJson('/api/v1/admin/payment-settings', [
            'stripe_enabled' => true,
            'cod_enabled' => true,
            'active_gateway' => 'stripe',
            'mode' => 'live',
        ]);

        $res->assertStatus(200)
            ->assertJson(['codEnabled' => true, 'mode' => 'live']);

        $this->getJson('/api/v1/admin/payment-settings')
            ->assertJson(['codEnabled' => true, 'mode' => 'live']);
    }

    public function test_at_least_one_payment_method_must_remain_enabled(): void
    {
        Sanctum::actingAs($this->makeAdmin());

        $res = $this->putJson('/api/v1/admin/payment-settings', [
            'stripe_enabled' => false,
            'cod_enabled' => false,
            'active_gateway' => 'stripe',
            'mode' => 'test',
        ]);

        $res->assertStatus(422);
    }

    public function test_unconnected_gateway_cannot_be_selected_as_active(): void
    {
        Sanctum::actingAs($this->makeAdmin());

        $res = $this->putJson('/api/v1/admin/payment-settings', [
            'stripe_enabled' => true,
            'cod_enabled' => false,
            'active_gateway' => 'paymob',
            'mode' => 'test',
        ]);

        $res->assertStatus(422);
    }

    public function test_invalid_gateway_value_is_rejected(): void
    {
        Sanctum::actingAs($this->makeAdmin());

        $res = $this->putJson('/api/v1/admin/payment-settings', [
            'stripe_enabled' => true,
            'cod_enabled' => false,
            'active_gateway' => 'made-up-gateway',
            'mode' => 'test',
        ]);

        $res->assertStatus(422);
    }

    public function test_customer_cannot_view_or_update_payment_settings(): void
    {
        Sanctum::actingAs($this->makeCustomer());

        $this->getJson('/api/v1/admin/payment-settings')->assertStatus(403);
        $this->putJson('/api/v1/admin/payment-settings', [
            'stripe_enabled' => true, 'cod_enabled' => false, 'active_gateway' => 'stripe', 'mode' => 'test',
        ])->assertStatus(403);
    }

    public function test_guest_cannot_view_payment_settings(): void
    {
        $this->getJson('/api/v1/admin/payment-settings')->assertStatus(401);
    }
}
