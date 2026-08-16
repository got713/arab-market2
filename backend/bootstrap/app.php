<?php

use App\Http\Middleware\ForceJsonResponse;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // API-only backend, no "login" route exists — see ForceJsonResponse
        // for why this is needed to avoid a 500 on unauthenticated requests
        // that don't send an Accept: application/json header.
        $middleware->api(prepend: [ForceJsonResponse::class]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Defense in depth against APP_DEBUG being left on by mistake outside
        // local development: Laravel's default JSON error response includes the
        // exception class, file path, line number, and full stack trace whenever
        // config('app.debug') is true, regardless of APP_ENV. If that
        // misconfiguration ever reaches a real deployment, strip the response
        // back down to a safe generic message instead of leaking internals to
        // API clients. Local/testing behavior is completely unaffected.
        $exceptions->render(function (\Throwable $e, $request) {
            $isApi = $request->is('api/*') || $request->expectsJson();
            $misconfiguredDebug = config('app.debug') && !app()->environment(['local', 'testing']);

            if (!$isApi || !$misconfiguredDebug) {
                return null; // fall through to Laravel's normal handling
            }

            if ($e instanceof \Illuminate\Validation\ValidationException) {
                return response()->json([
                    'message' => $e->getMessage(),
                    'errors' => $e->errors(),
                ], 422);
            }

            $status = method_exists($e, 'getStatusCode') ? $e->getStatusCode() : 500;
            $message = $status === 500
                ? 'Something went wrong. Please try again.'
                : ($e->getMessage() ?: 'An error occurred.');

            return response()->json(['message' => $message], $status);
        });
    })->create();
