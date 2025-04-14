import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getAuthToken } from '../utils/tokenStorage';
import { createLogger } from '../utils/logger';

const logger = createLogger('PrivateRoute');

const PrivateRoute = ({ children, requiredRoles = [] }) => {
  const { user, hasRole } = useAuth();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [hasToken, setHasToken] = useState(false);

  // Kontrollera token direkt från localStorage först, innan auth-kontexten laddat
  useEffect(() => {
    const checkToken = async () => {
      try {
        // Kontrollera om token finns oberoende av AuthContext
        const token = getAuthToken();
        setHasToken(!!token);
        logger.info(`Token check: ${!!token}`);
      } catch (error) {
        logger.error('Error checking token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkToken();
  }, []);

  // Visa laddningsindikator medan token kontrolleras
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Om ingen token finns alls, spara plats och omdirigera till inloggning
  if (!hasToken && !user) {
    logger.info(`No token or user, redirecting to login from: ${location.pathname}`);
    // Spara nuvarande URL i sessionStorage
    sessionStorage.setItem('savedLocation', location.pathname + location.search);
    // Rensa eventuell cache från localStorage
    localStorage.removeItem('userData');
    return <Navigate to="/login" replace />;
  }

  // Om token finns men ingen user ännu (AuthContext inte klar), visa laddning
  if (hasToken && !user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Kontrollera behörighet om roller krävs
  if (user && requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    logger.info(`User lacks required roles: ${requiredRoles}`);
    return <Navigate to="/" replace />;
  }

  // Användaren är inloggad och har rätt behörighet
  return children;
};

export default PrivateRoute; 