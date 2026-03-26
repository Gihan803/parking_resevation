import { useState, useEffect, useCallback } from 'react';

const WARNING_THRESHOLD_MINUTES = 10;
const CHECK_INTERVAL_MS = 30000;

// UI-only warning state (does not affect backend reservation status).

/**
 * Custom hook for managing expiration warnings
 * @param {array} reservations - List of reservations
 * @returns {object} Expiration warning state and actions
 */
export function useExpirationWarning(reservations) {
  const [warning, setWarning] = useState({
    isOpen: false,
    reservationId: null,
    slotNumber: null,
    minutesRemaining: 0,
    isLoading: false,
  });
  const [dismissedWarnings, setDismissedWarnings] = useState(new Set());

  const checkExpiringReservations = useCallback(() => {
    if (warning.isOpen) return;

    const now = new Date();
    
    reservations.forEach(res => {
      if (res.status === 'active' && res.booking_date) {
        const bookingDate = new Date(res.booking_date);
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const bookingDay = new Date(bookingDate.getFullYear(), bookingDate.getMonth(), bookingDate.getDate());
        
        if (bookingDay.getTime() === today.getTime()) {
          const [endHour, endMin] = res.end_time.split(':').map(Number);
          const endTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHour, endMin);
          const diffMs = endTime - now;
          const minutesRemaining = Math.floor(diffMs / 60000);
          
          if (minutesRemaining > 0 && minutesRemaining <= WARNING_THRESHOLD_MINUTES) {
            const slotNumber = res.slots?.[0]?.slot_number || 'N/A';
            
            if (!dismissedWarnings.has(res.id)) {
              setWarning({
                isOpen: true,
                reservationId: res.id,
                slotNumber,
                minutesRemaining,
                isLoading: false,
              });
            }
          }
        }
      }
    });
  }, [reservations, warning.isOpen, dismissedWarnings]);

  useEffect(() => {
    checkExpiringReservations();
    const interval = setInterval(checkExpiringReservations, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [checkExpiringReservations]);

  const closeWarning = useCallback(() => {
    if (warning.reservationId) {
      setDismissedWarnings(prev => new Set([...prev, warning.reservationId]));
    }
    setWarning({
      isOpen: false,
      reservationId: null,
      slotNumber: null,
      minutesRemaining: 0,
      isLoading: false,
    });
  }, [warning.reservationId]);

  const setLoading = useCallback((isLoading) => {
    setWarning(prev => ({ ...prev, isLoading }));
  }, []);

  return {
    warning,
    closeWarning,
    setLoading,
    dismissWarning: (id) => setDismissedWarnings(prev => new Set([...prev, id])),
  };
}
