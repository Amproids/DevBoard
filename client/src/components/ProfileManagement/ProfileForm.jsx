import React, { useEffect } from 'react';
import { profileService } from '../../services/profileService';
import { useFormStatus } from '../../hooks/useFormStatus';
import { useFormChanges } from '../../hooks/useFormChanges';

function ProfileForm({ profile = {}, setProfile, onProfileUpdate }) {
    const { status, loading, setLoading, setSuccessMessage, setErrorMessage } =
        useFormStatus();

    const { hasChanges, checkForChanges, updateOriginalData } = useFormChanges(
        {
            firstName: profile?.firstName || '',
            lastName: profile?.lastName || '',
            displayName: profile?.displayName || '',
            avatar: profile?.avatar || 'null'
        },
        [
            profile?.firstName,
            profile?.lastName,
            profile?.displayName,
            profile?.avatar
        ]
    );

    useEffect(() => {
        checkForChanges(profile);
    }, [profile, checkForChanges]);

    const handleChange = event => {
        const { name, value, files } = event.target;

        if (name === 'avatar' && files && files[0]) {
            setProfile?.(prevProfile => ({
                ...prevProfile,
                [name]: files[0]
            }));
        } else {
            setProfile?.(prevProfile => ({
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
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label
                        htmlFor="firstName"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-[var(--color-secondary)] disabled:opacity-50 disabled:cursor-not-allowed"
                        value={profile?.firstName || ''}
                        onChange={handleChange}
                        placeholder="Enter your first name"
                        disabled={loading}
                        required
                    />
                </div>

                <div>
                    <label
                        htmlFor="lastName"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-[var(--color-secondary)] disabled:opacity-50 disabled:cursor-not-allowed"
                        value={profile?.lastName || ''}
                        onChange={handleChange}
                        placeholder="Enter your last name"
                        disabled={loading}
                        required
                    />
                </div>

                <div>
                    <label
                        htmlFor="displayName"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Display Name
                    </label>
                    <input
                        type="text"
                        id="displayName"
                        name="displayName"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-[var(--color-secondary)] disabled:opacity-50 disabled:cursor-not-allowed"
                        value={profile?.displayName || ''}
                        onChange={handleChange}
                        placeholder="Enter your display name"
                        disabled={loading}
                    />
                </div>

                <div>
                    <label
                        htmlFor="avatar"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Profile Picture
                    </label>
                    <div className="relative">
                        <input
                            type="file"
                            id="avatar"
                            name="avatar"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-[var(--color-secondary)] disabled:opacity-50 cursor-pointer file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[var(--color-primary)] file:text-gray-800 hover:file:bg-[var(--color-highlight)]"
                            onChange={handleChange}
                            accept="image/*"
                            disabled={loading}
                        />
                    </div>
                </div>

                <button
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-secondary)] cursor-pointer ${hasChanges && !loading
                        ? 'bg-[var(--color-secondary)] text-white hover:bg-[var(--color-highlight)]'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                    type="submit"
                    disabled={!hasChanges || loading}
                >
                    {loading ? 'Updating...' : 'Update Profile'}
                </button>

                {status.message && (
                    <div
                        className={`p-3 rounded-lg ${status.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}
                    >
                        {status.message}
                    </div>
                )}
            </form>
        </div>
    );
}

export default ProfileForm;
