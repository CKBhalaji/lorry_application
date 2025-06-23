import React, { useState, useContext, useEffect } from 'react'; // Add useContext to the import
import { login as apiLogin } from '../services/authService.js';

const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Update the logging to properly stringify the state object
  console.log('Auth State:', JSON.stringify({
    isAuthenticated,
    userType,
    timestamp: new Date().toISOString()
  }, null, 2));

  const [authState, setAuthState] = useState({
    isAuthenticated: false,
    userType: null,
    username: '',
    timestamp: ''
  });

  const login = async (credentials) => {
    try {
      const response = await apiLogin(credentials);
      const { access_token, user } = response; // Adjust based on actual API response
      // The `user` object from `response` (which is response.data from axios)
      // is expected to be: { username: "...", type: "..." }
      const apiUser = user;

      if (!apiUser || !apiUser.type || !apiUser.username) {
        console.error('AuthContext: Login response missing user details or type.', apiUser);
        throw new Error('Login failed: User role information missing in server response.');
      }

      // Construct decodedUser directly from the user object in the response
      const decodedUser = {
        id: apiUser.id,
        username: apiUser.username,
        type: apiUser.type
        // Potentially include other user fields from apiUser if needed
      };

      
      // Role comparison (normalize both sides to lower case and remove underscores)
      const normalizeRole = (role) => role.toLowerCase().replace(/_/g, '');
      if (normalizeRole(decodedUser.type) !== normalizeRole(credentials.type)) {
        console.warn(`AuthContext: Role mismatch. Expected: ${credentials.type}, Got: ${decodedUser.type}`);
        throw new Error('Login failed: The user account is not registered for this role.');
      }

      // Proceed with successful login if roles match
      const newAuthState = {
        isAuthenticated: true,
        // userType: decodedUser.type,
        username: decodedUser.username,
        timestamp: new Date().toISOString()
      };

      setIsAuthenticated(true);
      setUserType(decodedUser.type);
      setUsername(decodedUser.username);
      setAuthState(newAuthState);
      localStorage.setItem('authToken', access_token);
      localStorage.setItem('authUser', JSON.stringify(decodedUser));


    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserType(null);
    setUsername(''); // Reset username to empty string
    setAuthState({ // Reset authState to initial values
      isAuthenticated: false,
      userType: null,
      username: '',
      timestamp: ''
    });
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    localStorage.removeItem('auth'); // Also remove the old 'auth' item if it's being phased out
  };

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'authUser') { // Listen for changes to 'authUser'
        const newAuthUser = JSON.parse(event.newValue);
        if (newAuthUser) {
          setIsAuthenticated(true); // Assume if authUser is set, user is authenticated
          setUserType(newAuthUser.type);
          setUsername(newAuthUser.username);
          // Update authState if still used
          setAuthState(prevState => ({
            ...prevState,
            isAuthenticated: true,
            userType: newAuthUser.type,
            username: newAuthUser.username,
            timestamp: new Date().toISOString()
          }));
        } else {
          // If authUser is removed (e.g. logout from another tab)
          setIsAuthenticated(false);
          setUserType(null);
          setUsername('');
          setAuthState({
            isAuthenticated: false,
            userType: null,
            username: '',
            timestamp: ''
          });
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');
    if (storedToken && storedUser) {
      const authUser = JSON.parse(storedUser);
      setIsAuthenticated(true);
      setUserType(authUser.type);
      setUsername(authUser.username);
      // Update authState if still used
      setAuthState({
        isAuthenticated: true,
        userType: authUser.type,
        username: authUser.username,
        timestamp: new Date().toISOString()
      });
    }
    setIsLoading(false);
  }, []);

  // Provide the full authUser object (id, username, type) for consumers
  let authUser = null;
  const storedUser = localStorage.getItem('authUser');
  if (storedUser) {
    try {
      authUser = JSON.parse(storedUser);
    } catch (e) {
      authUser = null;
    }
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, userType, username, login, logout, authUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
