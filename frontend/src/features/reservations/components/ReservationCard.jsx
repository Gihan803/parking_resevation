import React from 'react';
import { calculateDuration, getStatusStyle, formatDate } from '../../../shared/utils/helpers';

export default function ReservationCard({ reservation, onCancel, onDelete, cancelCountdown }) {
  const status = getStatusStyle(reservation.status || 'scheduled');
  const slotNumber = reservation.slots?.[0]?.slot_number || 'N/A';
  const canCancel = reservation.status === 'active' && (cancelCountdown || 0) > 0;

  return (
    <div className={`${status.bg} rounded-lg p-6 border-l-4 border-teal-500`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="text-3xl">🚗</div>
          <div>
            <div className={`text-xs font-bold ${status.text} mb-1`}>
              {status.label}
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Slot {slotNumber}
            </h3>
            <p className="text-gray-600 text-sm">
              📍 Plate: {reservation.vehicle_plate}
            </p>
          </div>
        </div>
      </div>

      {/* Reservation Details */}
      <div className="grid grid-cols-3 gap-4 mb-6 text-sm">
        <div>
          <div className="text-gray-600 font-semibold">DATE</div>
          <div className="text-gray-900 font-semibold">
            {formatDate(reservation.booking_date)}
          </div>
        </div>
        <div>
          <div className="text-gray-600 font-semibold">START</div>
          <div className="text-gray-900 font-semibold">
            {reservation.start_time}
          </div>
        </div>
        <div>
          <div className="text-gray-600 font-semibold">DURATION</div>
          <div className="text-gray-900 font-semibold">
            {calculateDuration(reservation.start_time, reservation.end_time)}
          </div>
        </div>
      </div>

      {/* Cancellation Window Timer */}
      {reservation.status === 'active' && (
        <div className="mb-4 p-3 bg-white rounded-lg border border-yellow-200">
          <div className="text-yellow-800 font-semibold text-sm">
            ⏱ Cancel within {cancelCountdown || 0}s
          </div>
          <div className="text-yellow-700 text-xs mt-1">
            {(cancelCountdown || 0) > 0
              ? `Only ${cancelCountdown}s left to cancel`
              : 'Cancellation window closed'}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {reservation.status === 'active' && (
          <>
            <button className="flex-1 border-2 border-teal-500 text-teal-600 font-semibold py-2 rounded-full hover:bg-teal-50 transition">
              ⏱ Extend Time(+30m)
            </button>
            <button
              onClick={() => onCancel(reservation.id)}
              disabled={!canCancel}
              className={`border-2 font-semibold px-6 py-2 rounded-full transition ${
                canCancel
                  ? 'border-red-300 text-red-600 hover:bg-red-50 cursor-pointer'
                  : 'border-gray-300 text-gray-400 cursor-not-allowed'
              }`}
            >
              ✕ Cancel
            </button>
          </>
        )}
        {reservation.status === 'scheduled' && (
          <button className="flex-1 border-2 border-teal-500 text-teal-600 font-semibold py-2 rounded-full hover:bg-teal-50 transition">
            ✏️ Modify Booking
          </button>
        )}
        {(reservation.status === 'completed' || reservation.status === 'cancelled') && (
          <>
            <div className="flex-1 text-center text-gray-600">
              Reservation {reservation.status}
            </div>
            <button
              onClick={() => onDelete(reservation.id)}
              className="border-2 border-red-300 text-red-600 font-semibold px-4 py-2 rounded-full hover:bg-red-50 transition"
            >
              🗑 Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
