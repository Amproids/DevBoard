import { useState } from 'react';
import Login from './Login';
import logo from '../assets/logo.svg';

function Header() {
    const [showLogin, setShowLogin] = useState(false);

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

                    {/* Navigation */}
                    <nav className="hidden md:flex space-x-8">
                        <a
                            href="/"
                            className="text-gray-700 hover:text-[var(--color-secondary)] transition-colors duration-200 font-medium"
                        >
                            Home
                        </a>
                        <a
                            href="dashboard"
                            className="text-gray-700 hover:text-[var(--color-secondary)] transition-colors duration-200 font-medium"
                        >
                            Dashboard
                        </a>
                        <a
                            href="about"
                            className="text-gray-700 hover:text-[var(--color-secondary)] transition-colors duration-200 font-medium"
                        >
                            About
                        </a>
                    </nav>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => setShowLogin(true)}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 font-medium"
                        >
                            Login
                        </button>
                        <button className="px-4 py-2 bg-[var(--color-primary)] text-gray-800 rounded-md hover:bg-[var(--color-highlight)] transition-colors duration-200 font-medium shadow-sm">
                            Sign Up
                        </button>
                    </div>
                </div>
            </div>

            {showLogin && <Login onClose={() => setShowLogin(false)} />}
        </header>
    );
}

export default Header;
