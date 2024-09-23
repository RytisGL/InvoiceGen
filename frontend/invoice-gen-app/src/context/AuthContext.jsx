import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [jwtToken, setJwtToken] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('jwtToken');
        if (token) {
            setJwtToken(token);
            setIsAuthenticated(true);
        }
    }, []);

    const login = async (jwtToken) => {
        setJwtToken(jwtToken);
        localStorage.setItem('jwtToken', jwtToken);

        await axios.post('/set-refresh-token', {
            refreshToken: 'your-refresh-token'
        });

        setIsAuthenticated(true);
    };

    const logout = async () => {
        setJwtToken(null);
        localStorage.removeItem('jwtToken');
        setIsAuthenticated(false);

        // Clear refresh token from httpOnly cookie
        await axios.post('/logout');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, jwtToken, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
