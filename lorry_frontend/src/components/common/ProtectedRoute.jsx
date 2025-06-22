import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Adjust path if necessary

const ProtectedRoute = ({ allowedUserTypes }) => {
  const { isAuthenticated, userType, isLoading } = useAuth(); // Assuming isLoading is added to AuthContext if initial auth check is async

  // If AuthContext is still determining auth status (e.g., on initial load reading from localStorage)
  // you might want to show a loading indicator or return null.
  // For now, we'll assume isLoading is false or handled such that isAuthenticated and userType are reliable.
  // If isLoading is true, you could return a loading spinner:
  // if (isLoading) {
  //   return <div>Loading...</div>;
  // }

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    // Pass the current location to redirect back after login (optional)
    return <Navigate to="/login" replace />;
  }

  // Normalize userType and allowedUserTypes for robust comparison
  const normalizeRole = (role) => role && role.toLowerCase().replace(/[_\s]/g, '');
  const normalizedUserType = normalizeRole(userType);
  const normalizedAllowedUserTypes = allowedUserTypes ? allowedUserTypes.map(normalizeRole) : [];

  if (
    allowedUserTypes &&
    allowedUserTypes.length > 0 &&
    !normalizedAllowedUserTypes.includes(normalizedUserType)
  ) {
    // Redirect to an unauthorized page or home if user type is not allowed
    return <Navigate to="/" replace />; // Or to="/unauthorized"
  }

  // If authenticated and user type is allowed (or no specific user types are required), render the child route/component
  return <Outlet />;
};

export default ProtectedRoute;
