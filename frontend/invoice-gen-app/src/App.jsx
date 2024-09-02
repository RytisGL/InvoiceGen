import './App.css';
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import NotFound from './components/NotFound.jsx'
import Generator from './components/Generator.jsx'
import NavBar from './components/NavBar.jsx'
import Footer from './components/Footer.jsx'
import Dashboard from './components/Dashboard.jsx'


function App() {
    return (
        <div className="App">
            <NavBar/>
            <BrowserRouter>
                <Routes>
                    <Route path="/">
                        <Route path="/" element={<Generator/>}/>
                        <Route path="/dashboard" element={<Dashboard/>}/>
                        <Route path="*" element={<NotFound/>}/>
                    </Route>
                </Routes>
            </BrowserRouter>
            <Footer/>
        </div>
    );
}

export default App;