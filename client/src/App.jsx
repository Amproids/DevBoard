import useAuth from './hooks/useAuth';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/Layout/ProtectedRoute';

import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Logout from './pages/Logout';
import Board from './pages/Board';

function App() {
    const { isAuthenticated, isLoading, login, logout } = useAuth();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="min-h-screen">
        <Router>
            <div className="App min-h-screen flex flex-col">
                <Header isAuthenticated={isAuthenticated} />
                <main>
                    <Routes>
                        <Route
                            path="/"
                            element={<Home />}
                        />
                        <Route
                            path="/login"
                            element={<Login setIsAuthenticated={login} />}
                        />
                        <Route
                            path="/register"
                            element={<Register />}
                        />
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute isAuthenticated={isAuthenticated}>
                                    <Dashboard />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute isAuthenticated={isAuthenticated}>
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
                                <ProtectedRoute isAuthenticated={isAuthenticated}>
                                    <Board />
                                </ProtectedRoute>
                            }
                        />
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
        </div>
    );
}

export default App;