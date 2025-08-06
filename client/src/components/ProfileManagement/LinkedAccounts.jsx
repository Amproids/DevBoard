import React, { useState, useEffect } from 'react';
import { linkedAccountsService } from '../../services/linkedAccountsService';
import { useApi } from '../../hooks/useApi';
import { useFormStatus } from '../../hooks/useFormStatus';

function LinkedAccounts({ onAccountsUpdate }) {
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({
        password: '',
        confirmPassword: ''
    });

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

    const handleSetPassword = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await linkedAccountsService.setPassword(passwordData);
            setSuccessMessage('Password set successfully');
            setPasswordData({ password: '', confirmPassword: '' });
            setShowPasswordForm(false);
            await fetchLinkedAccounts();
            if (onAccountsUpdate) await onAccountsUpdate();
        } catch (error) {
            setErrorMessage(error);
        } finally {
            setLoading(false);
        }
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
                        {!hasPassword && (
                            <button
                                onClick={() => setShowPasswordForm(true)}
                                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={loading}
                            >
                                Set Password
                            </button>
                        )}
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

            {/* Password Form Modal */}
            {showPasswordForm && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Set Password</h3>
                        <form onSubmit={handleSetPassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.password}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, password: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    minLength={6}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    minLength={6}
                                    required
                                />
                            </div>
                            <div className="flex space-x-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={loading}
                                >
                                    {loading ? 'Setting...' : 'Set Password'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowPasswordForm(false);
                                        setPasswordData({ password: '', confirmPassword: '' });
                                    }}
                                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Status Messages */}
            {status.message && (
                <div className={`p-3 rounded-lg ${status.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {status.message}
                </div>
            )}
        </div>
    );
}

export default LinkedAccounts;