<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserRole
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $user = $request->user();

        if (! $user || $user->role !== UserRole::from($role)) {
            return response()->json([
                'message' => 'Forbidden.',
                'errors' => [
                    'role' => ['This action is not authorized for your role.'],
                ],
            ], 403);
        }

        return $next($request);
    }
}
