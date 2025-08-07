import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';

function DeactivateModal({ isOpen, onClose }) {
    const [confirmationText, setConfirmationText] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (!isOpen) return;
        
        const handleEscape = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
        
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleDeactivate = async () => {
        try {
            await authService.deactivateAccount();
            navigate('/logout', { replace: true });
        } catch (error) {
            alert(error.message || 'An error occurred while deactivating your account');
        }
    };

    const isConfirmationValid = confirmationText === 'DEACTIVATE';

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-red-900">Deactivate Account</h2>
                    <button
                        onClick={onClose}
                        className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
                        aria-label="Close modal"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="p-6">
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-3">
                            <svg className="h-5 w-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
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
                    
                    <div className="mb-4">
                        <label htmlFor="confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                            Type "DEACTIVATE" to confirm account deletion:
                        </label>
                        <input
                            type="text"
                            id="confirmation"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                            value={confirmationText}
                            onChange={(e) => setConfirmationText(e.target.value)}
                            placeholder="DEACTIVATE"
                            autoComplete="off"
                        />
                    </div>
                    
                    <button
                        onClick={handleDeactivate}
                        disabled={!isConfirmationValid}
                        className={`w-full px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            isConfirmationValid
                                ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 cursor-pointer'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    >
                        Deactivate Account
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeactivateModal;