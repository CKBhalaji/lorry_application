import React, { useState, useContext, useEffect } from 'react'; // Add useContext to the import

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

  const login = (userData) => {
    if (!userData.username) {
      console.error('Username is required in userData');
      return;
    }

    const newAuthState = {
      isAuthenticated: true,
      userType: userData.type,
      username: userData.username,
      timestamp: new Date().toISOString()
    };

    setIsAuthenticated(true);
    setUserType(userData.type);
    setUsername(userData.username);
    setAuthState(newAuthState);
    localStorage.setItem('auth', JSON.stringify(newAuthState));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUsername(null);
    localStorage.removeItem('auth');
  };

  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'auth') {
        const newAuth = JSON.parse(event.newValue);
        if (newAuth) {
          setIsAuthenticated(newAuth.isAuthenticated);
          setUserType(newAuth.userType);
          setUsername(newAuth.username);
          setAuthState(newAuth);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const storedAuth = JSON.parse(localStorage.getItem('auth'));
    if (storedAuth && storedAuth.isAuthenticated) {
      setIsAuthenticated(true);
      setUserType(storedAuth.userType);
      setUsername(storedAuth.username);
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
