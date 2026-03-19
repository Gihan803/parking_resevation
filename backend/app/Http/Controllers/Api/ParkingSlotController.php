<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ParkingSlot;
use App\Models\Reservation;
use Illuminate\Http\Request;

class ParkingSlotController extends Controller
{
    /**
     * Get all parking slots with their status
     */
    public function index(Request $request)
    {
        // Auto-complete any expired active reservations
        $activeReservations = Reservation::where('status', 'active')->get();
        foreach ($activeReservations as $reservation) {
            $reservation->completeIfExpired();
        }

        $slots = ParkingSlot::all()->map(function ($slot) {
            // Get the active reservation for this slot if occupied
            $reservation = null;
            if ($slot->status === 'occupied') {
                $reservationItem = $slot->reservationItems()
                    ->whereHas('reservation', function ($query) {
                        $query->where('status', 'active');
                    })
                    ->with('reservation')
                    ->first();

                if ($reservationItem && $reservationItem->reservation) {
                    $res = $reservationItem->reservation;
                    // Calculate duration
                    [$startHour, $startMin] = explode(':', $res->start_time);
                    [$endHour, $endMin] = explode(':', $res->end_time);
                    $durationMinutes = ($endHour * 60 + $endMin) - ($startHour * 60 + $startMin);
                    $hours = floor($durationMinutes / 60);
                    $mins = $durationMinutes % 60;
                    $duration = $hours > 0 ? "{$hours}h {$mins}m" : "{$mins}m";

                    $reservation = [
                        'booking_date' => $res->booking_date,
                        'start_time' => $res->start_time,
                        'end_time' => $res->end_time,
                        'duration' => $duration,
                        'vehicle_plate' => $res->vehicle_plate,
                    ];
                }
            }

            return [
                'id' => $slot->id,
                'slot_number' => $slot->slot_number,
                'status' => $slot->status,
                'is_available' => $slot->status === 'available',
                'created_at' => $slot->created_at,
                'reservation' => $reservation,
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
