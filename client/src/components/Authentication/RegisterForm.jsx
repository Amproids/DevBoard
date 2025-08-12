import React from 'react';

function RegisterForm({
    formData,
    loading = false,
    status = {},
    onChange,
    onSubmit
}) {
    return (
        <form onSubmit={onSubmit} className="space-y-6">
            {/* First Name */}
            <div>
                <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700"
                >
                    First Name <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                    <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName || ''}
                        onChange={onChange}
                        required
                        disabled={loading}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Enter your first name"
                    />
                </div>
            </div>

            {/* Last Name */}
            <div>
                <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700"
                >
                    Last Name <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                    <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName || ''}
                        onChange={onChange}
                        required
                        disabled={loading}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Enter your last name"
                    />
                </div>
            </div>

            {/* Email */}
            <div>
                <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                >
                    Email Address <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={onChange}
                        required
                        disabled={loading}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Enter your email address"
                    />
                </div>
            </div>

            {/* Phone Number */}
            <div>
                <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-gray-700"
                >
                    Phone Number
                </label>
                <div className="mt-1">
                    <input
                        type="tel"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber || ''}
                        onChange={onChange}
                        disabled={loading}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Enter your phone number (optional)"
                    />
                </div>
            </div>

            {/* Password */}
            <div>
                <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                >
                    Password <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password || ''}
                        onChange={onChange}
                        required
                        minLength={6}
                        disabled={loading}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Enter your password (min. 6 characters)"
                    />
                </div>
            </div>

            {/* Confirm Password */}
            <div>
                <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700"
                >
                    Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="mt-1">
                    <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword || ''}
                        onChange={onChange}
                        required
                        minLength={6}
                        disabled={loading}
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-[var(--color-primary)] focus:border-[var(--color-primary)] sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Confirm your password"
                    />
                </div>
            </div>

            {/* Status Messages */}
            {status.message && (
                <div
                    className={`p-3 rounded-md ${status.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}
                >
                    {status.message}
                </div>
            )}

            {/* Submit Button */}
            <div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
                >
                    {loading ? 'Creating Account...' : 'Create Account'}
                </button>
            </div>
        </form>
    );
}

export default RegisterForm;
