<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Tenant;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $tenant = Tenant::updateOrCreate(
            ['domain' => 'default-tenant'],
            ['name' => 'Default Organization', 'is_active' => true]
        );

        $user = User::factory()->create([
            'name' => 'Superadmin User',
            'email' => 'admin@example.com',
            'is_superadmin' => true,
        ]);

        $user->tenants()->attach($tenant);
    }
}
