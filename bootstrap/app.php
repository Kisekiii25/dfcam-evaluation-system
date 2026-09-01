<?php

use App\Http\Middleware\AdminMiddleware;
use App\Http\Middleware\CheckEvaluationPeriod;
use App\Http\Middleware\EnsurePasswordIsChanged;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // Trust all proxies for Render load balancing & HTTPS termination
        $middleware->trustProxies(at: '*');

        $middleware->web(append: [
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
        $middleware->alias([
            'evaluation_open' => CheckEvaluationPeriod::class,
            'admin' => AdminMiddleware::class,
            'force_password_change' => EnsurePasswordIsChanged::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
