import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children, requiredRoles = [] }) => {
  const { user, hasRole } = useAuth();
  const location = useLocation();

  if (!user) {
    // Spara den aktuella sidan i sessionStorage
    sessionStorage.setItem('savedLocation', location.pathname + location.search);
    return <Navigate to="/login" replace />;
  }

  // Om det finns requiredRoles, kontrollera att användaren har någon av dem
  if (requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.some(role => hasRole(role));
    if (!hasRequiredRole) {
      // Omdirigera till dashboard med felmeddelande om obehörig
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default PrivateRoute; 