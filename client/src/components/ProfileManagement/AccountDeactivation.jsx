import React, { useState } from 'react';
import DeactivateModal from './DeactivateModal';

function AccountDeactivation() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div>
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                        <svg
                            className="h-5 w-5 text-red-400"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fillRule="evenodd"
                                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                    <div>
                        <h3 className="font-medium text-red-800 mb-1">
                            Account Deactivation
                        </h3>
                        <p className="text-sm text-red-700">
                            Permanently delete your account and all associated
                            data. This action cannot be undone.
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
