<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Product extends Model
{
    protected $fillable = [
        'category_id',
        'subcategory_id',
        'name',
        'arabic_name',
        'slug',
        'brand',
        'sku',
        'description',
        'arabic_description',
        'weight',
        'ingredients',
        'allergens',
        'price',
        'pack_price',
        'pack_quantity',
        'case_price',
        'case_quantity',
        'featured',
        'best_seller',
        'weekly_deal',
        'active',
        'rating',
        'country',
    ];

    protected $casts = [
        'price' => 'decimal:2',
        'pack_price' => 'decimal:2',
        'case_price' => 'decimal:2',
        'pack_quantity' => 'integer',
        'case_quantity' => 'integer',
        'featured' => 'boolean',
        'best_seller' => 'boolean',
        'weekly_deal' => 'boolean',
        'active' => 'boolean',
        'rating' => 'decimal:2',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function subcategory(): BelongsTo
    {
        return $this->belongsTo(Subcategory::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function inventory(): HasOne
    {
        return $this->hasOne(Inventory::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class)->where('status', 'approved');
    }
}
