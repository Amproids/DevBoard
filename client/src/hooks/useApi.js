import { set } from 'mongoose';
import { useState, useCallback, use } from 'react';

/**
 * Custom hook for API calls with loading and error handling
 * @param {Function} apiFunction - The API function to call
 * @returns {Object} API state and execute function
 */
export const useApi = (apiFunction) => {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const execute = useCallback(async (...args) => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiFunction(...args);
            setData(response.data);
            return response;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [apiFunction]);

    const reset = useCallback(() => {
        setData(null);
        setError(null);
        setLoading(false);
    }, []);

    return (
        {
            data,
            error,
            loading,
            execute,
            reset
        }
    )
}