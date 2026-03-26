// Shared helper utilities (browser-only)
/**
 * Calculate duration between start and end time
 * @param {string} startTime - Start time in HH:mm format
 * @param {string} endTime - End time in HH:mm format
 * @returns {string} Duration in format "Xh YYm"
 */
export function calculateDuration(startTime, endTime) {
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

/**
 * Get auth token from localStorage
 * @returns {string|null} Auth token or null
 */
export function getAuthToken() {
  return localStorage.getItem('auth_token');
}

/**
 * Get user data from localStorage
 * @returns {object|null} User data or null
 */
export function getUserData() {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
}

/**
 * Format date to locale string
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString();
}

/**
 * Status configuration map
 */
export const STATUS_CONFIG = {
  active: { bg: 'bg-green-50', text: 'text-green-700', label: 'ACTIVE' },
  scheduled: { bg: 'bg-blue-50', text: 'text-blue-700', label: 'SCHEDULED' },
  completed: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'COMPLETED' },
  cancelled: { bg: 'bg-red-50', text: 'text-red-700', label: 'CANCELLED' },
};

/**
 * Get status style configuration
 * @param {string} status - Reservation status
 * @returns {object} Status style config
 */
export function getStatusStyle(status) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.scheduled;
}
