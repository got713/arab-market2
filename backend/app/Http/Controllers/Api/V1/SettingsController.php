<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingsController extends Controller
{
    // Both routes sit behind auth:sanctum + can:admin-access (see routes/api.php).

    public function show()
    {
        return response()->json(Setting::current());
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'store_name' => 'required|string|max:255',
            'support_email' => 'required|email|max:255',
            'support_phone' => 'required|string|max:30',
            'address' => 'required|string|max:255',
            'currency' => 'required|string|in:USD,EGP,AED',
            'allow_guest_checkout' => 'required|boolean',
        ]);

        $settings = Setting::current();
        $settings->update($validated);

        return response()->json($settings);
    }
}
