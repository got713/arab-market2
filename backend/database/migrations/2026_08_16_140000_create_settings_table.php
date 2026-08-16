<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Singleton table — a single row (id=1) holding the store-wide settings
        // the admin Settings page edits. Deliberately flat/scalar (not a
        // key-value store) since this mirrors exactly the fields the existing
        // Settings UI already collects — nothing invented beyond that.
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('store_name');
            $table->string('support_email');
            $table->string('support_phone');
            $table->string('address');
            $table->string('currency', 10)->default('USD');
            $table->boolean('allow_guest_checkout')->default(true);
            $table->timestamps();
        });

        DB::table('settings')->insert([
            'id' => 1,
            'store_name' => 'Arab Market LLC',
            'support_email' => 'support@arabmarket.com',
            'support_phone' => '+1 (800) 555-0100',
            'address' => '1200 Industrial Blvd, Suite A, Brooklyn, NY 11231',
            'currency' => 'USD',
            'allow_guest_checkout' => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
