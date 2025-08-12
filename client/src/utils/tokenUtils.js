const TOKEN_KEY = 'authToken';

/**
 * Get authentication token from localStorage
 * @returns {string|null} Token value or null if not found
 */
export function getAuthToken() {
    return localStorage.getItem(TOKEN_KEY);
}

/**
 * Set authentication token in localStorage
 * @param {string} token - Token value to be set
 */
export const setAuthToken = token => {
    localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Remove authentication token from localStorage
 */
export const removeAuthToken = () => {
    localStorage.removeItem(TOKEN_KEY);
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated, false otherwise
 */
export const isAuthenticated = () => {
    return !!getAuthToken();
};

/**
 * Extract token from URL parameters and store it
 * @returns {string|null} Token value or null if not found in URL
 */
export const extractTokenFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (token) {
        setAuthToken(token);
        window.history.replaceState(
            {},
            document.title,
            window.location.pathname
        );
    }
    return token;
};
