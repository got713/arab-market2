<?php

namespace App\Console\Commands;

use App\Models\Order;
use Illuminate\Console\Command;

class ReleaseExpiredOrderReservations extends Command
{
    protected $signature = 'orders:release-expired';

    protected $description = 'Release inventory and coupon-usage reservations held by pending orders whose payment window has expired, without ever being paid.';

    public function handle(): int
    {
        $expired = Order::where('status', 'pending')
            ->where('payment_status', 'pending')
            ->whereNotNull('reserved_until')
            ->where('reserved_until', '<', now())
            ->get();

        foreach ($expired as $order) {
            $order->releaseReservation();
            $this->info("Released reservation for order {$order->order_number}");
        }

        $this->info("Processed {$expired->count()} expired order reservation(s).");

        return self::SUCCESS;
    }
}
