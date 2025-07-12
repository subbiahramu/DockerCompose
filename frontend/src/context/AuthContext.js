import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [isAdmin, setIsAdmin] = useState(false);

    // Check for existing token on load
    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            setIsAdmin(true);
            // Set default authorization header for all requests
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
    }, []);

    const login = async (username, password) => {
        try {
            const response = await axios.post('http://localhost:5000/api/admin/login', {
                username,
                password
            });
            if (response.data.token) {
                localStorage.setItem('adminToken', response.data.token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                setIsAdmin(true);
                return true;
            }
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        delete axios.defaults.headers.common['Authorization'];
        setIsAdmin(false);
    };

    return (
        <AuthContext.Provider value={{ isAdmin, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
} 