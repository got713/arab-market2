<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Phase 4 "selling unit" — deliberately NOT a variant/conversion system.
     * A product is sold as either a Piece or a Carton; the admin picks which,
     * and the quantity a customer buys always means exactly that many of
     * that unit (2 x Carton = 2 Cartons, never "48 pieces"). This is additive
     * metadata layered on top of the existing single/pack/case pricing-tier
     * system (unchanged) — it drives the display label for the "single" tier
     * specifically, not a parallel product model.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('selling_unit')->default('piece')->after('weight');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('selling_unit');
        });
    }
};
