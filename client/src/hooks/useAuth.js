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
                setIsAuthenticated(true);
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