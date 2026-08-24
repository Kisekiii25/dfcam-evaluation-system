<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // 1. Unauthenticated users must be sent to login first
        if (! Auth::check()) {
            return redirect()->guest(route('login'));
        }

        $user = Auth::user();

        // 2. Allow access for authorized admin roles
        if ($user->role === 'admin' || $user->role === 'super-admin') {
            return $next($request);
        }

        // 3. Authenticated non-admin users (students) are redirected to their dashboard
        return redirect()->route('evaluation.dashboard')->with('error', 'Unauthorized access.');
    }
}
