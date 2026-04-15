<?php

namespace App\Traits;

use App\Models\Scopes\TenantScope;
use App\Models\Tenant;
use App\Services\TenantManager;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToTenant
{
    protected static function bootBelongsToTenant()
    {
        static::addGlobalScope(new TenantScope);

        static::creating(function ($model) {
            $tenantId = app(TenantManager::class)->getTenantId();
            if ($tenantId && !$model->tenant_id) {
                $model->tenant_id = $tenantId;
            }
        });
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
