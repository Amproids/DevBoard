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
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        value={credentials.email || ''}
                        onChange={handleChange}
                        placeholder="Enter your email"
                        disabled={loading}
                        required
                    />
                </div>
                
                <div>
                    <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        value={credentials.phoneNumber || ''}
                        onChange={handleChange}
                        placeholder="Enter your phone number"
                        disabled={loading}
                    />
                </div>
                
                {/* Password Change Button */}
                <div>
                    <button
                        type="button"
                        onClick={() => setIsPasswordModalOpen(true)}
                        className="w-full px-4 py-2 bg-[var(--color-highlight)] text-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-blue-600 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 "
                        disabled={loading}
                    >
                        Change Password
                    </button>
                </div>
                
                <button
                    className={`w-full px-4 py-2 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        hasChanges && !loading
                            ? 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 cursor-pointer'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    type="submit"
                    disabled={!hasChanges || loading}
                >
                    {loading ? 'Updating...' : 'Update Contact Information'}
                </button>
                
                {status.message && (
                    <div className={`p-3 rounded-lg ${status.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
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