<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Facades\DB;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'order_number',
        'customer_name',
        'customer_email',
        'customer_phone',
        'shipping_address',
        'shipping_city',
        'shipping_state',
        'shipping_zip',
        'shipping_method',
        'subtotal',
        'discount',
        'shipping_cost',
        'tax',
        'total',
        'payment_method',
        'payment_status',
        'status',
        'tracking_number',
        'notes',
        'reserved_until',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'discount' => 'decimal:2',
        'shipping_cost' => 'decimal:2',
        'tax' => 'decimal:2',
        'total' => 'decimal:2',
        'reserved_until' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function shipment(): HasOne
    {
        return $this->hasOne(Shipment::class);
    }

    /**
     * Give back the inventory and coupon-usage slot this order reserved at
     * checkout, and mark it cancelled/unpaid. Used for orders whose payment
     * never completed within the reservation window (see
     * OrderController::RESERVATION_MINUTES and the orders:release-expired
     * command) — this is what stops an abandoned, never-paid checkout from
     * permanently locking up real stock or a limited-use coupon code.
     *
     * Safe to call more than once (idempotent) and safe to call concurrently
     * with the Stripe webhook resolving the same order — both paths lock the
     * order row first and no-op if it's already paid or already cancelled.
     */
    public function releaseReservation(): void
    {
        DB::transaction(function () {
            $order = self::where('id', $this->id)->lockForUpdate()->first();

            if (!$order || $order->payment_status === 'paid' || $order->status === 'cancelled') {
                return;
            }

            foreach ($order->items as $item) {
                $product = $item->product;
                if (!$product) {
                    continue;
                }

                $multiplier = 1;
                if ($item->option === 'pack') {
                    $multiplier = $product->pack_quantity;
                } elseif ($item->option === 'case') {
                    $multiplier = $product->case_quantity;
                }

                $inventory = $product->inventory()->lockForUpdate()->first();
                if ($inventory) {
                    $inventory->stock_quantity += ($item->quantity * $multiplier);
                    $inventory->save();
                }
            }

            $couponUsage = CouponUsage::where('order_id', $order->id)->first();
            if ($couponUsage) {
                $coupon = Coupon::lockForUpdate()->find($couponUsage->coupon_id);
                if ($coupon && $coupon->usage_count > 0) {
                    $coupon->decrement('usage_count');
                }
                $couponUsage->delete();
            }

            $order->status = 'cancelled';
            $order->payment_status = 'failed';
            $order->reserved_until = null;
            $order->save();
        });
    }
}
