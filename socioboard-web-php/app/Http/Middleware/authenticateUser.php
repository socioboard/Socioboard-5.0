<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Session;


class authenticateUser
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next, $module)
    {
        if($module == 'user'){
            if(!Session::has($module)){
                return redirect('login');
            }
            return $next($request);
        }
    }
}
