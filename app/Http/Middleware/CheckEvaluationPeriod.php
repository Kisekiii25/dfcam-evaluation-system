<?php

namespace App\Http\Middleware;

use App\Models\EvaluationSetting;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckEvaluationPeriod
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = Auth::user();

        // 1. Force Admins/Super-Admins off student evaluation pages entirely
        if ($user && in_array($user->role, ['admin', 'super-admin'])) {
            return redirect()->route('dashboard');
        }

        // 2. Allow access to the closed notice route to prevent infinite loops
        if ($request->routeIs('evaluation.closed')) {
            return $next($request);
        }

        // 3. Query active settings handling boolean, integer (1), or string ('1') DB types
        $settings = EvaluationSetting::where('is_active', true)
            ->orWhere('is_active', 1)
            ->orWhere('is_active', '1')
            ->first();

        // 4. If no active setting exists or the evaluation window is closed, redirect
        if (! $settings || ! $settings->isOpen()) {
            return redirect()->route('evaluation.closed');
        }

        return $next($request);
    }
}
