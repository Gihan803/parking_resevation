import { useState, useCallback } from 'react';

/**
 * useConfirmModal - Custom hook to consolidate confirmation modal handling
 * Eliminates repetitive code for cancel/delete confirmation patterns
 */
export function useConfirmModal() {
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: null,
    reservationId: null,
    isLoading: false,
  });

  /**
   * Open the confirmation modal with a specific type and reservation ID
   * @param {string} type - The type of action ('cancel' or 'delete')
   * @param {number|string} reservationId - The ID of the reservation
   */
  const openModal = useCallback((type, reservationId) => {
    setConfirmModal({
      isOpen: true,
      type,
      reservationId,
      isLoading: false,
    });
  }, []);

  /**
   * Close the confirmation modal and reset state
   */
  const closeModal = useCallback(() => {
    setConfirmModal({
      isOpen: false,
      type: null,
      reservationId: null,
      isLoading: false,
    });
  }, []);

  /**
   * Execute an action with loading state management
   * @param {Function} action - The async action to execute (e.g., cancelReservation, deleteReservation)
   * @param {string} successMessage - Message to show on success
   * @param {Function} showNotification - Function to display notifications
   * @returns {Promise<void>}
   */
  const executeAction = useCallback(async (action, successMessage, showNotification) => {
    const reservationId = confirmModal.reservationId;
    setConfirmModal(prev => ({ ...prev, isLoading: true }));

    try {
      await action(reservationId);
      showNotification(successMessage);
    } catch (err) {
      showNotification(err.message || 'Operation failed', 'error');
    } finally {
      closeModal();
    }
  }, [confirmModal.reservationId, closeModal]);

  return {
    confirmModal,
    openModal,
    closeModal,
    executeAction,
  };
}
