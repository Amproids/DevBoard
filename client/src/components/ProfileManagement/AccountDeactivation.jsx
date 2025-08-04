// components/AccountDeactivation.jsx
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
            // Validate confirmation text
            if (confirmation !== 'DEACTIVATE') {
                throw new Error('Please type "DEACTIVATE" exactly to confirm');
            }

            // Call the deactivation service (this already calls logout internally)
            await authService.deactivateAccount();

            // Navigate to logout page (which will handle the auth state update)
            navigate('/logout');

        } catch (error) {
            console.error('Error deactivating account:', error);
            setErrorMessage(error);
        } finally {
            setLoading(false);
        }
    };

    // Check if user has typed exactly "DEACTIVATE"
    const isConfirmationValid = confirmation === 'DEACTIVATE';

    return (
        <div className="text-base">
            <h2 className="text-xl font-medium mb-4 mt-4 md:mt-16">
                Account Deactivation
            </h2>
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">
                    <strong>Warning:</strong> This action cannot be undone. Deactivating your account will permanently remove all your data.
                </p>
            </div>
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col mb-4">
                    <label htmlFor="confirmation" className="mb-2 text-sm font-medium">
                        Type "DEACTIVATE" to confirm account deletion:
                    </label>
                    <input
                        type="text"
                        id="confirmation"
                        name="confirmation"
                        className="border border-gray-300 md:w-lg rounded-lg p-2 focus:outline-none focus:ring-0"
                        value={confirmation}
                        onChange={handleChange}
                        placeholder="DEACTIVATE"
                        disabled={loading}
                    />
                </div>
                <button
                    className={`cursor-pointer py-2 px-4 rounded-lg focus:outline-none focus:ring-0 transition-colors ${
                        isConfirmationValid && !loading
                            ? 'bg-red-600 text-white hover:bg-red-700'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    type="submit"
                    disabled={!isConfirmationValid || loading}
                >
                    {loading ? 'Deactivating...' : 'Deactivate Account'}
                </button>
                {!status.success && status.message && (
                    <div className="mt-4">
                        <p className="text-red-500">{status.message}</p>
                    </div>
                )}
            </form>
        </div>
    );
}

export default AccountDeactivation;