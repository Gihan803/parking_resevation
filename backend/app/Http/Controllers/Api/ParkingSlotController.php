<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ParkingSlot;
use Illuminate\Http\Request;

class ParkingSlotController extends Controller
{
    /**
     * Get all parking slots with their status
     */
    public function index(Request $request)
    {
        $slots = ParkingSlot::all()->map(function ($slot) {
            return [
                'id' => $slot->id,
                'slot_number' => $slot->slot_number,
                'status' => $slot->status,
                'is_available' => $slot->status === 'available',
                'created_at' => $slot->created_at,
            ];
        });

        return response()->json([
            'slots' => $slots,
            'total' => count($slots),
            'available' => $slots->where('is_available', true)->count(),
            'occupied' => $slots->where('status', 'occupied')->count(),
        ], 200);
    }

    /**
     * Get a specific slot details
     */
    public function show($id)
    {
        $slot = ParkingSlot::find($id);

        if (!$slot) {
            return response()->json([
                'message' => 'Slot not found',
            ], 404);
        }

        return response()->json([
            'slot' => [
                'id' => $slot->id,
                'slot_number' => $slot->slot_number,
                'status' => $slot->status,
                'is_available' => $slot->status === 'available',
                'created_at' => $slot->created_at,
            ],
        ], 200);
    }

    /**
     * Get available slots only
     */
    public function available()
    {
        $slots = ParkingSlot::where('status', 'available')
            ->get()
            ->map(function ($slot) {
                return [
                    'id' => $slot->id,
                    'slot_number' => $slot->slot_number,
                    'status' => $slot->status,
                ];
            });

        return response()->json([
            'available_slots' => $slots,
            'count' => count($slots),
        ], 200);
    }
}
