<?php 

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles Allowed role names (e.g. 'admin', 'institution', 'student')
     */

    public function handle(Request $request, Closure $next, string ...$roles):Response{
        $user = $request->user();

        if(!$user||!in_array($user->role_name, $roles, true)){
            return response()->json([
                'message'=> 'Unauthorized. You do not have permission to access this resource.' 
            ], 403);
        }

        return $next($request);
    }
}