<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class Phase4PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    private function makeCustomer(array $overrides = []): User
    {
        return User::create(array_merge([
            'name' => 'Reset Customer',
            'email' => 'resetme@example.com',
            'password' => Hash::make('oldpassword123'),
            'role' => 'customer',
        ], $overrides));
    }

    public function test_forgot_password_request_returns_generic_message_for_real_email(): void
    {
        $this->makeCustomer();

        $res = $this->postJson('/api/v1/auth/forgot-password', ['email' => 'resetme@example.com'])
            ->assertStatus(200);

        $this->assertStringContainsString('If an account exists', $res->json('message'));
        $this->assertDatabaseCount('password_reset_tokens', 1);
    }

    /** Anti-enumeration: an email with no account must get the exact same
     *  response shape/message as a real one. */
    public function test_forgot_password_request_is_identical_for_nonexistent_email(): void
    {
        $realRes = $this->postJson('/api/v1/auth/forgot-password', ['email' => 'nobody-here@example.com'])
            ->assertStatus(200);

        $this->assertStringContainsString('If an account exists', $realRes->json('message'));
        // No token row created for a non-existent user.
        $this->assertDatabaseCount('password_reset_tokens', 0);
    }

    public function test_successful_password_reset(): void
    {
        $user = $this->makeCustomer();
        $token = Password::createToken($user);

        $this->postJson('/api/v1/auth/reset-password', [
            'token' => $token,
            'email' => 'resetme@example.com',
            'password' => 'brandnewpassword123',
            'password_confirmation' => 'brandnewpassword123',
        ])->assertStatus(200);

        $user->refresh();
        $this->assertTrue(Hash::check('brandnewpassword123', $user->password));
        $this->assertFalse(Hash::check('oldpassword123', $user->password));
    }

    /** Resetting the password must revoke every existing Sanctum token — this
     *  is a bearer-token architecture, so that's the equivalent of "log out
     *  all sessions" after a reset. */
    public function test_password_reset_revokes_existing_sanctum_tokens(): void
    {
        $user = $this->makeCustomer();
        $user->createToken('old-session-1');
        $user->createToken('old-session-2');
        $this->assertEquals(2, $user->tokens()->count());

        $token = Password::createToken($user);
        $this->postJson('/api/v1/auth/reset-password', [
            'token' => $token,
            'email' => 'resetme@example.com',
            'password' => 'brandnewpassword123',
            'password_confirmation' => 'brandnewpassword123',
        ])->assertStatus(200);

        $this->assertEquals(0, $user->tokens()->count());
    }

    public function test_invalid_token_is_rejected(): void
    {
        $this->makeCustomer();

        $res = $this->postJson('/api/v1/auth/reset-password', [
            'token' => 'this-is-not-a-real-token',
            'email' => 'resetme@example.com',
            'password' => 'brandnewpassword123',
            'password_confirmation' => 'brandnewpassword123',
        ])->assertStatus(400);

        $this->assertStringContainsString('invalid or has expired', $res->json('message'));
    }

    public function test_expired_token_is_rejected(): void
    {
        $user = $this->makeCustomer();
        $token = Password::createToken($user);

        // Backdate the token row past the 60-minute expiry window configured
        // in config/auth.php (passwords.users.expire).
        DB::table('password_reset_tokens')
            ->where('email', 'resetme@example.com')
            ->update(['created_at' => now()->subMinutes(61)]);

        $this->postJson('/api/v1/auth/reset-password', [
            'token' => $token,
            'email' => 'resetme@example.com',
            'password' => 'brandnewpassword123',
            'password_confirmation' => 'brandnewpassword123',
        ])->assertStatus(400);

        $user->refresh();
        $this->assertTrue(Hash::check('oldpassword123', $user->password), 'Password must be unchanged after an expired-token attempt.');
    }

    public function test_password_confirmation_mismatch_is_rejected(): void
    {
        $user = $this->makeCustomer();
        $token = Password::createToken($user);

        $this->postJson('/api/v1/auth/reset-password', [
            'token' => $token,
            'email' => 'resetme@example.com',
            'password' => 'brandnewpassword123',
            'password_confirmation' => 'somethingElse123',
        ])->assertStatus(422);
    }

    /** A token can only ever be used once — Laravel's password broker deletes
     *  it after a successful reset. */
    public function test_reset_token_cannot_be_reused(): void
    {
        $user = $this->makeCustomer();
        $token = Password::createToken($user);

        $this->postJson('/api/v1/auth/reset-password', [
            'token' => $token,
            'email' => 'resetme@example.com',
            'password' => 'firstNewPassword123',
            'password_confirmation' => 'firstNewPassword123',
        ])->assertStatus(200);

        // Same token, second attempt — must fail even though it worked a moment ago.
        $res = $this->postJson('/api/v1/auth/reset-password', [
            'token' => $token,
            'email' => 'resetme@example.com',
            'password' => 'secondNewPassword123',
            'password_confirmation' => 'secondNewPassword123',
        ])->assertStatus(400);

        $this->assertStringContainsString('invalid or has expired', $res->json('message'));

        $user->refresh();
        $this->assertTrue(Hash::check('firstNewPassword123', $user->password), 'The first reset must be the one that stuck.');
    }

    /** A token minted for one email must not reset a different account. */
    public function test_token_cannot_be_used_for_a_different_email(): void
    {
        $user = $this->makeCustomer();
        $other = $this->makeCustomer(['email' => 'someoneelse@example.com', 'password' => Hash::make('theirpassword123')]);
        $token = Password::createToken($user);

        $this->postJson('/api/v1/auth/reset-password', [
            'token' => $token,
            'email' => 'someoneelse@example.com',
            'password' => 'hijacked123',
            'password_confirmation' => 'hijacked123',
        ])->assertStatus(400);

        $other->refresh();
        $this->assertTrue(Hash::check('theirpassword123', $other->password));
    }

    public function test_forgot_password_endpoint_is_rate_limited(): void
    {
        $this->makeCustomer();

        // Route is throttled to 5/min per IP (see routes/api.php).
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/forgot-password', ['email' => 'resetme@example.com'])->assertStatus(200);
        }

        $this->postJson('/api/v1/auth/forgot-password', ['email' => 'resetme@example.com'])
            ->assertStatus(429);
    }
}
