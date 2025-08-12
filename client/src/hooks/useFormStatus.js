import { useState, useCallback } from 'react';

/**
 * Custom hook for managing form submission status
 * @param {number} messageDuration - Duration of the message in milliseconds
 * @returns {Object} Status state and handlers
 */
export const useFormStatus = (messageDuration = 5000) => {
    const [status, setStatus] = useState({
        success: false,
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const setSuccessMessage = useCallback(
        message => {
            setStatus({ success: true, message });

            if (messageDuration > 0) {
                setTimeout(() => {
                    setStatus({ success: false, message: '' });
                }, messageDuration);
            }
        },
        [messageDuration]
    );

    const setErrorMessage = useCallback(
        error => {
            const message =
                error.response?.data?.message ||
                error.message ||
                'An error occurred';

            setStatus({ success: false, message });

            if (messageDuration > 0) {
                setTimeout(() => {
                    setStatus({ success: false, message: '' });
                }, messageDuration);
            }
        },
        [messageDuration]
    );

    const resetStatus = useCallback(() => {
        setStatus({ success: false, message: '' });
    }, []);

    return {
        status,
        loading,
        setLoading,
        setSuccessMessage,
        setErrorMessage,
        resetStatus
    };
};
