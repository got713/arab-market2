<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Indexes for columns that are actually filtered/grouped on in real,
     * existing queries (not speculative) — AnalyticsController groups and
     * range-filters on orders.status/payment_status/created_at, the
     * orders:release-expired command filters on the same status/payment_status
     * pair, and every public catalog request filters products.active.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->index(['status', 'payment_status']);
            $table->index('created_at');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->index('active');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['status', 'payment_status']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['active']);
        });
    }
};
