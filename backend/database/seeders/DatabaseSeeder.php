<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\ParkingSlot;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create Admin User
        User::create([
            'full_name' => 'Admin User',
            'email' => 'admin@parking.com',
            'password' => Hash::make('admin123'),
            'phone' => '1234567890',
            'role' => 'admin',
        ]);

        // Create Test Customer
        User::create([
            'full_name' => 'John Doe',
            'email' => 'customer@parking.com',
            'password' => Hash::make('customer123'),
            'phone' => '9876543210',
            'role' => 'customer',
        ]);

        // Create Parking Slots
        $slots = [
            'A1', 'A2', 'A3', 'A4', 'A5',
            'B1', 'B2', 'B3', 'B4', 'B5',
            'C1', 'C2', 'C3', 'C4', 'C5',
            'D1', 'D2', 'D3', 'D4', 'D5',
        ];

        foreach ($slots as $slot) {
            ParkingSlot::create([
                'slot_number' => $slot,
                'status' => 'available',
            ]);
        }
    }
}
