<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShippingMethod extends Model
{
    protected $fillable = [
        'code',
        'name',
        'arabic_name',
        'price',
        'active',
        'display_order',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'active' => 'boolean',
        'display_order' => 'integer',
    ];
}
