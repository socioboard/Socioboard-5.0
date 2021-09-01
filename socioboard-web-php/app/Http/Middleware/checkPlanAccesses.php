<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class checkPlanAccesses
{
    public function handle(Request $request, Closure $next, string $page)
    {
        return session()->get('user.userDetails.userPlanDetails')[$page]
            ? $next($request)
            : redirect('plan-details-view')
                ->with("failed", "Page {$page} is not available with the current plan. Please upgrade your plan");
    }
}
