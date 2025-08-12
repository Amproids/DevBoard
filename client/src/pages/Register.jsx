import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormStatus } from '../hooks/useFormStatus';
import { useFormChanges } from '../hooks/useFormChanges';
import { userService } from '../services/userService';
import OAuthButtons from '../components/Authentication/OAuthButtons';
import RegisterForm from '../components/Authentication/RegisterForm';

function Register() {
    const navigate = useNavigate();

    // Form data state
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: ''
    });

    // Use custom hooks
    const { status, loading, setLoading, setSuccessMessage, setErrorMessage } =
        useFormStatus();
    const { checkForChanges } = useFormChanges(formData);

    const handleChange = event => {
        const { name, value } = event.target;
        const updatedData = {
            ...formData,
            [name]: value
        };
        setFormData(updatedData);
        checkForChanges(updatedData);
    };

    const validateForm = () => {
        if (formData.password !== formData.confirmPassword) {
            throw new Error('Passwords do not match');
        }
        if (formData.password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }
        if (!formData.email.includes('@')) {
            throw new Error('Please enter a valid email address');
        }
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            throw new Error('First name and last name are required');
        }
    };

    const handleSubmit = async event => {
        event.preventDefault();

        try {
            setLoading(true);

            // Validate form data
            validateForm();

            // Call user service to register
            await userService.register(formData);

            setSuccessMessage(
                'Account created successfully! Redirecting to login...'
            );

            // Redirect to login after successful registration
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            console.error('Error creating account:', error);
            setErrorMessage(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create your account
                    </h2>

                    <p className="mt-2 text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link
                            to="/login"
                            className="font-medium text-[var(--color-secondary)] hover:text-[var(--color-primary)] transition-colors"
                        >
                            Log in here
                        </Link>
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                        {/* OAuth Buttons - Now using extracted component */}
                        <OAuthButtons
                            label="signup"
                            loading={loading}
                            onError={setErrorMessage}
                            onLoading={setLoading}
                        />

                        {/* Divider */}
                        <div className="relative mb-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    Or continue with email
                                </span>
                            </div>
                        </div>

                        {/* Registration Form - Now using extracted component */}
                        <RegisterForm
                            formData={formData}
                            loading={loading}
                            status={status}
                            onChange={handleChange}
                            onSubmit={handleSubmit}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
