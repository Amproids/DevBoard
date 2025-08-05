import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useFormStatus } from '../../hooks/useFormStatus';

function AccountDeactivation() {
    const [confirmation, setConfirmation] = useState('');
    const { status, loading, setLoading, setErrorMessage } = useFormStatus();
    const navigate = useNavigate();

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

    const isConfirmationValid = confirmation === 'DEACTIVATE';

    return (
        <div>
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">
                            Danger Zone
                        </h3>
                        <p className="mt-1 text-sm text-red-700">
                            This action cannot be undone. Deactivating your account will permanently remove all your data, including boards, tasks, and personal information.
                        </p>
                    </div>
                </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="confirmation" className="block text-sm font-medium text-gray-700 mb-2">
                        Type "DEACTIVATE" to confirm account deletion:
                    </label>
                    <input
                        type="text"
                        id="confirmation"
                        name="confirmation"
                        className="block w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        value={confirmation}
                        onChange={handleChange}
                        placeholder="DEACTIVATE"
                        disabled={loading}
                    />
                </div>
                
                <button
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        isConfirmationValid && !loading
                            ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    type="submit"
                    disabled={!isConfirmationValid || loading}
                >
                    {loading ? 'Deactivating Account...' : 'Deactivate Account'}
                </button>
                
                {status.message && !status.success && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                        {status.message}
                    </div>
                )}
            </form>
        </div>
    );
}

export default AccountDeactivation;