import React, { useState, useContext, useEffect } from 'react'; // Add useContext to the import
import { login as apiLogin } from '../services/authService.js';

const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);
  const [username, setUsername] = useState('');

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
      let decodedUser = null;

      if (user && user.username && user.type) {
        decodedUser = user;
      } else if (access_token) {

        try {
          const simulatedTokenData = { username: credentials.username, type: null }; // Start with null type
          if (response.user && response.user.type) { // Check again if apiLogin provided it
            decodedUser = response.user;
          } else {
            throw new Error('Login failed: User role could not be verified from server response.');
          }

        } catch (e) {
          console.error("Error processing token or user info not available", e);
          throw new Error('Login failed: User role could not be verified due to token processing error.');
        }
      }

      if (!decodedUser || !decodedUser.type || !decodedUser.username) {
        throw new Error('Login failed: User details (including role) could not be determined from server response.');
      }

      // Role comparison
      if (decodedUser.type !== credentials.type) {
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
      // setUserType(decodedUser.type);
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
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, userType, username, login, logout }}>
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
