<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

/**
 * This backend is API-only (no Blade "login" route exists at all — see
 * routes/web.php / bootstrap/app.php). Laravel's default auth middleware
 * only returns a clean 401 JSON response when it thinks the request "expects
 * json" (Request::expectsJson(), based on the Accept header); otherwise it
 * tries to redirect to route('login'), which doesn't exist here and throws
 * a RouteNotFoundException — turning a routine "not logged in" case into an
 * unhandled 500 for any client that didn't happen to send an Accept header
 * (curl/Postman by default, some HTTP libraries, bots).
 *
 * Forcing the Accept header for every request under /api/* makes that
 * behavior consistent regardless of what the client actually sent.
 */
class ForceJsonResponse
{
    public function handle(Request $request, Closure $next)
    {
        $request->headers->set('Accept', 'application/json');

        return $next($request);
    }
}
