import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const userService = {
    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @returns {Promise} API response
     */
    async register(userData) {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/users/register`,
                userData
            );
            return response.data;
        } catch (error) {
            console.error('Error registering user:', error);
            throw error;
        }
    },

    /**
     * Get user by ID
     * @param {string} userId - User ID
     * @returns {Promise} API response
     */
    async getUserById(userId) {
        try {
            const response = await axios.get(`${API_BASE_URL}/users/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching user:', error);
            throw error;
        }
    },

    /**
     * Update user information
     * @param {string} userId - User ID
     * @param {Object} userData - User data to update
     * @returns {Promise} API response
     */
    async updateUser(userId, userData) {
        try {
            const response = await axios.put(`${API_BASE_URL}/users/${userId}`, userData);
            return response.data;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },

    /**
     * Delete user account
     * @param {string} userId - User ID
     * @returns {Promise} API response
     */
    async deleteUser(userId) {
        try {
            const response = await axios.delete(`${API_BASE_URL}/users/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    },

    /**
     * Validate user registration data
     * @param {Object} userData - User data to validate
     * @throws {Error} - If validation fails
     */
    validateRegistrationData(userData) {
        if (userData.password !== userData.confirmPassword) {
            throw new Error('Passwords do not match');
        }
        if (userData.password && userData.password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }
        if (userData.email && !userData.email.includes('@')) {
            throw new Error('Please enter a valid email address');
        }
        if (!userData.firstName?.trim() || !userData.lastName?.trim()) {
            throw new Error('First name and last name are required');
        }
    }
};