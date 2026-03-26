import { getAuthToken } from './helpers';

export const API_BASE_URL = import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:8000/api';

/**
 * Make an authenticated API request
 * @param {string} endpoint - API endpoint
 * @param {object} options - Fetch options
 * @returns {Promise<object>} Response data
 */
export async function authenticatedFetch(endpoint, options = {}) {
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

export async function publicFetch(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    const firstError = data?.errors ? Object.values(data.errors)[0]?.[0] : null;
    throw new Error(data?.message || firstError || `HTTP error! status: ${response.status}`);
  }

  return data;
}

/**
 * Auth API methods
 */
export const authApi = {
  async register(payload) {
    return await publicFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  async me() {
    const data = await authenticatedFetch('/auth/me');
    return data.user;
  },

  async logout() {
    return await authenticatedFetch('/auth/logout', { method: 'POST' });
  },
};

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
    return data.available_slots || data.slots || [];
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

/**
 * Admin API methods
 */
export const adminApi = {
  async getDashboardStats() {
    return await authenticatedFetch('/admin/dashboard/stats');
  },

  async getSlots() {
    return await authenticatedFetch('/admin/slots');
  },

  async createSlot(slotNumber) {
    return await authenticatedFetch('/admin/slots', {
      method: 'POST',
      body: JSON.stringify({ slot_number: slotNumber }),
    });
  },

  async deleteSlot(slotId) {
    return await authenticatedFetch(`/admin/slots/${slotId}`, {
      method: 'DELETE',
    });
  },

  async getUsers() {
    return await authenticatedFetch('/admin/users');
  },

  async updateUser(userId, payload) {
    return await authenticatedFetch(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
};

export default {
  authApi,
  reservationApi,
  profileApi,
  parkingSlotApi,
  adminApi,
};
