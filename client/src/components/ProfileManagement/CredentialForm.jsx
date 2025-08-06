import React, { useEffect, useState } from 'react';
import { credentialsService } from '../../services/credentialsService';
import { useFormStatus } from '../../hooks/useFormStatus';
import { useFormChanges } from '../../hooks/useFormChanges';
import ChangePasswordModal from './ChangePasswordModal';

function CredentialForm({ credentials, setCredentials, onCredentialsUpdate }) {
    const { status, loading, setLoading, setSuccessMessage, setErrorMessage } = useFormStatus();
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    
    const { 
        hasChanges, 
        checkForChanges, 
        updateOriginalData 
    } = useFormChanges(
        {
            email: credentials.email || '',
            phoneNumber: credentials.phoneNumber || ''
        },
        [credentials.email, credentials.phoneNumber]
    );

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
            // Only validate email for this form (password is handled in modal)
            const credentialsToValidate = {
                email: credentials.email,
                phoneNumber: credentials.phoneNumber,
                password: '', // Empty password to skip password validation
                confirmPassword: ''
            };
            
            credentialsService.validateCredentials(credentialsToValidate);
            
            // Only send email and phone number updates
            const credentialsToUpdate = {
                email: credentials.email,
                phoneNumber: credentials.phoneNumber
            };
            
            await credentialsService.updateCredentials(credentialsToUpdate);
            
            setSuccessMessage('Contact information updated successfully');
            
            updateOriginalData({
                email: credentials.email,
                phoneNumber: credentials.phoneNumber
            });
            
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

    const handlePasswordUpdate = async () => {
        // Refresh the parent data when password is updated
        if (onCredentialsUpdate) {
            await onCredentialsUpdate();
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
                
                <div className="flex flex-col mb-6">
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
                
                {/* Password Change Button */}
                <div className="mb-6">
                    <button
                        type="button"
                        onClick={() => setIsPasswordModalOpen(true)}
                        className="w-full py-3 px-4 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={loading}
                    >
                        Change Password
                    </button>
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
                    {loading ? 'Updating...' : 'Update Contact Information'}
                </button>
                
                {status.message && (
                    <div className={`mt-4 p-3 rounded-lg ${status.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                        {status.message}
                    </div>
                )}
            </form>

            {/* Password Change Modal */}
            <ChangePasswordModal
                isOpen={isPasswordModalOpen}
                onClose={() => setIsPasswordModalOpen(false)}
                onPasswordUpdate={handlePasswordUpdate}
            />
        </div>
    );
}

export default CredentialForm;