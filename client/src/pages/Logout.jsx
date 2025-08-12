import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';

function Logout({ setIsAuthenticated }) {
    const { logout } = useAuth();

    // Use the prop if provided, otherwise use the hook
    const handleLogout = setIsAuthenticated || logout;

    useEffect(() => {
        const performLogout = async () => {
            try {
                // Use authService for clean logout
                authService.logout();

                // Update global/local auth state
                handleLogout();
            } catch (error) {
                console.error('Error during logout:', error);
                // Even if there's an error, still try to logout locally
                handleLogout();
            }
        };

        performLogout();
    }, [handleLogout]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
                <div className="mb-6">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                        <svg
                            className="h-6 w-6 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                            />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Logged Out Successfully
                    </h1>
                    <p className="text-gray-600">
                        You have been logged out of your account. Thank you for
                        using DevBoard!
                    </p>
                </div>

                <div className="space-y-3">
                    <Link
                        to="/"
                        className="w-full inline-flex justify-center px-4 py-2 bg-[var(--color-primary)] text-gray-800 rounded-md hover:bg-[var(--color-highlight)] transition-colors duration-200 font-medium shadow-sm"
                    >
                        Back to Home
                    </Link>
                    <Link
                        to="/login"
                        className="w-full inline-flex justify-center px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 font-medium"
                    >
                        Login Again
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Logout;
