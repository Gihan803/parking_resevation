import React from 'react';

export default function ParkingSlot({ slot, onSelect }) {
  const isAvailable = slot.status === 'available';
  const bgColor = isAvailable ? 'bg-emerald-400' : 'bg-red-400';
  const hoverClass = isAvailable ? 'hover:scale-105 hover:shadow-lg cursor-pointer' : 'cursor-not-allowed opacity-90';
  const reservation = slot.reservation;

  // Format date for display
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <button
      onClick={() => isAvailable && onSelect(slot)}
      disabled={!isAvailable}
      className={`
        ${bgColor}
        w-full aspect-square rounded-xl
        flex flex-col items-center justify-center
        transition-all duration-200 transform
        ${hoverClass}
        shadow-md active:scale-95
        p-1
      `}
    >
      <div className="text-2xl sm:text-3xl font-bold text-gray-800">
        {slot.slot_number}
      </div>
      <div className="text-xl">
        {isAvailable ? '🚗' : '🚙'}
      </div>
      {/* Show reservation details for occupied slots - clean display */}
      {!isAvailable && reservation && (
        <div className="text-[10px] sm:text-xs text-gray-800 text-center mt-1">
          <div className="font-bold">{formatDate(reservation.booking_date)}</div>
          <div>{reservation.start_time}</div>
          <div>{reservation.duration}</div>
        </div>
      )}
    </button>
  );
}
