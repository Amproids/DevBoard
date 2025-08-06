import React, { useState, useEffect } from 'react';
import { linkedAccountsService } from '../../services/linkedAccountsService';
import { useApi } from '../../hooks/useApi';
import { useFormStatus } from '../../hooks/useFormStatus';
import ChangePasswordModal from './ChangePasswordModal';

function LinkedAccounts({ onAccountsUpdate }) {
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

    const { 
        data: accountsData, 
        loading, 
        error, 
        execute: fetchLinkedAccounts 
    } = useApi(linkedAccountsService.getLinkedAccounts);

    const { status, setLoading, setSuccessMessage, setErrorMessage } = useFormStatus();

    useEffect(() => {
        fetchLinkedAccounts();
    }, [fetchLinkedAccounts]);

    // Provider configurations - only Google and GitHub
    const providers = [
        { name: 'Google', id: 'google', icon: '🔍', color: 'bg-red-500' },
        { name: 'GitHub', id: 'github', icon: '🐙', color: 'bg-gray-800' }
    ];

    const handleLinkAccount = async (provider) => {
        try {
            await linkedAccountsService.linkAccount(provider);
        } catch (error) {
            setErrorMessage(error);
        }
    };

    const handleUnlinkAccount = async (provider) => {
        if (!accountsData) return;

        const canUnlink = linkedAccountsService.canSafelyUnlink(
            accountsData.linkedAccounts,
            provider,
            accountsData.hasPassword
        );

        if (!canUnlink) {
            setErrorMessage(new Error('Cannot unlink this account. You must have at least one login method (password or linked account).'));
            return;
        }

        try {
            setLoading(true);
            await linkedAccountsService.unlinkAccount(provider);
            setSuccessMessage(`${provider} account unlinked successfully`);
            await fetchLinkedAccounts();
            if (onAccountsUpdate) await onAccountsUpdate();
        } catch (error) {
            setErrorMessage(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordUpdate = async () => {
        // Refresh the accounts data when password is updated
        await fetchLinkedAccounts();
        if (onAccountsUpdate) await onAccountsUpdate();
    };

    if (loading && !accountsData) {
        return (
            <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error && !accountsData) {
        return (
            <div className="text-center text-red-600">
                <p>Unable to load login methods</p>
                <button 
                    onClick={() => fetchLinkedAccounts()}
                    className="mt-2 text-blue-600 hover:underline"
                >
                    Try again
                </button>
            </div>
        );
    }

    const linkedAccounts = accountsData?.linkedAccounts || [];
    const hasPassword = accountsData?.hasPassword || false;

    return (
        <div className="space-y-6">
            {/* Password Section */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Password Login</h3>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <span className="text-2xl">🔒</span>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">
                                Email & Password
                            </p>
                            <p className="text-sm text-gray-500">
                                {hasPassword ? 'Password is set' : 'No password set'}
                            </p>
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => setIsPasswordModalOpen(true)}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={loading}
                        >
                            {hasPassword ? 'Change Password' : 'Set Password'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Social Login Providers */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Social Login</h3>
                <div className="space-y-3">
                    {providers.map((provider) => {
                        const linkedAccount = linkedAccounts.find(acc => acc.provider === provider.id);
                        const isLinked = linkedAccount?.isLinked || false;

                        return (
                            <div key={provider.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <span className="text-2xl">{provider.icon}</span>
                                    </div>
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-gray-900">
                                            {provider.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {isLinked ? (
                                                linkedAccount.email ? `Connected as ${linkedAccount.email}` :
                                                linkedAccount.username ? `Connected as ${linkedAccount.username}` :
                                                'Connected'
                                            ) : 'Not connected'}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    {isLinked ? (
                                        <button
                                            onClick={() => handleUnlinkAccount(provider.id)}
                                            className="px-3 py-1 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                            disabled={loading}
                                        >
                                            Unlink
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleLinkAccount(provider.id)}
                                            className={`px-3 py-1 text-sm text-white rounded-md focus:outline-none focus:ring-2 ${provider.color} hover:opacity-90`}
                                            disabled={loading}
                                        >
                                            Link Account
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Status Messages */}
            {status.message && (
                <div className={`p-3 rounded-lg ${status.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {status.message}
                </div>
            )}

            {/* Change Password Modal */}
            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                onPasswordUpdate={handlePasswordUpdate}
            />
        </div>
    );
}

export default LinkedAccounts;