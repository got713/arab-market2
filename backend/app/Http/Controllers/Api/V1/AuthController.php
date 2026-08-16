<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Password;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'customer',
            'phone' => $request->phone,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|string|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => [is_rtl_locale() ? 'بيانات الاعتماد المدخلة غير صحيحة.' : 'The provided credentials are incorrect.'],
            ]);
        }

        if (!$user->is_active) {
            throw ValidationException::withMessages([
                'email' => [is_rtl_locale() ? 'تم تعطيل هذا الحساب. برجاء التواصل مع الدعم الفني.' : 'This account has been deactivated. Please contact support.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ]);
    }

    // ── PASSWORD RESET ────────────────────────────────────────────────
    //
    // SECURITY: both endpoints return the exact same generic response whether
    // or not the email exists — never let the response shape/content reveal
    // account existence (account enumeration). Route-level throttle (see
    // routes/api.php) plus Laravel's own broker throttle (60s between
    // requests for the same email, config/auth.php `passwords.users.throttle`)
    // both apply.

    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        // Deliberately ignore the return status ($status would reveal whether
        // the email exists) — always respond with the same generic message.
        Password::sendResetLink($request->only('email'));

        return response()->json([
            'message' => is_rtl_locale()
                ? 'إذا كان هناك حساب مرتبط بهذا البريد الإلكتروني، فسيتم إرسال رابط إعادة تعيين كلمة المرور إليه.'
                : 'If an account exists for this email, a password reset link has been sent.',
        ]);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'email' => 'required|email',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill(['password' => Hash::make($password)])->save();

                // Resetting the password invalidates every existing session —
                // this is a bearer-token (Sanctum) architecture, so that means
                // revoking every previously issued personal access token. This
                // protects against a stolen/leaked token surviving a reset.
                $user->tokens()->delete();

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            // Same generic wording for "invalid token", "expired token", and
            // "unknown email" — none of these should be distinguishable to the
            // caller.
            return response()->json([
                'message' => is_rtl_locale()
                    ? 'رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية.'
                    : 'This password reset link is invalid or has expired.',
            ], 400);
        }

        return response()->json([
            'message' => is_rtl_locale() ? 'تم تحديث كلمة المرور بنجاح.' : 'Your password has been reset successfully.',
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Successfully logged out'
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:8|confirmed',
        ]);

        $user->name = $request->name;
        $user->phone = $request->phone;

        if ($request->filled('password')) {
            $user->password = Hash::make($request->password);
        }

        $user->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }

    // ── ADDRESS MANAGEMENT ───────────────────────────────────────────

    public function getAddresses(Request $request)
    {
        return response()->json($request->user()->addresses()->orderBy('is_default', 'desc')->get());
    }

    public function createAddress(Request $request)
    {
        $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'address_line_1' => 'required|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'zip' => 'required|string|max:20',
            'is_default' => 'nullable|boolean',
        ]);

        $user = $request->user();

        if ($request->is_default) {
            $user->addresses()->update(['is_default' => false]);
        }

        $address = $user->addresses()->create([
            'first_name' => $request->first_name,
            'last_name' => $request->last_name,
            'email' => $request->email,
            'phone' => $request->phone,
            'address_line_1' => $request->address_line_1,
            'address_line_2' => $request->address_line_2,
            'city' => $request->city,
            'state' => $request->state,
            'zip' => $request->zip,
            'is_default' => $request->is_default ?? false,
        ]);

        return response()->json($address, 201);
    }

    public function updateAddress(Request $request, $id)
    {
        // Ownership is enforced by scoping the lookup through the authenticated
        // user's own addresses() relation — findOrFail() 404s for any address
        // that isn't theirs, regardless of what id is requested.
        $address = $request->user()->addresses()->findOrFail($id);

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'address_line_1' => 'required|string|max:255',
            'address_line_2' => 'nullable|string|max:255',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'zip' => 'required|string|max:20',
            'is_default' => 'nullable|boolean',
        ]);

        if ($request->is_default) {
            $request->user()->addresses()->update(['is_default' => false]);
        }

        // Only the validated field set is written — never $request->all(), which
        // would let a client slip an extra `user_id` (or any other column) into
        // the update and reassign this address to a different account.
        $address->update($validated);

        return response()->json($address);
    }

    public function deleteAddress(Request $request, $id)
    {
        $address = $request->user()->addresses()->findOrFail($id);
        $address->delete();

        return response()->json([
            'message' => 'Address deleted successfully'
        ]);
    }
}

// Helper locale lookup
if (!function_exists('is_rtl_locale')) {
    function is_rtl_locale() {
        return request()->header('Accept-Language') === 'ar';
    }
}
