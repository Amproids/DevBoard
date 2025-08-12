import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_BASE_URL } from '../config/config';

function ResetPassword() {
    const [isCodeSent, setIsCodeSent] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        code: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleInputChange = e => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSendCode = async e => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await axios.post(`${API_BASE_URL}/password/reset/code`, {
                email: formData.email
            });
            setIsCodeSent(true);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    'Failed to send reset code. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async e => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match.');
            setLoading(false);
            return;
        }

        try {
            await axios.post(`${API_BASE_URL}/password/reset`, {
                email: formData.email,
                code: formData.code,
                newPassword: formData.newPassword,
                confirmPassword: formData.confirmPassword
            });

            setSuccess(true);
            setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                    'Reset password failed. Please try again.'
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Reset your password
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
                    {!isCodeSent && (
                        <form onSubmit={handleSendCode} className="space-y-4">
                            <input
                                type="email"
                                name="email"
                                id="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Email"
                                aria-label="Email"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent transition-all duration-200"
                                required
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[var(--color-primary)] text-gray-800 p-3 rounded-lg font-semibold hover:bg-[var(--color-secondary)] transition-colors duration-200 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Sending...' : 'Send Reset Code'}
                            </button>
                        </form>
                    )}

                    {isCodeSent && (
                        <form
                            onSubmit={handleResetPassword}
                            className="space-y-4"
                        >
                            <input
                                type="text"
                                name="code"
                                id="code"
                                value={formData.code}
                                onChange={handleInputChange}
                                placeholder="Reset Code"
                                aria-label="Reset Code"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent transition-all duration-200"
                                required
                                autoComplete="off"
                            />
                            <input
                                type="password"
                                name="newPassword"
                                id="newPassword"
                                value={formData.newPassword}
                                onChange={handleInputChange}
                                placeholder="New Password"
                                aria-label="New Password"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent transition-all duration-200"
                                required
                                autoComplete="new-password"
                            />
                            <input
                                type="password"
                                name="confirmPassword"
                                id="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                placeholder="Confirm Password"
                                aria-label="Confirm Password"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-secondary)] focus:border-transparent transition-all duration-200"
                                required
                                autoComplete="new-password"
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[var(--color-primary)] text-gray-800 p-3 rounded-lg font-semibold hover:bg-[var(--color-secondary)] transition-colors duration-200 shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Resetting...' : 'Reset Password'}
                            </button>
                            <p className="text-sm text-gray-600">
                                Your code is sent to your email after a few
                                seconds. It will expire in 7 minutes. Wait
                                before
                                <button
                                    type="button"
                                    className="text-blue-600 ml-1 cursor-pointer hover:underline"
                                    onClick={() => setIsCodeSent(false)}
                                    disabled={loading}
                                >
                                    Resend Code
                                </button>
                            </p>
                        </form>
                    )}

                    {/* Error Display */}
                    {error && (
                        <div className="p-3 mt-6 rounded-md bg-red-50 text-red-800">
                            {error}
                        </div>
                    )}

                    {/* Success Display */}
                    {success && (
                        <div className="p-3 mt-6 rounded-md bg-green-50 text-green-800">
                            Password reset successful! Redirecting to login...
                        </div>
                    )}

                    {/* Additional links */}
                    <div className="mt-6 text-center">
                        <Link
                            to="/login"
                            className="text-sm text-gray-600 hover:text-gray-900"
                        >
                            Back to login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ResetPassword;
