import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFormStatus } from '../hooks/useFormStatus';
import { useFormChanges } from '../hooks/useFormChanges';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { setAuthToken } from '../utils/tokenUtils';
import OAuthButtons from '../components/Authentication/OAuthButtons';

function Login({ setIsAuthenticated }) {
    const navigate = useNavigate();
    const { login } = useAuth();
    
    // Use the prop if provided, otherwise use the hook
    const handleLogin = setIsAuthenticated || login;
    
    // Form data state
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    // Use custom hooks
    const { status, loading, setLoading, setSuccessMessage, setErrorMessage } = useFormStatus();
    const { hasChanges, checkForChanges } = useFormChanges(formData);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const updatedData = {
            ...formData,
            [name]: value
        };
        setFormData(updatedData);
        checkForChanges(updatedData);
    };

    const validateForm = () => {
        if (!formData.email.trim()) {
            throw new Error('Email is required');
        }
        if (!formData.email.includes('@')) {
            throw new Error('Please enter a valid email address');
        }
        if (!formData.password.trim()) {
            throw new Error('Password is required');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setLoading(true);
            
            // Validate form data
            validateForm();

            // Call auth service to login
            const response = await authService.login({
                email: formData.email,
                password: formData.password
            });

            // Handle successful login
            const { token, user } = response.data;
            
            // Store token and update auth state
            setAuthToken(token);
            handleLogin(token);
            
            setSuccessMessage('Login successful! Redirecting...');
            
            // Redirect to dashboard
            setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
            
        } catch (error) {
            console.error('Login error:', error);
            setErrorMessage(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                    </h2>
                </div>

                <p className="mt-2 text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link
                        to="/register"
                        className="font-medium text-[var(--color-secondary)] hover:text-[var(--color-highlight)]"
                        aria-label="Sign up for a new account"
                    >
                        Sign up
                    </Link>
                </p>

                <div className="bg-white p-8 rounded-lg shadow-md">
                    {/* OAuth Buttons - Now using extracted component */}
                    <OAuthButtons
                        label="login"
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

                    {/* Email/Password Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="email"
                            name="email"
                            id='email'
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Email"
                            disabled={loading}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            required
                        />
                        <label htmlFor="password" aria-hidden="true" hidden>Password</label>
                        <input
                            type="password"
                            name="password"
                            id='password'
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Password"
                            disabled={loading}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            required
                        />
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[var(--color-primary)] text-gray-800 p-3 rounded-lg font-semibold hover:bg-[var(--color-secondary)] transition-colors duration-200 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                    {/* Status Messages */}
                    {status.message && (
                        <div className={`mt-4 p-3 rounded-lg ${status.success ? 'bg-green-100 border border-green-400 text-green-700' : 'bg-red-100 border border-red-400 text-red-700'}`}>
                            {status.message}
                        </div>
                    )}

                    {/* Additional links */}
                    <div className="mt-6 text-center">
                        <Link to="/forgot-password" className="text-sm text-gray-600 hover:text-gray-900">
                            Forgot your password?
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;