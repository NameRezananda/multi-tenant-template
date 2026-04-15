<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\Tenant;
use App\Services\TenantManager;

class CheckTenantHeader
{
    public function __construct(protected TenantManager $tenantManager) {}

    public function handle(Request $request, Closure $next): Response
    {
        $domain = $request->header('X-Tenant-Domain');
        
        if (!$domain) {
            return response()->json(['message' => 'Tenant domain missing.'], 400);
        }

        $tenant = Tenant::where('domain', $domain)->where('is_active', true)->first();

        if (!$tenant) {
            return response()->json(['message' => 'Tenant not found or inactive.'], 404);
        }

        if ($request->user() && !$request->user()->tenants()->where('tenants.id', $tenant->id)->exists()) {
             return response()->json(['message' => 'Unauthorized for this tenant.'], 403);
        }

        $this->tenantManager->setTenant($tenant);

        return $next($request);
    }
}
