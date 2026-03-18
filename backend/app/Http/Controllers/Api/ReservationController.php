<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\ParkingSlot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReservationController extends Controller
{
    /**
     * Get all reservations for authenticated user
     */
    public function index(Request $request)
    {
        $user = $request->user();
        
        $reservations = Reservation::where('user_id', $user->id)
            ->with('slots:id,slot_number,status')
            ->get()
            ->map(function ($reservation) {
                return [
                    'id' => $reservation->id,
                    'vehicle_plate' => $reservation->vehicle_plate,
                    'booking_date' => $reservation->booking_date,
                    'start_time' => $reservation->start_time,
                    'end_time' => $reservation->end_time,
                    'status' => $reservation->status,
                    'slots' => $reservation->slots,
                    'created_at' => $reservation->created_at,
                ];
            });

        return response()->json([
            'reservations' => $reservations,
            'total' => count($reservations),
        ], 200);
    }

    /**
     * Create a new reservation
     */
    public function store(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'vehicle_plate' => 'required|string|max:20',
            'booking_date' => 'required|date|after_or_equal:today',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'slot_ids' => 'required|array|min:1',
            'slot_ids.*' => 'required|integer|exists:parking_slots,id',
        ]);

        // Verify all slots are available
        $slots = ParkingSlot::whereIn('id', $request->slot_ids)->get();

        foreach ($slots as $slot) {
            if ($slot->status !== 'available') {
                return response()->json([
                    'message' => 'Slot ' . $slot->slot_number . ' is not available',
                ], 400);
            }
        }

        try {
            DB::beginTransaction();

            // Create reservation
            $reservation = Reservation::create([
                'user_id' => $user->id,
                'vehicle_plate' => $request->vehicle_plate,
                'booking_date' => $request->booking_date,
                'start_time' => $request->start_time,
                'end_time' => $request->end_time,
                'status' => 'active',
            ]);

            // Attach slots and mark as occupied
            foreach ($slots as $slot) {
                $reservation->slots()->attach($slot->id);
                $slot->markOccupied();
            }

            DB::commit();

            return response()->json([
                'message' => 'Reservation created successfully',
                'reservation' => [
                    'id' => $reservation->id,
                    'vehicle_plate' => $reservation->vehicle_plate,
                    'booking_date' => $reservation->booking_date,
                    'start_time' => $reservation->start_time,
                    'end_time' => $reservation->end_time,
                    'status' => $reservation->status,
                    'slots' => $reservation->slots()->get(['id', 'slot_number', 'status']),
                ],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error creating reservation: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get a specific reservation
     */
    public function show($id, Request $request)
    {
        $user = $request->user();
        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json([
                'message' => 'Reservation not found',
            ], 404);
        }

        // Check if user owns the reservation or is admin
        if ($reservation->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        return response()->json([
            'reservation' => [
                'id' => $reservation->id,
                'vehicle_plate' => $reservation->vehicle_plate,
                'booking_date' => $reservation->booking_date,
                'start_time' => $reservation->start_time,
                'end_time' => $reservation->end_time,
                'status' => $reservation->status,
                'slots' => $reservation->slots()->get(['id', 'slot_number', 'status']),
                'created_at' => $reservation->created_at,
            ],
        ], 200);
    }

    /**
     * Cancel a reservation
     */
    public function cancel($id, Request $request)
    {
        $user = $request->user();
        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json([
                'message' => 'Reservation not found',
            ], 404);
        }

        // Check if user owns the reservation
        if ($reservation->user_id !== $user->id && $user->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        if ($reservation->status === 'cancelled') {
            return response()->json([
                'message' => 'Reservation is already cancelled',
            ], 400);
        }

        try {
            DB::beginTransaction();
            $reservation->cancel();
            DB::commit();

            return response()->json([
                'message' => 'Reservation cancelled successfully',
                'reservation' => [
                    'id' => $reservation->id,
                    'status' => $reservation->status,
                ],
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error cancelling reservation: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a reservation (admin only)
     */
    public function destroy($id, Request $request)
    {
        $user = $request->user();

        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized - Admin only',
            ], 403);
        }

        $reservation = Reservation::find($id);

        if (!$reservation) {
            return response()->json([
                'message' => 'Reservation not found',
            ], 404);
        }

        try {
            DB::beginTransaction();
            $reservation->cancel();
            $reservation->delete();
            DB::commit();

            return response()->json([
                'message' => 'Reservation deleted successfully',
            ], 200);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Error deleting reservation: ' . $e->getMessage(),
            ], 500);
        }
    }
}
