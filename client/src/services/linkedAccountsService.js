import axios from 'axios';
import { authService } from './authService';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const linkedAccountsService = {
    /**
     * Get user's linked accounts and login methods from profile data
     * @returns {Promise} API response with linked accounts derived from profile
     */
    async getLinkedAccounts() {
        try {
            // Use existing profile endpoint to get user data
            const response = await axios.get(`${API_BASE_URL}/profiles`, {
                headers: authService.getAuthHeaders()
            });

            const userData = response.data.data;

            // Transform user data into login methods format
            const loginMethods = {
                hasPassword: userData.hasPassword || false,
                linkedAccounts: [
                    {
                        provider: 'google',
                        isLinked: !!userData.googleId,
                        email: userData.googleId ? userData.email : null
                    },
                    {
                        provider: 'github',
                        isLinked: !!userData.githubId,
                        username: userData.githubId ? userData.username : null
                    }
                ]
            };

            return { data: loginMethods };
        } catch (error) {
            console.error('Error fetching linked accounts:', error);
            throw error;
        }
    },

    /**
     * Link a new OAuth provider to the account
     * @param {string} provider - OAuth provider (google or github)
     * @returns {Promise} Redirects to OAuth provider
     */
    async linkAccount(provider) {
        try {
            // Store current location to return after linking
            localStorage.setItem('returnAfterLink', window.location.pathname);

            // Use existing OAuth redirect from authService (remove await)
            authService.redirectToOAuth(provider);
        } catch (error) {
            console.error(`Error linking ${provider} account:`, error);
            throw new Error(
                `Failed to link ${provider} account. Please try again.`
            );
        }
    },

    /**
     * Unlink an OAuth provider from the account
     * @param {string} provider - OAuth provider to unlink
     * @returns {Promise} API response
     */
    async unlinkAccount(provider) {
        try {
            const fieldName = provider === 'google' ? 'googleId' : 'githubId';
            const updateData = { [fieldName]: null };

            // If unlinking GitHub, also clear username
            if (provider === 'github') {
                updateData.username = null;
            }

            const response = await axios.put(
                `${API_BASE_URL}/profiles`,
                updateData,
                {
                    headers: authService.getAuthHeaders()
                }
            );
            return response.data;
        } catch (error) {
            console.error(`Error unlinking ${provider} account:`, error);
            throw error;
        }
    },

    /**
     * Set a password for the account (for users who signed up via OAuth)
     * @param {Object} passwordData - Password and confirmation
     * @returns {Promise} API response
     */
    async setPassword(passwordData) {
        try {
            this.validatePasswordData(passwordData);

            const { confirmPassword: _, ...dataToSend } = passwordData;
            // Use the profiles credentials endpoint (fix: use singular 'credential')
            const response = await axios.put(
                `${API_BASE_URL}/profiles/credential`,
                dataToSend,
                {
                    headers: authService.getAuthHeaders()
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error setting password:', error);
            throw error;
        }
    },

    /**
     * Validate password data before submission
     * @param {Object} passwordData - Password data to validate
     * @throws {Error} - If validation fails
     */
    validatePasswordData(passwordData) {
        if (passwordData.password !== passwordData.confirmPassword) {
            throw new Error('Passwords do not match');
        }
        if (!passwordData.password || passwordData.password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }
    },

    /**
     * Check if it's safe to unlink an account (user has other login methods)
     * @param {Array} linkedAccounts - Current linked accounts
     * @param {string} providerToUnlink - Provider being unlinked
     * @param {boolean} hasPassword - Whether user has a password set
     * @returns {boolean} Whether it's safe to unlink
     */
    canSafelyUnlink(linkedAccounts, providerToUnlink, hasPassword) {
        const otherLinkedAccounts = linkedAccounts.filter(
            account => account.provider !== providerToUnlink && account.isLinked
        );

        // Safe if user has password OR other linked accounts
        return hasPassword || otherLinkedAccounts.length > 0;
    }
};
