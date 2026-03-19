import React, { useEffect, useState } from 'react';
import Notification from './Notification';
import ConfirmModal from './ConfirmModal';
import ExpirationWarning from './ExpirationWarning';

export default function MyReservations({ onBack }) {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelCountdowns, setCancelCountdowns] = useState({});
  const [notification, setNotification] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null, // 'cancel' or 'delete'
    reservationId: null,
    isLoading: false,
  });
  const [expirationWarning, setExpirationWarning] = useState({
    isOpen: false,
    reservationId: null,
    slotNumber: null,
    minutesRemaining: 0,
    isLoading: false,
  });
  const [dismissedWarnings, setDismissedWarnings] = useState(new Set()); // Track dismissed warnings

  useEffect(() => {
    // Load reservations on mount only (no automatic polling)
    fetchReservations();
  }, []);

  // Countdown timer for cancellation window
  useEffect(() => {
    const interval = setInterval(() => {
      setCancelCountdowns(prev => {
        const updated = { ...prev };
        reservations.forEach(res => {
          if (res.status === 'active') {
            const secondsPassed = Math.floor(
              (new Date() - new Date(res.created_at)) / 1000
            );
            const secondsRemaining = Math.max(0, 60 - secondsPassed);
            updated[res.id] = secondsRemaining;
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [reservations]);

  // Countdown timer for expiration warning (check every 30 seconds)
  useEffect(() => {
    const checkExpiringReservations = () => {
      // Skip if warning is already open
      if (expirationWarning.isOpen) return;

      const now = new Date();
      
      reservations.forEach(res => {
        if (res.status === 'active' && res.booking_date) {
          const bookingDate = new Date(res.booking_date);
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          const bookingDay = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());
          
          // Only check for today's reservations
          if (bookingDay.getTime() === today.getTime()) {
            const [endHour, endMin] = res.end_time.split(':').map(Number);
            const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHour, endMin);
            const diffMs = endTime - now;
            const minutesRemaining = Math.floor(diffMs / 60000);
            
            // If within 10 minutes but not expired
            if (minutesRemaining > 0 && minutesRemaining <= 10) {
              const slotNumber = res.slots?.[0]?.slot_number || 'N/A';
              
              // Only show warning if not dismissed by user
              if (!dismissedWarnings.has(res.id)) {
                setExpirationWarning({
                  isOpen: true,
                  reservationId: res.id,
                  slotNumber: slotNumber,
                  minutesRemaining: minutesRemaining,
                  isLoading: false,
                });
              }
            }
          }
        }
      });
    };

    // Check immediately and then every 30 seconds
    checkExpiringReservations();
    const interval = setInterval(checkExpiringReservations, 30000);

    return () => clearInterval(interval);
  }, [reservations, expirationWarning.isOpen, dismissedWarnings]);

  const handleExtend = async () => {
    const reservationId = expirationWarning.reservationId;
    setExpirationWarning(prev => ({ ...prev, isLoading: true }));

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8000/api/reservations/${reservationId}/extend`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setNotification({
          message: data.message || 'Failed to extend reservation',
          type: 'error',
        });
        setExpirationWarning({ isOpen: false, reservationId: null, slotNumber: null, minutesRemaining: 0, isLoading: false });
        return;
      }

      // Update the reservation with new end_time
      setReservations(
        reservations.map(r =>
          r.id === reservationId ? { ...r, end_time: data.reservation.end_time } : r
        )
      );
      setNotification({
        message: '✅ Reservation extended by 30 minutes!',
        type: 'success',
      });
      // Add to dismissed warnings so it doesn't show again immediately
      setDismissedWarnings(prev => new Set([...prev, reservationId]));
      setExpirationWarning({ isOpen: false, reservationId: null, slotNumber: null, minutesRemaining: 0, isLoading: false });
    } catch (err) {
      setNotification({
        message: 'Failed to extend reservation',
        type: 'error',
      });
      setExpirationWarning({ isOpen: false, reservationId: null, slotNumber: null, minutesRemaining: 0, isLoading: false });
      console.error(err);
    }
  };

  const handleCloseExpirationWarning = () => {
    // Add the reservation to dismissed warnings so it doesn't show again
    if (expirationWarning.reservationId) {
      setDismissedWarnings(prev => new Set([...prev, expirationWarning.reservationId]));
    }
    setExpirationWarning({ isOpen: false, reservationId: null, slotNumber: null, minutesRemaining: 0, isLoading: false });
  };

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('auth_token');
      const response = await fetch('http://localhost:8000/api/reservations', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reservations');
      }

      const data = await response.json();
      const reservations = data.reservations || [];

      setReservations(reservations);
    } catch (err) {
      setError('Failed to load reservations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (reservationId) => {
    setConfirmModal({
      isOpen: true,
      type: 'cancel',
      reservationId,
      isLoading: false,
    });
  };

  const handleConfirmCancel = async () => {
    const reservationId = confirmModal.reservationId;
    setConfirmModal(prev => ({ ...prev, isLoading: true }));

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8000/api/reservations/${reservationId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setNotification({
          message: data.message || 'Failed to cancel reservation',
          type: 'error',
        });
        setConfirmModal({ isOpen: false, type: null, reservationId: null, isLoading: false });
        return;
      }

      // Update the reservation status to cancelled
      setReservations(
        reservations.map(r =>
          r.id === reservationId ? { ...r, status: 'cancelled' } : r
        )
      );
      setNotification({
        message: '✅ Reservation cancelled successfully!',
        type: 'success',
      });
      setConfirmModal({ isOpen: false, type: null, reservationId: null, isLoading: false });
    } catch (err) {
      setNotification({
        message: 'Failed to cancel reservation',
        type: 'error',
      });
      setConfirmModal({ isOpen: false, type: null, reservationId: null, isLoading: false });
      console.error(err);
    }
  };

  const handleDelete = async (reservationId) => {
    setConfirmModal({
      isOpen: true,
      type: 'delete',
      reservationId,
      isLoading: false,
    });
  };

  const handleConfirmDelete = async () => {
    const reservationId = confirmModal.reservationId;
    setConfirmModal(prev => ({ ...prev, isLoading: true }));

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`http://localhost:8000/api/reservations/${reservationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setNotification({
          message: data.message || 'Failed to delete reservation',
          type: 'error',
        });
        setConfirmModal({ isOpen: false, type: null, reservationId: null, isLoading: false });
        return;
      }

      // Remove the reservation from the list
      setReservations(reservations.filter(r => r.id !== reservationId));
      setNotification({
        message: '✅ Reservation deleted successfully!',
        type: 'success',
      });
      setConfirmModal({ isOpen: false, type: null, reservationId: null, isLoading: false });
    } catch (err) {
      setNotification({
        message: 'Failed to delete reservation',
        type: 'error',
      });
      setConfirmModal({ isOpen: false, type: null, reservationId: null, isLoading: false });
      console.error(err);
    }
  };

  const handleBackToDashboard = () => {
    onBack();
  };

  const handleCloseModal = () => {
    setConfirmModal({ isOpen: false, type: null, reservationId: null, isLoading: false });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-teal-500"></div>
          <p className="mt-4 text-gray-600">Loading reservations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50">
        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            duration={3000}
            onClose={() => setNotification(null)}
          />
        )}
      </div>

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={confirmModal.isOpen && confirmModal.type === 'cancel'}
        title="Cancel Reservation?"
        message="Are you sure you want to cancel this reservation? This action cannot be undone."
        icon="⚠️"
        confirmText="Cancel Reservation"
        cancelText="Keep It"
        onConfirm={handleConfirmCancel}
        onCancel={handleCloseModal}
        isLoading={confirmModal.isLoading}
        isDanger={true}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen && confirmModal.type === 'delete'}
        title="Delete Reservation?"
        message="Are you sure you want to delete this reservation? This action cannot be undone and the record will be permanently removed."
        icon="🗑"
        confirmText="Delete Permanently"
        cancelText="Keep It"
        onConfirm={handleConfirmDelete}
        onCancel={handleCloseModal}
        isLoading={confirmModal.isLoading}
        isDanger={true}
      />

      {/* Expiration Warning Modal */}
      <ExpirationWarning
        isOpen={expirationWarning.isOpen}
        slotNumber={expirationWarning.slotNumber}
        minutesRemaining={expirationWarning.minutesRemaining}
        onExtend={handleExtend}
        onClose={handleCloseExpirationWarning}
        isLoading={expirationWarning.isLoading}
      />

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">P</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">ParkingApp</h1>
            </div>

            <nav className="flex items-center gap-6">
              <button
                onClick={handleBackToDashboard}
                className="text-gray-600 font-semibold hover:text-gray-900"
              >
                Dashboard
              </button>
              <button className="text-teal-500 font-semibold border-b-2 border-teal-500">
                My Reservations
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Title */}
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-3xl font-bold text-gray-900">My Reservations</h2>
          <button
            onClick={() => fetchReservations()}
            disabled={loading}
            className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm disabled:text-gray-400"
          >
            🔄 Refresh
          </button>
        </div>
        <p className="text-gray-600 mb-8">
          Manage all your active and upcoming parking sessions.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {reservations.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-5xl mb-4">🅿️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reservations</h3>
            <p className="text-gray-600 mb-6">You haven't made any parking reservations yet.</p>
            <button
              onClick={handleBackToDashboard}
              className="bg-teal-500 text-white font-semibold px-6 py-2 rounded-full hover:bg-teal-600 transition"
            >
              Book a Slot
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {reservations.map((reservation) => (
              <ReservationCard
                key={reservation.id}
                reservation={reservation}
                onCancel={handleCancel}
                onDelete={handleDelete}
                cancelCountdown={cancelCountdowns[reservation.id]}
              />
            ))}

            {/* Book New Slot Button */}
            <button
              onClick={handleBackToDashboard}
              className="w-full bg-teal-500 text-white font-semibold py-3 rounded-full hover:bg-teal-600 transition flex items-center justify-center gap-2 mt-8"
            >
              <span>+</span> Book New Parking Slot
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function ReservationCard({ reservation, onCancel, onDelete, cancelCountdown }) {
  const getStatusBadge = (status) => {
    const statusMap = {
      active: { bg: 'bg-green-50', text: 'text-green-700', label: 'ACTIVE' },
      scheduled: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'SCHEDULED' },
      completed: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'COMPLETED' },
      cancelled: { bg: 'bg-red-50', text: 'text-red-700', label: 'CANCELLED' },
    };
    const style = statusMap[status] || statusMap.scheduled;
    return style;
  };

  const status = getStatusBadge(reservation.status || 'scheduled');

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
            {new Date(reservation.booking_date).toLocaleDateString()}
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

      {/* Cancellation Window Timer (for active reservations) */}
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

function calculateDuration(startTime, endTime) {
  if (!startTime || !endTime) return '0h 00m';
  
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  let hours = endHour - startHour;
  let minutes = endMin - startMin;
  
  if (minutes < 0) {
    hours--;
    minutes += 60;
  }
  
  return `${hours}h ${String(minutes).padStart(2, '0')}m`;
}
