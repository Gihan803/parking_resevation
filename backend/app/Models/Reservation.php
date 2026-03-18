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

    protected $casts = [
        'booking_date' => 'date',
        'start_time' => 'time',
        'end_time' => 'time',
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
     * Cancel the reservation
     */
    public function cancel(): void
    {
        $this->update(['status' => 'cancelled']);
        
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
}
