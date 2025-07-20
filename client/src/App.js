import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import logo from './components/logo.svg';
import CSS from './index.css';

function App() {
    return (
        <BrowserRouter>
            <div className="App">
                <header>
                    <div className="header-left">
                        <img src={logo} alt="DevBoard logo" />
                        <h1>DevBoard</h1>
                    </div>
                    <nav>
                        <a href="/">Home</a>
                        <a href="dashboard">Dashboard</a>
                        <a href="about">About</a>
                    </nav>
                    <div className="header-right">
                        <button>Login</button>
                        <button>Sign Up</button>
                    </div>
                </header>

                <main>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/about" element={<About />} />
                    </Routes>
                </main>

                <footer>
                    <div className="footer-content">
                        <p>&copy;2025 DevBoard</p>
                        <div className="footer-links">
                            <a href="GitHub">GitHub</a>
                        </div>
                    </div>
                </footer>
            </div>
        </BrowserRouter>
    );
}

export default App;
