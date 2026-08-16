<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Give back inventory/coupon usage held by checkouts that never paid — see
// App\Models\Order::releaseReservation() and OrderController::RESERVATION_MINUTES.
// Requires the Laravel scheduler to actually be running (`schedule:work` in dev,
// or a single cron entry calling `schedule:run` every minute in production).
Schedule::command('orders:release-expired')->everyFiveMinutes();
