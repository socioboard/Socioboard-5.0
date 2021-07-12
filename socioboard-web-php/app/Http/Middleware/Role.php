<?php

namespace App\Http\Middleware;

use  App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Session;

class Role
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */

    public function handle($request, Closure $next, String $role) {
        $user = User::where('id', Session::get('user_id'))->first();
        if($user->role == $role)
            return $next($request);
        return redirect()->back();
    }
}
