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
      let decodedUser = null;

      if (user && user.username && user.type) {
        // Prefer user object from response if available and complete
        decodedUser = user;
      } else if (access_token) {
        // Attempt to decode token if user object is not in response or incomplete
        // This is a simplified placeholder for actual JWT decoding
        try {
          // const actualDecodedToken = jwt_decode(access_token); // Placeholder for actual decoding
          // For demonstration, assuming the token *might* contain username and type directly (highly simplified)
          // In a real scenario, the structure of actualDecodedToken would be specific to your JWT
          // For now, let's assume a hypothetical structure or that authService normalizes it.
          // If your apiLogin service already decodes and returns a user object, this part might be redundant.
          // For this step, we'll assume a placeholder decoding that might give us type and username.
          // This is a critical part: ensure this reflects how you *actually* get role from token.
          // If token doesn't reliably contain 'type', this approach needs a real JWT decoding library.

          // Placeholder: Simulate decoding that might provide `type` and `username`
          // THIS IS A MOCK DECODING. REPLACE WITH ACTUAL JWT DECODING.
          const simulatedTokenData = { username: credentials.username, type: null }; // Start with null type

          // If backend sends user type in token, it should be extracted here.
          // For example, if token had a claim `user_role`: simulatedTokenData.type = decoded_jwt.user_role;
          // For now, if `response.user.type` was missing, we cannot reliably get it from a simple mock.
          // The backend response (either `response.user` or a decodable token) MUST provide the type.

          // If `user` object from response was partial (e.g. had username but not type),
          // we might try to get type from token.
          // However, this example assumes `user` from response is all-or-nothing for simplicity.

          // Crucial: If type cannot be determined from token or direct response, we must fail.
          // Let's assume `apiLogin` or a future JWT decoding step provides `type`.
          // For this exercise, if `response.user` was not there, we'll assume a hypothetical
          // `response.decodedTokenData` or similar from `apiLogin` for role.
          // If not, the login should fail.
          if (response.user && response.user.type) { // Check again if apiLogin provided it
            decodedUser = response.user;
          } else {
            // If no reliable type from backend (neither in response.user nor from token decoding)
            throw new Error('Login failed: User role could not be verified from server response.');
          }

        } catch (e) {
          console.error("Error processing token or user info not available", e);
          throw new Error('Login failed: User role could not be verified due to token processing error.');
        }
      }

      if (!decodedUser || !decodedUser.type || !decodedUser.username) {
        // This check ensures we have a user object with type and username.
        // It's a fallback if the above logic didn't correctly establish decodedUser.
        throw new Error('Login failed: User details (including role) could not be determined from server response.');
      }

      // Role comparison
      if (decodedUser.type !== credentials.type) {
        throw new Error('Login failed: The user account is not registered for this role.');
      }

      // Proceed with successful login if roles match
      const newAuthState = {
        isAuthenticated: true,
        userType: decodedUser.type,
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
