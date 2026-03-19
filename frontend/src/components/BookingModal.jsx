import React, { useState } from 'react';

export default function BookingModal({ slot, onClose, onConfirm }) {
  const [licensePlate, setLicensePlate] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!licensePlate || !date || !startTime || !endTime) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    // Validate that end time is after start time
    if (startTime >= endTime) {
      setError('End time must be after start time');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/api/reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          vehicle_plate: licensePlate.toUpperCase(),
          booking_date: date,
          start_time: startTime,
          end_time: endTime,
          slot_ids: [slot.id],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.message || data.errors?.vehicle_plate?.[0] || 'Failed to book slot';
        setError(errorMsg);
        setLoading(false);
        return;
      }

      // Show success and auto-redirect to reservations
      alert('✅ Booking confirmed successfully! You can now cancel within 1 minute.');
      onConfirm(data.reservation);
      
      // Close modal and let parent handle navigation
      setTimeout(() => {
        onClose();
      }, 500);
    } catch (err) {
      setError('Unable to complete booking. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Book Parking Slot</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Slot Info */}
        <div className="mb-6">
          <div className="text-teal-600 font-semibold text-sm">
            P Slot {slot.slot_number}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* License Plate */}
          <div>
            <label className="block font-semibold text-sm text-gray-700 mb-2">
              Vehicle License Plate
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400">🚗</span>
              <input
                type="text"
                placeholder="E.G., ABC-1234"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                disabled={loading}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 disabled:bg-gray-50"
              />
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block font-semibold text-sm text-gray-700 mb-2">
              Date
            </label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-gray-400">📅</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={loading}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 disabled:bg-gray-50"
              />
            </div>
          </div>

          {/* Time Range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-sm text-gray-700 mb-2">
                Start Time
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">🕐</span>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 disabled:bg-gray-50"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-sm text-gray-700 mb-2">
                End Time
              </label>
              <div className="relative">
                <span className="absolute left-3 top-3 text-gray-400">🕐</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-teal-500 disabled:bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-500 text-white font-semibold py-3 rounded-full hover:bg-teal-600 transition disabled:bg-teal-300 disabled:cursor-not-allowed mt-6"
          >
            {loading ? 'Confirming...' : 'Confirm Booking'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full text-teal-600 font-semibold py-2 hover:text-teal-700 transition disabled:text-gray-400"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
