import axios from 'axios';
import { useState } from 'react';

function ProfileForm({ profile, setProfile }) {
    const [status, setStatus] = useState({
        success: false,
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = event => {
        const { name, value } = event.target;
        setProfile(prevProfile => ({
            ...prevProfile,
            [name]: value
        }));
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
                        className="border border-gray-300   rounded-lg p-2 focus:outline-none focus:ring-0"
                        value={profile.firstName}
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
                        value={profile.lastName}
                        onChange={handleChange}
                        placeholder="Enter your last name"
                        required
                    />
                </div>

                <div className="flex flex-col mb-4">
                    <label htmlFor="lastName">Display Name</label>
                    <input
                        type="text"
                        id="displayName"
                        name="displayName"
                        className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-0"
                        value={profile.displayName}
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
                    type="submit"
                    className="bg-background cursor-pointer text-white py-2 px-4 rounded-lg hover:bg-background-hover focus:outline-none focus:ring-0"
                >
                    {loading ? 'Updating...' : 'Update Profile'}
                </button>
                <div className="mt-4">
                    {status.success && (
                        <p className="text-green-500">{status.message}</p>
                    )}
                    {!status.success && (
                        <p className="text-red-500">{status.message}</p>
                    )}
                </div>
            </form>
        </div>
    );
}

export default ProfileForm;
