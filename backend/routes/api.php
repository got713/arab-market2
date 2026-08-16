<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\CartController;
use App\Http\Controllers\Api\V1\WishlistController;
use App\Http\Controllers\Api\V1\CouponController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\AnalyticsController;

// ── V1 API ROUTES ───────────────────────────────────────────────────────────
Route::prefix('v1')->group(function () {

    // ── Public Routes
    // Auth endpoints are brute-force targets — throttle separately and more tightly
    // than the general API rate limit.
    Route::middleware('throttle:10,1')->group(function () {
        Route::post('/auth/register', [AuthController::class, 'register']);
        Route::post('/auth/login', [AuthController::class, 'login']);
    });

    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{slug}', [CategoryController::class, 'show']);

    Route::get('/products', [ProductController::class, 'index']);
    Route::get('/products/{id}', [ProductController::class, 'show']);

    Route::middleware('throttle:20,1')->post('/coupons/validate', [CouponController::class, 'validateCoupon']);
    Route::post('/checkout/shipping-rates', [OrderController::class, 'getShippingRates']);

    // Order placement & guest tracking — throttled to slow down scripted abuse /
    // order-number-guessing against the tracking endpoint.
    Route::middleware('throttle:15,1')->post('/orders', [OrderController::class, 'store']);
    Route::middleware('throttle:20,1')->get('/orders/track/{orderNumber}', [OrderController::class, 'track']);

    // Stripe payments webhook. NOTE: this is protected by signature verification
    // inside the controller (see OrderController::stripeWebhook), not auth
    // middleware — Stripe can't send a Sanctum bearer token. The throttle here is a
    // secondary defense-in-depth measure only.
    Route::middleware('throttle:60,1')->post('/payments/stripe/webhook', [OrderController::class, 'stripeWebhook']);

    // Stripe PaymentIntent creation must be public: guest checkout (no account) is
    // a supported flow (see /orders above), so this can't require auth:sanctum —
    // it was previously nested under the auth group, which silently broke payment
    // for every guest checkout. Ownership isn't an issue here since it only acts on
    // an order that was just created with a matching order_number.
    Route::middleware('throttle:15,1')->post('/payments/stripe/intent', [OrderController::class, 'createPaymentIntent']);

    // ── Protected Routes (Sanctum)
    Route::middleware('auth:sanctum')->group(function () {
        
        // Auth profile & address management
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
        
        Route::get('/auth/addresses', [AuthController::class, 'getAddresses']);
        Route::post('/auth/addresses', [AuthController::class, 'createAddress']);
        Route::put('/auth/addresses/{id}', [AuthController::class, 'updateAddress']);
        Route::delete('/auth/addresses/{id}', [AuthController::class, 'deleteAddress']);

        // User cart system
        Route::get('/cart', [CartController::class, 'index']);
        Route::post('/cart/add', [CartController::class, 'add']);
        Route::put('/cart/items/{id}', [CartController::class, 'update']);
        Route::delete('/cart/items/{id}', [CartController::class, 'remove']);
        Route::post('/cart/sync', [CartController::class, 'sync']);
        Route::post('/cart/clear', [CartController::class, 'clear']);

        // User wishlist
        Route::get('/wishlist', [WishlistController::class, 'index']);
        Route::post('/wishlist', [WishlistController::class, 'toggle']);

        // User order history
        Route::get('/orders/my', [OrderController::class, 'myOrders']);

        // ── Admin-Only Routes
        Route::middleware('can:admin-access')->group(function () {
            
            // Category management
            Route::post('/admin/categories', [CategoryController::class, 'storeCategory']);
            Route::put('/admin/categories/{id}', [CategoryController::class, 'updateCategory']);
            Route::delete('/admin/categories/{id}', [CategoryController::class, 'destroyCategory']);
            
            // Subcategory management
            Route::post('/admin/categories/{categoryId}/subcategories', [CategoryController::class, 'storeSubcategory']);
            Route::put('/admin/categories/{categoryId}/subcategories/{slug}', [CategoryController::class, 'updateSubcategory']);
            Route::delete('/admin/categories/{categoryId}/subcategories/{slug}', [CategoryController::class, 'destroySubcategory']);
            
            // Product CRUD
            Route::post('/admin/products', [ProductController::class, 'store']);
            Route::put('/admin/products/{id}', [ProductController::class, 'update']);
            Route::delete('/admin/products/{id}', [ProductController::class, 'destroy']);
            
            // Orders admin
            Route::get('/admin/orders', [OrderController::class, 'adminOrders']);
            Route::put('/admin/orders/{id}/status', [OrderController::class, 'updateOrderStatus']);
            
            // Coupon CRUD
            Route::get('/admin/coupons', [CouponController::class, 'index']);
            Route::post('/admin/coupons', [CouponController::class, 'store']);
            Route::put('/admin/coupons/{id}', [CouponController::class, 'update']);
            Route::delete('/admin/coupons/{id}', [CouponController::class, 'destroy']);

            // Inventory tracking
            Route::get('/admin/inventory', [AnalyticsController::class, 'inventoryList']);
            
            // Sales & operational metrics
            Route::get('/admin/analytics', [AnalyticsController::class, 'summary']);
        });

    });

});
