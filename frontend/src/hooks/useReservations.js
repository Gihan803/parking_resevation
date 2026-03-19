import { useState, useEffect, useCallback } from 'react';
import { reservationApi } from '../utils/api';

/**
 * Custom hook for managing reservations data
 * @returns {object} Reservations state and actions
 */
export function useReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReservations = useCallback(async () => {
    try {
      setLoading(true);
      const data = await reservationApi.fetchAll();
      setReservations(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load reservations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const cancelReservation = useCallback(async (reservationId) => {
    await reservationApi.cancel(reservationId);
    setReservations(prev =>
      prev.map(r =>
        r.id === reservationId ? { ...r, status: 'cancelled' } : r
      )
    );
  }, []);

  const deleteReservation = useCallback(async (reservationId) => {
    await reservationApi.delete(reservationId);
    setReservations(prev => prev.filter(r => r.id !== reservationId));
  }, []);

  const extendReservation = useCallback(async (reservationId) => {
    const updated = await reservationApi.extend(reservationId);
    setReservations(prev =>
      prev.map(r =>
        r.id === reservationId ? { ...r, end_time: updated.end_time } : r
      )
    );
  }, []);

  const updateReservation = useCallback((reservationId, updates) => {
    setReservations(prev =>
      prev.map(r =>
        r.id === reservationId ? { ...r, ...updates } : r
      )
    );
  }, []);

  return {
    reservations,
    loading,
    error,
    fetchReservations,
    cancelReservation,
    deleteReservation,
    extendReservation,
    updateReservation,
  };
}
