import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RoleBasedRoute = ({ children, allowedRoles }) => {
  const { user, hasRole } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Om användaren har någon av de tillåtna rollerna
  if (allowedRoles && hasRole(allowedRoles)) {
    return children;
  }

  // Om användaren är USER, omdirigera till kalendersidan
  if (hasRole('USER')) {
    return <Navigate to="/calendar" />;
  }

  // För andra fall, omdirigera till dashboard
  return <Navigate to="/dashboard" />;
};

export default RoleBasedRoute; 