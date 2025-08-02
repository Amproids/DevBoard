import axios from 'axios';
import { useState, useEffect } from 'react';

function ProfileForm({ profile, setProfile }) {
    const [status, setStatus] = useState({
        success: false,
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [originalProfile, setOriginalProfile] = useState({
        firstName: '',
        lastName: '',
        displayName: '',
        avatar: null
    });
    const [hasChanges, setHasChanges] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Store original profile when it's loaded
    useEffect(() => {
        // Only set original profile once when data is first loaded
        if (!isInitialized && (profile.firstName || profile.lastName || profile.displayName)) {
            setOriginalProfile({
                firstName: profile.firstName || '',
                lastName: profile.lastName || '',
                displayName: profile.displayName || '',
                avatar: profile.avatar || null
            });
            setIsInitialized(true);
        }
    }, [profile.firstName, profile.lastName, profile.displayName, profile.avatar, isInitialized]);

    // Check for changes whenever profile changes
    useEffect(() => {
        if (!isInitialized) return; // Don't check for changes until we have original values
        
        const firstNameChanged = profile.firstName !== originalProfile.firstName;
        const lastNameChanged = profile.lastName !== originalProfile.lastName;
        const displayNameChanged = profile.displayName !== originalProfile.displayName;
        const avatarChanged = profile.avatar !== originalProfile.avatar;
        
        const changesDetected = firstNameChanged || lastNameChanged || displayNameChanged || avatarChanged;
        setHasChanges(changesDetected);
    }, [profile, originalProfile, isInitialized]);

    const handleChange = event => {
        const { name, value, files } = event.target;
        
        if (name === 'avatar' && files && files[0]) {
            setProfile(prevProfile => ({
                ...prevProfile,
                [name]: files[0]
            }));
        } else {
            setProfile(prevProfile => ({
                ...prevProfile,
                [name]: value
            }));
        }
    };

    const handleSubmit = async event => {
        try {
            event.preventDefault();
            setStatus({
                success: false,
                message: ''
            });
            setLoading(true);

            // Get token from localStorage
            const token = localStorage.getItem('authToken');

            if (!token) {
                throw new Error('Authentication token not found');
            }
            
            const response = await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/profiles`,
                profile,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            
            setStatus({
                success: true,
                message: 'Profile updated successfully'
            });
            
            // Update original profile after successful save
            setOriginalProfile({
                firstName: profile.firstName,
                lastName: profile.lastName,
                displayName: profile.displayName,
                avatar: profile.avatar
            });
            
        } catch (error) {
            console.error('Error updating profile:', error);
            setStatus({
                success: false,
                message: error.response?.data?.message || error.message || 'An error occurred'
            });
        } finally {
            setLoading(false);
            setTimeout(() => {
                setStatus({
                    success: false,
                    message: ''
                });
            }, 5000);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-medium mb-4 mt-4 md:mt-16">
                Profile Management
            </h2>
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col mb-4">
                    <label htmlFor="firstName">
                        First Name <span className="p-1 text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-0"
                        value={profile.firstName || ''}
                        onChange={handleChange}
                        placeholder="Enter your first name"
                        required
                    />
                </div>
                <div className="flex flex-col mb-4">
                    <label htmlFor="lastName">
                        Last Name <span className="p-1 text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-0"
                        value={profile.lastName || ''}
                        onChange={handleChange}
                        placeholder="Enter your last name"
                        required
                    />
                </div>

                <div className="flex flex-col mb-4">
                    <label htmlFor="displayName">Display Name</label>
                    <input
                        type="text"
                        id="displayName"
                        name="displayName"
                        className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-0"
                        value={profile.displayName || ''}
                        onChange={handleChange}
                        placeholder="Enter your display name"
                    />
                </div>

                <div className="flex flex-col mb-4">
                    <label htmlFor="avatar">Profile Picture</label>
                    <input
                        type="file"
                        id="avatar"
                        name="avatar"
                        className="border border-gray-300 rounded-lg p-2 file:rounded-lg file:bg-[#f3f4f6] focus:outline-none focus:ring-0"
                        onChange={handleChange}
                        accept="image/*"
                    />
                </div>
                <button
                    className={`cursor-pointer text-black py-2 px-4 rounded-lg focus:outline-none focus:ring-0 transition-colors ${
                        hasChanges && !loading
                            ? 'bg-[var(--color-secondary)] hover:bg-[var(--color-highlight)]'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    type="submit"
                    disabled={!hasChanges || loading}
                >
                    {loading ? 'Updating...' : 'Update Profile'}
                </button>
                <div className="mt-4">
                    {status.success && (
                        <p className="text-green-500">{status.message}</p>
                    )}
                    {!status.success && status.message && (
                        <p className="text-red-500">{status.message}</p>
                    )}
                </div>
            </form>
        </div>
    );
}

export default ProfileForm;
