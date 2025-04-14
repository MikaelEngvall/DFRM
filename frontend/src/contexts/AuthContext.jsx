import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, userService } from '../services';
import sessionManager from '../utils/sessionManager';
import SessionWarning from '../components/SessionWarning';
import { getAuthToken, removeAuthToken } from '../utils/tokenStorage';
import { createLogger } from '../utils/logger';
import { validateJwtToken } from '../utils/errorHandler';

const logger = createLogger('AuthContext');
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [sessionRemainingTime, setSessionRemainingTime] = useState(0);
  const authCheckRef = useRef(false);

  // Hämta alla användare
  const fetchUsers = useCallback(async () => {
    try {
      const allUsers = await userService.getAllUsers();
      setUsers(allUsers);
    } catch (error) {
      logger.error('Error fetching users in auth context:', error);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    if (authCheckRef.current) return;
    authCheckRef.current = true;
    logger.info('Kontrollerar autentisering...');

    try {
      const token = getAuthToken();
      if (!token) {
        logger.info('Ingen token hittades');
        setUser(null);
        localStorage.removeItem('userData');
        setLoading(false);
        return;
      }

      // Kontrollera först om vi har cachad användardata
      const cachedUserData = localStorage.getItem('userData');
      let userData = null;
      
      if (cachedUserData) {
        try {
          userData = JSON.parse(cachedUserData);
          logger.info('Hittade cachad användardata', { userId: userData.id, role: userData.role });
        } catch (error) {
          logger.error('Kunde inte parsa cachad användardata:', error);
        }
      }

      // Försök hämta användardata från backend även om vi har cachad data
      try {
        logger.info('Token hittad, hämtar användardata från API...');
        const serverUserData = await authService.getCurrentUser();
        logger.info('Användardata hämtad från API, användare inloggad', { userId: serverUserData.id, role: serverUserData.role });
        
        // Uppdatera cachad användardata
        localStorage.setItem('userData', JSON.stringify(serverUserData));
        
        // Använd server-data
        setUser(serverUserData);
      } catch (error) {
        // Om API-anrop misslyckas, använd cachad användardata om sådan finns
        if (userData) {
          logger.warn('Kunde inte hämta uppdaterad användardata från API, använder cachad data', 
            { error: error.message, status: error.response?.status });
          
          // Validera token för att säkerställa att den inte har utgått
          const validation = validateJwtToken(token);
          if (validation.valid) {
            logger.info('Token fortfarande giltig, fortsätter session med cachad användardata');
            setUser(userData);
          } else {
            logger.error('Token ogiltig men finns i localStorage:', validation.error);
            setUser(null);
            removeAuthToken();
            localStorage.removeItem('userData');
          }
        } else {
          // Ingen cachad data och API-anrop misslyckades
          logger.error('Fel vid autentkontroll och ingen cachad data:', error);
          setUser(null);
          removeAuthToken();
        }
      }
    } catch (error) {
      logger.error('Autentiseringskontroll misslyckades:', error);
      setUser(null);
      removeAuthToken();
      localStorage.removeItem('userData');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (user) {
      initializeSessionManager();
    }
    return () => {
      sessionManager.cleanup();
    };
  }, [user]);

  const initializeSessionManager = () => {
    sessionManager.init(
      // Varningshanterare
      (remainingTime) => {
        setSessionRemainingTime(remainingTime);
        setShowSessionWarning(true);
      },
      // Utloggningshanterare
      () => {
        logout();
      },
      // Skicka med användarrollen
      user.role
    );
  };

  const login = async (credentials) => {
    try {
      const userData = await authService.login(credentials);
      setUser(userData);
      
      // Spara användardata i localStorage för att återställa session vid sidladdning
      localStorage.setItem('userData', JSON.stringify(userData));
      
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const logout = useCallback(() => {
    setUser(null);
    removeAuthToken();
    localStorage.removeItem('userData');
    setShowSessionWarning(false);
    navigate('/login');
  }, [navigate]);

  const extendSession = () => {
    sessionManager.handleUserActivity();
    setShowSessionWarning(false);
  };

  // Hjälpfunktion för att kontrollera användarroller
  const hasRole = useCallback((requiredRoles) => {
    if (!user) return false;
    if (!Array.isArray(requiredRoles)) {
      requiredRoles = [requiredRoles];
    }
    const userRole = user.role.startsWith('ROLE_') ? user.role : `ROLE_${user.role}`;
    return requiredRoles.some(role => {
      const formattedRole = role.startsWith('ROLE_') ? role : `ROLE_${role}`;
      return userRole === formattedRole;
    });
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const value = {
    user,
    users,
    login,
    logout,
    extendSession,
    hasRole,
    fetchUsers,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      {showSessionWarning && (
        <SessionWarning
          remainingTime={sessionRemainingTime}
          onExtend={extendSession}
          onLogout={logout}
        />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth måste användas inom en AuthProvider');
  }
  return context;
};

export default AuthContext; 