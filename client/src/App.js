import { Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Logout from "./pages/Logout";

function App() {
    return (
        <>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/logout" element={<Logout />} />
            </Routes>
    
        </>
    );
}

export default App;
