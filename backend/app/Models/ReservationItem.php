<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ReservationItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'reservation_id',
        'slot_id',
    ];

    /**
     * Get the reservation
     */
    public function reservation()
    {
        return $this->belongsTo(Reservation::class);
    }

    /**
     * Get the parking slot
     */
    public function slot()
    {
        return $this->belongsTo(ParkingSlot::class, 'slot_id');
    }
}
