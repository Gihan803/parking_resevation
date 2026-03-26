<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ParkingSlot;
use App\Models\Reservation;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    /**
     * List parking slots with occupancy details (admin)
     */
    public function getSlots(Request $request)
    {
        // Auto-complete any expired active reservations so slot status is up to date
        Reservation::where('status', 'active')
            ->with('slots')
            ->get()
            ->each(function (Reservation $reservation) {
                $reservation->completeIfExpired();
            });

        $slots = ParkingSlot::query()
            ->with(['reservationItems.reservation.user'])
            ->orderBy('slot_number')
            ->get()
            ->map(function (ParkingSlot $slot) {
                $activeReservation = null;

                $activeItem = $slot->reservationItems
                    ->first(function ($item) {
                        return $item->reservation && $item->reservation->status === 'active';
                    });

                if ($activeItem && $activeItem->reservation) {
                    $res = $activeItem->reservation;
                    $user = $res->user;

                    $bookingDate = $res->booking_date instanceof Carbon
                        ? $res->booking_date->format('Y-m-d')
                        : Carbon::parse($res->booking_date)->format('Y-m-d');

                    $startDateTime = Carbon::parse($bookingDate . ' ' . $res->start_time);
                    $endDateTime = Carbon::parse($bookingDate . ' ' . $res->end_time);

                    $plannedMinutes = max(0, $startDateTime->diffInMinutes($endDateTime, false));
                    $plannedHours = intdiv($plannedMinutes, 60);
                    $plannedMins = $plannedMinutes % 60;
                    $plannedDuration = $plannedHours > 0
                        ? "{$plannedHours}h {$plannedMins}m"
                        : "{$plannedMins}m";

                    $elapsedMinutes = max(0, $startDateTime->diffInMinutes(now(), false));
                    $elapsedHours = intdiv($elapsedMinutes, 60);
                    $elapsedMins = $elapsedMinutes % 60;
                    $elapsedDuration = $elapsedHours > 0
                        ? "{$elapsedHours}h {$elapsedMins}m"
                        : "{$elapsedMins}m";

                    $activeReservation = [
                        'id' => $res->id,
                        'booking_date' => $bookingDate,
                        'start_time' => (string) $res->start_time,
                        'end_time' => (string) $res->end_time,
                        'vehicle_plate' => $res->vehicle_plate,
                        'planned_duration' => $plannedDuration,
                        'elapsed_duration' => $elapsedDuration,
                        'occupant' => $user ? [
                            'id' => $user->id,
                            'full_name' => $user->full_name,
                            'email' => $user->email,
                            'phone' => $user->phone,
                        ] : null,
                    ];
                }

                return [
                    'id' => $slot->id,
                    'slot_number' => $slot->slot_number,
                    'status' => $slot->status,
                    'created_at' => $slot->created_at,
                    'active_reservation' => $activeReservation,
                ];
            });

        return response()->json([
            'slots' => $slots,
            'total' => $slots->count(),
            'available' => $slots->where('status', 'available')->count(),
            'occupied' => $slots->where('status', 'occupied')->count(),
            'maintenance' => $slots->where('status', 'maintenance')->count(),
        ], 200);
    }

    /**
     * Create a new parking slot
     */
    public function createSlot(Request $request)
    {
        // Check if user is admin
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized - Admin only',
            ], 403);
        }

        $slotNumber = strtoupper(trim((string) $request->slot_number));
        $request->merge(['slot_number' => $slotNumber]);

        $request->validate([
            'slot_number' => 'required|string|max:10|unique:parking_slots',
        ]);

        $slot = ParkingSlot::create([
            'slot_number' => $slotNumber,
            'status' => 'available',
        ]);

        return response()->json([
            'message' => 'Parking slot created successfully',
            'slot' => $slot,
        ], 201);
    }

    /**
     * Update a parking slot
     */
    public function updateSlot($id, Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized - Admin only',
            ], 403);
        }

        $slot = ParkingSlot::find($id);

        if (!$slot) {
            return response()->json([
                'message' => 'Slot not found',
            ], 404);
        }

        if ($request->has('slot_number')) {
            $slotNumber = strtoupper(trim((string) $request->slot_number));
            $request->merge(['slot_number' => $slotNumber]);
        }

        $request->validate([
            'slot_number' => 'sometimes|string|max:10|unique:parking_slots,slot_number,' . $id,
            'status' => 'sometimes|in:available,occupied,maintenance',
        ]);

        $slot->update($request->only(['slot_number', 'status']));

        return response()->json([
            'message' => 'Parking slot updated successfully',
            'slot' => $slot,
        ], 200);
    }

    /**
     * Delete a parking slot
     */
    public function deleteSlot($id, Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized - Admin only',
            ], 403);
        }

        $slot = ParkingSlot::find($id);

        if (!$slot) {
            return response()->json([
                'message' => 'Slot not found',
            ], 404);
        }

        // Check if slot has active reservations
        $activeReservations = $slot->reservationItems()
            ->whereHas('reservation', function ($query) {
                $query->where('status', 'active');
            })
            ->count();

        if ($activeReservations > 0) {
            return response()->json([
                'message' => 'Cannot delete slot with active reservations',
            ], 400);
        }

        $slot->delete();

        return response()->json([
            'message' => 'Parking slot deleted successfully',
        ], 200);
    }

    /**
     * Get all users (admin only)
     */
    public function getUsers(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized - Admin only',
            ], 403);
        }

        $users = User::select('id', 'full_name', 'email', 'phone', 'role', 'created_at')->get();

        return response()->json([
            'users' => $users,
            'total' => count($users),
        ], 200);
    }

    /**
     * Update user role or details
     */
    public function updateUser($id, Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized - Admin only',
            ], 403);
        }

        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'message' => 'User not found',
            ], 404);
        }

        $request->validate([
            'full_name' => 'sometimes|string|max:255',
            'phone' => 'sometimes|string|max:20',
            'role' => 'sometimes|in:customer,admin',
        ]);

        $user->update($request->only(['full_name', 'phone', 'role']));

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user,
        ], 200);
    }

    /**
     * Get admin dashboard statistics
     */
    public function getDashboardStats(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Unauthorized - Admin only',
            ], 403);
        }

        $totalSlots = ParkingSlot::count();
        $availableSlots = ParkingSlot::where('status', 'available')->count();
        $occupiedSlots = ParkingSlot::where('status', 'occupied')->count();
        $maintenanceSlots = ParkingSlot::where('status', 'maintenance')->count();
        
        $totalUsers = User::count();
        $totalCustomers = User::where('role', 'customer')->count();
        $totalAdmins = User::where('role', 'admin')->count();
        
        $activeReservations = \App\Models\Reservation::where('status', 'active')->count();
        $completedReservations = \App\Models\Reservation::where('status', 'completed')->count();
        $cancelledReservations = \App\Models\Reservation::where('status', 'cancelled')->count();

        return response()->json([
            'slots' => [
                'total' => $totalSlots,
                'available' => $availableSlots,
                'occupied' => $occupiedSlots,
                'maintenance' => $maintenanceSlots,
            ],
            'users' => [
                'total' => $totalUsers,
                'customers' => $totalCustomers,
                'admins' => $totalAdmins,
            ],
            'reservations' => [
                'active' => $activeReservations,
                'completed' => $completedReservations,
                'cancelled' => $cancelledReservations,
            ],
        ], 200);
    }
}
