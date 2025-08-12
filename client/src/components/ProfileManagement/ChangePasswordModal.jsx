import React, { useState, useEffect } from 'react';
import { credentialsService } from '../../services/credentialsService';
import { useFormStatus } from '../../hooks/useFormStatus';

function ChangePasswordModal({ isOpen, onClose, onPasswordUpdate }) {
    const { status, loading, setLoading, setSuccessMessage, setErrorMessage } = useFormStatus();
    
    const [passwordData, setPasswordData] = useState({
        password: '',
        confirmPassword: ''
    });

    // Check if form is valid and get validation errors
    const passwordTooShort = passwordData.password.length > 0 && passwordData.password.length < 6;
    const passwordsMismatch = passwordData.password.length > 0 && 
                             passwordData.confirmPassword.length > 0 && 
                             passwordData.password !== passwordData.confirmPassword;
    
    const isFormValid = passwordData.password.length >= 6 && 
                       passwordData.confirmPassword.length >= 6 &&
                       passwordData.password === passwordData.confirmPassword;

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setPasswordData({
                password: '',
                confirmPassword: ''
            });
        }
    }, [isOpen]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        
        try {
            // Create credentials object for validation
            const credentials = {
                password: passwordData.password,
                confirmPassword: passwordData.confirmPassword
            };
            
            credentialsService.validateCredentials(credentials);
            await credentialsService.updateCredentials(credentials);
            
            setSuccessMessage('Password updated successfully');
            
            // Reset form
            setPasswordData({
                password: '',
                confirmPassword: ''
            });
            
            // Call parent callback to refresh data if provided
            if (onPasswordUpdate) {
                await onPasswordUpdate();
            }
            
            // Close modal after successful update
            setTimeout(() => {
                onClose();
            }, 1500);
            
        } catch (error) {
            console.error('Error updating password:', error);
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

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Change Password</h2>
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="modal-password" className="block text-sm font-medium text-gray-700 mb-2">
                            New Password <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            id="modal-password"
                            name="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            value={passwordData.password}
                            onChange={handleChange}
                            placeholder="Enter new password (min. 6 characters)"
                            disabled={loading}
                            minLength={6}
                            required
                        />
                        {passwordTooShort && (
                            <p className="text-red-500 text-sm mt-1">Password must be at least 6 characters long</p>
                        )}
                    </div>
                    
                    <div>
                        <label htmlFor="modal-confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                            Confirm New Password <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="password"
                            id="modal-confirmPassword"
                            name="confirmPassword"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            value={passwordData.confirmPassword}
                            onChange={handleChange}
                            placeholder="Confirm your new password"
                            disabled={loading}
                            minLength={6}
                            required
                        />
                        {passwordsMismatch && (
                            <p className="text-red-500 text-sm mt-1">Passwords must match</p>
                        )}
                    </div>

                    {/* Status Message */}
                    {status.message && (
                        <div className={`p-3 rounded-lg ${status.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            {status.message}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                                isFormValid && !loading
                                    ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                            disabled={!isFormValid || loading}
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ChangePasswordModal;