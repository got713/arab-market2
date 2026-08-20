<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Shippo integration — the existing `weight` column is a free-text
     * display string ("750ml", "1kg", ...), not something a shipping-rate
     * API can compute with. This adds a real numeric weight in ounces used
     * only for rate calculation; nullable because most products don't have
     * it filled in yet — ShippoService falls back to a per-category default
     * when it's null (see catalog:apply-default-weights).
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->decimal('weight_oz', 8, 2)->nullable()->after('weight');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('weight_oz');
        });
    }
};
