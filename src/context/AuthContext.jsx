import React, { createContext, useState, useEffect, useContext } from 'react';
import * as authService from '../services/authService'; // Import all exports

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Stores user object { id, username, email, roles }
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true); // For initial check

    useEffect(() => {
        // Check for existing token and user data on app load
        const token = authService.getToken();
        const storedUser = authService.getCurrentUser();

        if (token && storedUser) {
            setUser(storedUser);
            setIsAuthenticated(true);
            // TODO: Optionally, add a request here to verify token with backend
            // and refresh user data if necessary. For now, trust localStorage.
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const userData = await authService.login(username, password);
            setUser(userData);
            setIsAuthenticated(true);
            return userData;
        } catch (error) {
            setIsAuthenticated(false);
            setUser(null);
            console.error("AuthContext login error:", error);
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setIsAuthenticated(false);
        // Optionally, redirect to login page or home page
    };

    const signup = async (signupData) => {
        try {
            // signupData: { username, email, password, roles, firstName, lastName, phoneNumber }
            const response = await authService.signup(signupData);
            // Optionally, log in the user directly after successful signup
            // Or, redirect to login page with a success message
            return response; // MessageResponse
        } catch (error) {
            console.error("AuthContext signup error:", error);
            throw error;
        }
    };

    // Expose a primary role or all roles if needed by components
    const primaryRole = user && user.roles && user.roles.length > 0 ? user.roles[0] : null;

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout, signup, getToken: authService.getToken, primaryRole, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
