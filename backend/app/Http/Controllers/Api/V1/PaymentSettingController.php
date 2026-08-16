<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PaymentSetting;
use Illuminate\Http\Request;

class PaymentSettingController extends Controller
{
    // Both routes sit behind auth:sanctum + can:admin-access (see routes/api.php).
    //
    // IMPORTANT: this endpoint never accepts or returns secret API keys.
    // Real Stripe credentials are configured exclusively via the backend
    // .env file (see config/services.php) and are never stored in the
    // database or exposed to any frontend request. `active_gateway` only
    // records which provider the admin *intends* to use — it does not
    // currently change which provider the checkout flow calls (see the
    // migration comment and the Phase 4 report for why).

    private const VALID_GATEWAYS = ['stripe', 'paymob'];

    public function show()
    {
        return response()->json($this->format(PaymentSetting::current()));
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'stripe_enabled' => 'required|boolean',
            'cod_enabled' => 'required|boolean',
            'active_gateway' => 'required|string|in:' . implode(',', self::VALID_GATEWAYS),
            'mode' => 'required|string|in:test,live',
        ]);

        if (!$validated['stripe_enabled'] && !$validated['cod_enabled']) {
            return response()->json([
                'message' => 'At least one payment method (Stripe or Cash on Delivery) must remain enabled.',
            ], 422);
        }

        // Paymob (or any future provider) has no real backend integration
        // yet — selecting it here only records admin intent for when that
        // integration is actually built; it must not be presented as a live,
        // working gateway.
        if ($validated['active_gateway'] === 'paymob') {
            return response()->json([
                'message' => 'Paymob is not connected yet. Add its backend integration before selecting it as the active gateway.',
            ], 422);
        }

        $settings = PaymentSetting::current();
        $settings->update($validated);

        return response()->json($this->format($settings));
    }

    private function format(PaymentSetting $settings): array
    {
        return [
            'stripeEnabled' => $settings->stripe_enabled,
            'codEnabled' => $settings->cod_enabled,
            'activeGateway' => $settings->active_gateway,
            'mode' => $settings->mode,
            'availableGateways' => self::VALID_GATEWAYS,
            // Tells the admin UI whether the selected gateway actually has a
            // working backend integration right now.
            'connectedGateways' => ['stripe'],
        ];
    }
}
