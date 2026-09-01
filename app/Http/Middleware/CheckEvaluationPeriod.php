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
        // 1. Bypass check if the user is an Admin or Super Admin
        $user = Auth::user();
        if ($user && in_array($user->role, ['admin', 'super-admin'])) {
            return $next($request);
        }

        // 2. Allow access to the closed notice route to prevent infinite redirect loops
        if ($request->routeIs('evaluation.closed')) {
            return $next($request);
        }

        // 3. Fetch ONLY active settings (Remove fallback to EvaluationSetting::first())
        $settings = EvaluationSetting::where('is_active', true)->first();

        // 4. If no active setting exists or the date window is closed, redirect
        if (! $settings || ! $settings->isOpen()) {
            return redirect()->route('evaluation.closed');
        }

        return $next($request);
    }
}
