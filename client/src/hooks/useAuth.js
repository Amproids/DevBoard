import { useState, useEffect } from 'react';

import {
    getAuthToken,
    setAuthToken,
    removeAuthToken,
    extractTokenFromUrl
} from '../utils/tokenUtils';

function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Handle OAuth token from URL
        const urlToken = extractTokenFromUrl();

        if (urlToken) {
            setIsAuthenticated(true);
        } else {
            // Check for existing token
            const existingToken = getAuthToken();
            if (existingToken) {
                // check if expired then logout
                const tokenPayload = JSON.parse(atob(existingToken.split('.')[1]));
                const isExpired = tokenPayload.exp * 1000 < Date.now();
                if (isExpired) {
                    removeAuthToken();
                    setIsAuthenticated(false);
                } else {
                    setIsAuthenticated(true);
                }
            }
        }
        setIsLoading(false);
    }, []);

    const login = (token) => {
        if (token) {
            setAuthToken(token);
        }
        setIsAuthenticated(true);
    };

    const logout = () => {
        removeAuthToken();
        setIsAuthenticated(false);
    };

    return {
        isAuthenticated,
        isLoading,
        login,
        logout
    };
}

export default useAuth;