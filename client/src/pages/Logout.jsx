import { useEffect } from 'react';
import { Link } from "react-router-dom";

function Logout({ setIsAuthenticated }) {
    useEffect(() => {
        // Automatically logout when component mounts
        console.log('Logout component mounted, setIsAuthenticated:', typeof setIsAuthenticated);
        console.log('Token before logout:', localStorage.getItem('authToken'));
        
        if (setIsAuthenticated) {
            setIsAuthenticated();
            console.log('Logout function called');
            console.log('Token after logout:', localStorage.getItem('authToken'));
        }
    }, [setIsAuthenticated]);

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
                        You have been logged out of your account. Thank you for using DevBoard!
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