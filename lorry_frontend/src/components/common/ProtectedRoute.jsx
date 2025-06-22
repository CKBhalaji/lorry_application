// src/components/common/ProtectedRoute.js
import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, userType }) => {
  const token = localStorage.getItem(`${userType}Token`);
  const isAuthenticated = !!token;
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

export default ProtectedRoute;