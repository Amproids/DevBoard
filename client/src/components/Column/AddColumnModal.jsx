import React, { useState, useEffect, useRef } from 'react';
import { columnService } from '../../services/columnService';

function AddColumnModal({ isOpen, onClose, boardId, onColumnCreated }) {
    const [formData, setFormData] = useState({
        name: '',
        isLocked: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Add ref for the name input
    const nameInputRef = useRef(null);

    useEffect(() => {
        if (!isOpen) return;

        const handleEscape = e => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';

        // Auto-focus the name input when modal opens
        // Use setTimeout to ensure the modal is fully rendered
        const focusTimeout = setTimeout(() => {
            if (nameInputRef.current) {
                nameInputRef.current.focus();
            }
        }, 100);

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
            clearTimeout(focusTimeout);
        };
    }, [isOpen, onClose]);

    const handleInputChange = e => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async e => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setError('Column name is required');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const columnData = {
                name: formData.name.trim(),
                isLocked: formData.isLocked
            };

            const response = await columnService.createColumn(
                boardId,
                columnData
            );

            // Call the callback to refresh board data
            if (onColumnCreated) {
                onColumnCreated(response.data);
            }

            // Reset form and close modal
            setFormData({ name: '', isLocked: false });
            onClose();
        } catch (error) {
            console.error('Error creating column:', error);
            setError(
                error.response?.data?.message || 'Failed to create column'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setFormData({ name: '', isLocked: false });
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={e => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Add New Column
                    </h2>
                    <button
                        onClick={handleClose}
                        className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                        aria-label="Close modal"
                        disabled={loading}
                    >
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                <div className="p-5">
                    <form onSubmit={handleSubmit}>
                        {/* Column Name */}
                        <div className="mb-4">
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-gray-700 mb-1.5"
                            >
                                Column Name *
                            </label>
                            <input
                                ref={nameInputRef}
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter column name"
                                disabled={loading}
                                maxLength={50}
                            />
                        </div>

                        {/* Lock Column Option */}
                        <div className="mb-4">
                            <label className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    name="isLocked"
                                    checked={formData.isLocked}
                                    onChange={handleInputChange}
                                    disabled={loading}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Lock column (prevents modifications)
                                </span>
                            </label>
                        </div>

                        {/* Info about locked columns */}
                        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                            <p className="text-sm text-amber-700 flex items-center gap-2">
                                <svg
                                    className="h-4 w-4 text-amber-400 flex-shrink-0"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                Locked columns cannot be renamed or deleted
                                untill unlocked.
                            </p>
                        </div>
                        {error && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-sm text-red-700 flex items-center gap-2">
                                    <svg
                                        className="h-4 w-4 text-red-400 flex-shrink-0"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                            clipRule="evenodd"
                                        />
                                    </svg>
                                    {error}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={`px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                    loading || !formData.name.trim()
                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 cursor-pointer'
                                }`}
                                disabled={loading || !formData.name.trim()}
                            >
                                {loading ? 'Creating...' : 'Create Column'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddColumnModal;
