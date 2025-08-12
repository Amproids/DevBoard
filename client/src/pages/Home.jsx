import { Link } from 'react-router-dom';
function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[var(--color-background)] to-white">
            {/* Hero Section */}
            <section className="px-4 sm:px-6 lg:px-8 py-20 text-center">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
                        DevBoard
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 mb-4 leading-relaxed">
                        A development board task manager built with the MERN
                        stack
                    </p>
                    <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                        Streamline your development workflow with kanban-style
                        project management and real-time team collaboration.
                    </p>
                    <Link 
                        to="/register" 
                        type="button"
                        className="px-8 py-4 bg-[var(--color-primary)] text-gray-800 rounded-lg text-lg font-semibold hover:bg-[var(--color-highlight)] transform hover:scale-105 transition-all duration-200 shadow-lg">
                        Get Started
                    </Link>
                </div>
            </section>

            {/* Features Section */}
            <section className="px-4 sm:px-6 lg:px-8 py-16 bg-white">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
                        Built for Developers
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center p-6 rounded-lg bg-gray-50 hover:bg-[var(--color-primary)] transition-colors duration-200">
                            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                                📋 Kanban Boards
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Organize tasks with drag-and-drop boards
                            </p>
                        </div>
                        <div className="text-center p-6 rounded-lg bg-gray-50 hover:bg-[var(--color-primary)] transition-colors duration-200">
                            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                                ⚡ Real-time Sync
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                See updates instantly with Socket.io
                            </p>
                        </div>
                        <div className="text-center p-6 rounded-lg bg-gray-50 hover:bg-[var(--color-primary)] transition-colors duration-200">
                            <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                                👥 Team Collaboration
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Work together seamlessly
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Tech Stack Section */}
            <section className="px-4 sm:px-6 lg:px-8 py-16 bg-[var(--color-background)]">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">
                        Tech Stack
                    </h2>
                    <div className="space-y-4">
                        <p className="text-lg text-gray-700 leading-relaxed">
                            <strong className="text-[var(--color-secondary)] font-semibold">
                                Frontend:
                            </strong>
                            <span className="ml-2">
                                React, Socket.io, React DnD, Tailwind CSS
                            </span>
                        </p>
                        <p className="text-lg text-gray-700 leading-relaxed">
                            <strong className="text-[var(--color-secondary)] font-semibold">
                                Backend:
                            </strong>
                            <span className="ml-2">
                                Node.js, Express, MongoDB, Socket.io
                            </span>
                        </p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Home;