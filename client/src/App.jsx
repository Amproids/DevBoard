import useAuth from './hooks/useAuth';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/Layout/ProtectedRoute';

import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import ErrorBoundary from './components/Shared/ErrorBoundary.jsx';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Logout from './pages/Logout';
import Board from './pages/Board';
import ResetPassword from './pages/ResetPassword';
import AcceptInvitation from './pages/AcceptInvitation';
import NotFound from './pages/NotFound.jsx';

function App() {
    const { isAuthenticated, isLoading, login, logout } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <ErrorBoundary>
            <div className="min-h-screen">
                <Router>
                    <div className="App min-h-screen flex flex-col">
                        <Header isAuthenticated={isAuthenticated} />
                        <main>
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route
                                    path="/login"
                                    element={<Login setIsAuthenticated={login} />}
                                />
                                <Route
                                    path="/forgot-password"
                                    element={<ResetPassword />}
                                />
                                <Route path="/register" element={<Register />} />
                                <Route
                                    path="/dashboard"
                                    element={
                                        <ProtectedRoute
                                            isAuthenticated={isAuthenticated}
                                        >
                                            <Dashboard />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/accept-invitation/:token"
                                    element={
                                        <ProtectedRoute
                                            isAuthenticated={isAuthenticated}
                                        >
                                            <AcceptInvitation />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/profile"
                                    element={
                                        <ProtectedRoute
                                            isAuthenticated={isAuthenticated}
                                        >
                                            <Profile />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/logout"
                                    element={<Logout setIsAuthenticated={logout} />}
                                />
                                <Route
                                    path="/board/:id"
                                    element={
                                        <ProtectedRoute
                                            isAuthenticated={isAuthenticated}
                                        >
                                            <Board />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route path="*" element={<NotFound />} />
                            </Routes>
                        </main>
                        <Footer />
                    </div>
                </Router>
            </div>
        </ErrorBoundary>
    );
}

export default App;
