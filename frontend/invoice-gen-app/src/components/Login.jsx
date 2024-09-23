import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Alert, Box } from '@mui/material';
import { AuthContext } from '../context/AuthContext.jsx';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [generalError, setGeneralError] = useState('');
    const { isAuthenticated, login } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/valdymas');
        }
    }, [isAuthenticated, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setGeneralError('');

        try {
            const response = await axios.post('http://localhost:8081/api/v1/user/login', {
                email,
                password,
            });

            login(response.data.jwtToken, response.data.refreshToken);
            navigate('/valdymas');
        } catch (error) {
            if (error.response && error.response.data) {
                const { message } = error.response.data;
                if (message) {
                    setGeneralError(message);
                }
            } else {
                setGeneralError('An unexpected error occurred. Please try again.');
            }
        }
    };

    return (
        <Container maxWidth="sm" className="mt-5">
            <Box className="shadow p-4 rounded" style={{ background: "white" }}>
                <h2 className="mb-4 text-center">Login</h2>
                {generalError && <Alert severity="error" className="mb-3">{generalError}</Alert>}
                <form onSubmit={handleLogin}>
                    <TextField
                        label="Email"
                        type="email"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <TextField
                        label="Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        style={{ background: "#6482AD" }}
                        className="w-100 mt-3"
                    >
                        Login
                    </Button>
                </form>
            </Box>
        </Container>
    );
};

export default Login;
