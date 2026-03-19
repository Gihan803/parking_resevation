import React from 'react';

export default function ConfirmModal({ isOpen, title, message, icon, confirmText, cancelText, onConfirm, onCancel, isLoading, isDanger }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-md shadow-2xl">
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="text-5xl">{icon}</div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
          {title}
        </h2>

        {/* Message */}
        <p className="text-gray-600 text-center mb-6">
          {message}
        </p>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 border-2 border-gray-300 text-gray-600 font-semibold py-2 rounded-lg hover:bg-gray-50 transition disabled:opacity-50"
          >
            {cancelText || 'Cancel'}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`flex-1 font-semibold py-2 rounded-lg transition disabled:opacity-50 ${
              isDanger
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-teal-500 hover:bg-teal-600 text-white'
            }`}
          >
            {isLoading ? 'Processing...' : confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  );
}
