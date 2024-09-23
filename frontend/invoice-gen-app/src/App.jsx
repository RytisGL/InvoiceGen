import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NotFound from './components/NotFound.jsx';
import Generator from './components/Generator.jsx';
import NavBar from './components/NavBar.jsx';
import Footer from './components/Footer.jsx';
import Dashboard from './components/Dashboard.jsx';
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import { AuthProvider } from './context/AuthContext.jsx';

function App() {
    return (
        <div className="App">
            <BrowserRouter>
                <AuthProvider>
                    <NavBar />
                    <Routes>
                        <Route path="/" element={<Generator />} />
                        <Route path="/valdymas" element={<Dashboard />} />
                        <Route path="*" element={<NotFound />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                    </Routes>
                </AuthProvider>
            </BrowserRouter>
            <Footer />
        </div>
    );
}

export default App;
