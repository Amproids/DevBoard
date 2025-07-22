import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BriefcaseIcon } from '@heroicons/react/24/outline';
import logo from '../../assets/logo.svg';

function Header({ isAuthenticated = false }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    // Check if current route is active
    const isActiveRoute = (path) => location.pathname === path;

    return (
        <header className="bg-[var(--color-background)] shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo and Title */}
                    <div className="flex items-center space-x-3">
                        <img
                            src={logo}
                            alt="DevBoard logo"
                            className="h-8 w-8"
                        />
                        <h1 className="text-2xl font-bold text-gray-800">
                            DevBoard
                        </h1>
                    </div>

                    {/* Desktop Navigation */}
                    {!isAuthenticated ? (
                        // PUBLIC NAVIGATION
                        <nav className="hidden md:flex space-x-8">
                            <Link
                                to="/"
                                className="text-gray-700 hover:text-[var(--color-secondary)] transition-colors duration-200 font-medium"
                            >
                                Home
                            </Link>
                            <Link
                                to="/about"
                                className="text-gray-700 hover:text-[var(--color-secondary)] transition-colors duration-200 font-medium"
                            >
                                About
                            </Link>
                            <Link
                                to="/dashboard"
                                className="text-gray-700 hover:text-[var(--color-secondary)] transition-colors duration-200 font-medium"
                            >
                                Dashboard
                            </Link>
                        </nav>
                    ) : (
                        // AUTHENTICATED NAVIGATION  
                        <nav className="hidden md:flex space-x-8">
                            <Link
                                to="/dashboard"
                                className={`flex items-center space-x-2 hover:text-gray-400 transition-colors duration-200 font-medium ${
                                    isActiveRoute('/dashboard') 
                                        ? 'text-[var(--color-primary)]' 
                                        : 'text-gray-700'
                                }`}
                            >
                                <BriefcaseIcon className="w-5 h-5" />
                                <span>Dashboard</span>
                            </Link>
                            <Link
                                to="/profile"
                                className={`hover:text-gray-400 transition-colors duration-200 font-medium ${
                                    isActiveRoute('/profile') 
                                        ? 'text-[var(--color-primary)]' 
                                        : 'text-gray-700'
                                }`}
                            >
                                Profile
                            </Link>
                            <Link
                                to="/logout"
                                className={`hover:text-gray-400 transition-colors duration-200 font-medium ${
                                    isActiveRoute('/logout') 
                                        ? 'text-[var(--color-primary)]' 
                                        : 'text-gray-700'
                                }`}
                            >
                                Logout
                            </Link>
                        </nav>
                    )}

                    {/* Action Buttons / Mobile Menu Toggle */}
                    <div className="flex items-center space-x-3">
                        {!isAuthenticated ? (
                            // PUBLIC ACTION BUTTONS
                            <div className="hidden md:flex items-center space-x-3">
                                <Link
                                    to="/login"
                                    type="button"
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 font-medium">
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    type="button"
                                    className="px-4 py-2 bg-[var(--color-primary)] text-gray-800 rounded-md hover:bg-[var(--color-highlight)] transition-colors duration-200 font-medium shadow-sm">
                                    Sign Up
                                </Link>
                            </div>
                        ) : null}

                        {/* Mobile Menu Toggle */}
                        <button
                            className="md:hidden flex items-center justify-center"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            <svg
                                className="w-6 h-6 text-gray-700"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M4 6h16M4 12h16M4 18h16"
                                />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-[var(--color-background)] border-t border-gray-200">
                        <div className="px-4 py-4 space-y-2">
                            {!isAuthenticated ? (
                                // MOBILE PUBLIC NAVIGATION
                                <>
                                    <Link
                                        to="/"
                                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Home
                                    </Link>
                                    <Link
                                        to="/about"
                                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        About
                                    </Link>
                                    <div className="pt-2 border-t border-gray-200 space-y-2">
                                        <Link
                                            to="/login"
                                            type="button"
                                            className="w-full text-left px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
                                            Login
                                        </Link>
                                        <Link 
                                            to="/register"
                                            type="button"
                                            className="w-full text-left px-4 py-2 bg-[var(--color-primary)] text-gray-800 rounded-md hover:bg-[var(--color-highlight)] transition-colors">
                                            Sign Up
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                // MOBILE AUTHENTICATED NAVIGATION
                                <>
                                    <Link
                                        to="/dashboard"
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                                            isActiveRoute('/dashboard')
                                                ? 'bg-[var(--color-primary)] text-gray-800'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <BriefcaseIcon className="w-5 h-5" />
                                        <span>Dashboard</span>
                                    </Link>
                                    <Link
                                        to="/profile"
                                        className={`block px-4 py-2 rounded-md transition-colors ${
                                            isActiveRoute('/profile')
                                                ? 'bg-[var(--color-primary)] text-gray-800'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Profile
                                    </Link>
                                    <Link
                                        to="/logout"
                                        className={`block px-4 py-2 rounded-md transition-colors ${
                                            isActiveRoute('/logout')
                                                ? 'bg-[var(--color-primary)] text-gray-800'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Logout
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}

export default Header;