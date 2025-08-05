import React, { useEffect } from 'react';
import { credentialsService } from '../../services/credentialsService';
import { useFormStatus } from '../../hooks/useFormStatus';
import { useFormChanges } from '../../hooks/useFormChanges';

function CredentialForm({ credentials, setCredentials, onCredentialsUpdate }) {
    const { status, loading, setLoading, setSuccessMessage, setErrorMessage } = useFormStatus();
    
    const { 
        hasChanges: hasFieldChanges, 
        checkForChanges, 
        updateOriginalData 
    } = useFormChanges(
        {
            email: credentials.email || '',
            phoneNumber: credentials.phoneNumber || ''
        },
        [credentials.email, credentials.phoneNumber]
    );

    const hasPasswordChanges = (credentials.password && credentials.password.length > 0) || 
                              (credentials.confirmPassword && credentials.confirmPassword.length > 0);
    const hasChanges = hasFieldChanges || hasPasswordChanges;

    useEffect(() => {
        checkForChanges({
            email: credentials.email,
            phoneNumber: credentials.phoneNumber
        });
    }, [credentials.email, credentials.phoneNumber, checkForChanges]);

    const handleChange = event => {
        const { name, value } = event.target;
        setCredentials(prevCredentials => ({
            ...prevCredentials,
            [name]: value
        }));
    };

    const handleSubmit = async event => {
        event.preventDefault();
        setLoading(true);
        
        try {
            credentialsService.validateCredentials(credentials);
            await credentialsService.updateCredentials(credentials);
            
            setSuccessMessage('Credentials updated successfully');
            
            updateOriginalData({
                email: credentials.email,
                phoneNumber: credentials.phoneNumber
            });
            
            setCredentials(prev => ({
                ...prev,
                password: '',
                confirmPassword: ''
            }));
            
            // Call parent callback to refresh data if provided
            if (onCredentialsUpdate) {
                await onCredentialsUpdate();
            }
            
        } catch (error) {
            console.error('Error updating credentials:', error);
            setErrorMessage(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <div className="flex flex-col mb-4">
                    <label htmlFor="email" className="mb-2 text-sm font-medium text-gray-700">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        value={credentials.email || ''}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        disabled={loading}
                        required
                    />
                </div>
                
                <div className="flex flex-col mb-4">
                    <label htmlFor="phoneNumber" className="mb-2 text-sm font-medium text-gray-700">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        value={credentials.phoneNumber || ''}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        disabled={loading}
                    />
                </div>
                
                <div className="flex flex-col mb-4">
                    <label htmlFor="password" className="mb-2 text-sm font-medium text-gray-700">
                        New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        value={credentials.password || ''}
                        onChange={handleChange}
                        placeholder="Enter new password (min. 6 characters)"
                        disabled={loading}
                        minLength={6}
                    />
                </div>
                
                <div className="flex flex-col mb-6">
                    <label htmlFor="confirmPassword" className="mb-2 text-sm font-medium text-gray-700">
                        Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        className="border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        value={credentials.confirmPassword || ''}
                        onChange={handleChange}
                        placeholder="Confirm your new password"
                        disabled={loading}
                        minLength={6}
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
                    {loading ? 'Updating...' : 'Update Credentials'}
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

export default CredentialForm;