import { getAuthToken } from './helpers';

const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise<object>} Response data
 */
async function authenticatedFetch(endpoint, options = {}) {
  const token = getAuthToken();
  
  const defaultOptions = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `HTTP error! status: ${response.status}`);
  }

  return data;
}

/**
 * Reservation API methods
 */
export const reservationApi = {
  /**
   * Fetch all reservations for the current user
   * @returns {Promise<Array>} List of reservations
   */
  async fetchAll() {
    const data = await authenticatedFetch('/reservations');
    return data.reservations || [];
  },

  /**
   * Cancel a reservation
   * @param {number} reservationId - Reservation ID
   * @returns {Promise<object>} Updated reservation
   */
  async cancel(reservationId) {
    return await authenticatedFetch(`/reservations/${reservationId}/cancel`, {
      method: 'POST',
    });
  },

  /**
   * Delete a reservation
   * @param {number} reservationId - Reservation ID
   * @returns {Promise<object>} Response data
   */
  async delete(reservationId) {
    return await authenticatedFetch(`/reservations/${reservationId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Extend a reservation
   * @param {number} reservationId - Reservation ID
   * @returns {Promise<object>} Updated reservation
   */
  async extend(reservationId) {
    return await authenticatedFetch(`/reservations/${reservationId}/extend`, {
      method: 'POST',
    });
  },

  /**
   * Create a new reservation
   * @param {object} reservationData - Reservation data
   * @returns {Promise<object>} Created reservation
   */
  async create(reservationData) {
    return await authenticatedFetch('/reservations', {
      method: 'POST',
      body: JSON.stringify(reservationData),
    });
  },
};

/**
 * Profile API methods
 */
export const profileApi = {
  /**
   * Update user profile
   * @param {object} profileData - Profile data to update
   * @returns {Promise<object>} Updated user data
   */
  async updateProfile(profileData) {
    const response = await authenticatedFetch('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    return response.user;
  },

  /**
   * Get current user profile
   * @returns {Promise<object>} User data
   */
  async getProfile() {
    return await authenticatedFetch('/auth/me');
  },
};

/**
 * Parking Slot API methods
 */
export const parkingSlotApi = {
  /**
   * Fetch all parking slots
   * @returns {Promise<Array>} List of parking slots
   */
  async fetchAll() {
    const data = await authenticatedFetch('/slots');
    return data.slots || [];
  },

  /**
   * Fetch available parking slots
   * @returns {Promise<Array>} List of available slots
   */
  async fetchAvailable() {
    const data = await authenticatedFetch('/slots/available');
    return data.slots || [];
  },

  /**
   * Get a specific parking slot
   * @param {number} slotId - Slot ID
   * @returns {Promise<object>} Slot data
   */
  async getById(slotId) {
    return await authenticatedFetch(`/slots/${slotId}`);
  },
};

export default {
  reservationApi,
  profileApi,
  parkingSlotApi,
};
