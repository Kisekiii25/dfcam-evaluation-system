<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePasswordIsChanged
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->must_change_password) {
            // Allow access strictly to password update routes and logout
            if (! $request->routeIs('password.force-change', 'password.force-change.update', 'logout')) {
                return redirect()->route('password.force-change');
            }
        } elseif ($user && ! $user->must_change_password && $request->routeIs('password.force-change')) {
            // Prevent users who have already updated their password from staying on this screen
            $redirectRoute = $user->role === 'admin' ? 'admin.dashboard' : 'dashboard';

            return redirect()->route($redirectRoute);
        }

        return $next($request);
    }
}
