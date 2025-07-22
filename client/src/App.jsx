import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/Layout/ProtectedRoute';

import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    
    return (
        <Router>
            <div className="App">
                <Header isAuthenticated={isAuthenticated} />
                <main>
                    <Routes>
                        <Route
                            path="/"
                            element={<Home />}
                        />
                        <Route
                            path="/login"
                            element={<Login setIsAuthenticated={setIsAuthenticated} />}
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
                    </Routes>
                </main>
                <Footer />
            </div>
        </Router>
    );
}

export default App;