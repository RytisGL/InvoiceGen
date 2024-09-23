import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Alert, Box } from '@mui/material';
import { AuthContext } from '../context/AuthContext.jsx';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [generalError, setGeneralError] = useState('');
    const { isAuthenticated, login } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/valdymas');
        }
    }, [isAuthenticated, navigate]);

    const handleRegister = async (e) => {
        e.preventDefault();
        setGeneralError('');

        // Check if passwords match
        if (password !== confirmPassword) {
            setGeneralError('Passwords do not match.');
            return;
        }

        try {
            const response = await axios.post('http://localhost:8081/api/v1/user/register', {
                email,
                password,
            });

            // Login after successful registration
            login(response.data.jwtToken, response.data.refreshToken);
            navigate('/valdymas'); // Redirect after registration
        } catch (error) {
            if (error.response && error.response.data) {
                const { message, errors } = error.response.data;

                // Set the general error message if provided
                if (message) {
                    setGeneralError(message);
                }

                // Handle field-specific errors if the `errors` object is provided
                if (errors) {
                    const errorMessages = {};
                    Object.keys(errors).forEach((field) => {
                        errorMessages[field] = errors[field].join(', ');
                    });
                    setGeneralError(prev => `${prev} ${errorMessages}`);
                }
            } else {
                setGeneralError('An unexpected error occurred. Please try again.');
            }
        }
    };

    return (
        <Container maxWidth="sm" className="mt-5">
            <Box className="shadow p-4 rounded" style={{ background: "white" }}>
                <h2 className="mb-4 text-center">Register</h2>
                {generalError && <Alert severity="error" className="mb-3">{generalError}</Alert>}
                <form onSubmit={handleRegister}>
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
                    <TextField
                        label="Confirm Password"
                        type="password"
                        variant="outlined"
                        fullWidth
                        margin="normal"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        style={{ background: "#6482AD" }}
                        className="w-100 mt-3"
                    >
                        Register
                    </Button>
                </form>
            </Box>
        </Container>
    );
};

export default Register;
