import { useEffect, useState } from 'react';
import ProfileForm from '../components/ProfileManagement/ProfileForm';
import CredentialForm from '../components/ProfileManagement/CredentialForm';
import AccountDeactivation from '../components/ProfileManagement/AccountDeactivation';

import axios from 'axios';

function Profile() {
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);

    // Fetch profile data from the server
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError(false);
                
                // Get token from localStorage
                const token = localStorage.getItem('authToken');
                
                if (!token) {
                    throw new Error('Authentication token not found');
                }

                const response = await axios.get(
                    `${import.meta.env.VITE_API_BASE_URL}/profiles`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );
                const data = response.data.data;
                setProfile({
                    firstName: data.firstName,
                    lastName: data.lastName,
                    displayName: data.displayName,
                    avatar: data.avatar
                });
                setCredentials({
                    email: data.email,
                    phoneNumber: data.phoneNumber || '',
                    password: '',
                    confirmPassword: ''
                });
            } catch (error) {
                setError(true);
                console.error('Error fetching profile:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    return (
        <div className="container mx-auto px-4 py-8">
            {!loading && !error && (
                <>
                    <div className="flex flex-col md:flex-row justify-center gap-20 mx-auto p-4 md:max-w-5xl">
                        {/* existing content stays the same */}
                        <div className="w-full">
                            <ProfileForm
                                profile={profile}
                                setProfile={setProfile}
                            />
                        </div>
                        <div className="w-full">
                            <CredentialForm
                                credentials={credentials}
                                setCredentials={setCredentials}
                            />
                        </div>
                    </div>
                </>
            )}
            {loading && (
                <div className="flex justify-center items-center h-screen">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-background"></div>
                </div>
            )}
            {error && (
                <div className="text-red-500 flex justify-center items-center h-[40vh]">
                    Server Error While Getting your Data.
                </div>
            )}
            {!loading && (
                <div className="text-xl p-4 mb-4 md:max-w-5xl mx-auto">
                    <AccountDeactivation />
                </div>
            )}
        </div>
    );
}

export default Profile;