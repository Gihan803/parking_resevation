import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Notification from '../components/Notification';
import ConfirmModal from '../components/ConfirmModal';
import ExpirationWarning from '../components/ExpirationWarning';
import Navbar from '../components/Navbar';
import ReservationCard from '../components/ReservationCard';
import { useReservations } from '../hooks/useReservations';
import { useCountdown } from '../hooks/useCountdown';
import { useExpirationWarning } from '../hooks/useExpirationWarning';
import { useConfirmModal } from '../hooks/useConfirmModal';
import { getUserData } from '../utils/helpers';

export default function MyReservations() {
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);

  const user = getUserData();
  const {
    reservations,
    loading,
    error,
    fetchReservations,
    cancelReservation,
    deleteReservation,
    extendReservation,
  } = useReservations();

  const cancelCountdowns = useCountdown(reservations);
  const { warning: expirationWarning, closeWarning, setLoading: setExpirationLoading } = useExpirationWarning(reservations);
  
  // Unified modal handling - eliminates repetitive code
  const { confirmModal, openModal, closeModal, executeAction } = useConfirmModal();

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Unified action handlers - use the hook's executeAction
  const handleCancel = (reservationId) => {
    openModal('cancel', reservationId);
  };

  const handleConfirmCancel = () => {
    executeAction(cancelReservation, '✅ Reservation cancelled successfully!', showNotification);
  };

  const handleDelete = (reservationId) => {
    openModal('delete', reservationId);
  };

  const handleConfirmDelete = () => {
    executeAction(deleteReservation, '✅ Reservation deleted successfully!', showNotification);
  };

  // Extend handlers
  const handleExtend = async () => {
    const reservationId = expirationWarning.reservationId;
    setExpirationLoading(true);

    try {
      await extendReservation(reservationId);
      showNotification('✅ Reservation extended by 30 minutes!');
      closeWarning();
    } catch (err) {
      showNotification(err.message || 'Failed to extend reservation', 'error');
      closeWarning();
    }
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
      <NotificationContainer notification={notification} onClose={() => setNotification(null)} />

      {/* Confirmation Modals */}
      <ConfirmModal
        isOpen={confirmModal.isOpen && confirmModal.type === 'cancel'}
        title="Cancel Reservation?"
        message="Are you sure you want to cancel this reservation? This action cannot be undone."
        icon="⚠️"
        confirmText="Cancel Reservation"
        cancelText="Keep It"
        onConfirm={handleConfirmCancel}
        onCancel={closeModal}
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
        onCancel={closeModal}
        isLoading={confirmModal.isLoading}
        isDanger={true}
      />

      {/* Expiration Warning Modal */}
      <ExpirationWarning
        isOpen={expirationWarning.isOpen}
        slotNumber={expirationWarning.slotNumber}
        minutesRemaining={expirationWarning.minutesRemaining}
        onExtend={handleExtend}
        onClose={closeWarning}
        isLoading={expirationWarning.isLoading}
      />

      {/* Navbar */}
      <Navbar user={user} onLogout={handleLogout} />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <PageHeader onRefresh={fetchReservations} loading={loading} />

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {reservations.length === 0 ? (
          <EmptyState onNavigate={handleBackToDashboard} />
        ) : (
          <ReservationList
            reservations={reservations}
            cancelCountdowns={cancelCountdowns}
            onCancel={handleCancel}
            onDelete={handleDelete}
            onNavigate={handleBackToDashboard}
          />
        )}
      </main>
    </div>
  );
}

// Sub-components for better organization

function NotificationContainer({ notification, onClose }) {
  if (!notification) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50">
      <Notification
        message={notification.message}
        type={notification.type}
        duration={3000}
        onClose={onClose}
      />
    </div>
  );
}

function PageHeader({ onRefresh, loading }) {
  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-3xl font-bold text-gray-900">My Reservations</h2>
        <button
          onClick={onRefresh}
          disabled={loading}
          className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm disabled:text-gray-400"
        >
          🔄 Refresh
        </button>
      </div>
      <p className="text-gray-600 mb-8">
        Manage all your active and upcoming parking sessions.
      </p>
    </>
  );
}

function EmptyState({ onNavigate }) {
  return (
    <div className="bg-white rounded-lg shadow p-12 text-center">
      <div className="text-5xl mb-4">🅿️</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reservations</h3>
      <p className="text-gray-600 mb-6">You haven't made any parking reservations yet.</p>
      <button
        onClick={onNavigate}
        className="bg-teal-500 text-white font-semibold px-6 py-2 rounded-full hover:bg-teal-600 transition"
      >
        Book a Slot
      </button>
    </div>
  );
}

function ReservationList({ reservations, cancelCountdowns, onCancel, onDelete, onNavigate }) {
  return (
    <div className="space-y-6">
      {reservations.map((reservation) => (
        <ReservationCard
          key={reservation.id}
          reservation={reservation}
          onCancel={onCancel}
          onDelete={onDelete}
          cancelCountdown={cancelCountdowns[reservation.id]}
        />
      ))}

      <button
        onClick={onNavigate}
        className="w-full bg-teal-500 text-white font-semibold py-3 rounded-full hover:bg-teal-600 transition flex items-center justify-center gap-2 mt-8"
      >
        <span>+</span> Book New Parking Slot
      </button>
    </div>
  );
}
