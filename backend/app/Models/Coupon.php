<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Coupon extends Model
{
    protected $fillable = [
        'code',
        'type', // percentage, fixed
        'value',
        'min_order_amount',
        'max_usages',
        'usage_count',
        'active',
        'expires_at',
    ];

    protected $casts = [
        'value' => 'decimal:2',
        'min_order_amount' => 'decimal:2',
        'max_usages' => 'integer',
        'usage_count' => 'integer',
        'active' => 'boolean',
        'expires_at' => 'datetime',
    ];

    public function usages(): HasMany
    {
        return $this->hasMany(CouponUsage::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function isLimitReached(): bool
    {
        return $this->max_usages && $this->usage_count >= $this->max_usages;
    }
}
