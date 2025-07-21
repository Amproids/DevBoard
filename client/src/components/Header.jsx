import logo from '../assets/logo.svg';

function Header() {
    return(
        <header className="bg-red-500">
            <div>
                <img src={logo} alt="DevBoard logo" />
                <h1>DevBoard</h1>
            </div>
            <nav>
                <a href="/">Home</a>
                <a href="dashboard">Dashboard</a>
                <a href="about">About</a>
            </nav>
            <div>
                <button>Login</button>
                <button>Sign Up</button>
            </div>
        </header>
    )
}

export default Header