<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Phase 4 payment gateway configuration — structural preparation only.
     *
     * This table deliberately stores no secrets. Real API keys (Stripe today,
     * any future provider) live exclusively in the backend .env file / host
     * environment, read via config('services.*') — never in this table, never
     * sent to the frontend. See AppServiceProvider / config/services.php.
     *
     * `active_gateway` and `mode` are informational/preparatory fields for
     * the admin UI. They intentionally are NOT wired into OrderController's
     * actual Stripe integration in this phase — the existing Stripe checkout
     * flow (Phase 1-3) continues to run unconditionally and unchanged. Wiring
     * live gateway switching or a real Cash-on-Delivery checkout path is a
     * checkout-flow behavior change and is out of scope here; see the Phase 4
     * report for the explicit reasoning.
     */
    public function up(): void
    {
        Schema::create('payment_settings', function (Blueprint $table) {
            $table->id();
            $table->boolean('stripe_enabled')->default(true);
            $table->boolean('cod_enabled')->default(false);
            $table->string('active_gateway')->default('stripe');
            $table->string('mode')->default('test'); // 'test' | 'live' — label only, does not rotate keys
            $table->timestamps();
        });

        DB::table('payment_settings')->insert([
            'id' => 1,
            'stripe_enabled' => true,
            'cod_enabled' => false,
            'active_gateway' => 'stripe',
            'mode' => 'test',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_settings');
    }
};
