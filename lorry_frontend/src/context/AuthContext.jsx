import React, { useState, useContext, useEffect} from 'react'; // Add useContext to the import
import { login as apiLogin } from '../../services/authService.js';

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
      // Assuming the backend returns { access_token: "...", token_type: "bearer", user: { username: "...", type: "..." } }
      // Or we might need to decode the JWT or make another call to /users/me
      // For now, let's assume user details are part of the login response or decoded from the token
      const { access_token, user } = response; // Adjust based on actual API response

      // For demonstration, if user info isn't directly in response, try to decode JWT (simplified)
      // In a real app, use a library like jwt-decode
      let decodedUser = user;
      if (!decodedUser && access_token) {
        try {
          // Simplified: normally you'd decode the token here if it contains user info
          // const decodedToken = jwt_decode(access_token);
          // decodedUser = { username: decodedToken.username, type: decodedToken.type };
          // For now, we'll use credentials if no user info in response
          decodedUser = { username: credentials.username, type: credentials.type };
        } catch (e) {
          console.error("Error decoding token or user info not available", e);
          // Fallback to credentials if token doesn't have user info or is not decodable easily
          decodedUser = { username: credentials.username, type: credentials.type };
        }
      }


      const newAuthState = {
        isAuthenticated: true,
        userType: decodedUser.type,
        username: decodedUser.username,
        timestamp: new Date().toISOString()
      };

      setIsAuthenticated(true);
      setUserType(decodedUser.type);
      setUsername(decodedUser.username);
      setAuthState(newAuthState); // Though authState itself is not directly used, keep for consistency or future use
      localStorage.setItem('authToken', access_token);
      localStorage.setItem('authUser', JSON.stringify(decodedUser)); // Store more comprehensive user object
      // For backward compatibility or if other parts of the app use 'auth', we can keep it or phase it out.
      // localStorage.setItem('auth', JSON.stringify(newAuthState));


    } catch (error) {
      console.error('Login failed:', error);
      // Propagate the error to the calling component for UI updates (e.g., showing an error message)
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
