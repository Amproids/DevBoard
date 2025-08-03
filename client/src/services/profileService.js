import axios from 'axios';
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const profileService = {
    /**
     * Update user profile
     * @param {Object} profileData - User profile data to update
     * @returns {Promise} API response
     */
    async updateProfile(profileData) {
        const isFile = profileData.avatar instanceof File;

        if (isFile) {
            const formData = new FormData();
            formData.append('avatar', profileData.avatar);
            formData.append('firstName', profileData.firstName);
            formData.append('lastName', profileData.lastName);
            formData.append('displayName', profileData.displayName || '');

            return axios.put(`${API_BASE_URL}/profiles`, formData, {
                headers: {
                    ...authService.getAuthHeaders(),
                    'Content-Type' : 'multipart/form-data'
                }
            });
        }

        return axios.put(`${API_BASE_URL}/profiles`, profileData, {
            headers: authService.getAuthHeaders()
        });
    },

    /**
     * Get user profile
     * @returns {Promise} API response with user profile data
     */
    async getProfile() {
        return axios.get(`${API_BASE_URL}/profiles`, {
            headers: authService.getAuthHeaders()
        })
    }
}