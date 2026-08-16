<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Phase4ApiErrorFormatTest extends TestCase
{
    use RefreshDatabase;

    // Regression test for a real bug found during Phase 4 manual smoke
    // testing: hitting a protected /api/* route WITHOUT an explicit
    // Accept: application/json header (the default for curl/Postman/many
    // HTTP clients) crashed with a 500 "Route [login] not defined" instead
    // of a clean 401, because this backend has no web login route to
    // redirect unauthenticated users to. Fixed via ForceJsonResponse
    // middleware (see bootstrap/app.php). Deliberately uses the raw get()
    // helper here (not getJson()) so this test actually exercises a request
    // without the Accept header, unlike the rest of the suite.
    public function test_unauthenticated_admin_request_without_accept_header_returns_clean_401(): void
    {
        $res = $this->get('/api/v1/admin/payment-settings');

        $res->assertStatus(401);
        $res->assertHeader('content-type', 'application/json');
        $res->assertJson(['message' => 'Unauthenticated.']);
    }

    public function test_unauthenticated_settings_request_without_accept_header_returns_clean_401(): void
    {
        $res = $this->get('/api/v1/admin/settings');

        $res->assertStatus(401);
        $res->assertJson(['message' => 'Unauthenticated.']);
    }
}
