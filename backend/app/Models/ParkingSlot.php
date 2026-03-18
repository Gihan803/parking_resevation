<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ParkingSlot extends Model
{
    use HasFactory;

    protected $fillable = [
        'slot_number',
        'status',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    /**
     * Get reservations for this slot
     */
    public function reservations()
    {
        return $this->belongsToMany(
            Reservation::class,
            'reservation_items',
            'slot_id',
            'reservation_id'
        );
    }

    /**
     * Get all reservation items for this slot
     */
    public function reservationItems()
    {
        return $this->hasMany(ReservationItem::class, 'slot_id');
    }

    /**
     * Check if slot is available
     */
    public function isAvailable(): bool
    {
        return $this->status === 'available';
    }

    /**
     * Mark slot as occupied
     */
    public function markOccupied(): void
    {
        $this->update(['status' => 'occupied']);
    }

    /**
     * Mark slot as available
     */
    public function markAvailable(): void
    {
        $this->update(['status' => 'available']);
    }
}
