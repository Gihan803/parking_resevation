<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Reservation extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'vehicle_plate',
        'booking_date',
        'start_time',
        'end_time',
        'status',
    ];

    protected $dates = [
        'created_at',
        'updated_at',
        'cancelled_at',
    ];

    protected $casts = [
        'booking_date' => 'date:Y-m-d',
        'cancelled_at' => 'datetime',
    ];

    /**
     * Get the user who made this reservation
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get parking slots for this reservation
     */
    public function slots()
    {
        return $this->belongsToMany(
            ParkingSlot::class,
            'reservation_items',
            'reservation_id',
            'slot_id'
        );
    }

    /**
     * Get reservation items
     */
    public function items()
    {
        return $this->hasMany(ReservationItem::class);
    }

    /**
     * Check if reservation is active
     */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    /**
     * Check if reservation can be cancelled (within 1 minute of creation)
     */
    public function canBeCancelled(): bool
    {
        // Can only cancel if reservation is active and within 1 minute of creation
        if ($this->status !== 'active') {
            return false;
        }

        $createdAt = $this->created_at;
        $now = now();
        $minutesPassed = $createdAt->diffInMinutes($now);

        return $minutesPassed < 1;
    }

    /**
     * Check if reservation has expired
     */
    public function hasExpired(): bool
    {
        if ($this->status !== 'active') {
            return false;
        }

        $bookingDate = $this->booking_date->format('Y-m-d');
        $today = now()->format('Y-m-d');
        $now = now();

        \Log::info('hasExpired check', [
            'reservation_id' => $this->id,
            'booking_date' => $bookingDate,
            'today' => $today,
            'end_time' => $this->end_time,
            'now' => $now->format('Y-m-d H:i:s'),
            'is_past' => $bookingDate < $today,
            'is_today' => $bookingDate === $today,
        ]);

        // If booking date is in the past (yesterday or earlier), it's expired
        if ($bookingDate < $today) {
            \Log::info('Reservation expired: past date', ['reservation_id' => $this->id]);
            return true;
        }

        // If booking is for today, check if end time has passed
        if ($bookingDate === $today) {
            // Create end time as Carbon with app timezone to match $now
            // Handle both H:i and H:i:s formats
            $endDateTime = \Carbon\Carbon::parse($bookingDate . ' ' . $this->end_time);
            
            $isExpired = $now->gte($endDateTime);
            \Log::info('Reservation time check', [
                'reservation_id' => $this->id,
                'now' => $now->format('Y-m-d H:i:s'),
                'endDateTime' => $endDateTime->format('Y-m-d H:i:s'),
                'timezone' => $now->timezone->getName(),
                'isExpired' => $isExpired,
            ]);
            return $isExpired;
        }

        // Booking is in the future, hasn't expired
        return false;
    }

    /**
     * Auto-complete the reservation if time has expired
     */
    public function completeIfExpired(): void
    {
        \Log::info('completeIfExpired called', [
            'reservation_id' => $this->id,
            'current_status' => $this->status,
        ]);
        
        if ($this->hasExpired()) {
            \Log::info('Completing expired reservation', ['reservation_id' => $this->id]);
            $this->update(['status' => 'completed']);
            \Log::info('Status updated to completed', ['reservation_id' => $this->id]);

            // Free up slots
            foreach ($this->slots as $slot) {
                $slot->markAvailable();
            }
        } else {
            \Log::info('Reservation not expired', ['reservation_id' => $this->id]);
        }
    }

    /**
     * Cancel the reservation
     */
    public function cancel(): void
    {
        $this->update([
            'status' => 'cancelled',
            'cancelled_at' => now(),
        ]);
        
        // Free up slots
        foreach ($this->slots as $slot) {
            $slot->markAvailable();
        }
    }

    /**
     * Complete the reservation
     */
    public function complete(): void
    {
        $this->update(['status' => 'completed']);
        
        // Free up slots
        foreach ($this->slots as $slot) {
            $slot->markAvailable();
        }
    }

    /**
     * Extend the reservation time by specified minutes
     */
    public function extendTime(int $minutes = 30): bool
    {
        if ($this->status !== 'active') {
            return false;
        }

        if ($this->hasExpired()) {
            return false;
        }

        // Parse the current end_time and add minutes using Carbon
        $bookingDate = $this->booking_date->format('Y-m-d');
        $endDateTime = \Carbon\Carbon::parse($bookingDate . ' ' . $this->end_time);

        // Add minutes to the end time
        $endDateTime->addMinutes($minutes);
        
        // Format back to HH:MM
        $newEndTime = $endDateTime->format('H:i');

        $this->update(['end_time' => $newEndTime]);

        \Log::info('Reservation extended', [
            'reservation_id' => $this->id,
            'old_end_time' => $this->getOriginal('end_time'),
            'new_end_time' => $newEndTime,
            'minutes_added' => $minutes,
        ]);

        return true;
    }

    /**
     * Check if reservation is about to expire (within 10 minutes)
     */
    public function isAboutToExpire(): bool
    {
        if ($this->status !== 'active') {
            return false;
        }

        $bookingDate = $this->booking_date->format('Y-m-d');
        $today = now()->format('Y-m-d');

        // Only check for today's reservations
        if ($bookingDate !== $today) {
            return false;
        }

        // Create end time as Carbon with app timezone to match $now
        $endDateTime = \Carbon\Carbon::parse($bookingDate . ' ' . $this->end_time);
        $now = now();

        // Calculate minutes until expiration
        $minutesUntilExpiry = $endDateTime->diffInMinutes($now, false);

        // Return true if within 10 minutes but not yet expired (positive = future, negative = past)
        return $minutesUntilExpiry > 0 && $minutesUntilExpiry <= 10;
    }

    /**
     * Get minutes until expiration
     */
    public function getMinutesUntilExpiry(): int
    {
        $bookingDate = $this->booking_date->format('Y-m-d');
        $today = now()->format('Y-m-d');

        if ($bookingDate !== $today) {
            return -1;
        }

        $endDateTime = \Carbon\Carbon::parse($bookingDate . ' ' . $this->end_time);
        $now = now();

        // Use Carbon's diffInMinutes for accurate timezone-aware calculation
        $minutesUntilExpiry = $endDateTime->diffInMinutes($now, false);

        return (int) $minutesUntilExpiry;
    }
}
