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

    const { status, setLoading, setSuccessMessage, setErrorMessage } =
        useFormStatus();

    useEffect(() => {
        fetchLinkedAccounts();
    }, [fetchLinkedAccounts]);

    // Provider configurations with SVG icons
    const providers = [
        {
            name: 'Google',
            id: 'google',
            color: 'bg-gray-800',
            icon: (
                <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                >
                    <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                    />
                    <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                    />
                    <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                    />
                    <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                    />
                </svg>
            )
        },
        {
            name: 'GitHub',
            id: 'github',
            color: 'bg-gray-800',
            icon: (
                <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
            )
        }
    ];

    const handleLinkAccount = async provider => {
        try {
            await linkedAccountsService.linkAccount(provider);
        } catch (error) {
            setErrorMessage(error);
        }
    };

    const handleUnlinkAccount = async provider => {
        if (!accountsData) return;

        const canUnlink = linkedAccountsService.canSafelyUnlink(
            accountsData.linkedAccounts,
            provider,
            accountsData.hasPassword
        );

        if (!canUnlink) {
            setErrorMessage(
                new Error(
                    'Cannot unlink this account. You must have at least one login method (password or linked account).'
                )
            );
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
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Password Login
                </h3>
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                            <svg
                                className="w-6 h-6 text-gray-600"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                />
                            </svg>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">
                                Email & Password
                            </p>
                            <p className="text-sm text-gray-500">
                                {hasPassword
                                    ? 'Password is set'
                                    : 'No password set'}
                            </p>
                        </div>
                    </div>
                    <div>
                        <button
                            onClick={() => setIsPasswordModalOpen(true)}
                            className="px-3 py-1.5 text-sm bg-[var(--color-highlight)] text-white rounded-md hover:bg-blue-600 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                            disabled={loading}
                        >
                            {hasPassword ? 'Change Password' : 'Set Password'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Social Login Providers */}
            <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">
                    Social Login
                </h3>
                <div className="space-y-3">
                    {providers.map(provider => {
                        const linkedAccount = linkedAccounts.find(
                            acc => acc.provider === provider.id
                        );
                        const isLinked = linkedAccount?.isLinked || false;

                        return (
                            <div
                                key={provider.id}
                                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0">
                                        <div
                                            className={`p-2 rounded-lg ${provider.color} text-white`}
                                        >
                                            {provider.icon}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            {provider.name}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {isLinked
                                                ? linkedAccount.email
                                                    ? `Connected as ${linkedAccount.email}`
                                                    : linkedAccount.username
                                                      ? `Connected as ${linkedAccount.username}`
                                                      : 'Connected'
                                                : 'Not connected'}
                                        </p>
                                    </div>
                                </div>
                                <div>
                                    {isLinked ? (
                                        <button
                                            onClick={() =>
                                                handleUnlinkAccount(provider.id)
                                            }
                                            className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                                            disabled={loading}
                                        >
                                            Unlink
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() =>
                                                handleLinkAccount(provider.id)
                                            }
                                            className={`px-3 py-1.5 text-sm text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${provider.color} hover:opacity-90 disabled:opacity-50`}
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
                <div
                    className={`p-3 rounded-lg ${status.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}
                >
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
