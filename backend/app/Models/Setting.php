<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    protected $fillable = [
        'store_name',
        'support_email',
        'support_phone',
        'address',
        'currency',
        'allow_guest_checkout',
    ];

    protected $casts = [
        'allow_guest_checkout' => 'boolean',
    ];

    /**
     * The settings table is a singleton — always row id=1. Seeded by the
     * create_settings_table migration; firstOrCreate here is just a safety
     * net in case that row is ever missing.
     */
    public static function current(): self
    {
        return static::firstOrCreate(['id' => 1], [
            'store_name' => 'Arab Market LLC',
            'support_email' => 'support@arabmarket.com',
            'support_phone' => '+1 (800) 555-0100',
            'address' => '1200 Industrial Blvd, Suite A, Brooklyn, NY 11231',
            'currency' => 'USD',
            'allow_guest_checkout' => true,
        ]);
    }
}
