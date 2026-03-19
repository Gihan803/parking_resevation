import { useState, useEffect } from 'react';

const CANCEL_WINDOW_SECONDS = 60;

/**
 * Custom hook for managing cancellation countdown timers
 * @param {array} reservations - List of reservations
 * @returns {object} Countdown state
 */
export function useCountdown(reservations) {
  const [countdowns, setCountdowns] = useState({});

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdowns(prev => {
        const updated = { ...prev };
        reservations.forEach(res => {
          if (res.status === 'active') {
            const secondsPassed = Math.floor(
              (new Date() - new Date(res.created_at)) / 1000
            );
            const secondsRemaining = Math.max(0, CANCEL_WINDOW_SECONDS - secondsPassed);
            updated[res.id] = secondsRemaining;
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [reservations]);

  return countdowns;
}
