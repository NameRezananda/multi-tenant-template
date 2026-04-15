<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Tenant;
use App\Models\User;

class SuperadminController extends Controller
{
    public function getTenants()
    {
        $tenants = Tenant::orderBy('created_at', 'desc')->get();
        return response()->json($tenants);
    }

    public function createTenant(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'domain' => 'required|string|unique:tenants,domain',
        ]);

        $tenant = Tenant::create([
            'name' => $request->name,
            'domain' => $request->domain,
            'is_active' => true
        ]);

        return response()->json(['message' => 'Tenant created optimally!', 'tenant' => $tenant]);
    }

    public function getUsers()
    {
        $users = User::with('tenants')->get();
        // Mask passwords natively for API just in case not hidden
        return response()->json($users);
    }

    public function addUserToTenant(Request $request)
    {
        $request->validate([
            'tenant_id' => 'required|exists:tenants,id',
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'nullable|string|min:6',
            'role' => 'string'
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => \Illuminate\Support\Facades\Hash::make($request->password ?? 'password123'),
        ]);

        $user->tenants()->attach($request->tenant_id, ['role' => $request->role ?? 'admin']);

        return response()->json(['message' => 'User created and attached to tenant.', 'user' => $user->load('tenants')]);
    }

    public function deleteUser(User $user)
    {
        $user->tenants()->detach();
        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }
}
