import axios from 'axios';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OAuthButtons from '../components/Authentication/OAuthButtons';
import RegisterForm from '../components/Authentication/RegisterForm';
import { API_BASE_URL } from '../config/config';

function Register() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: ''
    });
    const [status, setStatus] = useState({
        success: false,
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        try {
            event.preventDefault();
            setStatus({
                success: false,
                message: ''
            });
            setLoading(true);

            // Validate passwords match
            if (formData.password !== formData.confirmPassword) {
                throw {
                    response: { data: { message: 'Passwords do not match' } }
                };
            }

            // Make API call to register
            const response = await axios.post(
                `${API_BASE_URL}/users/register`,
                {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    phoneNumber: formData.phoneNumber,
                    password: formData.password,
                    confirmPassword: formData.confirmPassword
                }
            );

            setStatus({
                success: true,
                message: 'Account created successfully! Redirecting to login...'
            });

            // Redirect to login after successful registration
            setTimeout(() => {
                navigate('/login');
            }, 2000);

        } catch (error) {
            console.error('Error creating account:', error);
            setStatus({
                success: false,
                message: error.response?.data?.message || 'An error occurred while creating your account'
            });
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
                            className="font-medium text-[var(--color-secondary)] hover:text-[var(--color-highlight)]"
                        >
                            Log in here
                        </Link>
                    </p>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">

                        <OAuthButtons 
                            label='signup'
                            errorCallback={(message) => 
                                setStatus(
                                    { 
                                        success: false, 
                                        message: message 
                                    }

                                )
                            } 
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

                        {/* Email/Password Form */}
                        <RegisterForm
                            onSubmit={handleSubmit}
                            loading={loading}
                            status={status}
                            formData={formData}
                            handleChange={handleChange}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;