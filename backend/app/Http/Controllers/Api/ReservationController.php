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

        // Auto-complete any expired reservations before fetching
        $activeReservations = Reservation::where('user_id', $user->id)
            ->where('status', 'active')
            ->get();
        
        foreach ($activeReservations as $reservation) {
            $reservation->completeIfExpired();
        }

        $reservations = Reservation::where('user_id', $user->id)
            ->with('slots')
            ->get()
            ->map(function ($reservation) {
                return [
                    'id' => $reservation->id,
                    'vehicle_plate' => $reservation->vehicle_plate,
                    'booking_date' => $reservation->booking_date,
                    'start_time' => $reservation->start_time,
                    'end_time' => $reservation->end_time,
                    'status' => $reservation->status,
                    'can_cancel' => $reservation->canBeCancelled(),
                    'is_about_to_expire' => $reservation->isAboutToExpire(),
                    'minutes_until_expiry' => $reservation->getMinutesUntilExpiry(),
                    'slots' => $reservation->slots->map(function ($slot) {
                        return [
                            'id' => $slot->id,
                            'slot_number' => $slot->slot_number,
                            'status' => $slot->status,
                        ];
                    }),
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

        try {
            $request->validate([
                'vehicle_plate' => 'required|string|max:20',
                'booking_date' => 'required|string',
                'start_time' => 'required|string',
                'end_time' => 'required|string',
                'slot_ids' => 'required|array|min:1',
                'slot_ids.*' => 'required|integer|exists:parking_slots,id',
            ]);

            // Verify all slots are available
            $slots = ParkingSlot::whereIn('id', $request->slot_ids)->get();

            if ($slots->count() === 0) {
                return response()->json([
                    'message' => 'No slots found',
                ], 404);
            }

            foreach ($slots as $slot) {
                if ($slot->status !== 'available') {
                    return response()->json([
                        'message' => 'Slot ' . $slot->slot_number . ' is not available',
                    ], 400);
                }
            }

            DB::beginTransaction();

            // Create reservation
            $reservation = Reservation::create([
                'user_id' => $user->id,
                'vehicle_plate' => strtoupper($request->vehicle_plate),
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
                    'slots' => $reservation->slots->map(function ($slot) {
                        return [
                            'id' => $slot->id,
                            'slot_number' => $slot->slot_number,
                            'status' => $slot->status,
                        ];
                    }),
                ],
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Reservation creation error: ' . $e->getMessage() . ' ' . $e->getFile() . ':' . $e->getLine());
            return response()->json([
                'message' => 'Error creating reservation: ' . $e->getMessage(),
                'error' => config('app.debug') ? $e->getTrace() : null,
            ], 500);
        }
    }

    /**
     * Get a specific reservation
     */
    public function show($id, Request $request)
    {
        $user = $request->user();
        $reservation = Reservation::with('slots')->find($id);

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
                'slots' => $reservation->slots->map(function ($slot) {
                    return [
                        'id' => $slot->id,
                        'slot_number' => $slot->slot_number,
                        'status' => $slot->status,
                    ];
                }),
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

        if ($reservation->status === 'completed') {
            return response()->json([
                'message' => 'Cannot cancel a completed reservation',
            ], 400);
        }

        // Check if reservation can still be cancelled (1 minute window)
        if (!$reservation->canBeCancelled() && $user->role !== 'admin') {
            $minutesPassed = $reservation->created_at->diffInMinutes(now());
            return response()->json([
                'message' => 'Cancellation window expired. You can only cancel within 1 minute of booking.',
                'minutes_passed' => $minutesPassed,
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
                    'cancelled_at' => $reservation->cancelled_at,
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
     * Extend reservation time by 30 minutes
     */
    public function extend($id, Request $request)
    {
        $user = $request->user();
        $reservation = Reservation::with('slots')->find($id);

        if (!$reservation) {
            return response()->json([
                'message' => 'Reservation not found',
            ], 404);
        }

        // Check if user owns the reservation
        if ($reservation->user_id !== $user->id) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        if ($reservation->status !== 'active') {
            return response()->json([
                'message' => 'Can only extend active reservations',
            ], 400);
        }

        if ($reservation->hasExpired()) {
            return response()->json([
                'message' => 'Cannot extend an expired reservation',
            ], 400);
        }

        try {
            $success = $reservation->extendTime(30);

            if (!$success) {
                return response()->json([
                    'message' => 'Failed to extend reservation',
                ], 500);
            }

            // Refresh the reservation to get updated end_time
            $reservation->refresh();

            return response()->json([
                'message' => 'Reservation extended by 30 minutes',
                'reservation' => [
                    'id' => $reservation->id,
                    'vehicle_plate' => $reservation->vehicle_plate,
                    'booking_date' => $reservation->booking_date,
                    'start_time' => $reservation->start_time,
                    'end_time' => $reservation->end_time,
                    'status' => $reservation->status,
                    'slots' => $reservation->slots->map(function ($slot) {
                        return [
                            'id' => $slot->id,
                            'slot_number' => $slot->slot_number,
                            'status' => $slot->status,
                        ];
                    }),
                ],
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Error extending reservation: ' . $e->getMessage());
            return response()->json([
                'message' => 'Error extending reservation: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete a reservation (users can delete their own cancelled/completed, admins can delete any)
     */
    public function destroy($id, Request $request)
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

        // Debug logging
        \Log::info('Delete reservation attempt', [
            'reservation_id' => $reservation->id,
            'status' => $reservation->status,
            'booking_date' => $reservation->booking_date,
            'end_time' => $reservation->end_time,
            'has_expired_check' => $reservation->hasExpired(),
        ]);

        // Users can only delete cancelled or completed reservations
        if ($user->role !== 'admin' && !in_array($reservation->status, ['cancelled', 'completed'])) {
            return response()->json([
                'message' => 'You can only delete cancelled or completed reservations. Current status: ' . $reservation->status,
            ], 400);
        }

        try {
            DB::beginTransaction();
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
