import axios from 'axios';
import { getAuthToken, removeAuthToken } from '../utils/tokenUtils';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const authService = {
    /**
     * Get authorization headers with bearer token
     * @returns {Object} Headers object with Authorization
     */
    getAuthHeaders() {
        const token = getAuthToken();
        if (!token) {
            throw new Error('Authentication token not found');
        }
        return {
            Authorization: `Bearer ${token}`
        };
    },

    /**
     * Deactivate user account
     * @returns {Promise} API response
     */
    async deactivateAccount(userId) {
        return axios.delete(`${API_BASE_URL}/users/${userId}`, {
            headers: this.getAuthHeaders()
        });
    },

    /**
     * Logout user
     */
    logout() {
        removeAuthToken();
    }

    // ... other methods can be added here
};