<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\Product;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/login', [\App\Http\Controllers\AuthController::class, 'login']);

Route::get('/products', function () {
    return \App\Models\Product::all();
});

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [\App\Http\Controllers\AuthController::class, 'logout']);
    Route::get('/me', [\App\Http\Controllers\AuthController::class, 'me']);

    Route::prefix('superadmin')->group(function () {
        Route::get('/tenants', [\App\Http\Controllers\SuperadminController::class, 'getTenants']);
        Route::post('/tenants', [\App\Http\Controllers\SuperadminController::class, 'createTenant']);
        Route::get('/users', [\App\Http\Controllers\SuperadminController::class, 'getUsers']);
        Route::post('/users', [\App\Http\Controllers\SuperadminController::class, 'addUserToTenant']);
        Route::delete('/users/{user}', [\App\Http\Controllers\SuperadminController::class, 'deleteUser']);
    });

    Route::prefix('tenant')->middleware(\App\Http\Middleware\CheckTenantHeader::class)->group(function () {
        Route::get('/users', [\App\Http\Controllers\TenantAdminController::class, 'getUsers']);
        Route::post('/users', [\App\Http\Controllers\TenantAdminController::class, 'inviteUser']);
    });
});
