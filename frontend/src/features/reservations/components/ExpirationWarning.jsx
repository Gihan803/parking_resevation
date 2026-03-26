import React, { useEffect, useState } from 'react';

// Reservation expiration warning modal (used in My Reservations).
export default function ExpirationWarning({ 
  isOpen, 
  slotNumber, 
  minutesRemaining, 
  onExtend, 
  onClose,
  isLoading 
}) {
  const [countdown, setCountdown] = useState(60);

  // Auto-close countdown timer
  useEffect(() => {
    if (!isOpen) {
      setCountdown(60); // Reset countdown when modal closes
      return;
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          // Auto-close when countdown reaches 0
          clearInterval(timer);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-2xl">
        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div className="text-6xl">⚠️</div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-orange-600 text-center mb-2">
          Reservation Expiring Soon!
        </h2>

        {/* Message */}
        <p className="text-gray-600 text-center mb-2">
          Your reservation for parking slot <span className="font-bold text-gray-900">#{slotNumber}</span> is about to expire in 
          <span className="font-bold text-orange-600"> {minutesRemaining} minutes</span>.
        </p>
        
        <p className="text-gray-500 text-center mb-4 text-sm">
          Would you like to extend your reservation time?
        </p>

        {/* Countdown Timer */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center bg-orange-100 rounded-full px-4 py-2">
            <span className="text-orange-600 font-semibold">
              Auto-close in {countdown}s
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 border-2 border-gray-300 text-gray-600 font-semibold py-2 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            Close
          </button>
          <button
            onClick={onExtend}
            disabled={isLoading}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50"
          >
            {isLoading ? 'Extending...' : 'Extend +30 Minutes'}
          </button>
        </div>
      </div>
    </div>
  );
}
