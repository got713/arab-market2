<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Shippo integration — a Shipment row already exists per order (carrier,
     * tracking_number, status). These three columns let it also record which
     * Shippo rate the customer picked at checkout and, once the admin buys
     * the label, the resulting label PDF + Shippo transaction id (needed if
     * the label ever has to be refunded/voided through Shippo later).
     */
    public function up(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            $table->string('shippo_rate_id')->nullable()->after('carrier');
            $table->string('shippo_transaction_id')->nullable()->after('shippo_rate_id');
            $table->text('label_url')->nullable()->after('shippo_transaction_id');
        });
    }

    public function down(): void
    {
        Schema::table('shipments', function (Blueprint $table) {
            $table->dropColumn(['shippo_rate_id', 'shippo_transaction_id', 'label_url']);
        });
    }
};
