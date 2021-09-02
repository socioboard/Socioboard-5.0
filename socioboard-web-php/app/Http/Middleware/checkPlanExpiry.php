<?php

namespace App\Http\Middleware;

use Illuminate\Support\Facades\Session;
use Closure;
use Illuminate\Http\Request;

class checkPlanExpiry
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        if (Session::get('expired')=== 'true') {
            return redirect('plan-details-view')->with("failed", 'Please upgrade your plan');
        } else {
            return $next($request);
        }
    }
}
