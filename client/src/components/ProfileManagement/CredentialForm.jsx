// components/CredentialForm.jsx
import React, { useEffect } from 'react';
import { credentialsService } from '../../services/credentialsService';
import { useFormStatus } from '../../hooks/useFormStatus';
import { useFormChanges } from '../../hooks/useFormChanges';

function CredentialForm({ credentials, setCredentials }) {
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

    // Check for changes including password fields
    const hasPasswordChanges = (credentials.password && credentials.password.length > 0) || 
                              (credentials.confirmPassword && credentials.confirmPassword.length > 0);
    const hasChanges = hasFieldChanges || hasPasswordChanges;

    // Check for changes whenever credentials change
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
            // Validate credentials
            credentialsService.validateCredentials(credentials);
            
            // Update credentials
            await credentialsService.updateCredentials(credentials);
            
            setSuccessMessage('Credentials updated successfully');
            
            // Update original credentials after successful save
            updateOriginalData({
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
            setErrorMessage(error);
        } finally {
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