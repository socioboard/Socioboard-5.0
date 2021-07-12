<?php

namespace Modules\User\Http\Middleware;

use App\Classes\AuthUsers;
use Closure;
use Illuminate\Http\Request;

class CheckUser
{
    /**
     * Handle an incoming request.
     *
     * @param Request $request
     * @param Closure $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        if (AuthUsers::has()) {
            return redirect()->to('/dashboard');
        } else {
            return $next($request);
        }
    }
}
