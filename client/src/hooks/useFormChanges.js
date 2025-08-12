import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for tracking form changes
 * @param {Object} initialData - Initial form data
 * @returns {Object} Form state and change tracking
 */
export const useFormChanges = initialData => {
    const [originalData, setOriginalData] = useState(initialData);
    const [hasChanges, setHasChanges] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize original data when dependencies change
    useEffect(() => {
        const hasData = Object.values(initialData).some(
            value => value !== null && value !== undefined && value !== ''
        );

        if (!isInitialized && hasData) {
            setOriginalData({ ...initialData });
            setIsInitialized(true);
        }
    }, [initialData, isInitialized]);

    // Check for changes whenever dependencies change
    const checkForChanges = useCallback(
        currentData => {
            if (!isInitialized) return false;

            const changes = Object.keys(currentData).some(key => {
                const current = currentData[key];
                const original = originalData[key];

                // Handle file comparison
                if (current instanceof File || original instanceof File) {
                    return current !== original;
                }

                // Handle other data types
                return current !== original;
            });

            setHasChanges(changes);
            return changes;
        },
        [originalData, isInitialized]
    );

    // Update original data after successful save
    const updateOriginalData = useCallback(newData => {
        setOriginalData({ ...newData });
        setHasChanges(false);
    }, []);

    // Reset to original data
    const resetToOriginal = useCallback(() => {
        setHasChanges(false);
        setOriginalData({ ...originalData });
    }, [originalData]);

    return {
        originalData,
        hasChanges,
        isInitialized,
        checkForChanges,
        updateOriginalData,
        resetToOriginal
    };
};
