<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // How long an unpaid order holds its inventory/coupon-usage reservation.
            // Null once the order is paid (webhook clears it) or cancelled/released
            // (Order::releaseReservation clears it). See OrderController::store()
            // and the orders:release-expired scheduled command.
            $table->timestamp('reserved_until')->nullable()->after('payment_status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('reserved_until');
        });
    }
};
