<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

use Illuminate\Support\Facades\Gate;
use Illuminate\Auth\Notifications\ResetPassword;
use App\Models\User;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::define('admin-access', function (User $user) {
            return $user->role === 'admin';
        });

        // This is a decoupled API — there is no Laravel Blade "password.reset"
        // web route for the default ResetPassword notification to link to (and
        // registering a fake one just for URL generation would be a hack). Point
        // the reset link straight at the Next.js frontend's /reset-password page
        // instead, carrying the same token+email query params it needs.
        ResetPassword::createUrlUsing(function (User $user, string $token) {
            $frontendUrl = rtrim(config('app.frontend_url'), '/');
            return "{$frontendUrl}/reset-password?token={$token}&email=" . urlencode($user->email);
        });
    }
}
