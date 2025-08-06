import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useFormStatus } from '../../hooks/useFormStatus';

function DeactivateModal({ isOpen, onClose }) {
    const [confirmation, setConfirmation] = useState('');
    const { status, loading, setLoading, setErrorMessage } = useFormStatus();
    const navigate = useNavigate();

    // Reset form when modal opens/closes
    useEffect(() => {
        if (isOpen) {
            setConfirmation('');
        }
    }, [isOpen]);

    // Close modal on escape key
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleChange = event => {
        const { value } = event.target;
        setConfirmation(value);
    };

    const handleSubmit = async event => {
        event.preventDefault();
        setLoading(true);

        try {
            if (confirmation !== 'DEACTIVATE') {
                throw new Error('Please type "DEACTIVATE" exactly to confirm');
            }

            await authService.deactivateAccount();
            navigate('/logout');

        } catch (error) {
            console.error('Error deactivating account:', error);
            setErrorMessage(error);
        } finally {
            setLoading(false);
        }
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const isConfirmationValid = confirmation === 'DEACTIVATE';

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={handleBackdropClick}
        >
            <div 
                className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-red-900">
                        Deactivate Account
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                        disabled={loading}
                        aria-label="Close modal"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Warning Banner */}
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-red-800">
                                    This action cannot be undone
                                </h3>
                                <p className="mt-1 text-sm text-red-700">
                                    Deactivating your account will permanently remove all your data, including boards, tasks, and personal information.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                                Type "DEACTIVATE" to confirm account deletion:
                            </label>
                            <input
                                type="text"
                                id="confirmation"
                                name="confirmation"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                value={confirmation}
                                onChange={handleChange}
                                placeholder="DEACTIVATE"
                                disabled={loading}
                                autoComplete="off"
                            />
                        </div>

                        {/* Error Message */}
                        {status.message && !status.success && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                                {status.message}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className={`w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                    isConfirmationValid && !loading
                                        ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                                disabled={!isConfirmationValid || loading}
                            >
                                {loading ? 'Deactivating Account...' : 'Deactivate Account'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default DeactivateModal;