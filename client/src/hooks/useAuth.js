import { useState, useEffect } from 'react';

function useAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Handle OAuth token from URL
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (token) {
            localStorage.setItem('authToken', token);
            window.history.replaceState({}, document.title, window.location.pathname);
            setIsAuthenticated(true);
        } else {
            // Check for existing token
            const existingToken = localStorage.getItem('authToken');
            if (existingToken) {
                setIsAuthenticated(true);
            }
        }
        setIsLoading(false);
    }, []);

    const login = () => {
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('authToken');
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