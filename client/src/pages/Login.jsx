import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import OAuthButtons from '../components/Authentication/OAuthButtons';
import { API_BASE_URL } from '../config/config';

function Login({ setIsAuthenticated }) {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post(`${API_BASE_URL}/auth/login`, {
                email: formData.email,
                password: formData.password
            });

            // Handle successful login
            const { token, user } = response.data.data;

            // Store token
            localStorage.setItem('authToken', token);

            // Update user state
            setIsAuthenticated();

            // Redirect to dashboard or home page
            navigate('/dashboard');

        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
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
                    {/* OAuth Buttons */}
                    <OAuthButtons
                        label='login'
                        errorCallback={(message) =>
                            setError(message)
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
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="email"
                            name="email"
                            id='email'
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Email"
                            aria-label='Email'
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent transition-all duration-200"
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
                            aria-label='Password'
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent transition-all duration-200"
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

                    {/* Error Display */}
                    {error && (
                        <div className={`p-3 mt-6 rounded-md bg-red-50 text-red-800`}>
                            {error}
                        </div>
                    )}

                    {/* Additional links */}
                    <div className="mt-6 text-center">
                        <Link to="/reset/password" className="text-sm text-gray-600 hover:text-gray-900">
                            Forgot your password?
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;