import React, { useState } from 'react';
import DeactivateModal from './DeactivateModal';

function AccountDeactivation() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
<<<<<<< HEAD
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
                    className={`cursor-pointer py-2 px-4 rounded-lg focus:outline-none focus:ring-0 transition-colors ${isConfirmationValid && !loading
                        ? 'bg-red-50 border-red-200 border text-black hover:bg-red-100'
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
=======
        <div>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
>>>>>>> andrew
                    </div>
                    <div>
                        <h3 className="font-medium text-red-800 mb-1">
                            Account Deactivation
                        </h3>
                        <p className="text-sm text-red-700">
                            Permanently delete your account and all associated data. This action cannot be undone.
                        </p>
                    </div>
                </div>
            </div>
            <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 cursor-pointer"
            >
                Deactivate Account
            </button>
            
            <DeactivateModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}

export default AccountDeactivation;
