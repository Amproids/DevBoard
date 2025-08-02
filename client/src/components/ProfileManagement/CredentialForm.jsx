import axios from 'axios';
import { useState, useEffect } from 'react';

function CredentialForm({ credentials, setCredentials }) {
    const [status, setStatus] = useState({
        success: false,
        message: ''
    });
    const [loading, setLoading] = useState(false);
    const [originalCredentials, setOriginalCredentials] = useState({
        email: '',
        phoneNumber: ''
    });
    const [hasChanges, setHasChanges] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    // Store original credentials when they're loaded
    useEffect(() => {
        // Only set original credentials once when data is first loaded
        if (!isInitialized && (credentials.email || credentials.phoneNumber)) {
            setOriginalCredentials({
                email: credentials.email || '',
                phoneNumber: credentials.phoneNumber || ''
            });
            setIsInitialized(true);
        }
    }, [credentials.email, credentials.phoneNumber, isInitialized]);

    // Check for changes whenever credentials change
    useEffect(() => {
        if (!isInitialized) return; // Don't check for changes until we have original values
        
        const emailChanged = credentials.email !== originalCredentials.email;
        const phoneChanged = credentials.phoneNumber !== originalCredentials.phoneNumber;
        const hasPassword = credentials.password && credentials.password.length > 0;
        const hasConfirmPassword = credentials.confirmPassword && credentials.confirmPassword.length > 0;
        
        const changesDetected = emailChanged || phoneChanged || hasPassword || hasConfirmPassword;
        setHasChanges(changesDetected);
    }, [credentials, originalCredentials, isInitialized]);

    const handleChange = event => {
        const { name, value } = event.target;
        setCredentials(prevCredentials => ({
            ...prevCredentials,
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
            
            if (credentials.password !== credentials.confirmPassword) {
                throw {
                    response: { data: { message: 'Passwords do not match' } }
                };
            }
            
            // Get token from localStorage instead of hardcoding
            const token = localStorage.getItem('authToken');
            
            if (!token) {
                throw new Error('Authentication token not found');
            }
            
            const response = await axios.put(
                `${import.meta.env.VITE_API_BASE_URL}/credentials`,
                credentials,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );
            setStatus({
                success: true,
                message: 'Credentials updated successfully'
            });
            
            // Update original credentials after successful save
            setOriginalCredentials({
                email: credentials.email,
                phoneNumber: credentials.phoneNumber
            });
            
            // Clear passwords after successful update
            setCredentials(prev => ({
                ...prev,
                password: '',
                confirmPassword: ''
            }));
            
        } catch (error) {
            console.error('Error updating credentials:', error);
            setStatus({
                success: false,
                message: error.response?.data?.message || error.message || 'An error occurred!'
            });
        } finally {
            setTimeout(() => {
                setStatus({
                    success: false,
                    message: ''
                });
            }, 5000);
            setLoading(false);
        }
    };

    return (
        <div>
            <h2 className="text-xl font-medium mb-4 mt-4 md:mt-16">
                Credential Management
            </h2>
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col mb-4">
                    <label htmlFor="email">
                        Email<span className="p-1 text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        id="email"
                        className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-0"
                        name="email"
                        value={credentials.email || ''}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        required
                    />
                </div>
                <div className="flex flex-col mb-4">
                    <label htmlFor="phoneNumber">Phone Number</label>
                    <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-0"
                        value={credentials.phoneNumber || ''}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                    />
                </div>
                <div className="flex flex-col mb-4">
                    <label htmlFor="password">
                        Password <span className="p-1 text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        id="password"
                        className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-0"
                        name="password"
                        value={credentials.password || ''}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        required
                        minLength={6}
                    />
                </div>
                <div className="flex flex-col mb-4">
                    <label htmlFor="confirmPassword">
                        Confirm Password{' '}
                        <span className="p-1 text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        className="border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-0"
                        name="confirmPassword"
                        value={credentials.confirmPassword || ''}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        required
                        minLength={6}
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
                    {loading ? 'Updating...' : 'Update Credentials'}
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

export default CredentialForm;