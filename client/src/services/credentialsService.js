import axios from 'axios';
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const credentialsService = {
    /**
     * Update user credentials
     * @param {Object} credentials - User credentials data to update
     * @returns {Promise} API response
     */
    async updateCredentials(credentials) {
        //Remove confirm password before sending to API
        const { confirmPassword, ...credentialsToSend } = credentials;
        return axios.put(`${API_BASE_URL}/credentials`, credentialsToSend, {
            headers: authService.getAuthHeaders()
        })
    },

    /**
     * Validate credentials before submission
     * @param {Object} credentials - User credentials data to validate
     * @throws {Error} - If validation fails
     */
    validateCredentials(credentials) {
        if (credentials.password !== credentials.confirmPassword) {
            throw new Error('Passwords do not match');
        }
        if (credentials.password && credentials.password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }
        if (credentials.email && !credentials.email.includes('@')) {
            throw new Error('Please enter a valid email address');
        }
    }
}