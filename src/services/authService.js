import { post } from './apiService';

const AUTH_API_URL = '/auth';

export const login = async (username, password) => {
    try {
        const response = await post(`${AUTH_API_URL}/login`, { username, password });
        if (response && response.token) {
            localStorage.setItem('jwtToken', response.token);
            const userDetails = {
                id: response.id,
                username: response.username,
                email: response.email,
                roles: response.roles,
            };
            localStorage.setItem('user', JSON.stringify(userDetails));
            return userDetails;
        }
        throw new Error(response.message || 'Login failed: No token received');
    } catch (error) {
        console.error('Login failed:', error);
        throw error;
    }
};

export const signup = async (signupData) => {
    try {
        const response = await post(`${AUTH_API_URL}/signup`, signupData);
        return response;
    } catch (error) {
        console.error('Signup failed:', error);
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('user');
};

export const getCurrentUser = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
        try {
            return JSON.parse(userStr);
        } catch (e) {
            console.error("Error parsing user from localStorage:", e);
            localStorage.removeItem('user');
            return null;
        }
    }
    return null;
};

export const getToken = () => {
    return localStorage.getItem('jwtToken');
};
