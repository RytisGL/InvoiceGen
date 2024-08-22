import './App.css';
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import NotFound from './Components/NotFound'
import Generator from './Components/Generator'
import NavBar from './Components/NavBar.jsx'
import Footer from './Components/Footer.jsx'


function App() {
    return (
        <div className="App">
            <NavBar/>
            <BrowserRouter>
                <Routes>
                    <Route path="/">
                        <Route path="/" element={<Generator/>}/>
                        <Route path="*" element={<NotFound/>}/>
                    </Route>
                </Routes>
            </BrowserRouter>
            <Footer/>
        </div>
    );
}

export default App;