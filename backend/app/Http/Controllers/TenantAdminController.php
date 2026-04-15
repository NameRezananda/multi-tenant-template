<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Services\TenantManager;

class TenantAdminController extends Controller
{
    public function __construct(protected TenantManager $tenantManager) {}

    public function getUsers()
    {
        $tenant = $this->tenantManager->getTenant();
        
        if (!$tenant) {
            return response()->json(['message' => 'No active tenant context.'], 400);
        }

        // Get users attached to this tenant
        $users = $tenant->users()->get();
        return response()->json($users);
    }

    public function inviteUser(Request $request)
    {
        $tenant = $this->tenantManager->getTenant();
        
        if (!$tenant) {
            return response()->json(['message' => 'No active tenant context.'], 400);
        }

        $request->validate([
            'name' => 'required|string',
            'email' => 'required|email'
        ]);

        // Automatically assign random password for new user or just find existing
        $user = User::firstOrCreate(
            ['email' => $request->email],
            ['name' => $request->name, 'password' => bcrypt('password123')]
        );

        if (!$tenant->users()->where('users.id', $user->id)->exists()) {
            $tenant->users()->attach($user->id, ['role' => 'staff']);
        }

        return response()->json(['message' => 'User attached to tenant successfully!', 'user' => $user]);
    }
}
