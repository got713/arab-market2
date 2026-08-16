<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Replaces the hardcoded zip-prefix price tiers previously computed
        // inline in OrderController — those numbers were never surfaced to an
        // admin and had already drifted out of sync with what the checkout UI
        // actually displayed to customers (a flat $7.99 / $14.99, regardless of
        // zip). This table is the single, admin-editable source of truth for
        // both what customers see and what checkout charges.
        Schema::create('shipping_methods', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // 'standard' | 'express'
            $table->string('name');
            $table->string('arabic_name');
            $table->decimal('price', 10, 2);
            $table->boolean('active')->default(true);
            $table->integer('display_order')->default(0);
            $table->timestamps();
        });

        $now = now();
        DB::table('shipping_methods')->insert([
            [
                'code' => 'standard',
                'name' => 'Standard Shipping',
                'arabic_name' => 'شحن قياسي',
                'price' => 7.99,
                'active' => true,
                'display_order' => 0,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'code' => 'express',
                'name' => 'Express Shipping',
                'arabic_name' => 'شحن سريع',
                'price' => 14.99,
                'active' => true,
                'display_order' => 10,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('shipping_methods');
    }
};
