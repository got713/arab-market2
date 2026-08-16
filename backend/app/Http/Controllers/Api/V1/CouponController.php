<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    // ── PUBLIC VALIDATE ──────────────────────────────────────────────

    public function validateCoupon(Request $request)
    {
        $request->validate([
            'code' => 'required|string',
            'order_subtotal' => 'required|numeric|min:0',
        ]);

        $coupon = Coupon::where('code', strtoupper($request->code))->first();

        if (!$coupon) {
            return response()->json([
                'valid' => false,
                'message' => is_rtl() ? 'كود الخصم غير موجود.' : 'Coupon code is invalid.'
            ], 404);
        }

        if (!$coupon->active) {
            return response()->json([
                'valid' => false,
                'message' => is_rtl() ? 'كود الخصم غير نشط حالياً.' : 'Coupon code is inactive.'
            ], 400);
        }

        if ($coupon->isExpired()) {
            return response()->json([
                'valid' => false,
                'message' => is_rtl() ? 'لقد انتهت صلاحية كود الخصم.' : 'Coupon code is expired.'
            ], 400);
        }

        if ($coupon->isLimitReached()) {
            return response()->json([
                'valid' => false,
                'message' => is_rtl() ? 'تم استنفاد الحد الأقصى لاستخدام الكوبون.' : 'Coupon usage limit has been reached.'
            ], 400);
        }

        if ($request->order_subtotal < $coupon->min_order_amount) {
            return response()->json([
                'valid' => false,
                'message' => is_rtl() 
                    ? 'الحد الأدنى لتطبيق هذا الكوبون هو $' . number_format($coupon->min_order_amount, 2)
                    : 'Minimum order amount for this coupon is $' . number_format($coupon->min_order_amount, 2)
            ], 400);
        }

        // Calculate discount
        $discount = 0.00;
        if ($coupon->type === 'percentage') {
            $discount = round(($request->order_subtotal * $coupon->value) / 100, 2);
        } else {
            $discount = (float) $coupon->value;
        }

        // Clamp discount to order subtotal
        $discount = min($discount, (float)$request->order_subtotal);

        return response()->json([
            'valid' => true,
            'code' => $coupon->code,
            'type' => $coupon->type,
            'value' => (float)$coupon->value,
            'discount_amount' => $discount,
            'message' => is_rtl() ? 'تم تطبيق كود الخصم بنجاح!' : 'Coupon applied successfully!'
        ]);
    }

    // ── ADMIN CRUD ───────────────────────────────────────────────────

    public function index()
    {
        return response()->json(Coupon::orderBy('id', 'desc')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'code' => 'required|string|max:50|unique:coupons,code',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_usages' => 'nullable|integer|min:1',
            'active' => 'nullable|boolean',
            'expires_at' => 'nullable|date',
        ]);

        $coupon = Coupon::create([
            'code' => strtoupper($request->code),
            'type' => $request->type,
            'value' => $request->value,
            'min_order_amount' => $request->min_order_amount ?? 0.00,
            'max_usages' => $request->max_usages,
            'active' => $request->active ?? true,
            'expires_at' => $request->expires_at,
        ]);

        return response()->json($coupon, 201);
    }

    public function update(Request $request, $id)
    {
        $coupon = Coupon::findOrFail($id);

        $request->validate([
            'code' => 'required|string|max:50|unique:coupons,code,' . $coupon->id,
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'min_order_amount' => 'nullable|numeric|min:0',
            'max_usages' => 'nullable|integer|min:1',
            'active' => 'nullable|boolean',
            'expires_at' => 'nullable|date',
        ]);

        $coupon->update([
            'code' => strtoupper($request->code),
            'type' => $request->type,
            'value' => $request->value,
            'min_order_amount' => $request->min_order_amount ?? 0.00,
            'max_usages' => $request->max_usages,
            'active' => $request->active ?? $coupon->active,
            'expires_at' => $request->expires_at,
        ]);

        return response()->json($coupon);
    }

    public function destroy($id)
    {
        $coupon = Coupon::findOrFail($id);
        $coupon->delete();

        return response()->json([
            'message' => 'Coupon deleted successfully'
        ]);
    }
}

// Helper locale lookup
if (!function_exists('is_rtl')) {
    function is_rtl() {
        return request()->header('Accept-Language') === 'ar';
    }
}
