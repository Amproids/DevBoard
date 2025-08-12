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
     * Redirect to OAuth provider
     * @param {string} provider - OAuth provider (google, github, etc.)
     */
    async redirectToOAuth(provider) {
        try {
            const url = `${API_BASE_URL}/auth/${provider.toLowerCase()}`;
            console.log(`Redirecting to ${provider}:`, url);
            window.location.href = url;
        } catch (error) {
            console.error(`Error redirecting to ${provider}:`, error);
            throw new Error(
                `${provider} authentication failed. Please try again.`
            );
        }
    },

    /**
     * Login with email and password
     * @param {Object} credentials - Login credentials
     * @returns {Promise} API response
     */
    async login(credentials) {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/auth/login`,
                credentials
            );
            return response.data;
        } catch (error) {
            console.error('Error logging in:', error);
            throw error;
        }
    },

    /**
     * Refresh authentication token
     * @returns {Promise} API response
     */
    async refreshToken() {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/auth/refresh`,
                {},
                {
                    headers: this.getAuthHeaders()
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error refreshing token:', error);
            throw error;
        }
    },

    /**
     * Deactivate user account
     * @returns {Promise} API response
     */
    async deactivateAccount() {
        try {
            const response = await axios.get(`${API_BASE_URL}/profiles`, {
                headers: this.getAuthHeaders()
            });
            const userId = response.data.data._id;

            await axios.delete(`${API_BASE_URL}/users/${userId}`, {
                headers: this.getAuthHeaders()
            });

            this.logout();
            return { success: true };
        } catch (error) {
            console.error('Error deactivating account:', error);
            throw error;
        }
    },

    /**
     * Logout user
     */
    logout() {
        removeAuthToken();
    },

    /**
     * Check if user is authenticated
     * @returns {boolean} Authentication status
     */
    isAuthenticated() {
        const token = getAuthToken();
        return !!token;
    }
};
