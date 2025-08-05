import React, { useEffect } from 'react';
import { profileService } from '../../services/profileService';
import { useFormStatus } from '../../hooks/useFormStatus';
import { useFormChanges } from '../../hooks/useFormChanges';

function ProfileForm({ profile, setProfile, onProfileUpdate }) {
    const { status, loading, setLoading, setSuccessMessage, setErrorMessage } = useFormStatus();
    
    const { 
        hasChanges, 
        checkForChanges, 
        updateOriginalData 
    } = useFormChanges(
        {
            firstName: profile.firstName || '',
            lastName: profile.lastName || '',
            displayName: profile.displayName || '',
            avatar: profile.avatar || null
        },
        [profile.firstName, profile.lastName, profile.displayName, profile.avatar]
    );

    useEffect(() => {
        checkForChanges(profile);
    }, [profile, checkForChanges]);

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
        event.preventDefault();
        setLoading(true);

        try {
            await profileService.updateProfile(profile);
            setSuccessMessage('Profile updated successfully');
            updateOriginalData(profile);
            
            // Call parent callback to refresh data if provided
            if (onProfileUpdate) {
                await onProfileUpdate();
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setErrorMessage(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col mb-4">
                    <label htmlFor="firstName" className="mb-2 text-sm font-medium text-gray-700">
                        First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        value={profile.firstName || ''}
                        onChange={handleChange}
                        placeholder="Enter your first name"
                        disabled={loading}
                        required
                    />
                </div>
                
                <div className="flex flex-col mb-4">
                    <label htmlFor="lastName" className="mb-2 text-sm font-medium text-gray-700">
                        Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        value={profile.lastName || ''}
                        onChange={handleChange}
                        placeholder="Enter your last name"
                        disabled={loading}
                        required
                    />
                </div>

                <div className="flex flex-col mb-4">
                    <label htmlFor="displayName" className="mb-2 text-sm font-medium text-gray-700">
                        Display Name
                    </label>
                    <input
                        type="text"
                        id="displayName"
                        name="displayName"
                        className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        value={profile.displayName || ''}
                        onChange={handleChange}
                        placeholder="Enter your display name"
                        disabled={loading}
                    />
                </div>

                <div className="flex flex-col mb-6">
                    <label htmlFor="avatar" className="mb-2 text-sm font-medium text-gray-700">
                        Profile Picture
                    </label>
                    <input
                        type="file"
                        id="avatar"
                        name="avatar"
                        className="border border-gray-300 rounded-lg p-3 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        onChange={handleChange}
                        accept="image/*"
                        disabled={loading}
                    />
                </div>
                
                <button
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        hasChanges && !loading
                            ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    type="submit"
                    disabled={!hasChanges || loading}
                >
                    {loading ? 'Updating...' : 'Update Profile'}
                </button>
                
                {status.message && (
                    <div className={`mt-4 p-3 rounded-lg ${status.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        {status.message}
                    </div>
                )}
            </form>
        </div>
    );
}

export default ProfileForm;