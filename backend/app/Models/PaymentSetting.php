<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentSetting extends Model
{
    protected $fillable = [
        'stripe_enabled',
        'cod_enabled',
        'active_gateway',
        'mode',
    ];

    protected $casts = [
        'stripe_enabled' => 'boolean',
        'cod_enabled' => 'boolean',
    ];

    /**
     * Singleton row (id=1), same pattern as Setting::current().
     */
    public static function current(): self
    {
        return static::firstOrCreate(['id' => 1], [
            'stripe_enabled' => true,
            'cod_enabled' => false,
            'active_gateway' => 'stripe',
            'mode' => 'test',
        ]);
    }
}
