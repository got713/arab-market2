<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ShippingMethod;
use Illuminate\Http\Request;

class ShippingMethodController extends Controller
{
    // Admin-only CRUD over shipping prices. Sits behind auth:sanctum +
    // can:admin-access (see routes/api.php). This is the ONLY place shipping
    // prices are written — OrderController::resolveShippingCost() /
    // getShippingRates() only ever read them, never accept a price from a
    // checkout request. See OrderController for that side of the boundary.

    public function index()
    {
        return response()->json(
            ShippingMethod::orderBy('display_order')->orderBy('id')->get()
        );
    }

    public function update(Request $request, $id)
    {
        $method = ShippingMethod::findOrFail($id);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'arabic_name' => 'required|string|max:255',
            'price' => 'required|numeric|min:0|max:1000',
            'active' => 'required|boolean',
        ]);

        $method->update($validated);

        return response()->json($method);
    }
}
