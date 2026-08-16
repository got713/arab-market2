<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    protected $fillable = [
        'name',
        'arabic_name',
        'slug',
        'description',
        'arabic_description',
        'image',
        'icon',
        'active',
        'featured',
        'display_order',
    ];

    protected $casts = [
        'active' => 'boolean',
        'featured' => 'boolean',
        'display_order' => 'integer',
    ];

    public function subcategories(): HasMany
    {
        return $this->hasMany(Subcategory::class)->orderBy('display_order', 'asc');
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
