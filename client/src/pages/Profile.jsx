import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProfileForm from '../components/ProfileManagement/ProfileForm';
import CredentialForm from '../components/ProfileManagement/CredentialForm';
import LinkedAccounts from '../components/ProfileManagement/linkedAccounts.jsx';
import DeactivateModal from '../components/ProfileManagement/DeactivateModal'; // Updated import
import { useApi } from '../hooks/useApi';
import { useFormStatus } from '../hooks/useFormStatus';
import { profileService } from '../services/profileService';

function Profile() {
    const navigate = useNavigate();
    
    // Modal state
    const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
    
    // Form state
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

    const handleDeactivateClick = () => {
        setIsDeactivateModalOpen(true);
    };

    const handleCloseDeactivateModal = () => {
        setIsDeactivateModalOpen(false);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="flex justify-center items-center h-[40vh]">
                    <div className="text-center">
                        <div className="text-red-500 mb-4">
                            <svg className="mx-auto h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Profile</h3>
                        <p className="text-gray-500 mb-6">
                            {error.response?.data?.message || 'Unable to load your profile data. Please try again.'}
                        </p>
                        <button 
                            onClick={handleProfileUpdate}
                            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors font-medium"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            )}

            {/* Global Status Messages */}
            {status.message && (
                <div className={`mb-6 p-4 rounded-md ${status.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    {status.message}
                </div>
            )}

            {/* Profile Content */}
            {!loading && !error && (
                <>
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
                        <p className="text-gray-600">Manage your account information and preferences</p>
                    </div>

                    <div className="space-y-8">
                        {/* First Row - Profile and Credentials */}
                        <div className="flex flex-col lg:flex-row justify-center gap-8 mx-auto lg:max-w-6xl">
                            {/* Profile Form */}
                            <div className="w-full lg:w-1/2">
                                <div className="bg-white rounded-lg shadow-sm border p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
                                    <ProfileForm
                                        profile={profile}
                                        setProfile={setProfile}
                                        onProfileUpdate={handleProfileUpdate}
                                    />
                                </div>
                            </div>

                            {/* Credentials Form */}
                            <div className="w-full lg:w-1/2">
                                <div className="bg-white rounded-lg shadow-sm border p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Account Credentials</h2>
                                    <CredentialForm
                                        credentials={credentials}
                                        setCredentials={setCredentials}
                                        onCredentialsUpdate={handleProfileUpdate}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Second Row - Login Methods */}
                        <div className="flex justify-center mx-auto lg:max-w-4xl">
                            <div className="w-full">
                                <div className="bg-white rounded-lg shadow-sm border p-6">
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Login Methods</h2>
                                    <p className="text-gray-600 mb-6">
                                        Manage how you sign in to your account. You can use multiple login methods for convenience and security.
                                    </p>
                                    <LinkedAccounts onAccountsUpdate={handleProfileUpdate} />
                                </div>
                            </div>
                        </div>

                        {/* Third Row - Account Deactivation (Updated to use button) */}
                        <div className="flex justify-center mx-auto lg:max-w-4xl">
                            <div className="w-full">
                                <div className="bg-white rounded-lg shadow-sm border p-6">
                                    <h2 className="text-xl font-semibold text-red-900 mb-4">Danger Zone</h2>
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <h3 className="text-sm font-medium text-red-800">
                                                    Account Deactivation
                                                </h3>
                                                <p className="mt-1 text-sm text-red-700">
                                                    Permanently delete your account and all associated data. This action cannot be undone.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleDeactivateClick}
                                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                        Deactivate Account
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Deactivate Modal */}
            <DeactivateModal 
                isOpen={isDeactivateModalOpen} 
                onClose={handleCloseDeactivateModal} 
            />
        </div>
    );
}

export default Profile;