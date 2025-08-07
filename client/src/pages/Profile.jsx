import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileForm from '../components/ProfileManagement/ProfileForm';
import CredentialForm from '../components/ProfileManagement/CredentialForm';
import LinkedAccounts from '../components/ProfileManagement/linkedAccounts.jsx';
import AccountDeactivation from '../components/ProfileManagement/AccountDeactivation';
import { useApi } from '../hooks/useApi';
import { useFormStatus } from '../hooks/useFormStatus';
import { profileService } from '../services/profileService';

function Profile() {
    const navigate = useNavigate();
    
    // Form state - Initialize with default values to prevent undefined errors
    const [profile, setProfile] = useState({
        firstName: '',
        lastName: '',
        displayName: '',
        avatar: null
    });
    const [credentials, setCredentials] = useState({
        email: '',
        password: '',
        phoneNumber: '',
        confirmPassword: ''
    });

    // Use custom hooks
    const { 
        data: profileData, 
        loading, 
        error, 
        execute: fetchProfile 
    } = useApi(profileService.getProfile);
    
    const { status, setErrorMessage } = useFormStatus();

    // Fetch profile data on component mount
    useEffect(() => {
        const loadProfile = async () => {
            try {
                await fetchProfile();
                
                // Check if user just returned from OAuth linking
                const returnAfterLink = localStorage.getItem('returnAfterLink');
                if (returnAfterLink === window.location.pathname) {
                    localStorage.removeItem('returnAfterLink');
                    // Could show a success message here if desired
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                setErrorMessage(error);
                
                // If unauthorized, redirect to login
                if (error.response?.status === 401 || error.response?.status === 403) {
                    setTimeout(() => navigate('/login'), 2000);
                }
            }
        };

        loadProfile();
    }, [fetchProfile, navigate, setErrorMessage]);

    // Update form state when profile data is loaded
    useEffect(() => {
        if (profileData?.data) {
            const data = profileData.data;
            setProfile({
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                displayName: data.displayName || '',
                avatar: data.avatar || null
            });
            setCredentials({
                email: data.email || '',
                phoneNumber: data.phoneNumber || '',
                password: '',
                confirmPassword: ''
            });
        }
    }, [profileData]);

    // Handle profile refresh after updates
    const handleProfileUpdate = async () => {
        try {
            await fetchProfile();
        } catch (error) {
            console.error('Error refreshing profile:', error);
            setErrorMessage(error);
        }
    };

    return (
        <div className="min-h-screen" style={{ backgroundColor: 'var(--color-background)' }}>
            <div className="px-4 sm:px-6 lg:px-8 py-12">
                {/* Loading State */}
                {loading && (
                    <div className="flex justify-center items-center h-screen">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[var(--color-secondary)]">
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="flex justify-center items-center min-h-[60vh]">
                        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md mx-auto">
                            <div className="text-red-500 mb-4">
                                <svg className="mx-auto h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-4">Error Loading Profile</h3>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                {error.response?.data?.message || 'Unable to load your profile data. Please try again.'}
                            </p>
                            <button 
                                onClick={handleProfileUpdate}
                                className="px-6 py-3 bg-[var(--color-primary)] text-gray-800 rounded-lg font-semibold hover:bg-[var(--color-highlight)] transform hover:scale-105 transition-all duration-200 shadow-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:ring-offset-2"
                            >
                                Retry
                            </button>
                        </div>
                    </div>
                )}

                {/* Global Status Messages */}
                {status.message && (
                    <div className={`mb-8 p-4 rounded-lg shadow-sm ${status.success ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                        <div className="flex items-center gap-3">
                            {status.success ? (
                                <svg className="w-6 h-6 text-green-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="w-6 h-6 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            )}
                            <span className="font-medium">{status.message}</span>
                        </div>
                    </div>
                )}

                {/* Profile Content - Only show when not loading and no error */}
                {!loading && !error && (
                    <>
                        {/* Header Section */}
                        <div className="text-center mb-12">
                            <div className="inline-block p-6 rounded-full mb-6 bg-[var(--color-primary)] shadow-lg">
                                <svg className="w-10 h-10 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Profile Settings</h1>
                            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                                Manage your account information and preferences
                            </p>
                        </div>

                        <div className="max-w-7xl mx-auto space-y-8">
                            {/* First Row - Profile and Credentials */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Profile Form */}
                                <div className="bg-white rounded-lg shadow-md border border-gray-500 overflow-hidden">
                                    <div className="px-6 py-4 bg-[var(--color-primary)] border-b border-gray-200">
                                        <div className="flex items-center gap-3">
                                            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            <h2 className="text-xl font-semibold text-gray-800">Personal Information</h2>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <ProfileForm
                                            profile={profile}
                                            setProfile={setProfile}
                                            onProfileUpdate={handleProfileUpdate}
                                        />
                                    </div>
                                </div>

                                {/* Credentials Form */}
                                <div className="bg-white rounded-lg shadow-md border border-gray-500 overflow-hidden">
                                    <div className="px-6 py-4 bg-[var(--color-primary)] border-b border-gray-200">
                                        <div className="flex items-center gap-3">
                                            <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                            <h2 className="text-xl font-semibold text-gray-800">Account Security</h2>
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <CredentialForm
                                            credentials={credentials}
                                            setCredentials={setCredentials}
                                            onCredentialsUpdate={handleProfileUpdate}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Second Row - Login Methods */}
                            <div className="bg-white rounded-lg shadow-md border border-gray-500 overflow-hidden">
                                <div className="px-6 py-4 bg-[var(--color-secondary)] border-b border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                        </svg>
                                        <h2 className="text-xl font-semibold text-white">Login Methods</h2>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <LinkedAccounts onAccountsUpdate={handleProfileUpdate} />
                                </div>
                            </div>

                            {/* Third Row - Account Deactivation */}
                            <div className="bg-white rounded-lg shadow-md border border-red-200 overflow-hidden">
                                <div className="px-6 py-4 bg-red-50 border-b border-red-200">
                                    <div className="flex items-center gap-3">
                                        <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                        <h2 className="text-xl font-semibold text-red-900">Danger Zone</h2>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <AccountDeactivation />
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Profile;